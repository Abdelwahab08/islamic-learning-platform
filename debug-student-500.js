const https = require('https');

async function debugStudent500() {
  console.log('🔍 Debugging Student 500 Errors...\n');
  
  const baseUrl = 'https://yaqeen.up.railway.app';
  
  // Step 1: Login as student and get session
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
      console.log(`   Response: ${loginResponse.data}`);
    }
  } catch (error) {
    console.log(`💥 Student login error: ${error.message}`);
  }

  console.log('\n' + '='.repeat(80) + '\n');

  // Step 2: Test a simple API first to see if it's a general issue
  console.log('2️⃣ Testing a simple API that we know works...');
  
  try {
    const headers = {};
    if (sessionCookie) {
      headers['Cookie'] = sessionCookie;
    }
    
    const response = await new Promise((resolve, reject) => {
      const req = https.get(baseUrl + '/api/student/complaints', { headers }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({ statusCode: res.statusCode, data }));
      });
      req.on('error', reject);
      req.setTimeout(10000, () => req.destroy());
    });
    
    console.log(`/api/student/complaints: ${response.statusCode}`);
    if (response.statusCode === 200) {
      console.log(`   ✅ Works! Response: ${response.data}`);
    } else {
      console.log(`   ❌ Failed: ${response.data}`);
    }
  } catch (error) {
    console.log(`💥 Error: ${error.message}`);
  }

  console.log('\n' + '='.repeat(80) + '\n');

  // Step 3: Test the problematic APIs with detailed error logging
  console.log('3️⃣ Testing problematic APIs with detailed error info...');
  
  const apisToTest = [
    '/api/student/assignments',
    '/api/student/certificates',
    '/api/student/meetings',
    '/api/student/materials',
    '/api/student/schedule?date=2025-09-01',
    '/api/student/dashboard',
    '/api/student/stats'
  ];
  
  for (const api of apisToTest) {
    try {
      const headers = {};
      if (sessionCookie) {
        headers['Cookie'] = sessionCookie;
      }
      
      const response = await new Promise((resolve, reject) => {
        const req = https.get(baseUrl + api, { headers }, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => resolve({ statusCode: res.statusCode, data, headers: res.headers }));
        });
        req.on('error', reject);
        req.setTimeout(15000, () => req.destroy());
      });
      
      console.log(`${api}: ${response.statusCode}`);
      
      if (response.statusCode === 500) {
        console.log(`   ❌ 500 Error: ${response.data}`);
        
        // Try to parse the error message
        try {
          const errorData = JSON.parse(response.data);
          console.log(`   📝 Error message: ${errorData.message}`);
        } catch (e) {
          console.log(`   📝 Raw error: ${response.data.substring(0, 200)}`);
        }
      } else if (response.statusCode === 200) {
        console.log(`   ✅ Success!`);
        try {
          const jsonData = JSON.parse(response.data);
          if (Array.isArray(jsonData)) {
            console.log(`   📊 Array with ${jsonData.length} items`);
          } else if (typeof jsonData === 'object') {
            console.log(`   📊 Object with keys: ${Object.keys(jsonData).join(', ')}`);
          }
        } catch (e) {
          console.log(`   ❌ Invalid JSON: ${response.data.substring(0, 100)}`);
        }
      } else {
        console.log(`   ❓ Unexpected: ${response.data.substring(0, 100)}`);
      }
    } catch (error) {
      console.log(`${api}: Network Error - ${error.message}`);
    }
    
    // Add a small delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n' + '='.repeat(80) + '\n');

  // Step 4: Test without authentication to see if it's an auth issue
  console.log('4️⃣ Testing without authentication...');
  
  try {
    const response = await new Promise((resolve, reject) => {
      const req = https.get(baseUrl + '/api/student/assignments', (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({ statusCode: res.statusCode, data: data.substring(0, 100) }));
      });
      req.on('error', reject);
      req.setTimeout(5000, () => req.destroy());
    });
    
    console.log(`/api/student/assignments (no auth): ${response.statusCode} - ${response.data}`);
  } catch (error) {
    console.log(`💥 Error: ${error.message}`);
  }

  console.log('\n🎯 Analysis:');
  console.log('500 errors mean the API routes exist but there\'s a server-side error');
  console.log('This could be because:');
  console.log('1. Database connection issues');
  console.log('2. Missing student data in the database');
  console.log('3. SQL query errors');
  console.log('4. Import/export issues in the API routes');
  
  console.log('\n🔧 Next Steps:');
  console.log('1. Check if the student user exists in the database');
  console.log('2. Verify the student profile exists');
  console.log('3. Check for any SQL syntax errors');
  console.log('4. Look at Railway logs for detailed error messages');
}

debugStudent500().catch(console.error);
