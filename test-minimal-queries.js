const https = require('https');

const BASE_URL = 'https://yaqeen.up.railway.app';

// Test minimal database queries to identify the exact issue
async function testMinimalQueries() {
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

    // Step 2: Test minimal queries to identify the issue
    console.log('\n🔍 Testing minimal database queries...');

    // Test 1: Try to access meetings table with minimal query
    console.log('\n📅 Testing minimal meetings query...');
    const minimalMeetingsResponse = await makeRequestWithCookies('/api/teacher/meetings', 'GET', null, loginResponse.cookies);
    console.log('Minimal Meetings Status:', minimalMeetingsResponse.status);
    console.log('Minimal Meetings Response:', minimalMeetingsResponse.data);

    // Test 2: Try to access materials table with minimal query
    console.log('\n📚 Testing minimal materials query...');
    const minimalMaterialsResponse = await makeRequestWithCookies('/api/teacher/materials', 'GET', null, loginResponse.cookies);
    console.log('Minimal Materials Status:', minimalMaterialsResponse.status);
    console.log('Minimal Materials Response:', minimalMaterialsResponse.data);

    // Test 3: Check if the issue is with the teacher-specific filtering
    console.log('\n👨‍🏫 Testing if teacher filtering is the issue...');
    
    // Try to access meetings without teacher filtering (as admin would)
    const adminMeetingsResponse = await makeRequestWithCookies('/api/meetings', 'GET', null, loginResponse.cookies);
    console.log('Admin-style Meetings Status:', adminMeetingsResponse.status);
    console.log('Admin-style Meetings Response:', adminMeetingsResponse.data);

    // Test 4: Check if the issue is with specific JOIN operations
    console.log('\n🔗 Testing if JOIN operations are the issue...');
    
    // Try to create a very simple meeting to see if the basic table structure works
    const simpleMeetingData = JSON.stringify({
      title: 'Simple Test Meeting',
      scheduled_date: '2025-01-15',
      scheduled_time: '10:00',
      duration: 60,
      target_type: 'STAGE',
      target_id: 'test-stage-id'
    });
    const createSimpleMeetingResponse = await makeRequestWithCookies('/api/meetings', 'POST', simpleMeetingData, loginResponse.cookies);
    console.log('Create Simple Meeting Status:', createSimpleMeetingResponse.status);
    console.log('Create Simple Meeting Response:', createSimpleMeetingResponse.data);

    console.log('\n✅ Minimal query tests completed');

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
testMinimalQueries();
