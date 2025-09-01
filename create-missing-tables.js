const mysql = require('mysql2/promise');
const fs = require('fs');

async function createMissingTables() {
  console.log('🔧 Creating Missing Tables for Teacher Functionality...\n');
  
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
    
    // Read the SQL file
    const sqlContent = fs.readFileSync('create-missing-tables.sql', 'utf8');
    const statements = sqlContent.split(';').filter(stmt => stmt.trim());
    
    console.log(`📋 Found ${statements.length} SQL statements to execute\n`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      if (!statement) continue;
      
      try {
        console.log(`🔧 Executing statement ${i + 1}...`);
        console.log(`   ${statement.substring(0, 100)}${statement.length > 100 ? '...' : ''}`);
        
        await connection.execute(statement);
        console.log(`   ✅ Statement ${i + 1} executed successfully`);
      } catch (error) {
        console.log(`   ⚠️  Statement ${i + 1} failed: ${error.message}`);
        // Continue with other statements
      }
      console.log('');
    }
    
    // Verify the tables were created
    console.log('🔍 Verifying table creation...');
    
    const tablesToCheck = ['groups', 'group_members', 'assignments', 'assignment_targets', 'submissions', 'certificates'];
    
    for (const tableName of tablesToCheck) {
      try {
        const [columns] = await connection.execute(`DESCRIBE ${tableName}`);
        console.log(`   ✅ ${tableName} table exists with ${columns.length} columns`);
      } catch (error) {
        console.log(`   ❌ ${tableName} table not found: ${error.message}`);
      }
    }
    
    console.log('\n🎉 Missing tables creation completed!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database disconnected');
    }
  }
}

createMissingTables().catch(console.error);
