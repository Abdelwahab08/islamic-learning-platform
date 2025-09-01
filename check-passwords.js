const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function checkPasswords() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '',
    database: 'islamic_db'
  });

  try {
    console.log('🔍 Checking password hashes...');
    
    // Get all users with their password hashes
    const [users] = await connection.execute('SELECT email, password_hash FROM users');
    
    console.log('📋 Users found:', users.length);
    
    for (const user of users) {
      console.log(`\n👤 User: ${user.email}`);
      console.log(`🔐 Password hash: ${user.password_hash}`);
      
      // Test password comparison
      const testPasswords = ['admin123', 'teacher123', 'student123'];
      
      for (const testPassword of testPasswords) {
        try {
          const isValid = await bcrypt.compare(testPassword, user.password_hash);
          if (isValid) {
            console.log(`✅ Password "${testPassword}" is VALID for ${user.email}`);
          }
        } catch (error) {
          console.log(`❌ Error testing password "${testPassword}":`, error.message);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

checkPasswords();
