-- Fix groups table to match frontend expectations
USE islamic_db;

-- Add missing columns to groups table
ALTER TABLE `groups` 
ADD COLUMN `description` TEXT NULL AFTER `name`,
ADD COLUMN `max_students` INT DEFAULT 20 AFTER `description`,
ADD COLUMN `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP AFTER `max_students`;

-- Update existing groups to have default values
UPDATE `groups` SET 
  `description` = COALESCE(`description`, ''),
  `max_students` = COALESCE(`max_students`, 20),
  `created_at` = COALESCE(`created_at`, NOW());

-- Verify the table structure
DESCRIBE `groups`;
