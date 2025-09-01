const mysql = require('mysql2/promise');

const MYSQL_URL = 'mysql://root:IxIZLRYNpqztjoTYQijUTsGbyIXRZXOf@metro.proxy.rlwy.net:16665/railway';

async function createTeacher() {
  let connection;
  
  try {
    console.log('👨‍🏫 CREATING TEACHER USER');
    console.log('========================');
    
    const url = new URL(MYSQL_URL);
    const dbConfig = {
      host: url.hostname,
      port: parseInt(url.port || '3306'),
      user: url.username,
      password: url.password,
      database: url.pathname.slice(1),
      charset: 'utf8mb4',
      timezone: '+00:00'
    };
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to Railway MySQL');
    
    // Check if teacher already exists
    const [existingTeachers] = await connection.execute(`
      SELECT u.id, u.first_name, u.last_name, t.id as teacher_id
      FROM users u
      LEFT JOIN teachers t ON u.id = t.user_id
      WHERE u.role = 'TEACHER'
    `);
    
    if (existingTeachers.length > 0) {
      console.log('✅ Teacher already exists:', existingTeachers[0]);
      return existingTeachers[0];
    }
    
    // Create teacher user
    const teacherUserId = 'teacher-yaqeen-id';
    const teacherId = 'teacher-profile-id';
    
    console.log('👨‍🏫 Creating teacher user...');
    
    // Insert teacher user
    await connection.execute(`
      INSERT IGNORE INTO users (id, email, password_hash, role, is_approved, first_name, last_name, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    `, [
      teacherUserId,
      'teacher@yaqeen.edu',
      '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: password
      'TEACHER',
      1,
      'أحمد',
      'المعلم'
    ]);
    
    // Insert teacher profile
    await connection.execute(`
      INSERT IGNORE INTO teachers (id, user_id, specialization, bio, created_at)
      VALUES (?, ?, ?, ?, NOW())
    `, [
      teacherId,
      teacherUserId,
      'القرآن الكريم والتجويد',
      'معلم متخصص في تعليم القرآن الكريم وأحكام التجويد'
    ]);
    
    console.log('✅ Teacher created successfully');
    
    // Link teacher to existing data
    console.log('\n🔗 Linking teacher to existing data...');
    
    // Update certificates
    await connection.execute(`
      UPDATE certificates 
      SET teacher_id = ? 
      WHERE teacher_id IS NULL OR teacher_id = ''
    `, [teacherUserId]);
    
    // Update meetings
    await connection.execute(`
      UPDATE meetings 
      SET teacher_id = ? 
      WHERE teacher_id IS NULL OR teacher_id = ''
    `, [teacherUserId]);
    
    // Update materials
    await connection.execute(`
      UPDATE materials 
      SET teacher_id = ? 
      WHERE teacher_id IS NULL OR teacher_id = ''
    `, [teacherUserId]);
    
    // Update lessons
    await connection.execute(`
      UPDATE lessons 
      SET teacher_id = ? 
      WHERE teacher_id IS NULL OR teacher_id = ''
    `, [teacherId]);
    
    console.log('✅ Teacher linked to all existing data');
    
    // Verify
    const [certCount] = await connection.execute('SELECT COUNT(*) as count FROM certificates WHERE teacher_id = ?', [teacherUserId]);
    const [meetingCount] = await connection.execute('SELECT COUNT(*) as count FROM meetings WHERE teacher_id = ?', [teacherUserId]);
    const [materialCount] = await connection.execute('SELECT COUNT(*) as count FROM materials WHERE teacher_id = ?', [teacherUserId]);
    const [lessonCount] = await connection.execute('SELECT COUNT(*) as count FROM lessons WHERE teacher_id = ?', [teacherId]);
    
    console.log('\n📊 VERIFICATION:');
    console.log(`📋 Certificates: ${certCount[0].count}`);
    console.log(`📅 Meetings: ${meetingCount[0].count}`);
    console.log(`📚 Materials: ${materialCount[0].count}`);
    console.log(`📖 Lessons: ${lessonCount[0].count}`);
    
    console.log('\n🎉 TEACHER CREATED AND LINKED SUCCESSFULLY!');
    
  } catch (error) {
    console.error('❌ Creation failed:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

createTeacher();
