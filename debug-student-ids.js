const mysql = require('mysql2/promise');

async function debugStudentIDs() {
  console.log('🔍 Debugging Student ID Mismatch...\n');
  
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
    
    // Check the user ID for student@test.com
    const [users] = await connection.execute(
      'SELECT id, email FROM users WHERE email = ?',
      ['student@test.com']
    );
    
    if (users.length === 0) {
      console.log('❌ User not found!');
      return;
    }
    
    const userId = users[0].id;
    console.log(`👤 User ID: ${userId}`);
    
    // Check the student record
    const [students] = await connection.execute(
      'SELECT id, user_id FROM students WHERE user_id = ?',
      [userId]
    );
    
    if (students.length === 0) {
      console.log('❌ Student record not found!');
      return;
    }
    
    const studentId = students[0].id;
    console.log(`🎓 Student ID: ${studentId}`);
    
    // Check assignment_targets
    const [assignmentTargets] = await connection.execute(
      'SELECT student_id, assignment_id FROM assignment_targets WHERE student_id = ? LIMIT 5',
      [studentId]
    );
    
    console.log(`📋 Assignment Targets for student ${studentId}: ${assignmentTargets.length} found`);
    assignmentTargets.forEach(at => {
      console.log(`   - Assignment ${at.assignment_id} -> Student ${at.student_id}`);
    });
    
    // Check if there are any assignment_targets with the user ID
    const [userAssignmentTargets] = await connection.execute(
      'SELECT student_id, assignment_id FROM assignment_targets WHERE student_id = ? LIMIT 5',
      [userId]
    );
    
    console.log(`📋 Assignment Targets for user ${userId}: ${userAssignmentTargets.length} found`);
    userAssignmentTargets.forEach(at => {
      console.log(`   - Assignment ${at.assignment_id} -> Student ${at.student_id}`);
    });
    
    // Check the actual data in assignment_targets
    const [allTargets] = await connection.execute(
      'SELECT student_id, assignment_id FROM assignment_targets LIMIT 10'
    );
    
    console.log(`\n🔍 All Assignment Targets (first 10):`);
    allTargets.forEach(at => {
      console.log(`   - Assignment ${at.assignment_id} -> Student ${at.student_id}`);
    });
    
    console.log('\n💡 ANALYSIS:');
    console.log(`   User ID: ${userId}`);
    console.log(`   Student ID: ${studentId}`);
    console.log(`   Assignment targets use: ${assignmentTargets.length > 0 ? 'Student ID' : 'User ID'}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database disconnected');
    }
  }
}

debugStudentIDs().catch(console.error);
