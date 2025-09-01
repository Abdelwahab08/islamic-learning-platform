# إعداد جدول الحصص (Lessons Table Setup)

## المشكلة
يظهر خطأ "فشل في تحميل الجدول الزمني" لأن جدول الحصص غير موجود في قاعدة البيانات.

## الحل
قم بإنشاء جدول الحصص في phpMyAdmin:

### الخطوات:
1. افتح phpMyAdmin في المتصفح
2. اختر قاعدة البيانات `islamic_db`
3. اذهب إلى تبويب "SQL"
4. انسخ والصق الكود التالي:

```sql
-- Create lessons table for teacher schedule
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
  
  FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
  FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE SET NULL,
  
  INDEX idx_teacher_day (teacher_id, day_of_week),
  INDEX idx_teacher_time (teacher_id, start_time),
  UNIQUE KEY unique_teacher_day_time (teacher_id, day_of_week, start_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

5. اضغط "Go" أو "تنفيذ"

### بعد إنشاء الجدول:
- ستعمل ميزة "إضافة حصة جديدة" بشكل طبيعي
- يمكن للمعلمين إضافة حصصهم الأسبوعية
- سيتم عرض الجدول الزمني بشكل صحيح

### ملاحظات:
- الجدول يحتوي على علاقات مع جداول المعلمين والمجموعات
- يتم منع التعارض في الأوقات تلقائياً
- يمكن إضافة غرفة اختيارية لكل حصة
