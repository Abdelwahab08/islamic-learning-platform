const mysql = require('mysql2/promise');
const bcryptjs = require('bcryptjs');

const MYSQL_URL = 'mysql://root:IxIZLRYNpqztjoTYQijUTsGbyIXRZXOf@metro.proxy.rlwy.net:16665/railway';

async function fixAdminPassword() {
  let connection;
  
  try {
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
    console.log('🔌 Connected to Railway MySQL');
    
    // Generate new password hash for admin123
    const newPasswordHash = await bcryptjs.hash('admin123', 12);
    console.log('🔐 Generated new password hash for admin123');
    
    // Update admin user password
    await connection.execute(
      'UPDATE users SET password_hash = ? WHERE email = ?',
      [newPasswordHash, 'admin@yaqeen.edu']
    );
    
    console.log('✅ Admin password updated');
    
    // Verify the update
    const [users] = await connection.execute(
      'SELECT password_hash FROM users WHERE email = ?',
      ['admin@yaqeen.edu']
    );
    
    if (users.length > 0) {
      const isPasswordValid = await bcryptjs.compare('admin123', users[0].password_hash);
      console.log('🔐 Password verification test:', isPasswordValid ? '✅ Valid' : '❌ Invalid');
    }
    
    console.log('🎉 Admin password fixed!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

fixAdminPassword();
