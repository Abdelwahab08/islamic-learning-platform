-- Create missing groups table (using backticks for reserved keyword)
USE railway;

-- Create groups table (using backticks for reserved keyword)
CREATE TABLE IF NOT EXISTS `groups` (
    id CHAR(36) PRIMARY KEY,
    teacher_id CHAR(36) NOT NULL,
    name VARCHAR(100) NOT NULL,
    level_stage_id CHAR(36) NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    INDEX idx_teacher (teacher_id)
);

-- Create group_members table if it doesn't exist
CREATE TABLE IF NOT EXISTS `group_members` (
    id CHAR(36) PRIMARY KEY,
    group_id CHAR(36) NOT NULL,
    student_id CHAR(36) NOT NULL,
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES `groups`(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    UNIQUE KEY unique_group_student (group_id, student_id),
    INDEX idx_group (group_id),
    INDEX idx_student (student_id)
);

-- Create assignment_targets table if it doesn't exist
CREATE TABLE IF NOT EXISTS `assignment_targets` (
    id CHAR(36) PRIMARY KEY,
    assignment_id CHAR(36) NOT NULL,
    group_id CHAR(36) NULL,
    student_id CHAR(36) NULL,
    FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES `groups`(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    INDEX idx_assignment (assignment_id),
    INDEX idx_group (group_id),
    INDEX idx_student (student_id)
);
