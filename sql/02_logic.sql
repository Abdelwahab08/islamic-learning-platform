-- Islamic Learning Platform Database Logic
-- Views, Triggers, Functions, and Procedures

USE islamic_db;

-- View for user access mapping
CREATE VIEW v_user_access AS
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

-- Trigger to set default stage and page for new students
DELIMITER //
CREATE TRIGGER trg_students_default_level 
BEFORE INSERT ON students
FOR EACH ROW
BEGIN
    IF NEW.current_stage_id IS NULL THEN
        SELECT id INTO NEW.current_stage_id 
        FROM stages 
        WHERE code = 'RASHIDI' 
        LIMIT 1;
    END IF;
    
    IF NEW.current_page IS NULL THEN
        SET NEW.current_page = 1;
    END IF;
END //
DELIMITER ;

-- Procedure to record rating and advance student
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
    
    -- Get total pages for current stage
    SELECT total_pages INTO v_total_pages FROM stages WHERE id = p_stage_id;
    
    -- Get user IDs
    SELECT user_id INTO v_student_user_id FROM students WHERE id = p_student_id;
    SELECT user_id INTO v_teacher_user_id FROM teachers WHERE id = p_teacher_id;
    
    -- Insert progress log
    INSERT INTO progress_logs (id, student_id, teacher_id, stage_id, page_number, rating, notes)
    VALUES (UUID(), p_student_id, p_teacher_id, p_stage_id, p_page, p_rating, p_notes);
    
    -- Update student progress based on rating
    IF p_rating IN ('متفوق', 'ممتاز', 'جيد') THEN
        -- Advance page
        UPDATE students 
        SET current_page = current_page + 1,
            updated_at = NOW()
        WHERE id = p_student_id;
        
        -- Check if we need to advance to next stage
        IF (p_page + 1) > v_total_pages AND v_total_pages IS NOT NULL THEN
            -- Find next stage
            SELECT id INTO v_next_stage_id 
            FROM stages 
            WHERE order_index = (
                SELECT order_index + 1 
                FROM stages 
                WHERE id = p_stage_id
            )
            LIMIT 1;
            
            -- If next stage exists, promote student
            IF v_next_stage_id IS NOT NULL THEN
                UPDATE students 
                SET current_stage_id = v_next_stage_id,
                    current_page = 1,
                    updated_at = NOW()
                WHERE id = p_student_id;
                
                -- Notify student about promotion
                INSERT INTO notifications (id, user_id, title, body)
                VALUES (
                    UUID(), 
                    v_student_user_id, 
                    'ترقية مرحلة', 
                    CONCAT('تمت ترقيتك إلى المرحلة التالية. مرحباً بك في المرحلة الجديدة!')
                );
            END IF;
        END IF;
    END IF;
END //
DELIMITER ;

-- Procedure to set student stage manually
DELIMITER //
CREATE PROCEDURE set_student_stage(
    IN p_student_id CHAR(36),
    IN p_new_stage_id CHAR(36),
    IN p_new_page INT
)
BEGIN
    DECLARE v_total_pages INT;
    DECLARE v_student_user_id CHAR(36);
    DECLARE v_stage_name VARCHAR(100);
    
    -- Get stage info
    SELECT total_pages, name_ar INTO v_total_pages, v_stage_name 
    FROM stages WHERE id = p_new_stage_id;
    
    -- Get student user ID
    SELECT user_id INTO v_student_user_id FROM students WHERE id = p_student_id;
    
    -- Validate page number
    IF p_new_page < 1 THEN
        SET p_new_page = 1;
    ELSEIF v_total_pages IS NOT NULL AND p_new_page > v_total_pages THEN
        SET p_new_page = v_total_pages;
    END IF;
    
    -- Update student
    UPDATE students 
    SET current_stage_id = p_new_stage_id,
        current_page = p_new_page,
        updated_at = NOW()
    WHERE id = p_student_id;
    
    -- Notify student
    INSERT INTO notifications (id, user_id, title, body)
    VALUES (
        UUID(), 
        v_student_user_id, 
        'تغيير المرحلة', 
        CONCAT('تم تغيير مرحلتك إلى: ', v_stage_name, ' - الصفحة: ', p_new_page)
    );
