const https = require('https');

async function testLogin() {
  console.log('🔐 Testing Login...\n');
  
  const baseUrl = 'https://yaqeen.up.railway.app';
  const testData = {
    email: 'student@test.com',
    password: 'password123'
  };
  
  try {
    console.log('1️⃣ Attempting login...');
    const loginResponse = await makeRequest(`${baseUrl}/api/auth/login`, 'POST', testData);
    console.log('   Login Status:', loginResponse.status);
    
    if (loginResponse.status === 200) {
      console.log('   ✅ Login successful!');
      console.log('   Response:', JSON.stringify(loginResponse.data, null, 2));
      
      // Now test the dashboard API with the session
      console.log('\n2️⃣ Testing Dashboard API with session...');
      const dashboardResponse = await makeRequest(`${baseUrl}/api/student/dashboard`, 'GET', null, loginResponse.cookies);
      console.log('   Dashboard Status:', dashboardResponse.status);
      
      if (dashboardResponse.status === 200) {
        console.log('   ✅ Dashboard API working!');
        console.log('   Data:', JSON.stringify(dashboardResponse.data, null, 2));
      } else {
        console.log('   ❌ Dashboard API failed:', dashboardResponse.data);
      }
      
    } else {
      console.log('   ❌ Login failed');
      console.log('   Response:', loginResponse.data);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

function makeRequest(url, method, data, cookies = '') {
  return new Promise((resolve, reject) => {
    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies
      }
    };
    
    if (data) {
      options.body = JSON.stringify(data);
    }
    
    const req = https.request(url, options, (res) => {
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
            cookies: res.headers['set-cookie'] ? res.headers['set-cookie'].join('; ') : cookies
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: responseData,
            cookies: res.headers['set-cookie'] ? res.headers['set-cookie'].join('; ') : cookies
          });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

testLogin().catch(console.error);
