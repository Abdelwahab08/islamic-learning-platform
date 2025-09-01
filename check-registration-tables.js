const mysql = require('mysql2/promise');

async function checkRegistrationTables() {
  console.log('🔍 Checking Registration Tables Structure...\n');
  
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
    
    // Check users table structure
    console.log('\n📋 Users Table Structure:');
    const [usersColumns] = await connection.execute('DESCRIBE users');
    usersColumns.forEach(col => {
      console.log(`   ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${col.Default ? `DEFAULT ${col.Default}` : ''}`);
    });
    
    // Check students table structure
    console.log('\n📋 Students Table Structure:');
    const [studentsColumns] = await connection.execute('DESCRIBE students');
    studentsColumns.forEach(col => {
      console.log(`   ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${col.Default ? `DEFAULT ${col.Default}` : ''}`);
    });
    
    // Check stages table structure
    console.log('\n📋 Stages Table Structure:');
    const [stagesColumns] = await connection.execute('DESCRIBE stages');
    stagesColumns.forEach(col => {
      console.log(`   ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${col.Default ? `DEFAULT ${col.Default}` : ''}`);
    });
    
    // Check if we have default stages
    console.log('\n📋 Available Stages:');
    const [stages] = await connection.execute('SELECT id, code, name_ar, order_index FROM stages ORDER BY order_index');
    stages.forEach(stage => {
      console.log(`   ${stage.code}: ${stage.name_ar} (Order: ${stage.order_index})`);
    });
    
    // Check current users
    console.log('\n👥 Current Users:');
    const [users] = await connection.execute('SELECT id, email, role, is_approved, onboarding_status FROM users ORDER BY created_at DESC LIMIT 5');
    users.forEach(user => {
      console.log(`   ${user.email} (${user.role}) - Approved: ${user.is_approved}, Status: ${user.onboarding_status}`);
    });
    
    // Check if triggers exist
    console.log('\n🔧 Checking Triggers:');
    try {
      const [triggers] = await connection.execute('SHOW TRIGGERS');
      const studentTrigger = triggers.find(t => t.Trigger === 'trg_students_default_level');
      if (studentTrigger) {
        console.log('   ✅ Student default level trigger exists');
      } else {
        console.log('   ❌ Student default level trigger missing');
      }
    } catch (error) {
      console.log('   ❌ Error checking triggers:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database disconnected');
    }
  }
}

checkRegistrationTables().catch(console.error);