END //
DELIMITER ;

-- Procedure to notify users in scope
DELIMITER //
CREATE PROCEDURE notify_scope(
    IN p_teacher_id CHAR(36),
    IN p_stage_id CHAR(36),
    IN p_group_id CHAR(36),
    IN p_title VARCHAR(255),
    IN p_body TEXT
)
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE v_user_id CHAR(36);
    DECLARE user_cursor CURSOR FOR
        SELECT DISTINCT u.id
        FROM users u
        JOIN students s ON u.id = s.user_id
        WHERE u.role = 'STUDENT' AND u.is_approved = 1
        AND (
            (p_stage_id IS NOT NULL AND s.current_stage_id = p_stage_id)
            OR (p_group_id IS NOT NULL AND EXISTS (
                SELECT 1 FROM group_members gm 
                WHERE gm.group_id = p_group_id AND gm.student_id = s.id
            ))
        );
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    OPEN user_cursor;
    
    read_loop: LOOP
        FETCH user_cursor INTO v_user_id;
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        INSERT INTO notifications (id, user_id, title, body)
        VALUES (UUID(), v_user_id, p_title, p_body);
    END LOOP;
    
    CLOSE user_cursor;
END //
DELIMITER ;

-- Trigger to notify students when assignment is created
DELIMITER //
CREATE TRIGGER trg_asg_notify 
AFTER INSERT ON assignments
FOR EACH ROW
BEGIN
    IF NEW.stage_id IS NOT NULL THEN
        CALL notify_scope(NEW.teacher_id, NEW.stage_id, NULL, 'واجب جديد', NEW.title);
    END IF;
END //
DELIMITER ;

-- Trigger to notify students when material is created
DELIMITER //
CREATE TRIGGER trg_mat_notify 
AFTER INSERT ON materials
FOR EACH ROW
BEGIN
    CALL notify_scope(NEW.teacher_id, NEW.stage_id, NULL, 'مادة تعليمية جديدة', NEW.title);
END //
DELIMITER ;

-- Trigger to notify students when meeting is created
DELIMITER //
CREATE TRIGGER trg_meet_notify 
AFTER INSERT ON meetings
FOR EACH ROW
BEGIN
    IF NEW.level_stage_id IS NOT NULL THEN
        CALL notify_scope(NEW.teacher_id, NEW.level_stage_id, NULL, 'اجتماع جديد', NEW.title);
    ELSEIF NEW.group_id IS NOT NULL THEN
        CALL notify_scope(NEW.teacher_id, NULL, NEW.group_id, 'اجتماع جديد', NEW.title);
    END IF;
END //
DELIMITER ;

-- Trigger to notify student when certificate is approved
DELIMITER //
CREATE TRIGGER trg_cert_approved_notify 
AFTER UPDATE ON certificates
FOR EACH ROW
BEGIN
    DECLARE v_student_user_id CHAR(36);
    
    IF NEW.status = 'APPROVED' AND OLD.status != 'APPROVED' THEN
        SELECT user_id INTO v_student_user_id 
        FROM students WHERE id = NEW.student_id;
        
        INSERT INTO notifications (id, user_id, title, body)
        VALUES (
            UUID(), 
            v_student_user_id, 
            'شهادة معتمدة', 
            'تم اعتماد شهادتك. يمكنك تحميلها الآن.'
        );
    END IF;
END //
DELIMITER ;

-- Trigger to notify teacher when student submits assignment
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
        INSERT INTO notifications (id, user_id, title, body)
        VALUES (
            UUID(), 
            v_teacher_user_id, 
            'تسليم واجب جديد', 
            'تم تسليم واجب جديد من أحد الطلاب'
        );
    END IF;
END //
DELIMITER ;
