const mysql = require('mysql2/promise');

async function testStudents() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'islamic_db'
    });

    console.log('✅ Connected to database');

    // Test basic students query
    const [students] = await connection.execute('SELECT COUNT(*) as count FROM students');
    console.log('📊 Students count:', students[0].count);

    // Test the full query from the API
    const [fullQuery] = await connection.execute(`
      SELECT 
        s.id,
        s.user_id,
        u.email,
        s.current_page,
        s.stage_id,
        st.name_ar as stage_name,
        s.created_at
      FROM students s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN stages st ON s.stage_id = st.id
      ORDER BY u.email ASC
    `);

    console.log('📋 Full query result count:', fullQuery.length);
    if (fullQuery.length > 0) {
      console.log('📝 First student:', fullQuery[0]);
    }

    await connection.end();
    console.log('✅ Test completed successfully');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testStudents();
