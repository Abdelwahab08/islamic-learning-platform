const https = require('https');

const BASE_URL = 'https://yaqeen.up.railway.app';

// Test simple queries to isolate the issue
async function testSimpleQueries() {
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

    // Step 2: Test very simple queries
    console.log('\n🔍 Testing simple queries...');

    // Test 1: Try to access the teacher-specific meetings endpoint with minimal data
    console.log('\n📅 Testing teacher meetings endpoint...');
    const teacherMeetingsResponse = await makeRequestWithCookies('/api/teacher/meetings', 'GET', null, loginResponse.cookies);
    console.log('Teacher Meetings Status:', teacherMeetingsResponse.status);
    console.log('Teacher Meetings Response:', teacherMeetingsResponse.data);

    // Test 2: Try to access the teacher-specific materials endpoint with minimal data
    console.log('\n📚 Testing teacher materials endpoint...');
    const teacherMaterialsResponse = await makeRequestWithCookies('/api/teacher/materials', 'GET', null, loginResponse.cookies);
    console.log('Teacher Materials Status:', teacherMaterialsResponse.status);
    console.log('Teacher Materials Response:', teacherMaterialsResponse.data);

    // Test 3: Try to access the students endpoint
    console.log('\n👨‍🎓 Testing students endpoint...');
    const studentsResponse = await makeRequestWithCookies('/api/teacher/students', 'GET', null, loginResponse.cookies);
    console.log('Students Status:', studentsResponse.status);
    console.log('Students Response:', studentsResponse.data);

    // Test 4: Check if the issue is with the specific teacher email filtering
    console.log('\n🔍 Testing if email filtering is the issue...');
    
    // Try to access general endpoints to see if they still work
    const generalMeetingsResponse = await makeRequestWithCookies('/api/meetings', 'GET', null, loginResponse.cookies);
    console.log('General Meetings Status:', generalMeetingsResponse.status);
    
    const generalMaterialsResponse = await makeRequestWithCookies('/api/materials', 'GET', null, loginResponse.cookies);
    console.log('General Materials Status:', generalMaterialsResponse.status);

    console.log('\n✅ Simple query tests completed');

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
testSimpleQueries();
