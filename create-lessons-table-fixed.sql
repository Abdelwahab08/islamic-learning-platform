-- Create lessons table for teacher schedule (Fixed Version)
CREATE TABLE IF NOT EXISTS lessons (
  id CHAR(36) PRIMARY KEY,
  teacher_id CHAR(36) NOT NULL,
  day_of_week ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday') NOT NULL,
  start_time TIME NOT NULL,
  subject VARCHAR(255) NOT NULL,
  duration_minutes INT NOT NULL DEFAULT 60,
  room VARCHAR(100) NULL,
  group_id CHAR(36) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_teacher_day (teacher_id, day_of_week),
  INDEX idx_teacher_time (teacher_id, start_time),
  UNIQUE KEY unique_teacher_day_time (teacher_id, day_of_week, start_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add foreign keys separately (if tables exist)
-- Uncomment these lines after confirming the tables exist and have correct structure

-- ALTER TABLE lessons ADD CONSTRAINT fk_lessons_teacher 
--   FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE;

-- ALTER TABLE lessons ADD CONSTRAINT fk_lessons_group 
--   FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE SET NULL;
