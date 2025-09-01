const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function createTestUser() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '',
    database: 'islamic_db'
  });

  try {
    console.log('🔍 Creating test user with pending status...');
    
    // Hash password
    const passwordHash = await bcrypt.hash('test123', 12);
    
    // Create test teacher user with pending status
    const userId = 'test-user-1234-5678-9012-345678901234';
    const teacherId = 'test-teacher-1234-5678-9012-345678901234';
    
    // Insert user with pending status
    await connection.execute(`
      INSERT INTO users (id, role, email, password_hash, is_approved, onboarding_status) 
      VALUES (?, 'TEACHER', 'test.teacher@islamic.edu', ?, 0, 'PENDING_REVIEW')
    `, [userId, passwordHash]);
    
    // Insert teacher record
    await connection.execute(`
      INSERT INTO teachers (id, user_id, verified) 
      VALUES (?, ?, 0)
    `, [teacherId, userId]);
    
    console.log('✅ Test teacher user created successfully!');
    console.log('📧 Email: test.teacher@islamic.edu');
    console.log('🔑 Password: test123');
    console.log('📊 Status: PENDING (في الانتظار)');
    console.log('');
    console.log('🎯 Now you can test the approval system:');
    console.log('1. Go to http://localhost:3006/dashboard/admin/users');
    console.log('2. Login as admin@islamic.edu / admin123');
    console.log('3. You should see the test teacher with "في الانتظار" status');
    console.log('4. Click "موافقة" to approve the user');
    console.log('5. The status should change to "موافق عليه"');
    
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      console.log('ℹ️ Test user already exists, skipping creation...');
    } else {
      console.error('❌ Error creating test user:', error.message);
    }
  } finally {
    await connection.end();
  }
}

createTestUser();
