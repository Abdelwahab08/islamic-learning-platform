const mysql = require('mysql2/promise');

const MYSQL_URL = 'mysql://root:IxIZLRYNpqztjoTYQijUTsGbyIXRZXOf@metro.proxy.rlwy.net:16665/railway';

async function debugAPIResponse() {
  let connection;
  
  try {
    console.log('🔍 DEBUGGING API RESPONSE MISMATCH');
    console.log('==================================');
    
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
    
    // Get a student ID
    const [students] = await connection.execute('SELECT id FROM students LIMIT 1');
    if (students.length === 0) {
      console.log('❌ No students found');
      return;
    }
    const studentId = students[0].id;
    
    console.log('\n📊 CURRENT API RESPONSES:');
    console.log('========================');
    
    // Test 1: Certificates API
    console.log('\n🏆 1. Certificates API Response:');
    const [certificates] = await connection.execute(`
      SELECT 
        c.id,
        c.title,
        c.description,
        c.status,
        c.issued_at,
        u.first_name as teacher_first_name,
        u.last_name as teacher_last_name
      FROM certificates c
      LEFT JOIN users u ON c.teacher_id = u.id
      WHERE c.student_id = ?
      ORDER BY c.issued_at DESC
      LIMIT 3
    `, [studentId]);
    
    console.log('Raw data:', JSON.stringify(certificates, null, 2));
    
    // Test 2: Meetings API
    console.log('\n📅 2. Meetings API Response:');
    const [meetings] = await connection.execute(`
      SELECT 
        m.id,
        m.title,
        m.description,
        m.scheduled_at,
        m.duration,
        m.status,
        u.first_name as teacher_first_name,
        u.last_name as teacher_last_name
      FROM meetings m
      LEFT JOIN users u ON m.teacher_id = u.id
      WHERE m.student_id = ?
      ORDER BY m.scheduled_at DESC
      LIMIT 3
    `, [studentId]);
    
    console.log('Raw data:', JSON.stringify(meetings, null, 2));
    
    // Test 3: Materials API
    console.log('\n📚 3. Materials API Response:');
    const [materials] = await connection.execute(`
      SELECT 
        m.id,
        m.title,
        m.description,
        m.file_path,
        m.created_at,
        u.first_name as teacher_first_name,
        u.last_name as teacher_last_name
      FROM materials m
      LEFT JOIN users u ON m.teacher_id = u.id
      LIMIT 3
    `);
    
    console.log('Raw data:', JSON.stringify(materials, null, 2));
    
    console.log('\n🎯 FRONTEND EXPECTATIONS:');
    console.log('========================');
    console.log('Meetings interface expects:');
    console.log('- duration_minutes (we return: duration)');
    console.log('- provider (we return: none)');
    console.log('- teacher_name (we return: teacher_first_name + teacher_last_name)');
    console.log('- join_url (we return: none)');
    console.log('- stage_name (we return: none)');
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

debugAPIResponse();
