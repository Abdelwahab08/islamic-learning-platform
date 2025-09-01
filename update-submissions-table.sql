-- Update submissions table to support advanced grading system
USE islamic_db;

-- Add new columns to submissions table
ALTER TABLE submissions 
ADD COLUMN content TEXT NULL AFTER student_id,
ADD COLUMN audio_url TEXT NULL AFTER file_url,
ADD COLUMN page_number INT NULL AFTER audio_url,
ADD COLUMN evaluation_grade ENUM('متفوق','ممتاز','جيد','إعادة','غياب','إذن') NULL AFTER page_number,
ADD INDEX idx_evaluation (evaluation_grade);

-- Make file_url nullable since we now have content field
ALTER TABLE submissions MODIFY COLUMN file_url TEXT NULL;

-- Create student_progress_log table if it doesn't exist
CREATE TABLE IF NOT EXISTS student_progress_log (
    id CHAR(36) PRIMARY KEY,
    student_id CHAR(36) NOT NULL,
    page_number INT NOT NULL,
    evaluation_grade ENUM('متفوق','ممتاز','جيد','إعادة','غياب','إذن') NOT NULL,
    teacher_id CHAR(36) NOT NULL,
    assignment_id CHAR(36) NULL,
    logged_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE SET NULL,
    INDEX idx_student (student_id),
    INDEX idx_teacher (teacher_id),
    INDEX idx_assignment (assignment_id),
    INDEX idx_logged (logged_at)
);
