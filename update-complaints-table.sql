-- Update complaints table to match API requirements
ALTER TABLE complaints 
ADD COLUMN student_id CHAR(36) NULL AFTER user_id,
ADD COLUMN content TEXT NULL AFTER body,
ADD COLUMN status ENUM('PENDING', 'IN_PROGRESS', 'RESOLVED') DEFAULT 'PENDING' AFTER content,
ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at,
ADD FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
ADD INDEX idx_student (student_id),
ADD INDEX idx_status (status);

-- Update existing complaints to use the new structure
UPDATE complaints SET 
    content = body,
    status = 'PENDING'
WHERE content IS NULL;

-- Add some sample complaints for testing
INSERT INTO complaints (id, user_id, student_id, subject, body, content, status, created_at, updated_at) VALUES
('comp-001', '550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440012', 'مشكلة في الواجب', 'لا أستطيع فهم السؤال الثالث', 'لا أستطيع فهم السؤال الثالث', 'PENDING', NOW(), NOW()),
('comp-002', '550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440012', 'طلب مساعدة', 'أحتاج مساعدة في حفظ الآيات', 'أحتاج مساعدة في حفظ الآيات', 'IN_PROGRESS', NOW(), NOW());
