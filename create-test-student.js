const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function createTestStudent() {
  console.log('👤 Creating New Test Student...\n');
  
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
    
    // Create a new student user with known password
    const email = 'student2@test.com';
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Password: ${password}`);
    console.log(`🔐 Hashed: ${hashedPassword}`);
    
    // Check if user already exists
    const [existingUsers] = await connection.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    
    if (existingUsers.length > 0) {
      console.log('⚠️ User already exists, updating password...');
      await connection.execute(
        'UPDATE users SET password_hash = ? WHERE email = ?',
        [hashedPassword, email]
      );
      console.log('✅ Password updated!');
    } else {
      // Create new user
      const userId = `student2-${Date.now()}`;
      await connection.execute(
        'INSERT INTO users (id, email, password_hash, role, is_approved, first_name, last_name, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
        [userId, email, hashedPassword, 'STUDENT', 1, 'طالب', 'تجريبي']
      );
      console.log('✅ User created!');
      
      // Create student record
      const studentId = `student-profile-${Date.now()}`;
      await connection.execute(
        'INSERT INTO students (id, user_id, current_stage_id, current_page, stage_id, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
        [studentId, userId, '550e8400-e29b-41d4-a716-446655440001', 1, '550e8400-e29b-41d4-a716-446655440001']
      );
      console.log('✅ Student record created!');
    }
    
    console.log('\n🎉 Test student created/updated successfully!');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log('   You can now log in with these credentials');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database disconnected');
    }
  }
}

createTestStudent().catch(console.error);
