const mysql = require('mysql2/promise');
const fs = require('fs').promises;

// Railway database configuration
const railwayConfig = process.env.MYSQL_URL || 'mysql://root:IxIZLRYNpqztjoTYQijUTsGbyIXRZXOf@metro.proxy.rlwy.net:16665/railway';

async function importToRailway() {
  let connection;
  
  try {
    console.log('🔗 Connecting to Railway database...');
    connection = await mysql.createConnection(railwayConfig);
    console.log('✅ Connected to Railway!');

    // Check if we have the SQL file
    const sqlFiles = [
      'islamic-db2-complete.sql',
      'islamic-db2-export/islamic-db2-complete.sql',
      'export.sql',
      'database.sql'
    ];

    let sqlContent = '';
    let sqlFile = '';

    for (const file of sqlFiles) {
      try {
        sqlContent = await fs.readFile(file, 'utf8');
        sqlFile = file;
        console.log(`📄 Found SQL file: ${file}`);
        break;
      } catch (error) {
        // File not found, try next one
      }
    }

    if (!sqlContent) {
      console.log('❌ No SQL file found. Please place your islamic_db2 export in one of these locations:');
      sqlFiles.forEach(file => console.log(`  - ${file}`));
      return;
    }
    
    // Split by semicolon and execute each statement
    const statements = sqlContent.split(';').filter(stmt => stmt.trim());
    
    console.log(`📥 Importing ${statements.length} SQL statements from ${sqlFile}...`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      if (statement && !statement.startsWith('--')) {
        try {
          await connection.execute(statement);
          successCount++;
          if (i % 50 === 0) {
            console.log(`  - Processed ${i + 1}/${statements.length} statements (${successCount} success, ${errorCount} errors)`);
          }
        } catch (error) {
          errorCount++;
          if (error.message.includes('already exists') || error.message.includes('Duplicate entry')) {
            // Skip duplicate errors silently
          } else {
            console.warn(`⚠️  Statement ${i + 1} failed: ${error.message}`);
          }
        }
      }
    }
    
    console.log(`\n✅ Import completed!`);
    console.log(`📊 Results: ${successCount} successful, ${errorCount} errors`);
    
    // Verify some key tables
    console.log('\n🔍 Verifying key tables...');
    const keyTables = ['users', 'teachers', 'students', 'certificates', 'materials', 'meetings', 'assignments'];
    
    for (const table of keyTables) {
      try {
        const [rows] = await connection.execute(`SELECT COUNT(*) as count FROM \`${table}\``);
        console.log(`  - ${table}: ${rows[0].count} records`);
      } catch (error) {
        console.log(`  - ${table}: ❌ Table not found or error`);
      }
    }
    
  } catch (error) {
    console.error('❌ Import failed:', error);
  } finally {
    if (connection) await connection.end();
  }
}

importToRailway();
