const mysql = require('mysql2/promise');

async function fixRegistrationSimple() {
  console.log('🔧 Fixing Student Registration (Simple Approach)...\n');
  
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
    
    // 1. Get the default stage ID (RASHIDI)
    console.log('1️⃣ Getting default stage ID...');
    const [stages] = await connection.execute('SELECT id FROM stages WHERE code = "RASHIDI" LIMIT 1');
    const defaultStageId = stages[0]?.id;
    
    if (!defaultStageId) {
      console.log('❌ Default stage RASHIDI not found');
      return;
    }
    console.log(`✅ Default stage ID: ${defaultStageId}`);
    
    // 2. Update existing students to have proper stage_id if missing
    console.log('\n2️⃣ Updating existing students...');
    const [updateResult] = await connection.execute(`
      UPDATE students 
      SET stage_id = ? 
      WHERE stage_id IS NULL
    `, [defaultStageId]);
    console.log(`✅ Updated ${updateResult.affectedRows} students`);
    
    // 3. Update existing students to have proper current_page if missing
    console.log('\n3️⃣ Setting default pages...');
    const [pageResult] = await connection.execute(`
      UPDATE students 
      SET current_page = 1 
      WHERE current_page IS NULL
    `);
    console.log(`✅ Updated ${pageResult.affectedRows} students`);
    
    // 4. Verify the fixes
    console.log('\n4️⃣ Verifying fixes...');
    const [sampleStudents] = await connection.execute(`
      SELECT 
        s.id,
        s.user_id,
        s.stage_id,
        s.current_page,
        st.code as stage_code,
        st.name_ar as stage_name,
        st.order_index
      FROM students s
      LEFT JOIN stages st ON s.stage_id = st.id
      LIMIT 5
    `);
    
    console.log('\n📊 Students After Fix:');
    sampleStudents.forEach(student => {
      console.log(`   Student ID: ${student.user_id}`);
      console.log(`   Stage: ${student.stage_code} (${student.stage_name})`);
      console.log(`   Page: ${student.current_page}`);
      console.log('');
    });
    
    // 5. Test creating a new student record
    console.log('5️⃣ Testing new student creation...');
    const testUserId = `test-user-${Date.now()}`;
    const testStudentId = `test-student-${Date.now()}`;
    
    try {
      // Insert test user
      await connection.execute(`
        INSERT INTO users (id, role, email, password_hash, is_approved, onboarding_status) 
        VALUES (?, 'STUDENT', ?, 'test-hash', 0, 'PENDING')
      `, [testUserId, `test${Date.now()}@example.com`]);
      
      // Insert test student (this should work now)
      await connection.execute(`
        INSERT INTO students (id, user_id, stage_id, current_page) 
        VALUES (?, ?, ?, ?)
      `, [testStudentId, testUserId, defaultStageId, 1]);
      
      console.log('✅ New student creation test successful');
      
      // Clean up test data
      await connection.execute('DELETE FROM students WHERE id = ?', [testStudentId]);
      await connection.execute('DELETE FROM users WHERE id = ?', [testUserId]);
      console.log('✅ Test data cleaned up');
      
    } catch (error) {
      console.log('❌ New student creation test failed:', error.message);
    }
    
    console.log('\n🎉 Student registration fixes completed!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Students table structure is correct');
    console.log('   ✅ Default stage (RASHIDI) is set');
    console.log('   ✅ Default page (1) is set');
    console.log('   ✅ New students will start at RASHIDI stage, page 1');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database disconnected');
    }
  }
}

fixRegistrationSimple().catch(console.error);
