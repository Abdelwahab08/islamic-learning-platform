-- Islamic Learning Platform Database Logic (Minimal Version)
-- Basic Views, Functions, and Simple Procedures

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
