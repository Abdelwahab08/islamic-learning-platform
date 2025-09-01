const mysql = require('mysql2/promise');

async function testDatabase() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '',
    database: 'islamic_db'
  });

  try {
    console.log('🔍 Testing database connection...');
    
    // Test basic connection
    await connection.ping();
    console.log('✅ Database connection successful');
    
    // Check if tables exist
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('📋 Tables found:', tables.length);
    
    // Check users table
    const [users] = await connection.execute('SELECT COUNT(*) as count FROM users');
    console.log('👥 Users count:', users[0].count);
    
    // Check sample users
    const [sampleUsers] = await connection.execute('SELECT email, role FROM users LIMIT 5');
    console.log('🔍 Sample users:');
    sampleUsers.forEach(user => {
      console.log(`  - ${user.email} (${user.role})`);
    });
    
    // Test the view
    const [viewTest] = await connection.execute('SELECT * FROM v_user_access LIMIT 3');
    console.log('👁️ View test - Found', viewTest.length, 'records');
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
  } finally {
    await connection.end();
  }
}

testDatabase();
