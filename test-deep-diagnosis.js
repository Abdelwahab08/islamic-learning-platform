const https = require('https');

const BASE_URL = 'https://yaqeen.up.railway.app';

// Deep diagnosis of the failing APIs
async function testDeepDiagnosis() {
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

    // Step 2: Deep diagnosis of failing APIs
    console.log('\n🔍 Deep diagnosis of failing APIs...');

    // Test 1: Check if the issue is with the teacher-specific endpoint vs general endpoint
    console.log('\n📅 Testing meetings endpoints comparison...');
    
    // Test general meetings endpoint (should work)
    const generalMeetingsResponse = await makeRequestWithCookies('/api/meetings', 'GET', null, loginResponse.cookies);
    console.log('General Meetings Status:', generalMeetingsResponse.status);
    if (generalMeetingsResponse.status === 200) {
      console.log(`General Meetings found: ${generalMeetingsResponse.data.length}`);
    }
    
    // Test teacher-specific meetings endpoint (should work now)
    const teacherMeetingsResponse = await makeRequestWithCookies('/api/teacher/meetings', 'GET', null, loginResponse.cookies);
    console.log('Teacher Meetings Status:', teacherMeetingsResponse.status);
    if (teacherMeetingsResponse.status === 200) {
      console.log(`Teacher Meetings found: ${teacherMeetingsResponse.data.length}`);
    } else {
      console.log('Teacher Meetings Error:', teacherMeetingsResponse.data);
    }

    // Test 2: Check materials endpoints
    console.log('\n📚 Testing materials endpoints comparison...');
    
    // Test general materials endpoint (if it exists)
    const generalMaterialsResponse = await makeRequestWithCookies('/api/materials', 'GET', null, loginResponse.cookies);
    console.log('General Materials Status:', generalMaterialsResponse.status);
    if (generalMaterialsResponse.status === 200) {
      console.log(`General Materials found: ${generalMaterialsResponse.data.length}`);
    }
    
    // Test teacher-specific materials endpoint
    const teacherMaterialsResponse = await makeRequestWithCookies('/api/teacher/materials', 'GET', null, loginResponse.cookies);
    console.log('Teacher Materials Status:', teacherMaterialsResponse.status);
    if (teacherMaterialsResponse.status === 200) {
      console.log(`Teacher Materials found: ${teacherMaterialsResponse.data.length}`);
    } else {
      console.log('Teacher Materials Error:', teacherMaterialsResponse.data);
    }

    // Test 3: Check students endpoint more carefully
    console.log('\n👨‍🎓 Testing students endpoint...');
    const studentsResponse = await makeRequestWithCookies('/api/teacher/students', 'GET', null, loginResponse.cookies);
    console.log('Students Status:', studentsResponse.status);
    console.log('Students Response:', studentsResponse.data);
    
    // Test 4: Check if there's a mismatch between weekly progress and students
    console.log('\n📊 Testing weekly progress vs students consistency...');
    const weeklyProgressResponse = await makeRequestWithCookies('/api/teacher/weekly-progress', 'GET', null, loginResponse.cookies);
    console.log('Weekly Progress Status:', weeklyProgressResponse.status);
    if (weeklyProgressResponse.status === 200) {
      console.log(`Weekly Progress Students: ${weeklyProgressResponse.data.length}`);
      weeklyProgressResponse.data.forEach((student, index) => {
        console.log(`  ${index + 1}. ${student.studentName} (${student.studentEmail})`);
      });
    }

    console.log('\n✅ Deep diagnosis completed');

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
testDeepDiagnosis();
