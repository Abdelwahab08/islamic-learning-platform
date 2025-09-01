const mysql = require('mysql2/promise');

async function testStudentQuery() {
  console.log('🧪 Testing Student Query...\n');
  
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
    
    // Simulate what the API does
    const userEmail = 'student@test.com';
    
    // Step 1: Get user by email (like getCurrentUser does)
    const [users] = await connection.execute(
      'SELECT id, email FROM users WHERE email = ?',
      [userEmail]
    );
    
    if (users.length === 0) {
      console.log('❌ User not found!');
      return;
    }
    
    const userId = users[0].id;
    console.log(`👤 User ID: ${userId}`);
    
    // Step 2: Get student record (like the API does)
    const [students] = await connection.execute(
      'SELECT id FROM students WHERE user_id = ?',
      [userId]
    );
    
    if (students.length === 0) {
      console.log('❌ Student record not found!');
      return;
    }
    
    const studentId = students[0].id;
    console.log(`🎓 Student ID: ${studentId}`);
    
    // Step 3: Test the exact query the assignments API uses
    console.log('\n📋 Testing Assignments Query...');
    const [assignments] = await connection.execute(`
      SELECT
        a.id,
        a.title,
        a.description,
        COALESCE(a.due_at, a.due_date) AS due_at,
        a.created_at,
        'teacher@test.com' AS teacher_email,
        'معلم تجريبي' AS teacher_name,
        NULL AS submission_id
      FROM assignments a
      JOIN assignment_targets at ON at.assignment_id = a.id
      WHERE at.student_id = ?
      ORDER BY COALESCE(a.due_at, a.due_date) ASC
      LIMIT 10
    `, [studentId]);
    
    console.log(`   Found ${assignments.length} assignments`);
    assignments.forEach(a => {
      console.log(`   - ${a.title} (Due: ${a.due_at})`);
    });
    
    // Step 4: Test the certificates query
    console.log('\n🏆 Testing Certificates Query...');
    const [certificates] = await connection.execute(
      'SELECT * FROM certificates WHERE student_id = ? LIMIT 5',
      [studentId]
    );
    
    console.log(`   Found ${certificates.length} certificates`);
    certificates.forEach(c => {
      console.log(`   - Serial ${c.serial} (Grade: ${c.grade})`);
    });
    
    // Step 5: Test the meetings query
    console.log('\n📅 Testing Meetings Query...');
    const [meetings] = await connection.execute(
      'SELECT * FROM meetings WHERE scheduled_at > NOW() LIMIT 5',
      []
    );
    
    console.log(`   Found ${meetings.length} meetings`);
    meetings.forEach(m => {
      console.log(`   - ${m.title} (${m.scheduled_at})`);
    });
    
    // Step 6: Test the materials query
    console.log('\n📚 Testing Materials Query...');
    const [materials] = await connection.execute(
      'SELECT * FROM materials LIMIT 5',
      []
    );
    
    console.log(`   Found ${materials.length} materials`);
    materials.forEach(m => {
      console.log(`   - ${m.title}`);
    });
    
    console.log('\n✅ All queries tested successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database disconnected');
    }
  }
}

testStudentQuery().catch(console.error);
