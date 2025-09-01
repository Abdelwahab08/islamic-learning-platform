const mysql = require('mysql2/promise');

async function checkStudentData() {
  console.log('🔍 Checking Student Data for student@test.com...\n');
  
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
    
    // 1. Check if student user exists
    const [students] = await connection.execute(
      'SELECT * FROM users WHERE email = ?',
      ['student@test.com']
    );
    
    if (students.length === 0) {
      console.log('❌ Student user not found!');
      return;
    }
    
    const studentUser = students[0];
    console.log(`👤 Student User: ${studentUser.email} (ID: ${studentUser.id})`);
    
    // 2. Check student record
    const [studentRecords] = await connection.execute(
      'SELECT * FROM students WHERE user_id = ?',
      [studentUser.id]
    );
    
    if (studentRecords.length === 0) {
      console.log('❌ Student record not found!');
      return;
    }
    
    const studentRecord = studentRecords[0];
    console.log(`🎓 Student Record: ID ${studentRecord.id}, Stage: ${studentRecord.stage_id}, Current Page: ${studentRecord.current_page}`);
    
    // 3. Check assignments
    const [assignments] = await connection.execute(`
      SELECT a.*, at.student_id 
      FROM assignments a 
      JOIN assignment_targets at ON a.id = at.assignment_id 
      WHERE at.student_id = ?
    `, [studentRecord.id]);
    
    console.log(`📋 Assignments: ${assignments.length} found`);
    assignments.forEach(a => console.log(`   - ${a.title} (Due: ${a.due_at})`));
    
    // 4. Check certificates
    const [certificates] = await connection.execute(
      'SELECT * FROM certificates WHERE student_id = ?',
      [studentRecord.id]
    );
    
    console.log(`🏆 Certificates: ${certificates.length} found`);
    certificates.forEach(c => console.log(`   - Serial ${c.serial} (Grade: ${c.grade})`));
    
    // 5. Check meetings
    const [meetings] = await connection.execute(
      'SELECT * FROM meetings WHERE scheduled_at > NOW()',
      []
    );
    
    console.log(`📅 Meetings: ${meetings.length} found`);
    meetings.forEach(m => console.log(`   - ${m.title} (${m.scheduled_at})`));
    
    // 6. Check materials
    const [materials] = await connection.execute(
      'SELECT * FROM materials',
      []
    );
    
    console.log(`📚 Materials: ${materials.length} found`);
    materials.forEach(m => console.log(`   - ${m.title}`));
    
    // 7. Check assignment_targets
    const [assignmentTargets] = await connection.execute(
      'SELECT * FROM assignment_targets WHERE student_id = ?',
      [studentRecord.id]
    );
    
    console.log(`🔗 Assignment Targets: ${assignmentTargets.length} found`);
    
    // 8. Check if teacher exists
    const [teachers] = await connection.execute(
      'SELECT * FROM teachers LIMIT 1'
    );
    
    console.log(`👨‍🏫 Teachers: ${teachers.length} found`);
    
    // 9. Check stages
    const [stages] = await connection.execute(
      'SELECT * FROM stages LIMIT 1'
    );
    
    console.log(`📚 Stages: ${stages.length} found`);
    
    console.log('\n🔍 SUMMARY:');
    console.log(`   Student: ${studentUser.email} ✅`);
    console.log(`   Student Record: ${studentRecord.id} ✅`);
    console.log(`   Assignments: ${assignments.length} ✅`);
    console.log(`   Certificates: ${certificates.length} ✅`);
    console.log(`   Meetings: ${meetings.length} ✅`);
    console.log(`   Materials: ${materials.length} ✅`);
    console.log(`   Assignment Targets: ${assignmentTargets.length} ✅`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database disconnected');
    }
  }
}

checkStudentData().catch(console.error);
