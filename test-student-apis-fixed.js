const https = require('https');

async function testStudentAPIsFixed() {
  console.log('🔍 Testing Student APIs After Fixes...\n');
  
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
      
      // Parse login response to get user info
      try {
        const userData = JSON.parse(loginResponse.data);
        console.log(`   👤 User ID: ${userData.user?.id || 'Unknown'}`);
        console.log(`   👤 User Role: ${userData.user?.role || 'Unknown'}`);
      } catch (e) {
        console.log(`   ❌ Could not parse user data`);
      }
    } else {
      console.log(`❌ Student login failed: ${loginResponse.statusCode}`);
      console.log(`   Response: ${loginResponse.data}`);
      return;
    }
  } catch (error) {
    console.log(`💥 Student login error: ${error.message}`);
    return;
  }

  console.log('\n' + '='.repeat(80) + '\n');

  // Step 2: Test all student APIs
  console.log('2️⃣ Testing all student APIs...');
  
  const apisToTest = [
    { name: 'Dashboard Overview', path: '/api/student/dashboard' },
    { name: 'Assignments', path: '/api/student/assignments' },
    { name: 'Certificates', path: '/api/student/certificates' },
    { name: 'Meetings', path: '/api/student/meetings' },
    { name: 'Materials', path: '/api/student/materials' },
    { name: 'Schedule', path: '/api/student/schedule?date=2025-01-30' },
    { name: 'Stats', path: '/api/student/stats' },
    { name: 'Complaints', path: '/api/student/complaints' }
  ];
  
  const results = [];
  
  for (const api of apisToTest) {
    try {
      const headers = {};
      if (sessionCookie) {
        headers['Cookie'] = sessionCookie;
      }
      
      const response = await new Promise((resolve, reject) => {
        const req = https.get(baseUrl + api.path, { headers }, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => resolve({ statusCode: res.statusCode, data, headers: res.headers }));
        });
        req.on('error', reject);
        req.setTimeout(15000, () => req.destroy());
      });
      
      console.log(`${api.name}: ${response.statusCode}`);
      
      if (response.statusCode === 200) {
        console.log(`   ✅ Success!`);
        try {
          const jsonData = JSON.parse(response.data);
          if (Array.isArray(jsonData)) {
            console.log(`   📊 Array with ${jsonData.length} items`);
            if (jsonData.length > 0) {
              console.log(`   📋 Sample item keys: ${Object.keys(jsonData[0]).join(', ')}`);
            }
          } else if (typeof jsonData === 'object') {
            console.log(`   📊 Object with keys: ${Object.keys(jsonData).join(', ')}`);
            // Show some sample data for dashboard
            if (api.name === 'Dashboard Overview' && jsonData.stats) {
              console.log(`   📈 Stats: ${JSON.stringify(jsonData.stats)}`);
            }
          }
        } catch (e) {
          console.log(`   ❌ Invalid JSON: ${response.data.substring(0, 100)}`);
        }
        results.push({ name: api.name, status: 'SUCCESS', statusCode: response.statusCode });
      } else if (response.statusCode === 404) {
        console.log(`   ❌ 404 Not Found - API route doesn't exist`);
        results.push({ name: api.name, status: '404_ERROR', statusCode: response.statusCode });
      } else if (response.statusCode === 500) {
        console.log(`   ❌ 500 Server Error`);
        try {
          const errorData = JSON.parse(response.data);
          console.log(`   📝 Error: ${errorData.message}`);
        } catch (e) {
          console.log(`   📝 Raw error: ${response.data.substring(0, 200)}`);
        }
        results.push({ name: api.name, status: '500_ERROR', statusCode: response.statusCode });
      } else if (response.statusCode === 401 || response.statusCode === 403) {
        console.log(`   🔒 Auth required (${response.statusCode})`);
        results.push({ name: api.name, status: 'AUTH_ERROR', statusCode: response.statusCode });
      } else {
        console.log(`   ❓ Unexpected: ${response.statusCode}`);
        results.push({ name: api.name, status: 'UNEXPECTED', statusCode: response.statusCode });
      }
    } catch (error) {
      console.log(`${api.name}: Network Error - ${error.message}`);
      results.push({ name: api.name, status: 'NETWORK_ERROR', statusCode: 'N/A' });
    }
    
    // Add a small delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n' + '='.repeat(80) + '\n');

  // Step 3: Summary
  console.log('3️⃣ Test Results Summary:');
  console.log('='.repeat(50));
  
  const successCount = results.filter(r => r.status === 'SUCCESS').length;
  const errorCount = results.length - successCount;
  
  console.log(`✅ Successful APIs: ${successCount}/${results.length}`);
  console.log(`❌ Failed APIs: ${errorCount}/${results.length}`);
  
  if (errorCount > 0) {
    console.log('\n❌ Failed APIs:');
    results.filter(r => r.status !== 'SUCCESS').forEach(result => {
      console.log(`   - ${result.name}: ${result.status} (${result.statusCode})`);
    });
  }
  
  console.log('\n✅ Working APIs:');
  results.filter(r => r.status === 'SUCCESS').forEach(result => {
    console.log(`   - ${result.name}`);
  });

  console.log('\n' + '='.repeat(80) + '\n');

  // Step 4: Test specific problematic APIs with more detail
  console.log('4️⃣ Detailed test of previously failing APIs...');
  
  const problematicApis = [
    '/api/student/dashboard',
    '/api/student/assignments',
    '/api/student/certificates',
    '/api/student/meetings',
    '/api/student/materials',
    '/api/student/schedule?date=2025-01-30'
  ];
  
  for (const apiPath of problematicApis) {
    try {
      const headers = {};
      if (sessionCookie) {
        headers['Cookie'] = sessionCookie;
      }
      
      const response = await new Promise((resolve, reject) => {
        const req = https.get(baseUrl + apiPath, { headers }, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => resolve({ statusCode: res.statusCode, data: data.substring(0, 300) }));
        });
        req.on('error', reject);
        req.setTimeout(15000, () => req.destroy());
      });
      
      console.log(`${apiPath}: ${response.statusCode}`);
      
      if (response.statusCode === 200) {
        console.log(`   ✅ Fixed! API is now working`);
      } else {
        console.log(`   ❌ Still failing: ${response.data}`);
      }
    } catch (error) {
      console.log(`${apiPath}: Error - ${error.message}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n🎯 Final Analysis:');
  if (successCount === results.length) {
    console.log('🎉 All student APIs are now working correctly!');
    console.log('✅ The column name fixes have resolved the 404/500 errors');
  } else {
    console.log('⚠️ Some APIs are still failing');
    console.log('🔧 Additional fixes may be needed');
  }
}

testStudentAPIsFixed().catch(console.error);
