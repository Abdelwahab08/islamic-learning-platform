const https = require('https');

const BASE_URL = 'https://yaqeen.up.railway.app';

// Create test data for the logged-in teacher
async function createTestData() {
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

    // Step 2: Create test meeting
    console.log('\n📅 Creating test meeting...');
    const meetingData = JSON.stringify({
      title: 'درس تجريبي للاختبار',
      scheduled_date: '2025-01-20',
      scheduled_time: '10:00',
      duration: 60,
      target_type: 'STAGE',
      target_id: 'test-stage-id'
    });
    
    const createMeetingResponse = await makeRequestWithCookies('/api/meetings', 'POST', meetingData, loginResponse.cookies);
    console.log('Create Meeting Status:', createMeetingResponse.status);
    console.log('Create Meeting Response:', createMeetingResponse.data);

    // Step 3: Test if meetings API now works
    console.log('\n🔍 Testing if meetings API now works...');
    const meetingsResponse = await makeRequestWithCookies('/api/teacher/meetings', 'GET', null, loginResponse.cookies);
    console.log('Meetings API Status:', meetingsResponse.status);
    if (meetingsResponse.status === 200) {
      console.log(`Meetings API now shows ${meetingsResponse.data.length} meetings`);
    } else {
      console.log('Meetings API still failing:', meetingsResponse.data);
    }

    // Step 4: Test if materials API works
    console.log('\n🔍 Testing if materials API now works...');
    const materialsResponse = await makeRequestWithCookies('/api/teacher/materials', 'GET', null, loginResponse.cookies);
    console.log('Materials API Status:', materialsResponse.status);
    if (materialsResponse.status === 200) {
      console.log(`Materials API now shows ${materialsResponse.data.length} materials`);
    } else {
      console.log('Materials API still failing:', materialsResponse.data);
    }

    // Step 5: Test students API
    console.log('\n🔍 Testing students API...');
    const studentsResponse = await makeRequestWithCookies('/api/teacher/students', 'GET', null, loginResponse.cookies);
    console.log('Students API Status:', studentsResponse.status);
    if (studentsResponse.status === 200) {
      console.log(`Students API shows ${studentsResponse.data.students.length} students`);
    }

    console.log('\n✅ Test data creation completed');

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
createTestData();
