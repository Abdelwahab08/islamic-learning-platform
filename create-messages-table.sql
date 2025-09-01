-- Create messages table for chat functionality
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

-- Add some sample messages for testing
INSERT INTO messages (id, sender_id, receiver_id, content, message_type, is_read, created_at) VALUES
('msg-001', '550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440012', 'مرحباً، كيف حالك؟', 'TEXT', 0, NOW()),
('msg-002', '550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440011', 'الحمد لله، أنا بخير. شكراً لك', 'TEXT', 1, NOW()),
('msg-003', '550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440012', 'هل تريد مساعدة في الواجب؟', 'TEXT', 0, NOW());
