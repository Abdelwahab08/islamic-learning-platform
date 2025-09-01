const mysql = require('mysql2/promise');

async function testDatabaseConnection() {
  console.log('🔍 Testing Database Connection...\n');
  
  // Database connection details from Railway
  const connectionConfig = {
    host: 'metro.proxy.rlwy.net',
    port: 16665,
    user: 'root',
    password: 'IxIZLRYNpqztjoTYQijUTsGbyIXRZXOf',
    database: 'railway'
  };

  let connection;
  
  try {
    console.log('1️⃣ Connecting to database...');
    connection = await mysql.createConnection(connectionConfig);
    console.log('   ✅ Database connection successful!');
    
    console.log('\n2️⃣ Testing basic queries...');
    
    // Test 1: Check if tables exist
    console.log('\n📋 Checking tables...');
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('   Tables found:', tables.map(t => Object.values(t)[0]));
    
    // Test 2: Check students table structure
    console.log('\n📋 Checking students table structure...');
    try {
      const [studentsStructure] = await connection.execute('DESCRIBE students');
      console.log('   Students table columns:');
      studentsStructure.forEach(col => {
        console.log(`     ${col.Field} (${col.Type}) ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
      });
    } catch (error) {
      console.log(`   ❌ Error checking students table: ${error.message}`);
    }
    
    // Test 3: Check assignments table structure
    console.log('\n📋 Checking assignments table structure...');
    try {
      const [assignmentsStructure] = await connection.execute('DESCRIBE assignments');
      console.log('   Assignments table columns:');
      assignmentsStructure.forEach(col => {
        console.log(`     ${col.Field} (${col.Type}) ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
      });
    } catch (error) {
      console.log(`   ❌ Error checking assignments table: ${error.message}`);
    }
    
    // Test 4: Check assignment_targets table structure
    console.log('\n📋 Checking assignment_targets table structure...');
    try {
      const [targetsStructure] = await connection.execute('DESCRIBE assignment_targets');
      console.log('   Assignment_targets table columns:');
      targetsStructure.forEach(col => {
        console.log(`     ${col.Field} (${col.Type}) ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
      });
    } catch (error) {
      console.log(`   ❌ Error checking assignment_targets table: ${error.message}`);
    }
    
    // Test 5: Check certificates table structure
    console.log('\n📋 Checking certificates table structure...');
    try {
      const [certificatesStructure] = await connection.execute('DESCRIBE certificates');
      console.log('   Certificates table columns:');
      certificatesStructure.forEach(col => {
        console.log(`     ${col.Field} (${col.Type}) ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
      });
    } catch (error) {
      console.log(`   ❌ Error checking certificates table: ${error.message}`);
    }
    
    // Test 6: Check meetings table structure
    console.log('\n📋 Checking meetings table structure...');
    try {
      const [meetingsStructure] = await connection.execute('DESCRIBE meetings');
      console.log('   Meetings table columns:');
      meetingsStructure.forEach(col => {
        console.log(`     ${col.Field} (${col.Type}) ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
      });
    } catch (error) {
      console.log(`   ❌ Error checking meetings table: ${error.message}`);
    }
    
    // Test 7: Check if student user exists
    console.log('\n👤 Checking if student user exists...');
    try {
      const [users] = await connection.execute('SELECT * FROM users WHERE email = ?', ['student@test.com']);
      if (users.length > 0) {
        console.log('   ✅ Student user found:', users[0]);
        
        // Test 8: Check if student record exists
        console.log('\n🎓 Checking if student record exists...');
        const [students] = await connection.execute('SELECT * FROM students WHERE user_id = ?', [users[0].id]);
        if (students.length > 0) {
          console.log('   ✅ Student record found:', students[0]);
        } else {
          console.log('   ❌ No student record found for user_id:', users[0].id);
        }
      } else {
        console.log('   ❌ Student user not found');
      }
    } catch (error) {
      console.log(`   ❌ Error checking users: ${error.message}`);
    }
    
    // Test 9: Check table counts
    console.log('\n📊 Checking table counts...');
    const tablesToCheck = ['users', 'students', 'assignments', 'assignment_targets', 'certificates', 'meetings', 'materials'];
    
    for (const table of tablesToCheck) {
      try {
        const [result] = await connection.execute(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`   ${table}: ${result[0].count} records`);
      } catch (error) {
        console.log(`   ${table}: Error - ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
  
  console.log('\n🎯 Analysis:');
  console.log('This will show us:');
  console.log('1. If the database connection works');
  console.log('2. What tables exist');
  console.log('3. The actual column names in each table');
  console.log('4. If the student user and record exist');
  console.log('5. How many records are in each table');
}

testDatabaseConnection().catch(console.error);
