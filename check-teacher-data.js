const mysql = require('mysql2/promise');

async function checkTeacherData() {
  console.log('🔍 Checking Teacher Data in Database...\n');
  
  const connectionConfig = {
    host: 'metro.proxy.rlwy.net',
    port: 16665,
    user: 'root',
    password: 'IxIZLRYNpqztjoTYQijUTsGbyIXRZXOf',
    database: 'railway'
  };

  let connection;
  
  try {
    connection = await mysql.createConnection(connectionConfig);
    console.log('✅ Database connected!');
    
    // Check teachers table
    console.log('\n📋 Teachers Table:');
    try {
      const [teachers] = await connection.execute('SELECT * FROM teachers');
      console.log(`   Found ${teachers.length} teachers:`);
      teachers.forEach(teacher => {
        console.log(`     ID: ${teacher.id}, User ID: ${teacher.user_id}, Name: ${teacher.full_name}, Verified: ${teacher.verified}`);
      });
    } catch (error) {
      console.log('   ❌ Error:', error.message);
    }
    
    // Check users table for teachers
    console.log('\n📋 Users Table (Teachers):');
    try {
      const [teacherUsers] = await connection.execute('SELECT * FROM users WHERE role = "TEACHER"');
      console.log(`   Found ${teacherUsers.length} teacher users:`);
      teacherUsers.forEach(user => {
        console.log(`     ID: ${user.id}, Email: ${user.email}, Approved: ${user.is_approved}, Status: ${user.onboarding_status}`);
      });
    } catch (error) {
      console.log('   ❌ Error:', error.message);
    }
    
    // Check groups table
    console.log('\n📋 Groups Table:');
    try {
      const [groups] = await connection.execute('SELECT * FROM `groups`');
      console.log(`   Found ${groups.length} groups:`);
      groups.forEach(group => {
        console.log(`     ID: ${group.id}, Name: ${group.name}, Teacher ID: ${group.teacher_id}`);
      });
    } catch (error) {
      console.log('   ❌ Error:', error.message);
    }
    
    // Check teacher_students table
    console.log('\n📋 Teacher-Students Table:');
    try {
      const [teacherStudents] = await connection.execute('SELECT * FROM teacher_students');
      console.log(`   Found ${teacherStudents.length} teacher-student relationships:`);
      teacherStudents.forEach(ts => {
        console.log(`     Teacher ID: ${ts.teacher_id}, Student ID: ${ts.student_id}`);
      });
    } catch (error) {
      console.log('   ❌ Error:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database disconnected');
    }
  }
}

checkTeacherData().catch(console.error);
