const mysql = require('mysql2/promise');

const MYSQL_URL = 'mysql://root:IxIZLRYNpqztjoTYQijUTsGbyIXRZXOf@metro.proxy.rlwy.net:16665/railway';

async function fixTeacherLinks() {
  let connection;
  
  try {
    console.log('🔧 FIXING TEACHER LINKS IN DATABASE');
    console.log('===================================');
    
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
    
    // Step 1: Get teacher user ID
    const [teachers] = await connection.execute(`
      SELECT t.id, u.id as user_id, u.first_name, u.last_name
      FROM teachers t
      JOIN users u ON t.user_id = u.id
      WHERE u.role = 'TEACHER'
      LIMIT 1
    `);
    
    if (teachers.length === 0) {
      console.log('❌ No teachers found');
      return;
    }
    
    const teacherId = teachers[0].id;
    const teacherUserId = teachers[0].user_id;
    
    console.log(`✅ Found teacher: ${teachers[0].first_name} ${teachers[0].last_name} (ID: ${teacherId})`);
    
    // Step 2: Update certificates with teacher_id
    console.log('\n🏆 Updating certificates with teacher_id...');
    await connection.execute(`
      UPDATE certificates 
      SET teacher_id = ? 
      WHERE teacher_id IS NULL OR teacher_id = ''
    `, [teacherUserId]);
    
    const [certCount] = await connection.execute('SELECT COUNT(*) as count FROM certificates WHERE teacher_id = ?', [teacherUserId]);
    console.log(`✅ Updated ${certCount[0].count} certificates`);
    
    // Step 3: Update meetings with teacher_id
    console.log('\n📅 Updating meetings with teacher_id...');
    await connection.execute(`
      UPDATE meetings 
      SET teacher_id = ? 
      WHERE teacher_id IS NULL OR teacher_id = ''
    `, [teacherUserId]);
    
    const [meetingCount] = await connection.execute('SELECT COUNT(*) as count FROM meetings WHERE teacher_id = ?', [teacherUserId]);
    console.log(`✅ Updated ${meetingCount[0].count} meetings`);
    
    // Step 4: Update materials with teacher_id
    console.log('\n📚 Updating materials with teacher_id...');
    await connection.execute(`
      UPDATE materials 
      SET teacher_id = ? 
      WHERE teacher_id IS NULL OR teacher_id = ''
    `, [teacherUserId]);
    
    const [materialCount] = await connection.execute('SELECT COUNT(*) as count FROM materials WHERE teacher_id = ?', [teacherUserId]);
    console.log(`✅ Updated ${materialCount[0].count} materials`);
    
    // Step 5: Update lessons with teacher_id
    console.log('\n📖 Updating lessons with teacher_id...');
    await connection.execute(`
      UPDATE lessons 
      SET teacher_id = ? 
      WHERE teacher_id IS NULL OR teacher_id = ''
    `, [teacherId]);
    
    const [lessonCount] = await connection.execute('SELECT COUNT(*) as count FROM lessons WHERE teacher_id = ?', [teacherId]);
    console.log(`✅ Updated ${lessonCount[0].count} lessons`);
    
    // Step 6: Verify the fixes
    console.log('\n🧪 VERIFYING FIXES');
    console.log('==================');
    
    const [certificates] = await connection.execute(`
      SELECT c.title, u.first_name, u.last_name
      FROM certificates c
      LEFT JOIN users u ON c.teacher_id = u.id
      LIMIT 3
    `);
    
    console.log('📋 Certificates with teacher names:');
    certificates.forEach((cert, index) => {
      console.log(`  ${index + 1}. ${cert.title} - Teacher: ${cert.first_name} ${cert.last_name}`);
    });
    
    const [meetings] = await connection.execute(`
      SELECT m.title, u.first_name, u.last_name
      FROM meetings m
      LEFT JOIN users u ON m.teacher_id = u.id
      LIMIT 3
    `);
    
    console.log('📅 Meetings with teacher names:');
    meetings.forEach((meeting, index) => {
      console.log(`  ${index + 1}. ${meeting.title} - Teacher: ${meeting.first_name} ${meeting.last_name}`);
    });
    
    console.log('\n🎉 TEACHER LINKS FIXED SUCCESSFULLY!');
    console.log('✅ All certificates, meetings, materials, and lessons now have proper teacher links');
    
  } catch (error) {
    console.error('❌ Fix failed:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

fixTeacherLinks();
