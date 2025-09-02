const https = require('https');

const BASE_URL = 'https://yaqeen.up.railway.app';

// Test specific failing APIs to get detailed error information
async function testSpecificErrors() {
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

    // Step 2: Test the failing APIs with detailed error logging
    console.log('\n🔍 Testing failing APIs for detailed errors...');

    // Test 1: Meetings API - GET request
    console.log('\n📅 Testing Meetings API (GET)...');
    const meetingsResponse = await makeRequestWithCookies('/api/teacher/meetings', 'GET', null, loginResponse.cookies);
    console.log('Meetings Status:', meetingsResponse.status);
    console.log('Meetings Headers:', meetingsResponse.headers);
    console.log('Meetings Response:', meetingsResponse.data);

    // Test 2: Materials API - GET request
    console.log('\n📚 Testing Materials API (GET)...');
    const materialsResponse = await makeRequestWithCookies('/api/teacher/materials', 'GET', null, loginResponse.cookies);
    console.log('Materials Status:', materialsResponse.status);
    console.log('Materials Headers:', materialsResponse.headers);
    console.log('Materials Response:', materialsResponse.data);

    // Test 3: Try to create a simple meeting to see if POST works
    console.log('\n📝 Testing Meetings API (POST)...');
    const meetingData = JSON.stringify({
      title: 'Test Meeting',
      scheduled_date: '2025-01-15',
      scheduled_time: '10:00',
      duration: 60,
      target_type: 'STAGE',
      target_id: 'test-stage-id'
    });
    const createMeetingResponse = await makeRequestWithCookies('/api/meetings', 'POST', meetingData, loginResponse.cookies);
    console.log('Create Meeting Status:', createMeetingResponse.status);
    console.log('Create Meeting Response:', createMeetingResponse.data);

    // Test 4: Try to access the meetings API with different parameters
    console.log('\n🔍 Testing Meetings API with status parameter...');
    const meetingsWithStatusResponse = await makeRequestWithCookies('/api/teacher/meetings?status=scheduled', 'GET', null, loginResponse.cookies);
    console.log('Meetings with Status Status:', meetingsWithStatusResponse.status);
    console.log('Meetings with Status Response:', meetingsWithStatusResponse.data);

    console.log('\n✅ All specific error tests completed');

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
testSpecificErrors();
