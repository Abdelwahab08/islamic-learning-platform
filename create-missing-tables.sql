-- Create missing tables for teacher functionality
USE railway;

-- Create groups table
CREATE TABLE IF NOT EXISTS groups (
    id CHAR(36) PRIMARY KEY,
    teacher_id CHAR(36) NOT NULL,
    name VARCHAR(100) NOT NULL,
    level_stage_id CHAR(36) NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    INDEX idx_teacher (teacher_id)
);

-- Create group_members table if it doesn't exist
CREATE TABLE IF NOT EXISTS group_members (
    id CHAR(36) PRIMARY KEY,
    group_id CHAR(36) NOT NULL,
    student_id CHAR(36) NOT NULL,
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    UNIQUE KEY unique_group_student (group_id, student_id),
    INDEX idx_group (group_id),
    INDEX idx_student (student_id)
);

-- Create assignments table if it doesn't exist
CREATE TABLE IF NOT EXISTS assignments (
    id CHAR(36) PRIMARY KEY,
    teacher_id CHAR(36) NOT NULL,
    stage_id CHAR(36) NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_at DATETIME NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    FOREIGN KEY (stage_id) REFERENCES stages(id) ON DELETE SET NULL,
    INDEX idx_teacher (teacher_id),
    INDEX idx_stage (stage_id),
    INDEX idx_due (due_at)
);

-- Create assignment_targets table if it doesn't exist
CREATE TABLE IF NOT EXISTS assignment_targets (
    id CHAR(36) PRIMARY KEY,
    assignment_id CHAR(36) NOT NULL,
    group_id CHAR(36) NULL,
    student_id CHAR(36) NULL,
    FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    INDEX idx_assignment (assignment_id),
    INDEX idx_group (group_id),
    INDEX idx_student (student_id)
);

-- Create submissions table if it doesn't exist
CREATE TABLE IF NOT EXISTS submissions (
    id CHAR(36) PRIMARY KEY,
    assignment_id CHAR(36) NOT NULL,
    student_id CHAR(36) NOT NULL,
    content TEXT NULL,
    file_url TEXT NULL,
    audio_url TEXT NULL,
    page_number INT NULL,
    evaluation_grade ENUM('متفوق','ممتاز','جيد','إعادة','غياب','إذن') NULL,
    duration_seconds INT NULL,
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    grade VARCHAR(50) NULL,
    feedback TEXT NULL,
    graded_by CHAR(36) NULL,
    graded_at DATETIME NULL,
    FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (graded_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_assignment (assignment_id),
    INDEX idx_student (student_id),
    INDEX idx_submitted (submitted_at),
    INDEX idx_evaluation (evaluation_grade)
);

-- Create certificates table if it doesn't exist
CREATE TABLE IF NOT EXISTS certificates (
    id CHAR(36) PRIMARY KEY,
    student_id CHAR(36) NOT NULL,
    teacher_id CHAR(36) NOT NULL,
    stage_id CHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    issued_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    status ENUM('PENDING','APPROVED','REJECTED') DEFAULT 'PENDING',
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    FOREIGN KEY (stage_id) REFERENCES stages(id) ON DELETE CASCADE,
    INDEX idx_student (student_id),
    INDEX idx_teacher (teacher_id),
    INDEX idx_stage (stage_id)
);
