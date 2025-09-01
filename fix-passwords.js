const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function fixPasswords() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '',
    database: 'islamic_db'
  });

  try {
    console.log('🔧 Fixing password hashes...');
    
    // Define the correct passwords for each user
    const userPasswords = [
      { email: 'admin@islamic.edu', password: 'admin123' },
      { email: 'teacher@islamic.edu', password: 'teacher123' },
      { email: 'student@islamic.edu', password: 'student123' }
    ];
    
    for (const user of userPasswords) {
      // Hash the password
      const hashedPassword = await bcrypt.hash(user.password, 12);
      
      // Update the user's password hash
      await connection.execute(
        'UPDATE users SET password_hash = ? WHERE email = ?',
        [hashedPassword, user.email]
      );
      
      console.log(`✅ Updated password for ${user.email}`);
    }
    
    console.log('\n🔍 Verifying password fixes...');
    
    // Test the passwords
    for (const user of userPasswords) {
      const [result] = await connection.execute(
        'SELECT password_hash FROM users WHERE email = ?',
        [user.email]
      );
      
      if (result.length > 0) {
        const isValid = await bcrypt.compare(user.password, result[0].password_hash);
        console.log(`${isValid ? '✅' : '❌'} Password for ${user.email}: ${isValid ? 'VALID' : 'INVALID'}`);
      }
    }
    
    console.log('\n🎉 Password fixes completed!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

fixPasswords();
