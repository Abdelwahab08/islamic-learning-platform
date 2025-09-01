-- Setup Chat and Complaints Database Tables
-- Run this script in your MySQL database (phpMyAdmin or MySQL command line)

USE islamic_db;

-- 1. Create messages table for chat functionality
CREATE TABLE IF NOT EXISTS messages (
    id CHAR(36) PRIMARY KEY,
    sender_id CHAR(36) NOT NULL,
    receiver_id CHAR(36) NOT NULL,
    content TEXT NOT NULL,
    message_type ENUM('TEXT', 'FILE', 'AUDIO', 'IMAGE') DEFAULT 'TEXT',
    is_read TINYINT(1) DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_sender (sender_id),
    INDEX idx_receiver (receiver_id),
    INDEX idx_conversation (sender_id, receiver_id),
    INDEX idx_created_at (created_at),
    INDEX idx_unread (is_read)
);

-- 2. Update complaints table to match API requirements
ALTER TABLE complaints 
ADD COLUMN student_id CHAR(36) NULL AFTER user_id,
ADD COLUMN content TEXT NULL AFTER body,
ADD COLUMN status ENUM('PENDING', 'IN_PROGRESS', 'RESOLVED') DEFAULT 'PENDING' AFTER content,
ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at,
ADD FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
ADD INDEX idx_student (student_id),
ADD INDEX idx_status (status);

-- 3. Update existing complaints to use the new structure
UPDATE complaints SET 
    content = body,
    status = 'PENDING'
WHERE content IS NULL;

-- 4. Add some sample messages for testing (using existing teacher and student IDs)
INSERT INTO messages (id, sender_id, receiver_id, content, message_type, is_read, created_at) VALUES
('msg-001', '550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440012', 'مرحباً، كيف حالك؟', 'TEXT', 0, NOW()),
('msg-002', '550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440011', 'الحمد لله، أنا بخير. شكراً لك', 'TEXT', 1, NOW()),
('msg-003', '550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440012', 'هل تريد مساعدة في الواجب؟', 'TEXT', 0, NOW());

-- 5. Add some sample complaints for testing
INSERT INTO complaints (id, user_id, student_id, subject, body, content, status, created_at, updated_at) VALUES
('comp-001', '550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440012', 'مشكلة في الواجب', 'لا أستطيع فهم السؤال الثالث', 'لا أستطيع فهم السؤال الثالث', 'PENDING', NOW(), NOW()),
('comp-002', '550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440012', 'طلب مساعدة', 'أحتاج مساعدة في حفظ الآيات', 'أحتاج مساعدة في حفظ الآيات', 'IN_PROGRESS', NOW(), NOW());

-- 6. Verify tables were created
SELECT 'Messages table created successfully' as status;
SELECT COUNT(*) as message_count FROM messages;
SELECT 'Complaints table updated successfully' as status;
SELECT COUNT(*) as complaint_count FROM complaints;
