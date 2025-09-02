const https = require('https');

const BASE_URL = 'https://yaqeen.up.railway.app';

// Test to understand the exact database state
async function testDatabaseState() {
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

    // Step 2: Check the exact database state
    console.log('\n🔍 Checking exact database state...');

    // Test 1: Check if the logged-in teacher has a teacher record
    console.log('\n👨‍🏫 Checking if logged-in teacher has a teacher record...');
    
    // Try to access teacher stats (this works and shows totalStudents: 1)
    const statsResponse = await makeRequestWithCookies('/api/teacher/stats', 'GET', null, loginResponse.cookies);
    console.log('Teacher Stats Status:', statsResponse.status);
    if (statsResponse.status === 200) {
      console.log('Teacher Stats:', statsResponse.data);
    }

    // Test 2: Check weekly progress (this works and shows 1 student)
    console.log('\n📊 Checking weekly progress...');
    const weeklyProgressResponse = await makeRequestWithCookies('/api/teacher/weekly-progress', 'GET', null, loginResponse.cookies);
    console.log('Weekly Progress Status:', weeklyProgressResponse.status);
    if (weeklyProgressResponse.status === 200) {
      console.log(`Weekly Progress shows ${weeklyProgressResponse.data.length} students`);
      weeklyProgressResponse.data.forEach((student, index) => {
        console.log(`  ${index + 1}. ${student.studentName} (${student.studentEmail})`);
      });
    }

    // Test 3: Check students API (this returns empty array)
    console.log('\n👨‍🎓 Checking students API...');
    const studentsResponse = await makeRequestWithCookies('/api/teacher/students', 'GET', null, loginResponse.cookies);
    console.log('Students API Status:', studentsResponse.status);
    console.log('Students API Response:', studentsResponse.data);

    // Test 4: Check meetings API (this fails with 500)
    console.log('\n📅 Checking meetings API...');
    const meetingsResponse = await makeRequestWithCookies('/api/teacher/meetings', 'GET', null, loginResponse.cookies);
    console.log('Meetings API Status:', meetingsResponse.status);
    console.log('Meetings API Response:', meetingsResponse.data);

    // Test 5: Check materials API (this fails with 500)
    console.log('\n📚 Checking materials API...');
    const materialsResponse = await makeRequestWithCookies('/api/teacher/materials', 'GET', null, loginResponse.cookies);
    console.log('Materials API Status:', materialsResponse.status);
    console.log('Materials API Response:', materialsResponse.data);

    // Test 6: Check if there's a mismatch in the teacher records
    console.log('\n🔍 Checking for teacher record mismatch...');
    
    // Try to access general endpoints to see what teacher IDs are used
    const generalMeetingsResponse = await makeRequestWithCookies('/api/meetings', 'GET', null, loginResponse.cookies);
    if (generalMeetingsResponse.status === 200 && generalMeetingsResponse.data.length > 0) {
      console.log('General meetings use teacher IDs:');
      const teacherIds = [...new Set(generalMeetingsResponse.data.map(m => m.teacher_id))];
      teacherIds.forEach(id => console.log(`  - ${id}`));
    }

    console.log('\n✅ Database state test completed');

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
testDatabaseState();
