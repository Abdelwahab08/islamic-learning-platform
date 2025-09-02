-- Fix group_members table to add missing created_at column
USE islamic_db;

-- Add missing created_at column to group_members table
ALTER TABLE `group_members` 
ADD COLUMN `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP AFTER `student_id`;

-- Update existing group members to have default created_at values
UPDATE `group_members` SET 
  `created_at` = COALESCE(`created_at`, NOW());

-- Verify the table structure
DESCRIBE `group_members`;
