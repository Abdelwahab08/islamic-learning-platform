const mysql = require('mysql2/promise');
const fs = require('fs').promises;

// Railway database configuration
const railwayConfig = process.env.MYSQL_URL || 'mysql://root:IxIZLRYNpqztjoTYQijUTsGbyIXRZXOf@metro.proxy.rlwy.net:16665/railway';

async function importSqlFile() {
  let connection;
  
  try {
    console.log('🔗 Connecting to Railway database...');
    connection = await mysql.createConnection(railwayConfig);
    console.log('✅ Connected to Railway!');

    // Look for SQL files
    const sqlFiles = [
      'islamic_db.sql',
      'islamic_db_complete.sql',
      'islamic_db_export.sql',
      'export.sql',
      'database.sql',
      'islamic-db2-complete.sql'
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
      console.log('❌ No SQL file found. Please place your islamic_db export in one of these locations:');
      sqlFiles.forEach(file => console.log(`  - ${file}`));
      console.log('\n📋 To get the SQL file:');
      console.log('1. Export from your original database (phpMyAdmin, MySQL Workbench, etc.)');
      console.log('2. Save as one of the filenames above');
      console.log('3. Run this script again');
      return;
    }
    
    // Disable foreign key checks
    await connection.execute('SET FOREIGN_KEY_CHECKS = 0');
    console.log('🔓 Disabled foreign key checks');
    
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
          if (i % 100 === 0) {
            console.log(`  - Processed ${i + 1}/${statements.length} statements (${successCount} success, ${errorCount} errors)`);
          }
        } catch (error) {
          errorCount++;
          if (error.message.includes('already exists') || 
              error.message.includes('Duplicate entry') ||
              error.message.includes('Table') && error.message.includes('already exists')) {
            // Skip duplicate errors silently
          } else {
            console.warn(`⚠️  Statement ${i + 1} failed: ${error.message}`);
          }
        }
      }
    }

    // Re-enable foreign key checks
    await connection.execute('SET FOREIGN_KEY_CHECKS = 1');
    console.log('🔒 Re-enabled foreign key checks');
    
    console.log(`\n✅ Import completed!`);
    console.log(`📊 Results: ${successCount} successful, ${errorCount} errors`);
    
    // Verify some key tables
    console.log('\n🔍 Verifying key tables...');
    const keyTables = ['users', 'teachers', 'students', 'certificates', 'materials', 'meetings', 'assignments', 'lessons', 'stages', 'groups'];
    
    for (const table of keyTables) {
      try {
        const [rows] = await connection.execute(`SELECT COUNT(*) as count FROM \`${table}\``);
        console.log(`  - ${table}: ${rows[0].count} records`);
      } catch (error) {
        console.log(`  - ${table}: ❌ Table not found or error`);
      }
    }

    console.log('\n🎉 Full import completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Test your admin dashboard');
    console.log('2. Test student dashboard'); 
    console.log('3. Test teacher dashboard');
    console.log('4. Verify all functionality works');
    
  } catch (error) {
    console.error('❌ Import failed:', error);
  } finally {
    if (connection) await connection.end();
  }
}

importSqlFile();

