const mysql = require('mysql2/promise');
const fs = require('fs').promises;

// Railway database configuration
const railwayConfig = process.env.MYSQL_URL || 'mysql://root:IxIZLRYNpqztjoTYQijUTsGbyIXRZXOf@metro.proxy.rlwy.net:16665/railway';

// Original islamic_db configuration
const originalDbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'islamic_db'
};

async function smartImport() {
  let originalConnection;
  let railwayConnection;
  
  try {
    console.log('🔗 Connecting to original islamic_db database...');
    originalConnection = await mysql.createConnection(originalDbConfig);
    console.log('✅ Connected to original database!');

    console.log('🔗 Connecting to Railway database...');
    railwayConnection = await mysql.createConnection(railwayConfig);
    console.log('✅ Connected to Railway!');

    // Get all tables from original database
    console.log('\n📋 Getting all tables from islamic_db...');
    const [tables] = await originalConnection.execute('SHOW TABLES');
    const tableNames = tables.map(row => Object.values(row)[0]);
    console.log(`Found ${tableNames.length} tables:`, tableNames);

    // Disable foreign key checks on Railway
    await railwayConnection.execute('SET FOREIGN_KEY_CHECKS = 0');
    console.log('🔓 Disabled foreign key checks');

    // Define import order to handle dependencies
    const importOrder = [
      'users',
      'teachers', 
      'students',
      'stages',
      'groups',
      'lessons',
      'materials',
      'meetings',
      'assignments',
      'certificates',
      'notifications',
      'messages',
      'complaints',
      'complaint_replies',
      'submissions',
      'progress_logs',
      'student_progress_log',
      'student_ratings',
      'teacher_students',
      'group_members',
      'group_students',
      'assignment_targets',
      'quran_surahs',
      'quran_ayahs',
      'admin_toasts',
      'v_user_access'
    ];

    // Process tables in dependency order
    for (const tableName of importOrder) {
      if (!tableNames.includes(tableName)) {
        console.log(`⏭️  Skipping ${tableName} (not found in original database)`);
        continue;
      }

      console.log(`\n📊 Processing table: ${tableName}`);
      
      try {
        // Get table structure
        const [createTable] = await originalConnection.execute(`SHOW CREATE TABLE \`${tableName}\``);
        let createStatement = createTable[0]['Create Table'];
        
        // Fix common issues
        createStatement = createStatement
          .replace(/uuid\(\)/g, 'UUID()') // Fix UUID function
          .replace(/AUTO_INCREMENT=\d+/g, 'AUTO_INCREMENT=1') // Reset auto increment
          .replace(/ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci/g, 'ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci');
        
        // Drop table if exists on Railway
        await railwayConnection.execute(`DROP TABLE IF EXISTS \`${tableName}\``);
        console.log(`  - Dropped existing table`);
        
        // Create table on Railway
        await railwayConnection.execute(createStatement);
        console.log(`  - Created table structure`);
        
        // Get all data from original table
        const [rows] = await originalConnection.execute(`SELECT * FROM \`${tableName}\``);
        
        if (rows.length > 0) {
          // Get column names
          const [columns] = await originalConnection.execute(`DESCRIBE \`${tableName}\``);
          const columnNames = columns.map(col => col.Field);
          
          // Insert data in batches
          const batchSize = 50;
          for (let i = 0; i < rows.length; i += batchSize) {
            const batch = rows.slice(i, i + batchSize);
            
            for (const row of batch) {
              const values = columnNames.map(col => {
                const value = row[col];
                if (value === null) return 'NULL';
                if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`;
                if (value instanceof Date) return `'${value.toISOString().slice(0, 19).replace('T', ' ')}'`;
                if (typeof value === 'boolean') return value ? '1' : '0';
                return value;
              });
              
              const insertQuery = `INSERT INTO \`${tableName}\` (\`${columnNames.join('`, `')}\`) VALUES (${values.join(', ')})`;
              await railwayConnection.execute(insertQuery);
            }
          }
          
          console.log(`  - Imported ${rows.length} records`);
        } else {
          console.log(`  - No data to import`);
        }
        
      } catch (error) {
        console.error(`  ❌ Error processing ${tableName}:`, error.message);
        // Continue with other tables
      }
    }

    // Re-enable foreign key checks
    await railwayConnection.execute('SET FOREIGN_KEY_CHECKS = 1');
    console.log('\n🔒 Re-enabled foreign key checks');

    // Verify import
    console.log('\n🔍 Verifying import...');
    const keyTables = ['users', 'teachers', 'students', 'certificates', 'materials', 'meetings', 'assignments', 'lessons', 'stages', 'groups'];
    
    for (const table of keyTables) {
      try {
        const [originalCount] = await originalConnection.execute(`SELECT COUNT(*) as count FROM \`${table}\``);
        const [railwayCount] = await railwayConnection.execute(`SELECT COUNT(*) as count FROM \`${table}\``);
        console.log(`  - ${table}: ${originalCount[0].count} → ${railwayCount[0].count} records`);
      } catch (error) {
        console.log(`  - ${table}: ❌ Table not found or error`);
      }
    }

    console.log('\n🎉 Smart import completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Test your admin dashboard');
    console.log('2. Test student dashboard');
    console.log('3. Test teacher dashboard');
    console.log('4. Verify all functionality works');

  } catch (error) {
    console.error('❌ Import failed:', error);
  } finally {
    if (originalConnection) await originalConnection.end();
    if (railwayConnection) await railwayConnection.end();
  }
}

smartImport();

