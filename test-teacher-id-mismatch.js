const https = require('https');

const BASE_URL = 'https://yaqeen.up.railway.app';

// Test for teacher ID mismatch
async function testTeacherIdMismatch() {
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
    console.log('Logged in teacher user ID:', loginResponse.data.user.id);

    // Step 2: Check what teacher records exist
    console.log('\n🔍 Checking teacher records...');
    
    // Test general meetings to see what teacher_id is used there
    const generalMeetingsResponse = await makeRequestWithCookies('/api/meetings', 'GET', null, loginResponse.cookies);
    if (generalMeetingsResponse.status === 200 && generalMeetingsResponse.data.length > 0) {
      console.log('General meetings teacher IDs:');
      generalMeetingsResponse.data.forEach((meeting, index) => {
        console.log(`  ${index + 1}. Meeting: ${meeting.title}, Teacher ID: ${meeting.teacher_id}`);
      });
    }

    // Test general materials to see what teacher_id is used there
    const generalMaterialsResponse = await makeRequestWithCookies('/api/materials', 'GET', null, loginResponse.cookies);
    if (generalMaterialsResponse.status === 200 && generalMaterialsResponse.data.length > 0) {
      console.log('General materials teacher IDs:');
      generalMaterialsResponse.data.forEach((material, index) => {
        console.log(`  ${index + 1}. Material: ${material.title}, Teacher ID: ${material.teacher_id}`);
      });
    }

    // Test weekly progress to see what teacher record ID it uses
    const weeklyProgressResponse = await makeRequestWithCookies('/api/teacher/weekly-progress', 'GET', null, loginResponse.cookies);
    if (weeklyProgressResponse.status === 200) {
      console.log(`Weekly progress works and shows ${weeklyProgressResponse.data.length} students`);
    }

    // Test students API to see what it returns
    const studentsResponse = await makeRequestWithCookies('/api/teacher/students', 'GET', null, loginResponse.cookies);
    console.log('Students API response:', studentsResponse.data);

    console.log('\n✅ Teacher ID mismatch test completed');

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
testTeacherIdMismatch();
