const mysql = require('mysql2/promise');

async function checkTeacherDatabase() {
  let connection;
  
  try {
    // Connect to Railway database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'containers-us-west-207.railway.app',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'your_password_here',
      database: process.env.DB_NAME || 'railway',
      port: process.env.DB_PORT || 8002
    });

    console.log('🔗 Connected to database');

    // Check teacher user account
    console.log('\n👨‍🏫 Checking teacher user account...');
    const [teacherUsers] = await connection.execute(
      'SELECT id, email, role, is_approved, onboarding_status FROM users WHERE email = ?',
      ['teacher@test.com']
    );
    
    if (teacherUsers.length === 0) {
      console.log('❌ No teacher user found with email teacher@test.com');
      return;
    }
    
    const teacherUser = teacherUsers[0];
    console.log('✅ Teacher user found:', {
      id: teacherUser.id,
      email: teacherUser.email,
      role: teacherUser.role,
      is_approved: teacherUser.is_approved,
      onboarding_status: teacherUser.onboarding_status
    });

    // Check if teacher record exists
    console.log('\n📋 Checking teacher record...');
    const [teacherRecords] = await connection.execute(
      'SELECT * FROM teachers WHERE user_id = ?',
      [teacherUser.id]
    );
    
    if (teacherRecords.length === 0) {
      console.log('❌ No teacher record found in teachers table');
      return;
    }
    
    const teacherRecord = teacherRecords[0];
    console.log('✅ Teacher record found:', {
      id: teacherRecord.id,
      user_id: teacherRecord.user_id,
      first_name: teacherRecord.first_name,
      last_name: teacherRecord.last_name
    });

    // Check teacher_students table
    console.log('\n👥 Checking teacher_students table...');
    const [teacherStudents] = await connection.execute(
      'SELECT COUNT(*) as count FROM teacher_students WHERE teacher_id = ?',
      [teacherRecord.id]
    );
    console.log(`Teacher has ${teacherStudents[0].count} assigned students`);

    // Check groups table
    console.log('\n🏷️ Checking groups table...');
    const [groups] = await connection.execute(
      'SELECT COUNT(*) as count FROM `groups` WHERE teacher_id = ?',
      [teacherRecord.id]
    );
    console.log(`Teacher has ${groups[0].count} groups`);

    // Check materials table
    console.log('\n📚 Checking materials table...');
    const [materials] = await connection.execute(
      'SELECT COUNT(*) as count FROM materials WHERE teacher_id = ?',
      [teacherRecord.id]
    );
    console.log(`Teacher has ${materials[0].count} materials`);

    // Check meetings table
    console.log('\n📅 Checking meetings table...');
    const [meetings] = await connection.execute(
      'SELECT COUNT(*) as count FROM meetings WHERE teacher_id = ?',
      [teacherRecord.id]
    );
    console.log(`Teacher has ${meetings[0].count} meetings`);

    // Check if tables exist
    console.log('\n🗄️ Checking table existence...');
    const tables = ['teacher_students', 'groups', 'materials', 'meetings', 'assignments', 'submissions'];
    
    for (const table of tables) {
      try {
        const [result] = await connection.execute(`SELECT 1 FROM ${table} LIMIT 1`);
        console.log(`✅ Table ${table} exists`);
      } catch (error) {
        console.log(`❌ Table ${table} does not exist or has issues:`, error.message);
      }
    }

  } catch (error) {
    console.error('❌ Database check failed:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the check
checkTeacherDatabase();
