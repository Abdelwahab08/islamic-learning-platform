const mysql = require('mysql2/promise');
const fs = require('fs');

async function runFixRegistration() {
  console.log('🔧 Running Student Registration Fixes...\n');
  
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
    
    // Read the SQL file
    const sqlContent = fs.readFileSync('fix-student-registration.sql', 'utf8');
    const statements = sqlContent.split(';').filter(stmt => stmt.trim());
    
    console.log(`📋 Found ${statements.length} SQL statements to execute\n`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      if (!statement) continue;
      
      try {
        console.log(`🔧 Executing statement ${i + 1}...`);
        console.log(`   ${statement.substring(0, 100)}${statement.length > 100 ? '...' : ''}`);
        
        await connection.execute(statement);
        console.log(`   ✅ Statement ${i + 1} executed successfully`);
      } catch (error) {
        console.log(`   ⚠️  Statement ${i + 1} failed: ${error.message}`);
        // Continue with other statements
      }
      console.log('');
    }
    
    // Verify the fixes
    console.log('🔍 Verifying fixes...');
    
    // Check if trigger exists
    const [triggers] = await connection.execute('SHOW TRIGGERS LIKE "trg_students_default_level"');
    if (triggers.length > 0) {
      console.log('✅ Student default level trigger created successfully');
    } else {
      console.log('❌ Trigger creation failed');
    }
    
    // Check students table structure
    const [studentsColumns] = await connection.execute('DESCRIBE students');
    const hasStageId = studentsColumns.some(col => col.Field === 'stage_id');
    const hasCurrentPage = studentsColumns.some(col => col.Field === 'current_page');
    
    if (hasStageId && hasCurrentPage) {
      console.log('✅ Students table structure is correct');
    } else {
      console.log('❌ Students table structure issues remain');
    }
    
    // Check sample students
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
      LIMIT 3
    `);
    
    console.log('\n📊 Sample Students After Fix:');
    sampleStudents.forEach(student => {
      console.log(`   Student ID: ${student.user_id}`);
      console.log(`   Stage: ${student.stage_code} (${student.stage_name})`);
      console.log(`   Page: ${student.current_page}`);
      console.log('');
    });
    
    console.log('🎉 Student registration fixes completed!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database disconnected');
    }
  }
}

runFixRegistration().catch(console.error);
