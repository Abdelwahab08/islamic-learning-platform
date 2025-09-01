const mysql = require('mysql2/promise');

async function addTestData() {
  console.log('🚀 Adding Test Data for Student...\n');
  
  // Database connection details from Railway
  const connectionConfig = {
    host: 'metro.proxy.rlwy.net',
    port: 16665,
    user: 'root',
    password: 'IxIZLRYNpqztjoTYQijUTsGbyIXRZXOf',
    database: 'railway'
  };

  let connection;
  
  try {
    console.log('1️⃣ Connecting to database...');
    connection = await mysql.createConnection(connectionConfig);
    console.log('   ✅ Database connection successful!');
    
    // Get the student user ID
    const [students] = await connection.execute(
      'SELECT * FROM users WHERE email = ?',
      ['student@test.com']
    );
    
    if (students.length === 0) {
      console.log('❌ Student user not found');
      return;
    }
    
    const studentUserId = students[0].id;
    console.log(`   👤 Student User ID: ${studentUserId}`);
    
    // Get student record
    const [studentRecords] = await connection.execute(
      'SELECT * FROM students WHERE user_id = ?',
      [studentUserId]
    );
    
    if (studentRecords.length === 0) {
      console.log('❌ Student record not found');
      return;
    }
    
    const studentId = studentRecords[0].id;
    console.log(`   🎓 Student Record ID: ${studentId}`);
    
    // Get existing teacher or create a new one with unique email
    console.log('\n2️⃣ Getting/Creating Test Teacher...');
    let teacherUserId;
    let teacherId;
    
    const [existingTeachers] = await connection.execute(
      'SELECT u.id as user_id, t.id as teacher_id FROM users u JOIN teachers t ON u.id = t.user_id WHERE u.role = ? LIMIT 1',
      ['TEACHER']
    );
    
    if (existingTeachers.length > 0) {
      teacherUserId = existingTeachers[0].user_id;
      teacherId = existingTeachers[0].teacher_id;
      console.log(`   👨‍🏫 Using existing teacher: ${teacherUserId}`);
    } else {
      // Create a new teacher with unique email
      teacherUserId = `test-teacher-${Date.now()}`;
      await connection.execute(
        'INSERT INTO users (id, role, email, password_hash, is_approved, first_name, last_name, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
        [teacherUserId, 'TEACHER', `teacher${Date.now()}@test.com`, '$2a$10$test', 1, 'معلم', 'تجريبي']
      );
      console.log(`   ✅ Created teacher user: ${teacherUserId}`);
      
      // Create teacher record
      teacherId = `teacher-record-${Date.now()}`;
      await connection.execute(
        'INSERT INTO teachers (id, user_id, specialization, experience_years, created_at) VALUES (?, ?, ?, ?, NOW())',
        [teacherId, teacherUserId, 'تجويد القرآن الكريم', 5]
      );
      console.log(`   ✅ Created teacher record: ${teacherId}`);
    }
    
    // Get existing stage
    let stageId;
    const [stages] = await connection.execute(
      'SELECT * FROM stages LIMIT 1'
    );
    
    if (stages.length > 0) {
      stageId = stages[0].id;
      console.log(`   📚 Using existing stage: ${stageId}`);
    } else {
      // Create a test stage
      stageId = `stage-${Date.now()}`;
      await connection.execute(
        'INSERT INTO stages (id, name, description, level, created_at) VALUES (?, ?, ?, ?, NOW())',
        [stageId, 'المرحلة الابتدائية', 'مرحلة تعليمية تجريبية', 1]
      );
      console.log(`   📚 Created test stage: ${stageId}`);
    }
    
    console.log('\n3️⃣ Adding Test Assignments...');
    
    // Add test assignments
    const assignments = [
      {
        id: `assign-${Date.now()}-1`,
        teacher_id: teacherId,
        stage_id: stageId,
        title: 'واجب حفظ سورة الفاتحة',
        description: 'حفظ سورة الفاتحة مع التجويد الصحيح',
        due_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        created_at: new Date()
      },
      {
        id: `assign-${Date.now()}-2`,
        teacher_id: teacherId,
        stage_id: stageId,
        title: 'واجب قراءة سورة البقرة',
        description: 'قراءة أول 10 آيات من سورة البقرة',
        due_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        created_at: new Date()
      },
      {
        id: `assign-${Date.now()}-3`,
        teacher_id: teacherId,
        stage_id: stageId,
        title: 'واجب التجويد',
        description: 'ممارسة أحكام التجويد الأساسية',
        due_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        created_at: new Date()
      }
    ];
    
    for (const assignment of assignments) {
      await connection.execute(
        'INSERT INTO assignments (id, teacher_id, stage_id, title, description, due_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [assignment.id, assignment.teacher_id, assignment.stage_id, assignment.title, assignment.description, assignment.due_at, assignment.created_at]
      );
      console.log(`   ✅ Added assignment: ${assignment.title}`);
    }
    
    // Add assignment targets (link assignments to student)
    for (const assignment of assignments) {
      await connection.execute(
        'INSERT INTO assignment_targets (id, assignment_id, student_id) VALUES (?, ?, ?)',
        [`target-${Date.now()}-${Math.random()}`, assignment.id, studentId]
      );
    }
    console.log('   ✅ Linked assignments to student');
    
    console.log('\n4️⃣ Adding Test Certificates...');
    
    // Add test certificates
    const certificates = [
      {
        id: `cert-${Date.now()}-1`,
        serial: 1001,
        student_id: studentId,
        teacher_id: teacherId,
        stage_id: stageId,
        grade: 'ممتاز',
        issued_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        status: 'APPROVED'
      },
      {
        id: `cert-${Date.now()}-2`,
        serial: 1002,
        student_id: studentId,
        teacher_id: teacherId,
        stage_id: stageId,
        grade: 'ممتاز',
        issued_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        status: 'APPROVED'
      }
    ];
    
    for (const cert of certificates) {
      await connection.execute(
        'INSERT INTO certificates (id, serial, student_id, teacher_id, stage_id, grade, issued_at, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [cert.id, cert.serial, cert.student_id, cert.teacher_id, cert.stage_id, cert.grade, cert.issued_at, cert.status]
      );
      console.log(`   ✅ Added certificate: Serial ${cert.serial}`);
    }
    
    console.log('\n5️⃣ Adding Test Meetings...');
    
    // Add test meetings
    const meetings = [
      {
        id: `meeting-${Date.now()}-1`,
        teacher_id: teacherId,
        provider: 'ZOOM',
        title: 'درس تجويد سورة الفاتحة',
        description: 'درس في أحكام التجويد الأساسية',
        scheduled_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        duration_minutes: 60,
        status: 'scheduled'
      },
      {
        id: `meeting-${Date.now()}-2`,
        teacher_id: teacherId,
        provider: 'MEET',
        title: 'مراجعة حفظ القرآن',
        description: 'مراجعة ما تم حفظه من القرآن الكريم',
        scheduled_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        duration_minutes: 45,
        status: 'scheduled'
      },
      {
        id: `meeting-${Date.now()}-3`,
        teacher_id: teacherId,
        provider: 'ZOOM',
        title: 'درس تفسير القرآن',
        description: 'تفسير معاني الآيات القرآنية',
        scheduled_at: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        duration_minutes: 90,
        status: 'scheduled'
      }
    ];
    
    for (const meeting of meetings) {
      await connection.execute(
        'INSERT INTO meetings (id, teacher_id, provider, title, description, scheduled_at, duration_minutes, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [meeting.id, meeting.teacher_id, meeting.provider, meeting.title, meeting.description, meeting.scheduled_at, meeting.duration_minutes, meeting.status]
      );
      console.log(`   ✅ Added meeting: ${meeting.title}`);
    }
    
    console.log('\n6️⃣ Adding Test Materials...');
    
    // Add test materials
    const materials = [
      {
        id: `material-${Date.now()}-1`,
        teacher_id: teacherId,
        title: 'دليل التجويد الأساسي',
        file_path: '/materials/tajweed-basic.pdf',
        created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)
      },
      {
        id: `material-${Date.now()}-2`,
        teacher_id: teacherId,
        title: 'أحكام النون الساكنة والتنوين',
        file_path: '/materials/nun-rules.pdf',
        created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
      },
      {
        id: `material-${Date.now()}-3`,
        teacher_id: teacherId,
        title: 'قواعد القراءة الصحيحة',
        file_path: '/materials/reading-rules.pdf',
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      }
    ];
    
    for (const material of materials) {
      await connection.execute(
        'INSERT INTO materials (id, teacher_id, title, file_path, created_at) VALUES (?, ?, ?, ?, ?)',
        [material.id, material.teacher_id, material.title, material.file_path, material.created_at]
      );
      console.log(`   ✅ Added material: ${material.title}`);
    }
    
    console.log('\n7️⃣ Updating Student Progress...');
    
    // Update student progress to show real data
    await connection.execute(
      'UPDATE students SET current_stage_id = ?, current_page = 1, stage_id = ?, updated_at = NOW() WHERE id = ?',
      [stageId, stageId, studentId]
    );
    console.log('   ✅ Updated student progress');
    
    console.log('\n🎯 Test Data Summary:');
    console.log('   ✅ 3 Assignments added and linked to student');
    console.log('   ✅ 2 Certificates added for student');
    console.log('   ✅ 3 Meetings scheduled');
    console.log('   ✅ 3 Materials added');
    console.log('   ✅ Student progress updated (Page 1 of 10)');
    
    console.log('\n📊 Now the student dashboard should show:');
    console.log('   📋 3 Total Assignments');
    console.log('   🏆 2 Total Certificates');
    console.log('   📅 3 Upcoming Meetings');
    console.log('   📚 3 Total Materials');
    console.log('   📖 Current Page: 1 / 10');
    console.log('   🎯 Progress: 10% (1 out of 10 pages)');
    
  } catch (error) {
    console.error('❌ Error adding test data:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

addTestData().catch(console.error);
