const mysql = require('mysql2/promise');

async function fixTeacherStatus() {
  console.log('🔧 Fixing Teacher Status...\n');
  
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
    
    // Fix teacher@test.com status
    console.log('🔧 Fixing teacher@test.com status...');
    try {
      const [result] = await connection.execute(`
        UPDATE users 
        SET onboarding_status = 'ACTIVE' 
        WHERE email = 'teacher@test.com'
      `);
      console.log(`   ✅ Updated ${result.affectedRows} teacher status`);
    } catch (error) {
      console.log('   ❌ Error updating teacher status:', error.message);
    }
    
    // Verify the fix
    console.log('\n🔍 Verifying teacher status...');
    try {
      const [teacher] = await connection.execute('SELECT * FROM users WHERE email = "teacher@test.com"');
      if (teacher.length > 0) {
        console.log(`   ✅ Teacher: ${teacher[0].email}, Status: ${teacher[0].onboarding_status}, Approved: ${teacher[0].is_approved}`);
      }
    } catch (error) {
      console.log('   ❌ Error checking teacher:', error.message);
    }
    
    console.log('\n🎉 Teacher status fix completed!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database disconnected');
    }
  }
}

fixTeacherStatus().catch(console.error);
