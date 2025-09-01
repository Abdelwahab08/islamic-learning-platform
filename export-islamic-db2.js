const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

// Configuration for your original islamic_db2 database
const originalDbConfig = {
  host: 'localhost', // or your original database host
  user: 'root', // or your original database user
  password: '', // your original database password
  database: 'islamic_db2'
};

async function exportDatabase() {
  let connection;
  
  try {
    console.log('🔗 Connecting to original islamic_db2 database...');
    connection = await mysql.createConnection(originalDbConfig);
    console.log('✅ Connected successfully!');

    // Get all tables
    console.log('\n📋 Getting all tables...');
    const [tables] = await connection.execute('SHOW TABLES');
    const tableNames = tables.map(row => Object.values(row)[0]);
    console.log(`Found ${tableNames.length} tables:`, tableNames);

    // Create export directory
    const exportDir = path.join(__dirname, 'islamic-db2-export');
    await fs.mkdir(exportDir, { recursive: true });

    // Export schema (CREATE TABLE statements)
    console.log('\n📝 Exporting database schema...');
    const schemaFile = path.join(exportDir, 'schema.sql');
    let schemaContent = '-- Islamic DB2 Schema Export\n';
    schemaContent += '-- Generated on: ' + new Date().toISOString() + '\n\n';
    schemaContent += 'SET FOREIGN_KEY_CHECKS = 0;\n\n';

    for (const tableName of tableNames) {
      console.log(`  - Exporting schema for ${tableName}...`);
      const [createTable] = await connection.execute(`SHOW CREATE TABLE \`${tableName}\``);
      schemaContent += `-- Table structure for ${tableName}\n`;
      schemaContent += createTable[0]['Create Table'] + ';\n\n';
    }

    schemaContent += 'SET FOREIGN_KEY_CHECKS = 1;\n';
    await fs.writeFile(schemaFile, schemaContent);
    console.log(`✅ Schema exported to: ${schemaFile}`);

    // Export data (excluding surahs table)
    console.log('\n📊 Exporting table data...');
    const dataFile = path.join(exportDir, 'data.sql');
    let dataContent = '-- Islamic DB2 Data Export\n';
    dataContent += '-- Generated on: ' + new Date().toISOString() + '\n\n';
    dataContent += 'SET FOREIGN_KEY_CHECKS = 0;\n\n';

    for (const tableName of tableNames) {
      if (tableName.toLowerCase().includes('surah')) {
        console.log(`  - Skipping ${tableName} (surah table)`);
        continue;
      }

      console.log(`  - Exporting data for ${tableName}...`);
      
      // Get table structure
      const [columns] = await connection.execute(`DESCRIBE \`${tableName}\``);
      const columnNames = columns.map(col => col.Field);
      
      // Get all data
      const [rows] = await connection.execute(`SELECT * FROM \`${tableName}\``);
      
      if (rows.length > 0) {
        dataContent += `-- Data for table ${tableName}\n`;
        dataContent += `DELETE FROM \`${tableName}\`;\n`;
        
        // Build INSERT statements
        for (const row of rows) {
          const values = columnNames.map(col => {
            const value = row[col];
            if (value === null) return 'NULL';
            if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`;
            if (value instanceof Date) return `'${value.toISOString().slice(0, 19).replace('T', ' ')}'`;
            return value;
          });
          
          dataContent += `INSERT INTO \`${tableName}\` (\`${columnNames.join('`, `')}\`) VALUES (${values.join(', ')});\n`;
        }
        dataContent += '\n';
        console.log(`    - Exported ${rows.length} rows`);
      } else {
        console.log(`    - No data in ${tableName}`);
      }
    }

    dataContent += 'SET FOREIGN_KEY_CHECKS = 1;\n';
    await fs.writeFile(dataFile, dataContent);
    console.log(`✅ Data exported to: ${dataFile}`);

    // Create combined file
    console.log('\n📦 Creating combined export file...');
    const combinedFile = path.join(exportDir, 'islamic-db2-complete.sql');
    const combinedContent = schemaContent + '\n' + dataContent;
    await fs.writeFile(combinedFile, combinedContent);
    console.log(`✅ Combined export created: ${combinedFile}`);

    // Create import script for Railway
    console.log('\n🚀 Creating Railway import script...');
    const importScript = `const mysql = require('mysql2/promise');
const fs = require('fs').promises;

// Railway database configuration
const railwayConfig = {
  host: process.env.MYSQLHOST || 'mysql.railway.internal',
  port: process.env.MYSQLPORT || 3306,
  user: process.env.MYSQLUSER || 'root',
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE || 'railway'
};

async function importToRailway() {
  let connection;
  
  try {
    console.log('🔗 Connecting to Railway database...');
    connection = await mysql.createConnection(railwayConfig);
    console.log('✅ Connected to Railway!');

    // Read the combined SQL file
    const sqlContent = await fs.readFile('islamic-db2-complete.sql', 'utf8');
    
    // Split by semicolon and execute each statement
    const statements = sqlContent.split(';').filter(stmt => stmt.trim());
    
    console.log(\`📥 Importing \${statements.length} SQL statements...\`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      if (statement && !statement.startsWith('--')) {
        try {
          await connection.execute(statement);
          if (i % 10 === 0) {
            console.log(\`  - Processed \${i + 1}/\${statements.length} statements\`);
          }
        } catch (error) {
          console.warn(\`⚠️  Statement \${i + 1} failed: \${error.message}\`);
        }
      }
    }
    
    console.log('✅ Import completed!');
    
  } catch (error) {
    console.error('❌ Import failed:', error);
  } finally {
    if (connection) await connection.end();
  }
}

importToRailway();
`;

    const importScriptPath = path.join(exportDir, 'import-to-railway.js');
    await fs.writeFile(importScriptPath, importScript);
    console.log(`✅ Railway import script created: ${importScriptPath}`);

    console.log('\n🎉 Export completed successfully!');
    console.log('\n📁 Files created:');
    console.log(`  - ${schemaFile}`);
    console.log(`  - ${dataFile}`);
    console.log(`  - ${combinedFile}`);
    console.log(`  - ${importScriptPath}`);
    
    console.log('\n📋 Next steps:');
    console.log('1. Update the database connection details in this script');
    console.log('2. Run: node export-islamic-db2.js');
    console.log('3. Copy the export files to your Railway project');
    console.log('4. Run: node import-to-railway.js');

  } catch (error) {
    console.error('❌ Export failed:', error);
  } finally {
    if (connection) await connection.end();
  }
}

exportDatabase();

