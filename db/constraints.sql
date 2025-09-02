-- Core uniqueness
ALTER TABLE users           ADD CONSTRAINT uq_users_email       UNIQUE (email);
ALTER TABLE teachers        ADD CONSTRAINT uq_teachers_user     UNIQUE (user_id);
ALTER TABLE students        ADD CONSTRAINT uq_students_user     UNIQUE (user_id);
ALTER TABLE teacher_students ADD CONSTRAINT uq_teacher_student  UNIQUE (teacher_id, student_id);
ALTER TABLE group_students   ADD CONSTRAINT uq_group_student    UNIQUE (group_id, student_id);
ALTER TABLE certificates     ADD CONSTRAINT uq_certificate_serial UNIQUE (serial);

-- NOT NULL / defaults where needed
ALTER TABLE users
  MODIFY email VARCHAR(255) NOT NULL,
  MODIFY password_hash VARCHAR(255) NOT NULL,
  MODIFY role ENUM('ADMIN','TEACHER','STUDENT','ACADEMIC_MOD') NOT NULL,
  MODIFY is_approved TINYINT(1) NOT NULL DEFAULT 0;

ALTER TABLE students
  MODIFY user_id CHAR(36) NOT NULL,
  MODIFY current_page INT NOT NULL DEFAULT 1;

ALTER TABLE teachers
  MODIFY user_id CHAR(36) NOT NULL;

ALTER TABLE assignments
  MODIFY teacher_id CHAR(36) NOT NULL,
  MODIFY title VARCHAR(255) NOT NULL;

ALTER TABLE submissions
  MODIFY assignment_id CHAR(36) NOT NULL,
  MODIFY student_id CHAR(36) NOT NULL;

ALTER TABLE `groups`
  MODIFY teacher_id CHAR(36) NOT NULL,
  MODIFY name VARCHAR(100) NOT NULL;

ALTER TABLE group_students
  MODIFY group_id VARCHAR(36) NOT NULL,
  MODIFY student_id VARCHAR(36) NOT NULL;

ALTER TABLE meetings
  MODIFY teacher_id CHAR(36) NOT NULL,
  MODIFY title VARCHAR(255) NOT NULL,
  MODIFY scheduled_at DATETIME NOT NULL,
  MODIFY duration_minutes INT NOT NULL;

ALTER TABLE materials
  MODIFY teacher_id CHAR(36) NOT NULL,
  MODIFY title VARCHAR(255) NOT NULL,
  MODIFY file_url TEXT NOT NULL;

-- Helpful indexes
CREATE INDEX idx_users_role       ON users(role);
CREATE INDEX idx_users_approved   ON users(is_approved);
CREATE INDEX idx_students_user    ON students(user_id);
CREATE INDEX idx_teachers_user    ON teachers(user_id);
CREATE INDEX idx_assign_teacher   ON assignments(teacher_id);
CREATE INDEX idx_materials_group  ON materials(group_id);
CREATE INDEX idx_meetings_group   ON meetings(group_id);
CREATE INDEX idx_gs_group         ON group_students(group_id);
CREATE INDEX idx_gs_student       ON group_students(student_id);
CREATE INDEX idx_ts_teacher       ON teacher_students(teacher_id);
CREATE INDEX idx_ts_student       ON teacher_students(student_id);
CREATE INDEX idx_sub_assignment   ON submissions(assignment_id);
CREATE INDEX idx_sub_student      ON submissions(student_id);


