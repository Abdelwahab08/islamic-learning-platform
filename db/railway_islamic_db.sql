SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";
SET NAMES utf8mb4;

-- ====== TABLES (NO views/procs) ======

CREATE TABLE IF NOT EXISTS admin_toasts (
  id char(36) NOT NULL,
  title varchar(255) NOT NULL,
  body text NOT NULL,
  active tinyint(1) DEFAULT 1,
  starts_at datetime DEFAULT NULL,
  ends_at datetime DEFAULT NULL,
  created_at datetime DEFAULT current_timestamp(),
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS assignments (
  id char(36) NOT NULL,
  teacher_id char(36) NOT NULL,
  stage_id char(36) DEFAULT NULL,
  title varchar(255) NOT NULL,
  description text DEFAULT NULL,
  due_at datetime DEFAULT NULL,
  created_at datetime DEFAULT current_timestamp(),
  PRIMARY KEY (id),
  KEY idx_assignments_teacher (teacher_id),
  KEY idx_assignments_stage (stage_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS assignment_targets (
  id char(36) NOT NULL,
  assignment_id char(36) NOT NULL,
  group_id char(36) DEFAULT NULL,
  student_id char(36) DEFAULT NULL,
  PRIMARY KEY (id),
  KEY idx_at_assignment (assignment_id),
  KEY idx_at_group (group_id),
  KEY idx_at_student (student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS certificates (
  id char(36) NOT NULL,
  serial bigint(20) NOT NULL,
  student_id char(36) NOT NULL,
  teacher_id char(36) NOT NULL,
  stage_id char(36) NOT NULL,
  grade varchar(50) NOT NULL,
  issued_at datetime DEFAULT current_timestamp(),
  pdf_url text DEFAULT NULL,
  template_id char(36) DEFAULT NULL,
  status enum('PENDING','APPROVED','REJECTED') DEFAULT 'PENDING',
  approved_by char(36) DEFAULT NULL,
  approved_at datetime DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_cert_serial (serial),
  KEY idx_cert_student (student_id),
  KEY idx_cert_teacher (teacher_id),
  KEY idx_cert_stage (stage_id),
  KEY idx_cert_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS complaints (
  id char(36) NOT NULL,
  user_id char(36) NOT NULL,
  student_id char(36) DEFAULT NULL,
  subject varchar(255) NOT NULL,
  body text NOT NULL,
  content text DEFAULT NULL,
  status enum('PENDING','IN_PROGRESS','RESOLVED') DEFAULT 'PENDING',
  created_at datetime DEFAULT current_timestamp(),
  updated_at datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (id),
  KEY idx_complaints_user (user_id),
  KEY idx_complaints_student (student_id),
  KEY idx_complaints_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS complaint_replies (
  id char(36) NOT NULL,
  complaint_id char(36) NOT NULL,
  user_id char(36) NOT NULL,
  body text NOT NULL,
  created_at datetime DEFAULT current_timestamp(),
  PRIMARY KEY (id),
  KEY idx_cr_complaint (complaint_id),
  KEY idx_cr_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- RESERVED WORD → backtick the table name
CREATE TABLE IF NOT EXISTS `groups` (
  id char(36) NOT NULL,
  teacher_id char(36) NOT NULL,
  name varchar(100) NOT NULL,
  description text DEFAULT NULL,
  max_students int(11) DEFAULT 20,
  created_at datetime DEFAULT current_timestamp(),
  level_stage_id char(36) DEFAULT NULL,
  updated_at datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (id),
  KEY idx_groups_teacher (teacher_id),
  KEY idx_groups_level (level_stage_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- (You can keep either group_members OR group_students. Your code uses group_students.)
CREATE TABLE IF NOT EXISTS group_students (
  id varchar(36) NOT NULL DEFAULT (uuid()),
  group_id varchar(36) NOT NULL,
  student_id varchar(36) NOT NULL,
  created_at timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (id),
  UNIQUE KEY uq_group_student (group_id, student_id),
  KEY idx_gs_group (group_id),
  KEY idx_gs_student (student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS lessons (
  id char(36) NOT NULL,
  teacher_id char(36) NOT NULL,
  day_of_week enum('monday','tuesday','wednesday','thursday','friday','saturday','sunday') NOT NULL,
  start_time time NOT NULL,
  subject varchar(255) NOT NULL,
  duration_minutes int(11) NOT NULL DEFAULT 60,
  room varchar(100) DEFAULT NULL,
  group_id char(36) DEFAULT NULL,
  created_at timestamp NOT NULL DEFAULT current_timestamp(),
  updated_at timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (id),
  KEY idx_lessons_teacher (teacher_id),
  KEY idx_lessons_group (group_id),
  KEY idx_lessons_day (day_of_week)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS materials (
  id char(36) NOT NULL,
  teacher_id char(36) NOT NULL,
  stage_id char(36) DEFAULT NULL,
  title varchar(255) NOT NULL,
  file_url text NOT NULL,
  kind enum('PDF','AUDIO','VIDEO') DEFAULT 'PDF',
  created_at datetime DEFAULT current_timestamp(),
  group_id char(36) DEFAULT NULL,
  PRIMARY KEY (id),
  KEY idx_materials_teacher (teacher_id),
  KEY idx_materials_stage (stage_id),
  KEY idx_materials_group (group_id),
  KEY idx_materials_kind (kind)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS meetings (
  id char(36) NOT NULL,
  teacher_id char(36) NOT NULL,
  provider enum('ZOOM','MEET','JITSI','AGORA') DEFAULT 'AGORA',
  title varchar(255) NOT NULL,
  scheduled_at datetime NOT NULL,
  duration_minutes int(11) NOT NULL,
  level_stage_id char(36) DEFAULT NULL,
  group_id char(36) DEFAULT NULL,
  join_url text DEFAULT NULL,
  record tinyint(1) DEFAULT 0,
  status enum('scheduled','active','completed','cancelled') DEFAULT 'scheduled',
  recording_url text DEFAULT NULL,
  PRIMARY KEY (id),
  KEY idx_meetings_teacher (teacher_id),
  KEY idx_meetings_group (group_id),
  KEY idx_meetings_stage (level_stage_id),
  KEY idx_meetings_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS messages (
  id char(36) NOT NULL,
  sender_id char(36) NOT NULL,
  receiver_id char(36) NOT NULL,
  content text NOT NULL,
  message_type enum('TEXT','FILE','AUDIO','IMAGE') DEFAULT 'TEXT',
  is_read tinyint(1) DEFAULT 0,
  created_at datetime DEFAULT current_timestamp(),
  updated_at datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (id),
  KEY idx_msg_sender (sender_id),
  KEY idx_msg_receiver (receiver_id),
  KEY idx_msg_read (is_read),
  KEY idx_msg_type (message_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS notifications (
  id char(36) NOT NULL,
  user_id char(36) NOT NULL,
  title varchar(255) NOT NULL,
  body text NOT NULL,
  read_flag tinyint(1) DEFAULT 0,
  created_at datetime DEFAULT current_timestamp(),
  PRIMARY KEY (id),
  KEY idx_notif_user (user_id),
  KEY idx_notif_read (read_flag),
  KEY idx_notif_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS progress_logs (
  id char(36) NOT NULL,
  student_id char(36) NOT NULL,
  teacher_id char(36) NOT NULL,
  stage_id char(36) NOT NULL,
  page_number int(11) NOT NULL,
  rating enum('متفوق','ممتاز','جيد','إعادة','غياب','إذن') NOT NULL,
  notes text DEFAULT NULL,
  created_at datetime DEFAULT current_timestamp(),
  PRIMARY KEY (id),
  KEY idx_pl_student (student_id),
  KEY idx_pl_teacher (teacher_id),
  KEY idx_pl_stage (stage_id),
  KEY idx_pl_rating (rating)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS quran_surahs (
  id int(11) NOT NULL,
  name_ar varchar(100) NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS quran_ayahs (
  id bigint(20) NOT NULL,
  surah_id int(11) NOT NULL,
  ayah_number int(11) NOT NULL,
  text_ar mediumtext NOT NULL,
  PRIMARY KEY (id),
  KEY idx_qayah_surah (surah_id),
  KEY idx_qayah_ayah (ayah_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS stages (
  id char(36) NOT NULL,
  name_ar varchar(255) NOT NULL,
  pages_count int(11) DEFAULT NULL,
  sort_order int(11) DEFAULT 0,
  PRIMARY KEY (id),
  KEY idx_stages_sort (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS students (
  id char(36) NOT NULL,
  user_id char(36) NOT NULL,
  full_name varchar(255) DEFAULT NULL,
  current_stage_id char(36) DEFAULT NULL,
  current_page int(11) DEFAULT 1,
  created_at datetime DEFAULT current_timestamp(),
  PRIMARY KEY (id),
  UNIQUE KEY uq_students_user (user_id),
  KEY idx_students_stage (current_stage_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS student_progress_log (
  id char(36) NOT NULL,
  student_id char(36) NOT NULL,
  stage_id char(36) NOT NULL,
  page_number int(11) NOT NULL,
  rating enum('متفوق','ممتاز','جيد','إعادة','غياب','إذن') NOT NULL,
  notes text DEFAULT NULL,
  created_at datetime DEFAULT current_timestamp(),
  PRIMARY KEY (id),
  KEY idx_spl_student (student_id),
  KEY idx_spl_stage (stage_id),
  KEY idx_spl_rating (rating)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS student_ratings (
  id char(36) NOT NULL,
  student_id char(36) NOT NULL,
  teacher_id char(36) NOT NULL,
  rating enum('متفوق','ممتاز','جيد','إعادة','غياب','إذن') NOT NULL,
  notes text DEFAULT NULL,
  created_at datetime DEFAULT current_timestamp(),
  PRIMARY KEY (id),
  KEY idx_sr_student (student_id),
  KEY idx_sr_teacher (teacher_id),
  KEY idx_sr_rating (rating)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS submissions (
  id char(36) NOT NULL,
  assignment_id char(36) NOT NULL,
  student_id char(36) NOT NULL,
  file_url text DEFAULT NULL,
  audio_url text DEFAULT NULL,
  duration_seconds int(11) DEFAULT NULL,
  status enum('PENDING','SUBMITTED','GRADED') DEFAULT 'PENDING',
  grade varchar(50) DEFAULT NULL,
  created_at datetime DEFAULT current_timestamp(),
  updated_at datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (id),
  KEY idx_sub_assignment (assignment_id),
  KEY idx_sub_student (student_id),
  KEY idx_sub_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS teachers (
  id char(36) NOT NULL,
  user_id char(36) NOT NULL,
  cv_url text DEFAULT NULL,
  verified tinyint(1) DEFAULT 0,
  created_at datetime DEFAULT current_timestamp(),
  PRIMARY KEY (id),
  UNIQUE KEY uq_teachers_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS teacher_students (
  id char(36) NOT NULL,
  teacher_id char(36) NOT NULL,
  student_id char(36) NOT NULL,
  created_at datetime DEFAULT current_timestamp(),
  PRIMARY KEY (id),
  UNIQUE KEY uq_teacher_student (teacher_id, student_id),
  KEY idx_ts_student (student_id),
  KEY idx_ts_teacher (teacher_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS users (
  id char(36) NOT NULL,
  email varchar(255) NOT NULL,
  password_hash varchar(255) NOT NULL,
  role enum('ADMIN','TEACHER','STUDENT','ACADEMIC_MOD') NOT NULL,
  is_approved tinyint(1) DEFAULT 0,
  first_name varchar(100) DEFAULT NULL,
  last_name varchar(100) DEFAULT NULL,
  phone varchar(50) DEFAULT NULL,
  created_at datetime DEFAULT current_timestamp(),
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email),
  KEY idx_users_role (role),
  KEY idx_users_approved (is_approved)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ====== OPTIONAL FK SECTION (add only if you want strict FK checks) ======
-- (Uncomment if you’re sure referenced IDs exist in your data)
-- ALTER TABLE assignments       ADD CONSTRAINT fk_assign_teacher  FOREIGN KEY (teacher_id)  REFERENCES teachers(id);
-- ALTER TABLE assignment_targets ADD CONSTRAINT fk_at_assignment  FOREIGN KEY (assignment_id) REFERENCES assignments(id);
-- ALTER TABLE assignment_targets ADD CONSTRAINT fk_at_group       FOREIGN KEY (group_id)     REFERENCES `groups`(id);
-- ALTER TABLE assignment_targets ADD CONSTRAINT fk_at_student     FOREIGN KEY (student_id)   REFERENCES students(id);
-- ALTER TABLE certificates      ADD CONSTRAINT fk_cert_student    FOREIGN KEY (student_id)   REFERENCES students(id);
-- ALTER TABLE certificates      ADD CONSTRAINT fk_cert_teacher    FOREIGN KEY (teacher_id)   REFERENCES teachers(id);
-- ALTER TABLE certificates      ADD CONSTRAINT fk_cert_stage      FOREIGN KEY (stage_id)     REFERENCES stages(id);
-- ALTER TABLE group_students    ADD CONSTRAINT fk_gs_group        FOREIGN KEY (group_id)     REFERENCES `groups`(id);
-- ALTER TABLE group_students    ADD CONSTRAINT fk_gs_student      FOREIGN KEY (student_id)   REFERENCES students(id);
-- ALTER TABLE lessons           ADD CONSTRAINT fk_lessons_teacher FOREIGN KEY (teacher_id)   REFERENCES teachers(id);
-- ALTER TABLE lessons           ADD CONSTRAINT fk_lessons_group   FOREIGN KEY (group_id)     REFERENCES `groups`(id);
-- ALTER TABLE materials         ADD CONSTRAINT fk_mat_teacher     FOREIGN KEY (teacher_id)   REFERENCES teachers(id);
-- ALTER TABLE materials         ADD CONSTRAINT fk_mat_stage       FOREIGN KEY (stage_id)     REFERENCES stages(id);
-- ALTER TABLE materials         ADD CONSTRAINT fk_mat_group       FOREIGN KEY (group_id)     REFERENCES `groups`(id);
-- ALTER TABLE meetings          ADD CONSTRAINT fk_meet_teacher    FOREIGN KEY (teacher_id)   REFERENCES teachers(id);
-- ALTER TABLE meetings          ADD CONSTRAINT fk_meet_group      FOREIGN KEY (group_id)     REFERENCES `groups`(id);
-- ALTER TABLE meetings          ADD CONSTRAINT fk_meet_stage      FOREIGN KEY (level_stage_id) REFERENCES stages(id);
-- ALTER TABLE teacher_students  ADD CONSTRAINT fk_ts_teacher      FOREIGN KEY (teacher_id)   REFERENCES teachers(id);
-- ALTER TABLE teacher_students  ADD CONSTRAINT fk_ts_student      FOREIGN KEY (student_id)   REFERENCES students(id);

-- ====== DATA SEED ======
-- Minimal data examples; feel free to append your inserts from your backup here.
-- (You can paste the INSERTs from your dump after this comment.)


