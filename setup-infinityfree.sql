-- InfinityFree Compatible Database Setup
-- This script avoids views, procedures, and triggers that are restricted on free plans

-- Create tables without advanced features
CREATE TABLE IF NOT EXISTS users (
    id CHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'TEACHER', 'STUDENT', 'ACADEMIC_MOD') NOT NULL,
    is_approved BOOLEAN DEFAULT FALSE,
    onboarding_status ENUM('PENDING', 'ACTIVE', 'REJECTED') DEFAULT 'PENDING',
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS stages (
    id CHAR(36) PRIMARY KEY,
    code VARCHAR(50) NOT NULL,
    name_ar VARCHAR(100) NOT NULL,
    total_pages INT,
    order_index INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS teachers (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    specialization VARCHAR(100),
    bio TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS students (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    stage_id INT,
    grade VARCHAR(50),
    parent_phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (stage_id) REFERENCES stages(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS groups (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    teacher_id CHAR(36) NOT NULL,
    stage_id INT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    FOREIGN KEY (stage_id) REFERENCES stages(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS group_students (
    id CHAR(36) PRIMARY KEY,
    group_id CHAR(36) NOT NULL,
    student_id CHAR(36) NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    UNIQUE KEY unique_group_student (group_id, student_id)
);

CREATE TABLE IF NOT EXISTS teacher_students (
    id CHAR(36) PRIMARY KEY,
    teacher_id CHAR(36) NOT NULL,
    student_id CHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    UNIQUE KEY unique_teacher_student (teacher_id, student_id)
);

CREATE TABLE IF NOT EXISTS student_ratings (
    id CHAR(36) PRIMARY KEY,
    student_id CHAR(36) NOT NULL,
    teacher_id CHAR(36) NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    notes TEXT,
    date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    UNIQUE KEY unique_student_date (student_id, date)
);

CREATE TABLE IF NOT EXISTS certificates (
    id CHAR(36) PRIMARY KEY,
    student_id CHAR(36) NOT NULL,
    teacher_id CHAR(36) NOT NULL,
    stage_id INT NOT NULL,
    grade VARCHAR(50) NOT NULL,
    serial_number INT AUTO_INCREMENT,
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    FOREIGN KEY (stage_id) REFERENCES stages(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS meetings (
    id CHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    teacher_id CHAR(36) NOT NULL,
    group_id CHAR(36),
    scheduled_at DATETIME NOT NULL,
    duration_minutes INT DEFAULT 60,
    provider ENUM('ZOOM', 'GOOGLE_MEET', 'TEAMS', 'IN_PERSON') DEFAULT 'ZOOM',
    join_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS assignments (
    id CHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    teacher_id CHAR(36) NOT NULL,
    stage_id INT NOT NULL,
    due_at DATETIME NOT NULL,
    max_score INT DEFAULT 100,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    FOREIGN KEY (stage_id) REFERENCES stages(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS assignment_targets (
    id CHAR(36) PRIMARY KEY,
    assignment_id CHAR(36) NOT NULL,
    group_id CHAR(36),
    student_id CHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS submissions (
    id CHAR(36) PRIMARY KEY,
    assignment_id CHAR(36) NOT NULL,
    student_id CHAR(36) NOT NULL,
    content TEXT,
    file_path VARCHAR(500),
    score INT,
    feedback TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS materials (
    id CHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_path VARCHAR(500),
    file_size INT,
    mime_type VARCHAR(100),
    teacher_id CHAR(36) NOT NULL,
    stage_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    FOREIGN KEY (stage_id) REFERENCES stages(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS notifications (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    body TEXT,
    read_flag BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS complaints (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status ENUM('PENDING', 'IN_PROGRESS', 'RESOLVED', 'CLOSED') DEFAULT 'PENDING',
    admin_response TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert default stages (using correct column names)
INSERT IGNORE INTO stages (id, code, name_ar, total_pages, order_index) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'RASHIDI', 'إتقان لغتي (الرشيدي)', 44, 1),
('550e8400-e29b-41d4-a716-446655440002', 'MUBTADI', 'المبتدئ', 50, 2),
('550e8400-e29b-41d4-a716-446655440003', 'MUTAWASSIT', 'المتوسط', 60, 3),
('550e8400-e29b-41d4-a716-446655440004', 'MUQADDAM', 'المتقدم', 70, 4),
('550e8400-e29b-41d4-a716-446655440005', 'MUHAFIZ', 'المحفظ', 80, 5);

-- Insert default admin user
INSERT IGNORE INTO users (id, email, password_hash, role, is_approved, onboarding_status, first_name, last_name) VALUES
('admin-yaqeen-id', 'admin@yaqeen.edu', '$2a$10$YourHashedPasswordHere', 'ADMIN', 1, 'ACTIVE', 'مدير', 'منصة يقين');

-- Insert admin teacher record
INSERT IGNORE INTO teachers (id, user_id, specialization, bio) VALUES
('admin-teacher-id', 'admin-yaqeen-id', 'إدارة النظام', 'مدير منصة يقين لتعليم القرآن الكريم');
