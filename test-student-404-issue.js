const https = require('https');

async function testStudent404Issue() {
  console.log('🔍 Testing Student 404 Issues...\n');
  
  const baseUrl = 'https://yaqeen.up.railway.app';
  
  console.log(`🔗 Testing: ${baseUrl}\n`);
  
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
    }
  } catch (error) {
    console.log(`💥 Student login error: ${error.message}`);
  }

  console.log('\n' + '='.repeat(80) + '\n');

  // Step 2: Test the exact APIs mentioned in the error
  console.log('2️⃣ Testing the exact APIs from the error messages...');
  
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
        req.setTimeout(10000, () => req.destroy());
      });
      
      console.log(`${api}: ${response.statusCode} - ${response.headers['content-type'] || 'No content-type'}`);
      
      if (response.statusCode === 200) {
        console.log(`   ✅ Works!`);
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
      } else if (response.statusCode === 404) {
        console.log(`   ❌ 404 Not Found - API route doesn't exist`);
        console.log(`   Response: ${response.data.substring(0, 200)}`);
      } else if (response.statusCode === 401 || response.statusCode === 403) {
        console.log(`   🔒 Auth required`);
      } else if (response.statusCode === 500) {
        console.log(`   ❌ Server error: ${response.data.substring(0, 200)}`);
      } else {
        console.log(`   ❓ Unexpected: ${response.data.substring(0, 100)}`);
      }
    } catch (error) {
      console.log(`${api}: Error - ${error.message}`);
    }
  }

  console.log('\n' + '='.repeat(80) + '\n');

  // Step 3: Check if the API routes exist by testing without authentication
  console.log('3️⃣ Testing APIs without authentication to see if routes exist...');
  
  for (const api of apisToTest) {
    try {
      const response = await new Promise((resolve, reject) => {
        const req = https.get(baseUrl + api, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => resolve({ statusCode: res.statusCode, data: data.substring(0, 100) }));
        });
        req.on('error', reject);
        req.setTimeout(5000, () => req.destroy());
      });
      
      console.log(`${api}: ${response.statusCode} - ${response.data}`);
    } catch (error) {
      console.log(`${api}: Error - ${error.message}`);
    }
  }

  console.log('\n' + '='.repeat(80) + '\n');

  // Step 4: Check if there are any other student API routes that work
  console.log('4️⃣ Testing other potential student API routes...');
  
  const otherApis = [
    '/api/student',
    '/api/student/profile',
    '/api/student/voice-submission',
    '/api/student/chat',
    '/api/student/complaints'
  ];
  
  for (const api of otherApis) {
    try {
      const headers = {};
      if (sessionCookie) {
        headers['Cookie'] = sessionCookie;
      }
      
      const response = await new Promise((resolve, reject) => {
        const req = https.get(baseUrl + api, { headers }, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => resolve({ statusCode: res.statusCode, data: data.substring(0, 100) }));
        });
        req.on('error', reject);
        req.setTimeout(5000, () => req.destroy());
      });
      
      console.log(`${api}: ${response.statusCode} - ${response.data}`);
    } catch (error) {
      console.log(`${api}: Error - ${error.message}`);
    }
  }

  console.log('\n🎯 Analysis:');
  console.log('404 errors mean the API routes don\'t exist on the server');
  console.log('This could be because:');
  console.log('1. The changes haven\'t been deployed yet');
  console.log('2. There\'s a build issue');
  console.log('3. The API routes are not properly configured');
  console.log('4. There\'s a routing issue in Next.js');
  
  console.log('\n🔧 Next Steps:');
  console.log('1. Check if Railway has deployed the latest changes');
  console.log('2. Verify the API route files exist in the codebase');
  console.log('3. Check for any build errors in Railway logs');
  console.log('4. Ensure the API routes are properly exported');
}

testStudent404Issue().catch(console.error);
