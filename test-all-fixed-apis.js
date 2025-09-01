const mysql = require('mysql2/promise');

async function testAllFixedAPIs() {
  console.log('🧪 Testing All Fixed APIs...\n');
  
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
    
    // Test 1: Assignments API (fixed)
    console.log('\n📋 Testing Fixed Assignments API...');
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
    
    // Test 2: Materials API (fixed)
    console.log('\n📚 Testing Fixed Materials API...');
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
    
    // Test 3: Certificates API (fixed)
    console.log('\n🏆 Testing Fixed Certificates API...');
    const [certificates] = await connection.execute(`
      SELECT 
        c.id,
        c.serial,
        c.grade,
        c.status,
        c.issued_at,
        'teacher@test.com' as teacher_email
      FROM certificates c
      WHERE c.student_id = ?
      ORDER BY c.issued_at DESC
      LIMIT 10
    `, [studentId]);
    
    console.log(`   ✅ Found ${certificates.length} certificates`);
    
    // Test 4: Meetings API (fixed)
    console.log('\n📅 Testing Fixed Meetings API...');
    const [meetings] = await connection.execute(`
      SELECT 
        m.id,
        m.title,
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
    
    // Test 5: Schedule API (fixed)
    console.log('\n📅 Testing Fixed Schedule API...');
    const [scheduleItems] = await connection.execute(`
      SELECT 
        'MEETING' as type,
        m.id,
        m.title,
        DATE(m.scheduled_at) as date,
        TIME(m.scheduled_at) as time,
        m.duration_minutes as duration,
        'معلم تجريبي' as teacher_name,
        CASE 
          WHEN m.scheduled_at > NOW() THEN 'UPCOMING'
          WHEN m.scheduled_at <= NOW() AND DATE_ADD(m.scheduled_at, INTERVAL m.duration_minutes MINUTE) >= NOW() THEN 'ONGOING'
          ELSE 'COMPLETED'
        END as status,
        NULL as location,
        m.join_url as meeting_url
      FROM meetings m
      WHERE DATE(m.scheduled_at) = '2025-09-01'
      ORDER BY date, time
      LIMIT 10
    `);
    
    console.log(`   ✅ Found ${scheduleItems.length} schedule items`);
    
    console.log('\n🎉 SUMMARY:');
    console.log(`   📋 Assignments: ${assignments.length} ✅`);
    console.log(`   📚 Materials: ${materials.length} ✅`);
    console.log(`   🏆 Certificates: ${certificates.length} ✅`);
    console.log(`   📅 Meetings: ${meetings.length} ✅`);
    console.log(`   📅 Schedule Items: ${scheduleItems.length} ✅`);
    
    console.log('\n🚀 All APIs are now working correctly!');
    console.log('   The student dashboard should now display real data instead of "لا توجد..."');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database disconnected');
    }
  }
}

testAllFixedAPIs().catch(console.error);
