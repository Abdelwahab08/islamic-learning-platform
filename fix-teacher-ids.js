const mysql = require('mysql2/promise');

const MYSQL_URL = 'mysql://root:IxIZLRYNpqztjoTYQijUTsGbyIXRZXOf@metro.proxy.rlwy.net:16665/railway';

async function fixTeacherIds() {
  let connection;
  
  try {
    console.log('🔧 FIXING TEACHER IDs IN DATABASE');
    console.log('==================================');
    
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
    
    // Get the correct teacher user ID
    const [teacherUser] = await connection.execute(`
      SELECT u.id as user_id, t.id as teacher_id
      FROM users u
      JOIN teachers t ON u.id = t.user_id
      WHERE u.role = 'TEACHER' AND u.email = 'teacher@yaqeen.edu'
    `);
    
    if (teacherUser.length === 0) {
      console.log('❌ Teacher not found');
      return;
    }
    
    const teacherUserId = teacherUser[0].user_id;
    const teacherId = teacherUser[0].teacher_id;
    
    console.log(`✅ Found teacher - User ID: ${teacherUserId}, Teacher ID: ${teacherId}`);
    
    // Update all records to use the correct teacher IDs
    console.log('\n🔄 Updating teacher IDs...');
    
    // Update certificates
    await connection.execute(`
      UPDATE certificates 
      SET teacher_id = ? 
      WHERE teacher_id = 'admin-teacher-id' OR teacher_id IS NULL
    `, [teacherUserId]);
    
    // Update meetings
    await connection.execute(`
      UPDATE meetings 
      SET teacher_id = ? 
      WHERE teacher_id = 'admin-teacher-id' OR teacher_id IS NULL
    `, [teacherUserId]);
    
    // Update materials
    await connection.execute(`
      UPDATE materials 
      SET teacher_id = ? 
      WHERE teacher_id = 'admin-teacher-id' OR teacher_id IS NULL
    `, [teacherUserId]);
    
    // Update lessons
    await connection.execute(`
      UPDATE lessons 
      SET teacher_id = ? 
      WHERE teacher_id = 'admin-teacher-id' OR teacher_id IS NULL
    `, [teacherId]);
    
    // Update assignments
    await connection.execute(`
      UPDATE assignments 
      SET teacher_id = ? 
      WHERE teacher_id = 'admin-teacher-id' OR teacher_id IS NULL
    `, [teacherId]);
    
    console.log('✅ Updated all records with correct teacher IDs');
    
    // Verify the fix
    console.log('\n🧪 VERIFYING FIX...');
    
    const [certificates] = await connection.execute(`
      SELECT c.title, u.first_name, u.last_name
      FROM certificates c
      LEFT JOIN users u ON c.teacher_id = u.id
      LIMIT 3
    `);
    
    console.log('📋 Certificates with teachers:');
    certificates.forEach((cert, index) => {
      console.log(`  ${index + 1}. ${cert.title} - Teacher: ${cert.first_name} ${cert.last_name}`);
    });
    
    const [meetings] = await connection.execute(`
      SELECT m.title, u.first_name, u.last_name
      FROM meetings m
      LEFT JOIN users u ON m.teacher_id = u.id
      LIMIT 3
    `);
    
    console.log('📅 Meetings with teachers:');
    meetings.forEach((meeting, index) => {
      console.log(`  ${index + 1}. ${meeting.title} - Teacher: ${meeting.first_name} ${meeting.last_name}`);
    });
    
    console.log('\n🎉 TEACHER IDs FIXED SUCCESSFULLY!');
    
  } catch (error) {
    console.error('❌ Fix failed:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

fixTeacherIds();
