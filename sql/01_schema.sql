-- Islamic Learning Platform Database Schema
-- MySQL 8.0 with utf8mb4_unicode_ci collation

CREATE DATABASE IF NOT EXISTS islamic_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE islamic_db;

-- Users table
CREATE TABLE users (
    id CHAR(36) PRIMARY KEY,
    role ENUM('ADMIN','TEACHER','STUDENT','ACADEMIC_MOD') NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_approved TINYINT(1) DEFAULT 0,
    onboarding_status ENUM('PENDING_REVIEW','ACTIVE','REJECTED') DEFAULT 'PENDING_REVIEW',
    preferences JSON NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_approved (is_approved)
);

-- Teachers table
CREATE TABLE teachers (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) UNIQUE NOT NULL,
    verified TINYINT(1) DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_verified (verified)
);

-- Stages table
CREATE TABLE stages (
    id CHAR(36) PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name_ar VARCHAR(100) NOT NULL,
    total_pages INT NULL,
    order_index INT NOT NULL,
    INDEX idx_order (order_index)
);

-- Students table
CREATE TABLE students (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) UNIQUE NOT NULL,
    current_stage_id CHAR(36) NULL,
    current_page INT NULL,
    updated_at DATETIME NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (current_stage_id) REFERENCES stages(id) ON DELETE SET NULL,
    INDEX idx_stage_page (current_stage_id, current_page)
);

-- Teacher-Student relationships
CREATE TABLE teacher_students (
    id CHAR(36) PRIMARY KEY,
    teacher_id CHAR(36) NOT NULL,
    student_id CHAR(36) NOT NULL,
    assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    UNIQUE KEY unique_teacher_student (teacher_id, student_id),
    INDEX idx_teacher (teacher_id),
    INDEX idx_student (student_id)
);

-- Groups table
CREATE TABLE groups (
    id CHAR(36) PRIMARY KEY,
    teacher_id CHAR(36) NOT NULL,
    name VARCHAR(100) NOT NULL,
    level_stage_id CHAR(36) NULL,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    FOREIGN KEY (level_stage_id) REFERENCES stages(id) ON DELETE SET NULL,
    INDEX idx_teacher (teacher_id)
);

-- Group members
CREATE TABLE group_members (
    id CHAR(36) PRIMARY KEY,
    group_id CHAR(36) NOT NULL,
    student_id CHAR(36) NOT NULL,
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    UNIQUE KEY unique_group_student (group_id, student_id),
    INDEX idx_group (group_id),
    INDEX idx_student (student_id)
);

-- Assignments table
CREATE TABLE assignments (
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

-- Assignment targets
CREATE TABLE assignment_targets (
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

-- Submissions table
CREATE TABLE submissions (
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

-- Materials table
CREATE TABLE materials (
    id CHAR(36) PRIMARY KEY,
    teacher_id CHAR(36) NOT NULL,
    stage_id CHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    kind ENUM('PDF','AUDIO','VIDEO') DEFAULT 'PDF',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    FOREIGN KEY (stage_id) REFERENCES stages(id) ON DELETE CASCADE,
    INDEX idx_teacher (teacher_id),
    INDEX idx_stage (stage_id),
    INDEX idx_kind (kind)
);

-- Meetings table
CREATE TABLE meetings (
    id CHAR(36) PRIMARY KEY,
    teacher_id CHAR(36) NOT NULL,
    provider ENUM('ZOOM','MEET','JITSI','AGORA') DEFAULT 'AGORA',
    title VARCHAR(255) NOT NULL,
    scheduled_at DATETIME NOT NULL,
    duration_minutes INT NOT NULL,
    level_stage_id CHAR(36) NULL,
    group_id CHAR(36) NULL,
    join_url TEXT NULL,
    record TINYINT(1) DEFAULT 0,
    recording_url TEXT NULL,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    FOREIGN KEY (level_stage_id) REFERENCES stages(id) ON DELETE SET NULL,
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE SET NULL,
    INDEX idx_teacher (teacher_id),
    INDEX idx_scheduled (scheduled_at),
    INDEX idx_stage (level_stage_id),
    INDEX idx_group (group_id)
);

-- Certificates table
CREATE TABLE certificates (
    id CHAR(36) PRIMARY KEY,
    serial BIGINT AUTO_INCREMENT UNIQUE,
    student_id CHAR(36) NOT NULL,
    teacher_id CHAR(36) NOT NULL,
    stage_id CHAR(36) NOT NULL,
    grade VARCHAR(50) NOT NULL,
    issued_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    pdf_url TEXT NULL,
    template_id CHAR(36) NULL,
    status ENUM('PENDING','APPROVED','REJECTED') DEFAULT 'PENDING',
    approved_by CHAR(36) NULL,
    approved_at DATETIME NULL,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    FOREIGN KEY (stage_id) REFERENCES stages(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_student (student_id),
    INDEX idx_teacher (teacher_id),
    INDEX idx_status (status),
    INDEX idx_serial (serial)
);

-- Notifications table
CREATE TABLE notifications (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    read_flag TINYINT(1) DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_read (read_flag),
    INDEX idx_created (created_at)
);

-- Complaints table
CREATE TABLE complaints (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_created (created_at)
);

-- Complaint replies table
CREATE TABLE complaint_replies (
    id CHAR(36) PRIMARY KEY,
    complaint_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    body TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_complaint (complaint_id),
    INDEX idx_created (created_at)
);

-- Progress logs table
CREATE TABLE progress_logs (
    id CHAR(36) PRIMARY KEY,
    student_id CHAR(36) NOT NULL,
    teacher_id CHAR(36) NOT NULL,
    stage_id CHAR(36) NOT NULL,
    page_number INT NOT NULL,
    rating ENUM('متفوق','ممتاز','جيد','إعادة','غياب','إذن') NOT NULL,
    notes TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    FOREIGN KEY (stage_id) REFERENCES stages(id) ON DELETE CASCADE,
    INDEX idx_student (student_id),
    INDEX idx_teacher (teacher_id),
    INDEX idx_stage (stage_id),
    INDEX idx_created (created_at)
);

-- Student progress log table for detailed tracking
CREATE TABLE student_progress_log (
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

-- Admin toasts table
CREATE TABLE admin_toasts (
    id CHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    active TINYINT(1) DEFAULT 1,
    starts_at DATETIME NULL,
    ends_at DATETIME NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_active (active),
    INDEX idx_dates (starts_at, ends_at)
);

-- Quran surahs table
CREATE TABLE quran_surahs (
    id INT PRIMARY KEY,
    name_ar VARCHAR(100) NOT NULL,
    ayah_count INT NOT NULL,
    INDEX idx_id (id)
);

-- Quran ayahs table
CREATE TABLE quran_ayahs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    surah_id INT NOT NULL,
    ayah_number INT NOT NULL,
    text_ar MEDIUMTEXT NOT NULL,
    FOREIGN KEY (surah_id) REFERENCES quran_surahs(id) ON DELETE CASCADE,
    INDEX idx_surah_ayah (surah_id, ayah_number),
    INDEX idx_surah (surah_id)
);
