const mysql = require('mysql2/promise');

const MYSQL_URL = 'mysql://root:IxIZLRYNpqztjoTYQijUTsGbyIXRZXOf@metro.proxy.rlwy.net:16665/railway';

async function debugStudentDashboard() {
  let connection;
  
  try {
    console.log('🔍 DEBUGGING STUDENT DASHBOARD ISSUES');
    console.log('=====================================');
    
    const url = new URL(MYSQL_URL);
    const dbConfig = {
      host: url.hostname,
      port: parseInt(url.port || '3306'),
      user: url.username,
      password: url.password,
      database: url.pathname.slice(1),
      charset: 'utf8mb4',
      timezone: '+00:00'
    };
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to Railway MySQL');
    
    // Check table structures first
    console.log('\n📋 CHECKING TABLE STRUCTURES');
    console.log('----------------------------');
    
    const tables = ['certificates', 'meetings', 'lessons', 'teachers', 'students', 'users'];
    
    for (const table of tables) {
      try {
        const [columns] = await connection.execute(`DESCRIBE ${table}`);
        console.log(`\n📊 ${table.toUpperCase()} table structure:`);
        columns.forEach(col => {
          console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(NULL)' : '(NOT NULL)'}`);
        });
      } catch (error) {
        console.log(`❌ Error describing ${table}: ${error.message}`);
      }
    }
    
    // Test 1: Certificates Query (فشل في تحميل الشهادات)
    console.log('\n🏆 TEST 1: Certificates Loading (فشل في تحميل الشهادات)');
    console.log('------------------------------------------------------');
    
    try {
      const [certificates] = await connection.execute(`
        SELECT 
          c.id, c.title, c.description, c.status, c.issued_at,
          s.first_name as student_first_name, s.last_name as student_last_name,
          u.first_name as teacher_first_name, u.last_name as teacher_last_name
        FROM certificates c
        LEFT JOIN students st ON c.student_id = st.id
        LEFT JOIN users s ON st.user_id = s.id
        LEFT JOIN users u ON c.teacher_id = u.id
        LIMIT 5
      `);
      
      console.log(`✅ Certificates query successful: ${certificates.length} found`);
      certificates.forEach((cert, index) => {
        console.log(`  ${index + 1}. ${cert.title} - ${cert.status} - Student: ${cert.student_first_name} ${cert.student_last_name}`);
      });
    } catch (error) {
      console.log(`❌ Certificates query failed: ${error.message}`);
    }
    
    // Test 2: Meetings Query (فشل في تحميل الاجتماعات)
    console.log('\n📅 TEST 2: Meetings Loading (فشل في تحميل الاجتماعات)');
    console.log('---------------------------------------------------');
    
    try {
      const [meetings] = await connection.execute(`
        SELECT 
          m.id, m.title, m.description, m.meeting_date, m.start_time, m.end_time,
          u.first_name as teacher_first_name, u.last_name as teacher_last_name
        FROM meetings m
        LEFT JOIN users u ON m.teacher_id = u.id
        ORDER BY m.meeting_date DESC, m.start_time
        LIMIT 5
      `);
      
      console.log(`✅ Meetings query successful: ${meetings.length} found`);
      meetings.forEach((meeting, index) => {
        console.log(`  ${index + 1}. ${meeting.title} - ${meeting.meeting_date} at ${meeting.start_time}`);
      });
    } catch (error) {
      console.log(`❌ Meetings query failed: ${error.message}`);
    }
    
    // Test 3: Schedule/Timetable Query (فشل في تحميل الجدول الزمني)
    console.log('\n📅 TEST 3: Schedule/Timetable Loading (فشل في تحميل الجدول الزمني)');
    console.log('----------------------------------------------------------------');
    
    try {
      const [lessons] = await connection.execute(`
        SELECT 
          l.id, l.title, l.description, l.day_of_week, l.start_time, l.end_time,
          u.first_name as teacher_first_name, u.last_name as teacher_last_name
        FROM lessons l
        LEFT JOIN users u ON l.teacher_id = u.id
        ORDER BY FIELD(l.day_of_week, 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'), l.start_time
        LIMIT 10
      `);
      
      console.log(`✅ Lessons/Schedule query successful: ${lessons.length} found`);
      lessons.forEach((lesson, index) => {
        console.log(`  ${index + 1}. ${lesson.title} - ${lesson.day_of_week} at ${lesson.start_time}-${lesson.end_time}`);
      });
    } catch (error) {
      console.log(`❌ Lessons/Schedule query failed: ${error.message}`);
    }
    
    // Test 4: Student-specific data
    console.log('\n👤 TEST 4: Student-specific Data');
    console.log('--------------------------------');
    
    try {
      const [students] = await connection.execute(`
        SELECT 
          s.id, s.age, s.level,
          u.first_name, u.last_name, u.email, u.role, u.is_approved
        FROM students s
        JOIN users u ON s.user_id = u.id
        WHERE u.role = 'STUDENT'
      `);
      
      console.log(`✅ Student data query successful: ${students.length} found`);
      students.forEach((student, index) => {
        console.log(`  ${index + 1}. ${student.first_name} ${student.last_name} - Age: ${student.age}, Level: ${student.level}`);
      });
    } catch (error) {
      console.log(`❌ Student data query failed: ${error.message}`);
    }
    
    // Test 5: Check if we need to add more data
    console.log('\n📊 TEST 5: Data Availability Check');
    console.log('----------------------------------');
    
    const [certCount] = await connection.execute('SELECT COUNT(*) as count FROM certificates');
    const [meetingCount] = await connection.execute('SELECT COUNT(*) as count FROM meetings');
    const [lessonCount] = await connection.execute('SELECT COUNT(*) as count FROM lessons');
    
    console.log(`📋 Certificates: ${certCount[0].count} records`);
    console.log(`📅 Meetings: ${meetingCount[0].count} records`);
    console.log(`📖 Lessons: ${lessonCount[0].count} records`);
    
    if (certCount[0].count === 0) {
      console.log('⚠️  No certificates found - need to add sample data');
    }
    if (meetingCount[0].count === 0) {
      console.log('⚠️  No meetings found - need to add sample data');
    }
    if (lessonCount[0].count === 0) {
      console.log('⚠️  No lessons found - need to add sample data');
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

debugStudentDashboard();
