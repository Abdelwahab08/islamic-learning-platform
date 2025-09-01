-- Islamic Learning Platform Database Logic (Simplified Version)
-- Views, Triggers, Functions, and Procedures

USE islamic_db;

-- View for user access mapping
CREATE OR REPLACE VIEW v_user_access AS
SELECT 
    u.id,
    u.role,
    u.email,
    u.is_approved,
    u.onboarding_status,
    t.verified as teacher_verified,
    s.current_stage_id,
    s.current_page,
    CASE 
        WHEN u.role = 'ADMIN' THEN '/dashboard/admin'
        WHEN u.role = 'TEACHER' AND u.is_approved = 1 AND t.verified = 1 THEN '/dashboard/teacher'
        WHEN u.role = 'TEACHER' THEN '/auth/awaiting-approval?type=teacher'
        WHEN u.role = 'STUDENT' AND u.is_approved = 1 AND EXISTS (
            SELECT 1 FROM teacher_students ts 
            WHERE ts.student_id = s.id
        ) THEN '/dashboard/student'
        WHEN u.role = 'STUDENT' THEN '/auth/awaiting-approval?type=student'
        ELSE '/auth/login'
    END as redirect_path
FROM users u
LEFT JOIN teachers t ON u.id = t.user_id
LEFT JOIN students s ON u.id = s.user_id;

-- Function to get stage total pages
DROP FUNCTION IF EXISTS stage_total_pages;
DELIMITER //
CREATE FUNCTION stage_total_pages(stage_id CHAR(36))
RETURNS INT
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE total_pages_val INT;
    SELECT total_pages INTO total_pages_val
    FROM stages WHERE id = stage_id;
    RETURN COALESCE(total_pages_val, 0);
END //
DELIMITER ;

-- Simple trigger to set default stage and page for new students
DROP TRIGGER IF EXISTS trg_students_default_level;
DELIMITER //
CREATE TRIGGER trg_students_default_level 
BEFORE INSERT ON students
FOR EACH ROW
BEGIN
    DECLARE default_stage_id CHAR(36);
    
    IF NEW.current_stage_id IS NULL THEN
        SELECT id INTO default_stage_id 
        FROM stages 
        WHERE code = 'RASHIDI' 
        LIMIT 1;
        SET NEW.current_stage_id = default_stage_id;
    END IF;
    
    IF NEW.current_page IS NULL THEN
        SET NEW.current_page = 1;
    END IF;
END //
DELIMITER ;

-- Simple procedure to notify users
DROP PROCEDURE IF EXISTS notify_scope;
DELIMITER //
CREATE PROCEDURE notify_scope(
    IN p_user_id CHAR(36),
    IN p_type VARCHAR(50),
    IN p_message TEXT
)
BEGIN
    INSERT INTO notifications (id, user_id, type, message, read_flag)
    VALUES (UUID(), p_user_id, p_type, p_message, 0);
END //
DELIMITER ;

-- Simple procedure to set student stage
DROP PROCEDURE IF EXISTS set_student_stage;
DELIMITER //
CREATE PROCEDURE set_student_stage(
    IN p_student_id CHAR(36),
    IN p_stage_id CHAR(36),
    IN p_page INT
)
BEGIN
    DECLARE v_student_user_id CHAR(36);
    
    UPDATE students 
    SET current_stage_id = p_stage_id,
        current_page = p_page,
        updated_at = NOW()
    WHERE id = p_student_id;
    
    SELECT user_id INTO v_student_user_id FROM students WHERE id = p_student_id;
    
    CALL notify_scope(v_student_user_id, 'STAGE_CHANGED', 
        CONCAT('تم تغيير المرحلة إلى: ', 
               (SELECT name_ar FROM stages WHERE id = p_stage_id)));
END //
DELIMITER ;

