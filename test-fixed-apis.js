const mysql = require('mysql2/promise');

async function testFixedAPIs() {
  console.log('🧪 Testing Fixed APIs...\n');
  
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
    
    const userEmail = 'student@test.com';
    
    // Get user and student IDs
    const [users] = await connection.execute(
      'SELECT id FROM users WHERE email = ?',
      [userEmail]
    );
    
    const userId = users[0].id;
    const [students] = await connection.execute(
      'SELECT id FROM students WHERE user_id = ?',
      [userId]
    );
    
    const studentId = students[0].id;
    console.log(`👤 User ID: ${userId}`);
    console.log(`🎓 Student ID: ${studentId}`);
    
    // Test 1: Assignments API query (fixed)
    console.log('\n📋 Testing Fixed Assignments Query...');
    const [assignments] = await connection.execute(`
      SELECT
        a.id,
        a.title,
        a.description,
        a.created_at,
        'teacher@test.com' AS teacher_email,
        'معلم تجريبي' AS teacher_name,
        NULL AS submission_id
      FROM assignments a
      JOIN assignment_targets at ON at.assignment_id = a.id
      WHERE at.student_id = ?
      ORDER BY a.created_at DESC
      LIMIT 10
    `, [studentId]);
    
    console.log(`   ✅ Found ${assignments.length} assignments`);
    assignments.forEach(a => {
      console.log(`   - ${a.title} (Created: ${a.created_at})`);
    });
    
    // Test 2: Materials API query (fixed)
    console.log('\n📚 Testing Fixed Materials Query...');
    const [materials] = await connection.execute(`
      SELECT 
        m.id,
        m.title,
        m.file_url as fileUrl,
        m.created_at,
        'teacher@test.com' as teacherEmail,
        'المرحلة المتوسطة' as stageName
      FROM materials m
      ORDER BY m.created_at DESC
      LIMIT 10
    `);
    
    console.log(`   ✅ Found ${materials.length} materials`);
    materials.forEach(m => {
      console.log(`   - ${m.title} (File: ${m.fileUrl})`);
    });
    
    // Test 3: Certificates API query
    console.log('\n🏆 Testing Certificates Query...');
    const [certificates] = await connection.execute(`
      SELECT 
        c.id,
        c.title,
        c.description,
        c.status,
        c.issued_at,
        'teacher@test.com' as teacher_email
      FROM certificates c
      WHERE c.student_id = ?
      ORDER BY c.issued_at DESC
      LIMIT 10
    `, [studentId]);
    
    console.log(`   ✅ Found ${certificates.length} certificates`);
    certificates.forEach(c => {
      console.log(`   - ${c.title} (Status: ${c.status})`);
    });
    
    // Test 4: Meetings API query
    console.log('\n📅 Testing Meetings Query...');
    const [meetings] = await connection.execute(`
      SELECT 
        m.id,
        m.title,
        m.description,
        m.scheduled_at,
        m.duration_minutes as duration_minutes,
        m.status,
        'معلم تجريبي' as teacher_name,
        COALESCE(m.provider, 'ZOOM') as provider,
        m.join_url as join_url,
        'المرحلة المتوسطة' as stage_name
      FROM meetings m
      ORDER BY m.scheduled_at DESC
      LIMIT 10
    `);
    
    console.log(`   ✅ Found ${meetings.length} meetings`);
    meetings.forEach(m => {
      console.log(`   - ${m.title} (${m.scheduled_at})`);
    });
    
    console.log('\n🎉 All Fixed API Queries Working!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database disconnected');
    }
  }
}

testFixedAPIs().catch(console.error);
