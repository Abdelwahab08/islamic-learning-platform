-- Create v_user_access view for login functionality
USE islamic_db;

CREATE OR REPLACE VIEW v_user_access AS
SELECT 
    u.id,
    u.email,
    u.role,
    u.is_approved,
    CASE 
        WHEN u.role = 'ADMIN' THEN '/dashboard/admin'
        WHEN u.role = 'TEACHER' AND u.is_approved = 1 THEN '/dashboard/teacher'
        WHEN u.role = 'TEACHER' AND u.is_approved = 0 THEN '/auth/awaiting-approval?type=teacher'
        WHEN u.role = 'STUDENT' AND u.is_approved = 1 THEN '/dashboard/student'
        WHEN u.role = 'STUDENT' AND u.is_approved = 0 THEN '/auth/awaiting-approval?type=student'
        WHEN u.role = 'ACADEMIC_MOD' THEN '/dashboard/admin'
        ELSE '/'
    END as redirect_path,
    CASE 
        WHEN u.role = 'ADMIN' THEN 'المدير'
        WHEN u.role = 'TEACHER' THEN 'المعلم'
        WHEN u.role = 'STUDENT' THEN 'الطالب'
        WHEN u.role = 'ACADEMIC_MOD' THEN 'المشرف الأكاديمي'
        ELSE 'مستخدم'
    END as role_name_ar
FROM users u;