-- Simple procedure to record rating and advance student
DROP PROCEDURE IF EXISTS record_rating_and_advance;
DELIMITER //
CREATE PROCEDURE record_rating_and_advance(
    IN p_teacher_id CHAR(36),
    IN p_student_id CHAR(36),
    IN p_stage_id CHAR(36),
    IN p_page INT,
    IN p_rating ENUM('متفوق','ممتاز','جيد','إعادة','غياب','إذن'),
    IN p_notes TEXT
)
BEGIN
    DECLARE v_total_pages INT;
    DECLARE v_next_stage_id CHAR(36);
    DECLARE v_student_user_id CHAR(36);
    DECLARE v_teacher_user_id CHAR(36);
    
    SELECT total_pages INTO v_total_pages FROM stages WHERE id = p_stage_id;
    SELECT user_id INTO v_student_user_id FROM students WHERE id = p_student_id;
    SELECT user_id INTO v_teacher_user_id FROM teachers WHERE id = p_teacher_id;
    
    INSERT INTO progress_logs (id, student_id, teacher_id, stage_id, page_number, rating, notes)
    VALUES (UUID(), p_student_id, p_teacher_id, p_stage_id, p_page, p_rating, p_notes);
    
    IF p_rating IN ('متفوق', 'ممتاز', 'جيد') THEN
        UPDATE students 
        SET current_page = current_page + 1,
            updated_at = NOW()
        WHERE id = p_student_id;
        
        IF (SELECT current_page FROM students WHERE id = p_student_id) > v_total_pages THEN
            SELECT id INTO v_next_stage_id 
            FROM stages 
            WHERE order_index = (SELECT order_index + 1 FROM stages WHERE id = p_stage_id)
            LIMIT 1;
            
            IF v_next_stage_id IS NOT NULL THEN
                UPDATE students 
                SET current_stage_id = v_next_stage_id,
                    current_page = 1,
                    updated_at = NOW()
                WHERE id = p_student_id;
                
                CALL notify_scope(v_student_user_id, 'STAGE_ADVANCED', 
                    CONCAT('تم الانتقال إلى المرحلة التالية: ', 
                           (SELECT name_ar FROM stages WHERE id = v_next_stage_id)));
            END IF;
        END IF;
    END IF;
    
    CALL notify_scope(v_teacher_user_id, 'STUDENT_RATED', 
        CONCAT('تم تقييم الطالب في الصفحة ', p_page));
END //
DELIMITER ;

-- Simple trigger for assignment notifications
DROP TRIGGER IF EXISTS trg_asg_notify;
DELIMITER //
CREATE TRIGGER trg_asg_notify
AFTER INSERT ON assignments
FOR EACH ROW
BEGIN
    DECLARE v_teacher_user_id CHAR(36);
    
    SELECT user_id INTO v_teacher_user_id FROM teachers WHERE id = NEW.teacher_id;
    
    IF v_teacher_user_id IS NOT NULL THEN
        CALL notify_scope(v_teacher_user_id, 'ASSIGNMENT_CREATED', 
            CONCAT('تم إنشاء واجب جديد: ', NEW.title));
    END IF;
END //
DELIMITER ;

-- Simple trigger for material notifications
DROP TRIGGER IF EXISTS trg_mat_notify;
DELIMITER //
CREATE TRIGGER trg_mat_notify
AFTER INSERT ON materials
FOR EACH ROW
BEGIN
    DECLARE v_teacher_user_id CHAR(36);
    
    SELECT user_id INTO v_teacher_user_id FROM teachers WHERE id = NEW.teacher_id;
    
    IF v_teacher_user_id IS NOT NULL THEN
        CALL notify_scope(v_teacher_user_id, 'MATERIAL_CREATED', 
            CONCAT('تم إنشاء مادة جديدة: ', NEW.title));
    END IF;
END //
DELIMITER ;

-- Simple trigger for meeting notifications
DROP TRIGGER IF EXISTS trg_meet_notify;
DELIMITER //
CREATE TRIGGER trg_meet_notify
AFTER INSERT ON meetings
FOR EACH ROW
BEGIN
    DECLARE v_teacher_user_id CHAR(36);
    
    SELECT user_id INTO v_teacher_user_id FROM teachers WHERE id = NEW.teacher_id;
    
    IF v_teacher_user_id IS NOT NULL THEN
        CALL notify_scope(v_teacher_user_id, 'MEETING_CREATED', 
            CONCAT('تم إنشاء اجتماع جديد: ', NEW.title));
    END IF;
END //
DELIMITER ;

-- Simple trigger for certificate approval notifications
DROP TRIGGER IF EXISTS trg_cert_approved_notify;
DELIMITER //
CREATE TRIGGER trg_cert_approved_notify
AFTER UPDATE ON certificates
FOR EACH ROW
BEGIN
    DECLARE v_student_user_id CHAR(36);
    
    IF NEW.status = 'APPROVED' AND OLD.status != 'APPROVED' THEN
        SELECT s.user_id INTO v_student_user_id 
        FROM students s WHERE s.id = NEW.student_id;
        
        IF v_student_user_id IS NOT NULL THEN
            CALL notify_scope(v_student_user_id, 'CERTIFICATE_APPROVED', 
                CONCAT('تم الموافقة على شهادتك: ', NEW.title));
        END IF;
    END IF;
END //
DELIMITER ;

-- Simple trigger for submission notifications to teacher
DROP TRIGGER IF EXISTS trg_submission_notify_teacher;
DELIMITER //
CREATE TRIGGER trg_submission_notify_teacher
AFTER INSERT ON submissions
FOR EACH ROW
BEGIN
    DECLARE v_teacher_user_id CHAR(36);
    
    SELECT t.user_id INTO v_teacher_user_id 
    FROM teachers t 
    JOIN assignments a ON t.id = a.teacher_id 
    WHERE a.id = NEW.assignment_id;
    
    IF v_teacher_user_id IS NOT NULL THEN
        CALL notify_scope(v_teacher_user_id, 'STUDENT_SUBMISSION', 
            'تم تسليم واجب جديد من طالب');
    END IF;
END //
DELIMITER ;
