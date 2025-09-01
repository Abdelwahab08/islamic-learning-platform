const mysql = require('mysql2/promise');

const MYSQL_URL = 'mysql://root:IxIZLRYNpqztjoTYQijUTsGbyIXRZXOf@metro.proxy.rlwy.net:16665/railway';

async function checkConstraints() {
  let connection;
  
  try {
    console.log('🔍 CHECKING FOREIGN KEY CONSTRAINTS');
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
    
    // Check certificates table structure
    console.log('\n📋 CERTIFICATES TABLE STRUCTURE:');
    const [certColumns] = await connection.execute('DESCRIBE certificates');
    certColumns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Key ? `(${col.Key})` : ''}`);
    });
    
    // Check teachers table
    console.log('\n👨‍🏫 TEACHERS TABLE:');
    const [teachers] = await connection.execute('SELECT id, user_id FROM teachers');
    teachers.forEach(teacher => {
      console.log(`  - Teacher ID: ${teacher.id}, User ID: ${teacher.user_id}`);
    });
    
    // Check current certificate teacher_ids
    console.log('\n📊 CURRENT CERTIFICATE TEACHER IDs:');
    const [certTeacherIds] = await connection.execute('SELECT DISTINCT teacher_id FROM certificates');
    certTeacherIds.forEach(cert => {
      console.log(`  - ${cert.teacher_id}`);
    });
    
    // The issue is that certificates.teacher_id references teachers.id, not users.id
    // So we need to use the teacher profile ID, not the user ID
    
    console.log('\n🔧 FIXING WITH CORRECT TEACHER PROFILE ID...');
    
    const [teacherProfile] = await connection.execute(`
      SELECT t.id as teacher_profile_id, u.id as user_id
      FROM teachers t
      JOIN users u ON t.user_id = u.id
      WHERE u.email = 'teacher@yaqeen.edu'
    `);
    
    if (teacherProfile.length > 0) {
      const teacherProfileId = teacherProfile[0].teacher_profile_id;
      const teacherUserId = teacherProfile[0].user_id;
      
      console.log(`✅ Teacher Profile ID: ${teacherProfileId}, User ID: ${teacherUserId}`);
      
      // Update certificates with teacher profile ID
      await connection.execute(`
        UPDATE certificates 
        SET teacher_id = ? 
        WHERE teacher_id = 'admin-teacher-id' OR teacher_id IS NULL
      `, [teacherProfileId]);
      
      // Update meetings with teacher user ID (meetings.teacher_id references users.id)
      await connection.execute(`
        UPDATE meetings 
        SET teacher_id = ? 
        WHERE teacher_id = 'admin-teacher-id' OR teacher_id IS NULL
      `, [teacherUserId]);
      
      // Update materials with teacher user ID (materials.teacher_id references users.id)
      await connection.execute(`
        UPDATE materials 
        SET teacher_id = ? 
        WHERE teacher_id = 'admin-teacher-id' OR teacher_id IS NULL
      `, [teacherUserId]);
      
      // Update lessons with teacher profile ID (lessons.teacher_id references teachers.id)
      await connection.execute(`
        UPDATE lessons 
        SET teacher_id = ? 
        WHERE teacher_id = 'admin-teacher-id' OR teacher_id IS NULL
      `, [teacherProfileId]);
      
      // Update assignments with teacher profile ID (assignments.teacher_id references teachers.id)
      await connection.execute(`
        UPDATE assignments 
        SET teacher_id = ? 
        WHERE teacher_id = 'admin-teacher-id' OR teacher_id IS NULL
      `, [teacherProfileId]);
      
      console.log('✅ Updated all records with correct teacher IDs');
      
      // Verify
      console.log('\n🧪 VERIFYING FIX...');
      
      const [fixedCerts] = await connection.execute(`
        SELECT c.title, u.first_name, u.last_name
        FROM certificates c
        LEFT JOIN teachers t ON c.teacher_id = t.id
        LEFT JOIN users u ON t.user_id = u.id
        LIMIT 3
      `);
      
      console.log('📋 Certificates with teachers:');
      fixedCerts.forEach((cert, index) => {
        console.log(`  ${index + 1}. ${cert.title} - Teacher: ${cert.first_name} ${cert.last_name}`);
      });
      
    } else {
      console.log('❌ Teacher not found');
    }
    
  } catch (error) {
    console.error('❌ Check failed:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkConstraints();
