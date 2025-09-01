-- Update groups table to add missing columns
USE islamic_db;

-- Add missing columns to groups table
ALTER TABLE groups 
ADD COLUMN description TEXT NULL AFTER name,
ADD COLUMN max_students INT DEFAULT 20 AFTER description,
ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP AFTER max_students;

-- Update existing groups to have default values
UPDATE groups SET 
description = CONCAT('مجموعة ', name) WHERE description IS NULL;

UPDATE groups SET 
max_students = 20 WHERE max_students IS NULL;

-- Add index for better performance
CREATE INDEX idx_groups_created_at ON groups(created_at);
