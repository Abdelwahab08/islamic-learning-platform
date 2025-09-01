const mysql = require('mysql2/promise');

const MYSQL_URL = 'mysql://root:IxIZLRYNpqztjoTYQijUTsGbyIXRZXOf@metro.proxy.rlwy.net:16665/railway';

async function checkTeacherStatus() {
  let connection;
  
  try {
    console.log('🔍 CHECKING TEACHER STATUS');
    console.log('==========================');
    
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
    
    // Check all users
    console.log('\n👥 ALL USERS:');
    const [users] = await connection.execute('SELECT id, email, role, first_name, last_name FROM users');
    users.forEach(user => {
      console.log(`  - ${user.email} (${user.role}): ${user.first_name} ${user.last_name}`);
    });
    
    // Check teachers table
    console.log('\n👨‍🏫 TEACHERS TABLE:');
    const [teachers] = await connection.execute('SELECT * FROM teachers');
    teachers.forEach(teacher => {
      console.log(`  - Teacher ID: ${teacher.id}, User ID: ${teacher.user_id}`);
    });
    
    // Check current data status
    console.log('\n📊 CURRENT DATA STATUS:');
    
    const [certificates] = await connection.execute('SELECT id, teacher_id FROM certificates LIMIT 3');
    console.log('📋 Certificates teacher_id:', certificates.map(c => ({ id: c.id, teacher_id: c.teacher_id })));
    
    const [meetings] = await connection.execute('SELECT id, teacher_id FROM meetings LIMIT 3');
    console.log('📅 Meetings teacher_id:', meetings.map(m => ({ id: m.id, teacher_id: m.teacher_id })));
    
    const [materials] = await connection.execute('SELECT id, teacher_id FROM materials LIMIT 3');
    console.log('📚 Materials teacher_id:', materials.map(m => ({ id: m.id, teacher_id: m.teacher_id })));
    
    const [lessons] = await connection.execute('SELECT id, teacher_id FROM lessons LIMIT 3');
    console.log('📖 Lessons teacher_id:', lessons.map(l => ({ id: l.id, teacher_id: l.teacher_id })));
    
    // Fix the linking issue
    console.log('\n🔧 FIXING TEACHER LINKS...');
    
    // Get the teacher user ID
    const [teacherUser] = await connection.execute(`
      SELECT u.id as user_id, t.id as teacher_id
      FROM users u
      JOIN teachers t ON u.id = t.user_id
      WHERE u.role = 'TEACHER'
      LIMIT 1
    `);
    
    if (teacherUser.length > 0) {
      const teacherUserId = teacherUser[0].user_id;
      const teacherId = teacherUser[0].teacher_id;
      
      console.log(`✅ Found teacher - User ID: ${teacherUserId}, Teacher ID: ${teacherId}`);
      
      // Update certificates with teacher user ID
      await connection.execute(`
        UPDATE certificates 
        SET teacher_id = ? 
        WHERE teacher_id IS NULL OR teacher_id = ''
      `, [teacherUserId]);
      
      // Update meetings with teacher user ID
      await connection.execute(`
        UPDATE meetings 
        SET teacher_id = ? 
        WHERE teacher_id IS NULL OR teacher_id = ''
      `, [teacherUserId]);
      
      // Update materials with teacher user ID
      await connection.execute(`
        UPDATE materials 
        SET teacher_id = ? 
        WHERE teacher_id IS NULL OR teacher_id = ''
      `, [teacherUserId]);
      
      // Update lessons with teacher profile ID
      await connection.execute(`
        UPDATE lessons 
        SET teacher_id = ? 
        WHERE teacher_id IS NULL OR teacher_id = ''
      `, [teacherId]);
      
      console.log('✅ Updated all records with teacher IDs');
      
      // Verify the fix
      console.log('\n🧪 VERIFYING FIX...');
      
      const [fixedCerts] = await connection.execute(`
        SELECT c.title, u.first_name, u.last_name
        FROM certificates c
        LEFT JOIN users u ON c.teacher_id = u.id
        LIMIT 3
      `);
      
      console.log('📋 Certificates with teachers:');
      fixedCerts.forEach((cert, index) => {
        console.log(`  ${index + 1}. ${cert.title} - Teacher: ${cert.first_name} ${cert.last_name}`);
      });
      
      const [fixedMeetings] = await connection.execute(`
        SELECT m.title, u.first_name, u.last_name
        FROM meetings m
        LEFT JOIN users u ON m.teacher_id = u.id
        LIMIT 3
      `);
      
      console.log('📅 Meetings with teachers:');
      fixedMeetings.forEach((meeting, index) => {
        console.log(`  ${index + 1}. ${meeting.title} - Teacher: ${meeting.first_name} ${meeting.last_name}`);
      });
      
    } else {
      console.log('❌ No teacher found');
    }
    
  } catch (error) {
    console.error('❌ Check failed:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkTeacherStatus();
