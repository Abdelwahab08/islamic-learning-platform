const mysql = require('mysql2/promise');

// Test with the correct hostname and different possible database names
async function testConnection() {
  const host = 'sql105.infinityfree.com';
  const user = 'if0_39829212';
  const password = 'cH1VFIv7x1m';
  
  // Possible database names
  const possibleDatabases = [
    'if0_39829212_islamic_db',
    'if0_39829212_XXX',
    'if0_39829212_islamic',
    'if0_39829212_db'
  ];

  for (const database of possibleDatabases) {
    try {
      console.log(`🔌 Testing connection to: ${host}`);
      console.log(`📊 Database: ${database}`);
      
      const connection = await mysql.createConnection({
        host: host,
        user: user,
        password: password,
        database: database
      });
      
      console.log(`✅ SUCCESS! Connected to: ${host}`);
      console.log(`✅ Database: ${database}`);
      
      // Test a simple query
      const [result] = await connection.execute('SELECT COUNT(*) as count FROM users');
      console.log(`📊 Users in database: ${result[0].count}`);
      
      await connection.end();
      console.log(`🎉 ${database} is the correct database name!\n`);
      return database;
      
    } catch (error) {
      console.log(`❌ Failed to connect to database: ${database}`);
      console.log(`   Error: ${error.message}\n`);
    }
  }
  
  console.log('❌ Could not connect to any database');
  return null;
}

testConnection();
