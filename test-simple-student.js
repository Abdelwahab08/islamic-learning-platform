const https = require('https');

async function testSimpleStudent() {
  console.log('🔍 Testing Simple Student API...\n');
  
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

  // Step 2: Test the simple test API
  console.log('2️⃣ Testing simple student test API...');
  
  try {
    const headers = {};
    if (sessionCookie) {
      headers['Cookie'] = sessionCookie;
    }
    
    const response = await new Promise((resolve, reject) => {
      const req = https.get(baseUrl + '/api/student/test', { headers }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({ statusCode: res.statusCode, data }));
      });
      req.on('error', reject);
      req.setTimeout(15000, () => req.destroy());
    });
    
    console.log(`/api/student/test: ${response.statusCode}`);
    
    if (response.statusCode === 200) {
      console.log(`   ✅ Success!`);
      try {
        const data = JSON.parse(response.data);
        console.log(`   📝 Message: ${data.message}`);
        console.log(`   👤 User ID: ${data.user?.id}`);
        console.log(`   👤 User Role: ${data.user?.role}`);
        console.log(`   📊 Test Data: ${JSON.stringify(data.testData, null, 2)}`);
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
  console.log('If this simple API works, then the issue is with the database queries.');
  console.log('If it fails, then there\'s a more fundamental issue with the student API structure.');
}

testSimpleStudent().catch(console.error);
