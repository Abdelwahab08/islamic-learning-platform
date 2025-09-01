const mysql = require('mysql2/promise');
const fs = require('fs');

async function createGroupsTableFixed() {
  console.log('🔧 Creating Groups Table (Fixed)...\n');
  
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
    const sqlContent = fs.readFileSync('create-groups-table-fixed.sql', 'utf8');
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
    
    // Verify the groups table was created
    console.log('🔍 Verifying groups table creation...');
    
    try {
      const [columns] = await connection.execute('DESCRIBE `groups`');
      console.log(`   ✅ groups table exists with ${columns.length} columns`);
      
      const [groupMembersColumns] = await connection.execute('DESCRIBE `group_members`');
      console.log(`   ✅ group_members table exists with ${groupMembersColumns.length} columns`);
      
      const [assignmentTargetsColumns] = await connection.execute('DESCRIBE `assignment_targets`');
      console.log(`   ✅ assignment_targets table exists with ${assignmentTargetsColumns.length} columns`);
      
    } catch (error) {
      console.log(`   ❌ Error checking tables: ${error.message}`);
    }
    
    console.log('\n🎉 Groups table creation completed!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database disconnected');
    }
  }
}

createGroupsTableFixed().catch(console.error);
