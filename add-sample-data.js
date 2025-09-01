const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Load environment variables manually
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      process.env[key.trim()] = valueParts.join('=').trim();
    }
  });
}

async function addSampleData() {
  const dbConfig = {
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'islamic_db',
    charset: 'utf8mb4',
    timezone: '+00:00',
    connectionLimit: 10,
  };

  try {
    console.log('🔍 Adding sample data...');
    
    const pool = mysql.createPool(dbConfig);
    const connection = await pool.getConnection();
    
    // Get existing IDs
    const [students] = await connection.execute('SELECT id FROM students LIMIT 1');
    const [teachers] = await connection.execute('SELECT id FROM teachers LIMIT 1');
    const [stages] = await connection.execute('SELECT id FROM stages LIMIT 1');
    const [users] = await connection.execute('SELECT id FROM users WHERE role = "STUDENT" LIMIT 1');
    
    if (!students.length || !teachers.length || !stages.length || !users.length) {
      console.log('❌ Need existing students, teachers, stages, and users first');
      return;
    }

    const studentId = students[0].id;
    const teacherId = teachers[0].id;
    const stageId = stages[0].id;
    const userId = users[0].id;

    console.log('✅ Found existing data:', { studentId, teacherId, stageId, userId });

    // Add sample assignments - using correct schema
    try {
      const assignmentId = uuidv4();
      await connection.execute(`
        INSERT INTO assignments (id, teacher_id, stage_id, title, description, due_at, created_at)
        VALUES (?, ?, ?, ?, ?, ?, NOW())
      `, [assignmentId, teacherId, stageId, 'واجب حفظ سورة الفاتحة', 'حفظ سورة الفاتحة مع التجويد', '2024-12-31 23:59:59']);
      console.log('✅ Added sample assignment');
    } catch (error) {
      console.log('❌ Error adding assignment:', error.message);
    }

    // Add sample meetings - using correct schema
    try {
      const meetingId = uuidv4();
      await connection.execute(`
        INSERT INTO meetings (id, teacher_id, provider, title, scheduled_at, duration_minutes, level_stage_id, join_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [meetingId, teacherId, 'ZOOM', 'اجتماع تعليمي', '2024-12-25 10:00:00', 60, stageId, 'https://zoom.us/j/123456789']);
      console.log('✅ Added sample meeting');
    } catch (error) {
      console.log('❌ Error adding meeting:', error.message);
    }

    // Add sample materials - using correct schema
    try {
      const materialId = uuidv4();
      await connection.execute(`
        INSERT INTO materials (id, teacher_id, stage_id, title, file_url, kind, created_at)
        VALUES (?, ?, ?, ?, ?, ?, NOW())
      `, [materialId, teacherId, stageId, 'ملف تعليمي', '["sample-material.pdf"]', 'PDF']);
      console.log('✅ Added sample material');
    } catch (error) {
      console.log('❌ Error adding material:', error.message);
    }

    // Add sample certificates
    try {
      const certificateId = uuidv4();
      await connection.execute(`
        INSERT INTO certificates (id, serial, student_id, teacher_id, stage_id, grade, issued_at, status)
        VALUES (?, ?, ?, ?, ?, ?, NOW(), ?)
      `, [certificateId, 1, studentId, teacherId, stageId, 'ممتاز', 'PENDING']);
      console.log('✅ Added sample certificate');
    } catch (error) {
      console.log('❌ Error adding certificate:', error.message);
    }

    // Add sample complaints
    try {
      const complaintId = uuidv4();
      await connection.execute(`
        INSERT INTO complaints (id, user_id, subject, body, created_at)
        VALUES (?, ?, ?, ?, NOW())
      `, [complaintId, userId, 'مشكلة في التطبيق', 'لا يمكنني الوصول للواجبات']);
      console.log('✅ Added sample complaint');
    } catch (error) {
      console.log('❌ Error adding complaint:', error.message);
    }

    console.log('✅ Sample data process completed!');
    
    connection.release();
    await pool.end();
    
  } catch (error) {
    console.error('❌ Error in sample data process:', error.message);
  }
}

addSampleData();
