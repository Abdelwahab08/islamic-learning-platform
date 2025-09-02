const https = require('https');

const BASE_URL = 'https://yaqeen.up.railway.app';

async function testWeeklyProgress() {
  try {
    console.log('1️⃣ Testing teacher login...');

    // Step 1: Login as teacher@test.com
    const loginData = JSON.stringify({
      email: 'teacher@test.com',
      password: 'teacher123'
    });

    const loginResponse = await makeRequest('/api/auth/login', 'POST', loginData);
    console.log('Login Status:', loginResponse.status);
    console.log('Login Response:', loginResponse.data);

    if (loginResponse.status !== 200) {
      console.log('❌ Teacher login failed, cannot proceed with tests');
      return;
    }

    console.log('✅ Teacher login successful');

    // Step 2: Test Weekly Progress API
    console.log('\n2️⃣ Testing Weekly Progress API...');
    const fromDate = '2025-01-01';
    const toDate = '2025-01-07';
    
    const weeklyProgressResponse = await makeRequest(
      `/api/teacher/students/timetable?from=${fromDate}&to=${toDate}`, 
      'GET', 
      null, 
      loginResponse.headers['set-cookie']
    );
    
    console.log('Weekly Progress Status:', weeklyProgressResponse.status);
    console.log('Weekly Progress Response:', weeklyProgressResponse.data);

    if (weeklyProgressResponse.status === 200) {
      console.log('✅ Weekly Progress API working!');
    } else {
      console.log('❌ Weekly Progress API failed');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Full error:', error);
  }
}

function makeRequest(path, method, data = null, cookies = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'yaqeen.up.railway.app',
      port: 443,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data ? Buffer.byteLength(data) : 0
      }
    };

    if (cookies) {
      options.headers['Cookie'] = cookies.join('; ');
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
      req.write(data);
    }

    req.end();
  });
}

// Run the test
testWeeklyProgress();
