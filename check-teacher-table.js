const mysql = require('mysql2/promise');

async function checkTeacherTable() {
  console.log('🔍 Checking Teachers Table Structure...\n');
  
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
    
    // Check teachers table structure
    console.log('\n📋 Teachers Table Structure:');
    const [teachersColumns] = await connection.execute('DESCRIBE teachers');
    teachersColumns.forEach(col => {
      console.log(`   ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${col.Default ? `DEFAULT ${col.Default}` : ''}`);
    });
    
    // Check users table structure for teachers
    console.log('\n📋 Users Table Structure (for teachers):');
    const [usersColumns] = await connection.execute('DESCRIBE users');
    usersColumns.forEach(col => {
      console.log(`   ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${col.Default ? `DEFAULT ${col.Default}` : ''}`);
    });
    
    // Check current teachers
    console.log('\n👥 Current Teachers:');
    const [teachers] = await connection.execute(`
      SELECT 
        t.id,
        t.user_id,
        t.full_name,
        t.phone_number,
        t.verified,
        u.email,
        u.is_approved,
        u.onboarding_status
      FROM teachers t
      JOIN users u ON t.user_id = u.id
      ORDER BY u.created_at DESC
      LIMIT 5
    `);
    
    teachers.forEach(teacher => {
      console.log(`   ${teacher.full_name} (${teacher.email})`);
      console.log(`     Verified: ${teacher.verified}, Approved: ${teacher.is_approved}, Status: ${teacher.onboarding_status}`);
      console.log('');
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

checkTeacherTable().catch(console.error);
