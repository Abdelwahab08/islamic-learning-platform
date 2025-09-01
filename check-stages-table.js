const mysql = require('mysql2/promise');

async function checkStagesTable() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'islamic_db'
  });

  try {
    console.log('🔍 Checking stages table structure...');
    
    // Check if table exists
    const [tables] = await connection.execute('SHOW TABLES LIKE "stages"');
    if (tables.length === 0) {
      console.log('❌ Stages table does not exist');
      return;
    }
    
    // Get table structure
    const [columns] = await connection.execute('DESCRIBE stages');
    console.log('📋 Stages table columns:');
    columns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    // Check existing data
    const [rows] = await connection.execute('SELECT * FROM stages LIMIT 5');
    console.log(`📊 Found ${rows.length} existing records in stages table`);
    if (rows.length > 0) {
      console.log('Sample data:', rows[0]);
    }
    
  } catch (error) {
    console.error('❌ Error checking stages table:', error.message);
  } finally {
    await connection.end();
  }
}

checkStagesTable();
