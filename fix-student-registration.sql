-- Fix Student Registration System
USE railway;

-- 1. Fix the students table structure (remove duplicate column)
ALTER TABLE students DROP COLUMN IF EXISTS current_stage_id;

-- 2. Create the missing trigger for default stage and page
DELIMITER //
DROP TRIGGER IF EXISTS trg_students_default_level //
CREATE TRIGGER trg_students_default_level 
BEFORE INSERT ON students
FOR EACH ROW
BEGIN
    DECLARE default_stage_id CHAR(36);
    
    -- Set default stage to RASHIDI (الرشيدي) if not specified
    IF NEW.stage_id IS NULL THEN
        SELECT id INTO default_stage_id 
        FROM stages 
        WHERE code = 'RASHIDI' 
        LIMIT 1;
        
        IF default_stage_id IS NOT NULL THEN
            SET NEW.stage_id = default_stage_id;
        END IF;
    END IF;
    
    -- Set default page to 1 if not specified
    IF NEW.current_page IS NULL THEN
        SET NEW.current_page = 1;
    END IF;
    
    -- Set updated_at to current timestamp
    SET NEW.updated_at = NOW();
END //
DELIMITER ;

-- 3. Update existing students to have proper stage_id if missing
UPDATE students s 
LEFT JOIN stages st ON s.stage_id = st.id
SET s.stage_id = (SELECT id FROM stages WHERE code = 'RASHIDI' LIMIT 1)
WHERE s.stage_id IS NULL;

-- 4. Update existing students to have proper current_page if missing
UPDATE students 
SET current_page = 1 
WHERE current_page IS NULL;

-- 5. Verify the trigger was created
SHOW TRIGGERS LIKE 'trg_students_default_level';

-- 6. Test the trigger by checking a sample student
SELECT 
    s.id,
    s.user_id,
    s.stage_id,
    s.current_page,
    st.code as stage_code,
    st.name_ar as stage_name,
    st.order_index
FROM students s
LEFT JOIN stages st ON s.stage_id = st.id
LIMIT 3;
