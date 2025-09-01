const mysql = require('mysql2/promise');

async function checkStudentPassword() {
  console.log('🔐 Checking Student Password...\n');
  
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
    
    // Check student user details
    const [students] = await connection.execute(
      'SELECT id, email, password_hash, is_approved, role FROM users WHERE email = ?',
      ['student@test.com']
    );
    
    if (students.length === 0) {
      console.log('❌ Student user not found!');
      return;
    }
    
    const student = students[0];
    console.log('👤 Student Details:');
    console.log(`   ID: ${student.id}`);
    console.log(`   Email: ${student.email}`);
    console.log(`   Password Hash: ${student.password_hash}`);
    console.log(`   Is Approved: ${student.is_approved}`);
    console.log(`   Role: ${student.role}`);
    
    // Check if there are other test users
    const [allUsers] = await connection.execute(
      'SELECT email, password_hash, role FROM users WHERE email LIKE "%test%" LIMIT 5'
    );
    
    console.log('\n🔍 Other Test Users:');
    allUsers.forEach(user => {
      console.log(`   ${user.email} (${user.role}) - Hash: ${user.password_hash}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database disconnected');
    }
  }
}

checkStudentPassword().catch(console.error);
