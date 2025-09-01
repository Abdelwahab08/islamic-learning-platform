const https = require('https');

async function testStructureAPI() {
  console.log('🔍 Testing Database Structure API...\n');
  
  const baseUrl = 'https://yaqeen.up.railway.app';
  
  // Step 1: Login as admin
  console.log('1️⃣ Logging in as admin...');
  let sessionCookie = null;
  
  try {
    const loginData = JSON.stringify({
      email: 'admin@yaqeen.edu',
      password: 'admin123'
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
      console.log(`✅ Admin login successful`);
      const setCookie = loginResponse.headers['set-cookie'];
      if (setCookie) {
        sessionCookie = setCookie[0];
        console.log(`   🔐 Session cookie obtained`);
      }
    } else {
      console.log(`❌ Admin login failed: ${loginResponse.statusCode}`);
      return;
    }
  } catch (error) {
    console.log(`💥 Admin login error: ${error.message}`);
    return;
  }

  console.log('\n' + '='.repeat(80) + '\n');

  // Step 2: Test the structure API
  console.log('2️⃣ Testing the structure API...');
  
  try {
    const headers = {};
    if (sessionCookie) {
      headers['Cookie'] = sessionCookie;
    }
    
    const response = await new Promise((resolve, reject) => {
      const req = https.get(baseUrl + '/api/debug/structure', { headers }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({ statusCode: res.statusCode, data }));
      });
      req.on('error', reject);
      req.setTimeout(15000, () => req.destroy());
    });
    
    console.log(`/api/debug/structure: ${response.statusCode}`);
    
    if (response.statusCode === 200) {
      console.log(`   ✅ Success!`);
      try {
        const tableData = JSON.parse(response.data);
        
        console.log('\n📊 Table Structure Analysis:');
        console.log('='.repeat(50));
        
        // Analyze each table
        Object.keys(tableData).forEach(tableName => {
          console.log(`\n🔍 ${tableName.toUpperCase()} table:`);
          if (Array.isArray(tableData[tableName])) {
            tableData[tableName].forEach(column => {
              console.log(`   ${column.Field} (${column.Type}) ${column.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
            });
          } else {
            console.log(`   ❌ No structure data for ${tableName}`);
          }
        });
        
        // Look for student-related columns
        console.log('\n🎯 Student-related columns found:');
        console.log('='.repeat(50));
        
        Object.keys(tableData).forEach(tableName => {
          if (Array.isArray(tableData[tableName])) {
            const studentColumns = tableData[tableName].filter(col => 
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
        
        // Look for specific problematic columns
        console.log('\n🔍 Looking for specific columns that might be causing issues:');
        console.log('='.repeat(50));
        
        const problematicTables = ['certificates', 'meetings', 'submissions'];
        problematicTables.forEach(tableName => {
          if (tableData[tableName] && Array.isArray(tableData[tableName])) {
            console.log(`\n📋 ${tableName}:`);
            const studentIdColumns = tableData[tableName].filter(col => 
              col.Field.toLowerCase().includes('student') || 
              col.Field.toLowerCase().includes('user') ||
              col.Field.toLowerCase().includes('id')
            );
            studentIdColumns.forEach(col => {
              console.log(`   ${col.Field} (${col.Type})`);
            });
          }
        });
        
      } catch (e) {
        console.log(`   ❌ Could not parse response: ${response.data.substring(0, 200)}`);
      }
    } else {
      console.log(`   ❌ Failed: ${response.data}`);
    }
  } catch (error) {
    console.log(`💥 Error: ${error.message}`);
  }

  console.log('\n🎯 Analysis:');
  console.log('Based on the table structure, we can now:');
  console.log('1. Identify the correct column names for student references');
  console.log('2. Fix the SQL queries in the student APIs');
  console.log('3. Update all the failing endpoints');
}

testStructureAPI().catch(console.error);
