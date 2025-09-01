const https = require('https');

async function testSimpleAPIs() {
  console.log('🧪 Testing Fixed Teacher APIs...\n');
  
  const baseUrl = 'https://yaqeen.up.railway.app';
  
  // Test teacher login
  const teacherLoginData = {
    email: 'teacher@test.com',
    password: 'password123'
  };
  
  try {
    console.log('1️⃣ Testing teacher login...');
    const loginResponse = await makeRequest(`${baseUrl}/api/auth/login`, 'POST', teacherLoginData);
    
    if (loginResponse.status !== 200) {
      console.log('❌ Teacher login failed:', loginResponse.data);
      return;
    }
    
    console.log('✅ Teacher login successful');
    const authToken = loginResponse.headers?.['set-cookie']?.[0] || '';
    
    // Test groups API
    console.log('\n2️⃣ Testing groups API...');
    const groupsResponse = await makeRequest(`${baseUrl}/api/teacher/groups`, 'GET', null, authToken);
    console.log(`   Status: ${groupsResponse.status}`);
    if (groupsResponse.status === 200) {
      console.log('   ✅ Groups API working');
      console.log('   📊 Data:', JSON.stringify(groupsResponse.data, null, 2));
    } else {
      console.log('   ❌ Groups API failed:', groupsResponse.data);
    }
    
    // Test weekly progress API
    console.log('\n3️⃣ Testing weekly progress API...');
    const progressResponse = await makeRequest(`${baseUrl}/api/teacher/weekly-progress`, 'GET', null, authToken);
    console.log(`   Status: ${progressResponse.status}`);
    if (progressResponse.status === 200) {
      console.log('   ✅ Weekly progress API working');
      console.log('   📊 Data:', JSON.stringify(progressResponse.data, null, 2));
    } else {
      console.log('   ❌ Weekly progress API failed:', progressResponse.data);
    }
    
    // Test materials API
    console.log('\n4️⃣ Testing materials API...');
    const materialsResponse = await makeRequest(`${baseUrl}/api/materials`, 'GET', null, authToken);
    console.log(`   Status: ${materialsResponse.status}`);
    if (materialsResponse.status === 200) {
      console.log('   ✅ Materials API working');
      console.log('   📊 Data count:', materialsResponse.data?.length || 0);
    } else {
      console.log('   ❌ Materials API failed:', materialsResponse.data);
    }
    
    // Test meetings API
    console.log('\n5️⃣ Testing meetings API...');
    const meetingsResponse = await makeRequest(`${baseUrl}/api/meetings`, 'GET', null, authToken);
    console.log(`   Status: ${meetingsResponse.status}`);
    if (meetingsResponse.status === 200) {
      console.log('   ✅ Meetings API working');
      console.log('   📊 Data count:', meetingsResponse.data?.length || 0);
    } else {
      console.log('   ❌ Meetings API failed:', meetingsResponse.data);
    }
    
    console.log('\n🎉 All API tests completed!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

function makeRequest(url, method, data, authToken = '') {
  return new Promise((resolve, reject) => {
    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    if (authToken) {
      options.headers['Cookie'] = authToken;
    }
    
    if (data) {
      options.body = JSON.stringify(data);
    }
    
    const req = https.request(url, options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = responseData ? JSON.parse(responseData) : {};
          resolve({
            status: res.statusCode,
            data: parsedData,
            headers: res.headers
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: responseData,
            headers: res.headers
          });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Add timeout to prevent hanging
setTimeout(() => {
  console.log('⏰ Test timeout - forcing exit');
  process.exit(1);
}, 30000);

testSimpleAPIs().catch(console.error);
