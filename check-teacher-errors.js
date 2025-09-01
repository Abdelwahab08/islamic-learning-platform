const mysql = require('mysql2/promise');

async function checkTeacherErrors() {
  console.log('🔍 Checking Teacher API Error Causes...\n');
  
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
    
    // Check if groups table exists and its structure
    console.log('\n📋 Checking Groups Table:');
    try {
      const [groupsColumns] = await connection.execute('DESCRIBE groups');
      console.log('   ✅ Groups table exists with columns:');
      groupsColumns.forEach(col => {
        console.log(`     ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
      });
    } catch (error) {
      console.log('   ❌ Groups table does not exist or error:', error.message);
    }
    
    // Check if materials table exists and its structure
    console.log('\n📋 Checking Materials Table:');
    try {
      const [materialsColumns] = await connection.execute('DESCRIBE materials');
      console.log('   ✅ Materials table exists with columns:');
      materialsColumns.forEach(col => {
        console.log(`     ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
      });
    } catch (error) {
      console.log('   ❌ Materials table does not exist or error:', error.message);
    }
    
    // Check if meetings table exists and its structure
    console.log('\n📋 Checking Meetings Table:');
    try {
      const [meetingsColumns] = await connection.execute('DESCRIBE meetings');
      console.log('   ✅ Meetings table exists with columns:');
      meetingsColumns.forEach(col => {
        console.log(`     ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
      });
    } catch (error) {
      console.log('   ❌ Meetings table does not exist or error:', error.message);
    }
    
    // Check if teacher_students table exists
    console.log('\n📋 Checking Teacher-Students Table:');
    try {
      const [teacherStudentsColumns] = await connection.execute('DESCRIBE teacher_students');
      console.log('   ✅ Teacher-students table exists with columns:');
      teacherStudentsColumns.forEach(col => {
        console.log(`     ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
      });
    } catch (error) {
      console.log('   ❌ Teacher-students table does not exist or error:', error.message);
    }
    
    // Check if group_members table exists
    console.log('\n📋 Checking Group Members Table:');
    try {
      const [groupMembersColumns] = await connection.execute('DESCRIBE group_members');
      console.log('   ✅ Group members table exists with columns:');
      groupMembersColumns.forEach(col => {
        console.log(`     ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
      });
    } catch (error) {
      console.log('   ❌ Group members table does not exist or error:', error.message);
    }
    
    // Check current data in these tables
    console.log('\n📊 Checking Current Data:');
    
    try {
      const [groupsCount] = await connection.execute('SELECT COUNT(*) as count FROM groups');
      console.log(`   Groups: ${groupsCount[0].count}`);
    } catch (error) {
      console.log('   Groups: Table does not exist');
    }
    
    try {
      const [materialsCount] = await connection.execute('SELECT COUNT(*) as count FROM materials');
      console.log(`   Materials: ${materialsCount[0].count}`);
    } catch (error) {
      console.log('   Materials: Table does not exist');
    }
    
    try {
      const [meetingsCount] = await connection.execute('SELECT COUNT(*) as count FROM meetings');
      console.log(`   Meetings: ${meetingsCount[0].count}`);
    } catch (error) {
      console.log('   Meetings: Table does not exist');
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

checkTeacherErrors().catch(console.error);
