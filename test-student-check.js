const https = require('https');

async function testStudentCheck() {
  console.log('🔍 Testing Student Check API to see database structure...\n');
  
  const baseUrl = 'https://yaqeen.up.railway.app';
  
  // Step 1: Login as student
  console.log('1️⃣ Logging in as student...');
  let sessionCookie = null;
  
  try {
    const loginData = JSON.stringify({
      email: 'student@test.com',
      password: 'student123'
    });
    
    const loginResponse = await new Promise((resolve, reject) => {
      const req = https.request(baseUrl + '/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(loginData)
        }
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({ statusCode: res.statusCode, data, headers: res.headers }));
      });
      
      req.on('error', reject);
      req.write(loginData);
      req.end();
      req.setTimeout(10000, () => req.destroy());
    });
    
    if (loginResponse.statusCode === 200) {
      console.log(`✅ Student login successful`);
      const setCookie = loginResponse.headers['set-cookie'];
      if (setCookie) {
        sessionCookie = setCookie[0];
        console.log(`   🔐 Session cookie obtained`);
      }
    } else {
      console.log(`❌ Student login failed: ${loginResponse.statusCode}`);
      return;
    }
  } catch (error) {
    console.log(`💥 Student login error: ${error.message}`);
    return;
  }

  console.log('\n' + '='.repeat(80) + '\n');

  // Step 2: Test the student check API
  console.log('2️⃣ Testing student check API...');
  
  try {
    const headers = {};
    if (sessionCookie) {
      headers['Cookie'] = sessionCookie;
    }
    
    const response = await new Promise((resolve, reject) => {
      const req = https.get(baseUrl + '/api/debug/student-check', { headers }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({ statusCode: res.statusCode, data }));
      });
      req.on('error', reject);
      req.setTimeout(15000, () => req.destroy());
    });
    
    console.log(`/api/debug/student-check: ${response.statusCode}`);
    
    if (response.statusCode === 200) {
      console.log(`   ✅ Success!`);
      try {
        const data = JSON.parse(response.data);
        
        console.log('\n📊 Database Analysis:');
        console.log('='.repeat(50));
        
        // User info
        console.log(`\n👤 User Info:`);
        console.log(`   ID: ${data.user.id}`);
        console.log(`   Role: ${data.user.role}`);
        console.log(`   Exists: ${data.user.exists}`);
        
        // Student info
        console.log(`\n🎓 Student Info:`);
        console.log(`   Exists: ${data.student.exists}`);
        if (data.student.record) {
          console.log(`   Record: ${JSON.stringify(data.student.record, null, 2)}`);
        }
        
        // Table counts
        console.log(`\n📈 Table Counts:`);
        Object.keys(data.tableCounts).forEach(table => {
          console.log(`   ${table}: ${data.tableCounts[table]} records`);
        });
        
        // Table structure
        console.log(`\n🔍 Table Structure:`);
        Object.keys(data.tableStructure).forEach(table => {
          console.log(`\n📋 ${table.toUpperCase()}:`);
          if (Array.isArray(data.tableStructure[table])) {
            data.tableStructure[table].forEach(column => {
              console.log(`   ${column.Field} (${column.Type}) ${column.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
            });
          } else {
            console.log(`   ❌ No structure data`);
          }
        });
        
        // Look for student-related columns
        console.log(`\n🎯 Student-related columns found:`);
        console.log('='.repeat(50));
        
        Object.keys(data.tableStructure).forEach(tableName => {
          if (Array.isArray(data.tableStructure[tableName])) {
            const studentColumns = data.tableStructure[tableName].filter(col => 
              col.Field.toLowerCase().includes('student') || 
              col.Field.toLowerCase().includes('user')
            );
            if (studentColumns.length > 0) {
              console.log(`\n📋 ${tableName}:`);
              studentColumns.forEach(col => {
                console.log(`   ${col.Field} (${col.Type})`);
              });
            }
          }
        });
        
      } catch (e) {
        console.log(`   ❌ Could not parse response: ${response.data.substring(0, 200)}`);
      }
    } else if (response.statusCode === 500) {
      console.log(`   ❌ 500 Error: ${response.data}`);
      try {
        const errorData = JSON.parse(response.data);
        console.log(`   📝 Error: ${errorData.error}`);
        if (errorData.stack) {
          console.log(`   📝 Stack: ${errorData.stack.substring(0, 500)}`);
        }
      } catch (e) {
        console.log(`   📝 Raw error: ${response.data}`);
      }
    } else {
      console.log(`   ❌ Unexpected: ${response.statusCode} - ${response.data}`);
    }
  } catch (error) {
    console.log(`💥 Error: ${error.message}`);
  }

  console.log('\n🎯 Analysis:');
  console.log('This will show us:');
  console.log('1. If the student user exists in the database');
  console.log('2. If the student record exists');
  console.log('3. The actual table structure');
  console.log('4. How many records are in each table');
  console.log('5. What column names are actually used');
}

testStudentCheck().catch(console.error);
