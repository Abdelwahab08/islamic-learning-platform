const mysql = require('mysql2/promise');

async function checkMeetingsTable() {
  console.log('🔍 Checking Meetings Table Structure...\n');
  
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
    
    // Check table structure
    const [columns] = await connection.execute('DESCRIBE meetings');
    console.log('📅 Meetings Table Columns:');
    columns.forEach(col => {
      console.log(`   - ${col.Field} (${col.Type}) ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });
    
    // Check sample data
    const [sampleData] = await connection.execute('SELECT * FROM meetings LIMIT 3');
    console.log('\n📊 Sample Meetings Data:');
    sampleData.forEach(row => {
      console.log(`   - ID: ${row.id}, Title: ${row.title}, Scheduled: ${row.scheduled_at}`);
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

checkMeetingsTable().catch(console.error);
