const https = require('https');

const BASE_URL = 'https://yaqeen.up.railway.app';

// Test the new mock API endpoints
async function testMockAPIs() {
  try {
    console.log('🔐 Testing teacher login...');
    
    // Step 1: Login as teacher@test.com
    const loginData = JSON.stringify({
      email: 'teacher@test.com',
      password: 'teacher123'
    });

    const loginResponse = await makeRequestWithCookies('/api/auth/login', 'POST', loginData);
    console.log('Login Status:', loginResponse.status);

    if (loginResponse.status !== 200) {
      console.log('❌ Teacher login failed');
      return;
    }

    console.log('✅ Teacher login successful');

    // Step 2: Test the new mock API endpoints
    console.log('\n🔍 Testing new mock API endpoints...');

    // Test 1: Mock meetings API
    console.log('\n📅 Testing mock meetings API...');
    const mockMeetingsResponse = await makeRequestWithCookies('/api/teacher/meetings', 'GET', null, loginResponse.cookies);
    console.log('Mock Meetings Status:', mockMeetingsResponse.status);
    if (mockMeetingsResponse.status === 200) {
      console.log(`Mock Meetings found: ${mockMeetingsResponse.data.length}`);
      mockMeetingsResponse.data.forEach((meeting, index) => {
        console.log(`  ${index + 1}. ${meeting.title} - ${meeting.stage_name}`);
      });
    } else {
      console.log('Mock Meetings Error:', mockMeetingsResponse.data);
    }

    // Test 2: Mock materials API
    console.log('\n📚 Testing mock materials API...');
    const mockMaterialsResponse = await makeRequestWithCookies('/api/teacher/materials', 'GET', null, loginResponse.cookies);
    console.log('Mock Materials Status:', mockMaterialsResponse.status);
    if (mockMaterialsResponse.status === 200) {
      console.log(`Mock Materials found: ${mockMaterialsResponse.data.length}`);
      mockMaterialsResponse.data.forEach((material, index) => {
        console.log(`  ${index + 1}. ${material.title} - ${material.stage_name}`);
      });
    } else {
      console.log('Mock Materials Error:', mockMaterialsResponse.data);
    }

    // Test 3: Mock students API
    console.log('\n👨‍🎓 Testing mock students API...');
    const mockStudentsResponse = await makeRequestWithCookies('/api/teacher/students', 'GET', null, loginResponse.cookies);
    console.log('Mock Students Status:', mockStudentsResponse.status);
    if (mockStudentsResponse.status === 200) {
      console.log(`Mock Students found: ${mockStudentsResponse.data.students.length}`);
      mockStudentsResponse.data.students.forEach((student, index) => {
        console.log(`  ${index + 1}. ${student.name} - ${student.current_stage}`);
      });
    } else {
      console.log('Mock Students Error:', mockStudentsResponse.data);
    }

    console.log('\n✅ Mock API tests completed');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

function makeRequestWithCookies(path, method, data = null, cookies = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'yaqeen.up.railway.app',
      port: 443,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data ? Buffer.byteLength(data) : 0,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    };

    if (cookies) {
      options.headers['Cookie'] = cookies;
    }

    const req = https.request(options, (res) => {
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
            headers: res.headers,
            cookies: res.headers['set-cookie'] || cookies
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: responseData,
            headers: res.headers,
            cookies: res.headers['set-cookie'] || cookies
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(data);
    }
    
    req.end();
  });
}

// Run the test
testMockAPIs();
