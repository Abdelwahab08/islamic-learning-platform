const mysql = require('mysql2/promise');

async function checkStagesTable() {
  console.log('🔍 Checking Stages Table Structure...\n');
  
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
    
    // Check table structure
    const [columns] = await connection.execute('DESCRIBE stages');
    console.log('📚 Stages Table Columns:');
    columns.forEach(col => {
      console.log(`   - ${col.Field} (${col.Type}) ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });
    
    // Check sample data
    const [sampleData] = await connection.execute('SELECT * FROM stages LIMIT 5');
    console.log('\n📊 Sample Stages Data:');
    sampleData.forEach(row => {
      console.log(`   - ID: ${row.id}, Name: ${row.name}, Total Pages: ${row.total_pages}`);
    });
    
    // Check student's current stage
    const [studentStage] = await connection.execute(`
      SELECT 
        s.stage_id,
        s.current_page,
        st.name as stageName,
        st.total_pages
      FROM students s
      LEFT JOIN stages st ON s.stage_id = st.id
      WHERE s.user_id = 'test-student-1756745498583'
      LIMIT 1
    `);
    
    console.log('\n🎓 Student Stage Info:');
    if (studentStage.length > 0) {
      const stage = studentStage[0];
      console.log(`   Stage ID: ${stage.stage_id}`);
      console.log(`   Current Page: ${stage.current_page}`);
      console.log(`   Stage Name: ${stage.stageName}`);
      console.log(`   Total Pages: ${stage.total_pages}`);
    } else {
      console.log('   ❌ No stage info found for student');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database disconnected');
    }
  }
}

checkStagesTable().catch(console.error);
