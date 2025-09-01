const mysql = require('mysql2/promise');

const MYSQL_URL = 'mysql://root:IxIZLRYNpqztjoTYQijUTsGbyIXRZXOf@metro.proxy.rlwy.net:16665/railway';

async function fixAllTeacherIds() {
  let connection;
  
  try {
    console.log('🔧 FIXING ALL TEACHER IDs');
    console.log('=========================');
    
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
    
    // Get the correct teacher profile ID
    const [teacherProfile] = await connection.execute(`
      SELECT t.id as teacher_profile_id, u.id as user_id
      FROM teachers t
      JOIN users u ON t.user_id = u.id
      WHERE u.email = 'teacher@yaqeen.edu'
    `);
    
    if (teacherProfile.length === 0) {
      console.log('❌ Teacher not found');
      return;
    }
    
    const teacherProfileId = teacherProfile[0].teacher_profile_id;
    console.log(`✅ Teacher Profile ID: ${teacherProfileId}`);
    
    // Update all tables to use the teacher profile ID
    console.log('\n🔄 Updating all tables...');
    
    // Update certificates
    await connection.execute(`
      UPDATE certificates 
      SET teacher_id = ? 
      WHERE teacher_id = 'admin-teacher-id' OR teacher_id IS NULL
    `, [teacherProfileId]);
    
    // Update meetings
    await connection.execute(`
      UPDATE meetings 
      SET teacher_id = ? 
      WHERE teacher_id = 'admin-teacher-id' OR teacher_id IS NULL
    `, [teacherProfileId]);
    
    // Update materials
    await connection.execute(`
      UPDATE materials 
      SET teacher_id = ? 
      WHERE teacher_id = 'admin-teacher-id' OR teacher_id IS NULL
    `, [teacherProfileId]);
    
    // Update lessons
    await connection.execute(`
      UPDATE lessons 
      SET teacher_id = ? 
      WHERE teacher_id = 'admin-teacher-id' OR teacher_id IS NULL
    `, [teacherProfileId]);
    
    // Update assignments
    await connection.execute(`
      UPDATE assignments 
      SET teacher_id = ? 
      WHERE teacher_id = 'admin-teacher-id' OR teacher_id IS NULL
    `, [teacherProfileId]);
    
    console.log('✅ Updated all records with teacher profile ID');
    
    // Verify the fix
    console.log('\n🧪 VERIFYING FIX...');
    
    const [certificates] = await connection.execute(`
      SELECT c.title, u.first_name, u.last_name
      FROM certificates c
      LEFT JOIN teachers t ON c.teacher_id = t.id
      LEFT JOIN users u ON t.user_id = u.id
      LIMIT 3
    `);
    
    console.log('📋 Certificates with teachers:');
    certificates.forEach((cert, index) => {
      console.log(`  ${index + 1}. ${cert.title} - Teacher: ${cert.first_name} ${cert.last_name}`);
    });
    
    const [meetings] = await connection.execute(`
      SELECT m.title, u.first_name, u.last_name
      FROM meetings m
      LEFT JOIN teachers t ON m.teacher_id = t.id
      LEFT JOIN users u ON t.user_id = u.id
      LIMIT 3
    `);
    
    console.log('📅 Meetings with teachers:');
    meetings.forEach((meeting, index) => {
      console.log(`  ${index + 1}. ${meeting.title} - Teacher: ${meeting.first_name} ${meeting.last_name}`);
    });
    
    const [materials] = await connection.execute(`
      SELECT m.title, u.first_name, u.last_name
      FROM materials m
      LEFT JOIN teachers t ON m.teacher_id = t.id
      LEFT JOIN users u ON t.user_id = u.id
      LIMIT 3
    `);
    
    console.log('📚 Materials with teachers:');
    materials.forEach((material, index) => {
      console.log(`  ${index + 1}. ${material.title} - Teacher: ${material.first_name} ${material.last_name}`);
    });
    
    console.log('\n🎉 ALL TEACHER IDs FIXED SUCCESSFULLY!');
    
  } catch (error) {
    console.error('❌ Fix failed:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

fixAllTeacherIds();
