const https = require('https');

const BASE_URL = 'https://yaqeen.up.railway.app';

// Test database connection and table existence through simple API calls
async function testDatabaseConnection() {
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

    // Step 2: Test simple database operations
    console.log('\n🔍 Testing database operations...');

    // Test 1: Check if we can get teacher record (this should work since stats API works)
    console.log('\n👨‍🏫 Testing teacher record access...');
    const statsResponse = await makeRequestWithCookies('/api/teacher/stats', 'GET', null, loginResponse.cookies);
    console.log('Stats Status:', statsResponse.status);
    if (statsResponse.status === 200) {
      console.log('✅ Teacher record access works');
    }

    // Test 2: Check if we can access students table (this should work since weekly progress works)
    console.log('\n👨‍🎓 Testing students table access...');
    const weeklyProgressResponse = await makeRequestWithCookies('/api/teacher/weekly-progress', 'GET', null, loginResponse.cookies);
    console.log('Weekly Progress Status:', weeklyProgressResponse.status);
    if (weeklyProgressResponse.status === 200) {
      console.log('✅ Students table access works');
    }

    // Test 3: Check if we can access groups table (this should work since groups API works)
    console.log('\n🏷️ Testing groups table access...');
    const groupsResponse = await makeRequestWithCookies('/api/teacher/groups', 'GET', null, loginResponse.cookies);
    console.log('Groups Status:', groupsResponse.status);
    if (groupsResponse.status === 200) {
      console.log('✅ Groups table access works');
    }

    // Test 4: Try to access a simple endpoint that doesn't require complex joins
    console.log('\n🔍 Testing simple database query...');
    const simpleResponse = await makeRequestWithCookies('/api/teacher/students', 'GET', null, loginResponse.cookies);
    console.log('Simple Query Status:', simpleResponse.status);
    if (simpleResponse.status === 200) {
      console.log('✅ Simple database query works');
    }

    // Test 5: Check if the issue is with specific table joins
    console.log('\n🔗 Testing table join operations...');
    
    // Try to access meetings with a different approach
    console.log('Testing meetings table access...');
    const meetingsResponse = await makeRequestWithCookies('/api/teacher/meetings', 'GET', null, loginResponse.cookies);
    console.log('Meetings Status:', meetingsResponse.status);
    
    // Try to access materials with a different approach
    console.log('Testing materials table access...');
    const materialsResponse = await makeRequestWithCookies('/api/teacher/materials', 'GET', null, loginResponse.cookies);
    console.log('Materials Status:', materialsResponse.status);

    console.log('\n✅ Database connection tests completed');

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
testDatabaseConnection();
