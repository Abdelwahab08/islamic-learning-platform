const mysql = require('mysql2/promise');

async function checkCertificatesTable() {
  console.log('🔍 Checking Certificates Table Structure...\n');
  
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
    const [columns] = await connection.execute('DESCRIBE certificates');
    console.log('🏆 Certificates Table Columns:');
    columns.forEach(col => {
      console.log(`   - ${col.Field} (${col.Type}) ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });
    
    // Check sample data
    const [sampleData] = await connection.execute('SELECT * FROM certificates LIMIT 3');
    console.log('\n📊 Sample Certificates Data:');
    sampleData.forEach(row => {
      console.log(`   - ID: ${row.id}, Serial: ${row.serial}, Grade: ${row.grade}`);
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

checkCertificatesTable().catch(console.error);
