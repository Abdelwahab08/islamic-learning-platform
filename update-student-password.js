const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function updateStudentPassword() {
  console.log('🔐 Updating Student Password...\n');
  
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
    
    // Update existing student password
    const email = 'student@test.com';
    const newPassword = 'password123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 New Password: ${newPassword}`);
    
    // Update the password
    await connection.execute(
      'UPDATE users SET password_hash = ? WHERE email = ?',
      [hashedPassword, email]
    );
    
    console.log('✅ Password updated successfully!');
    console.log('\n🎉 You can now log in with:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${newPassword}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database disconnected');
    }
  }
}

updateStudentPassword().catch(console.error);
