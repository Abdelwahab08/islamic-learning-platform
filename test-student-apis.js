const https = require('https');

// Test all student APIs
async function testStudentAPIs() {
  console.log('🧪 Testing Student APIs...\n');
  
  const baseUrl = 'https://yaqeen.up.railway.app';
  const testData = {
    email: 'student@test.com',
    password: 'test123'
  };
  
  try {
    // First, let's try to get a session cookie by logging in
    console.log('1️⃣ Testing login...');
    const loginResponse = await makeRequest(`${baseUrl}/api/auth/login`, 'POST', testData);
    console.log('   Login Status:', loginResponse.status);
    
    if (loginResponse.status === 200) {
      console.log('   ✅ Login successful');
      
      // Test dashboard API
      console.log('\n2️⃣ Testing Dashboard API...');
      const dashboardResponse = await makeRequest(`${baseUrl}/api/student/dashboard`, 'GET', null, loginResponse.cookies);
      console.log('   Dashboard Status:', dashboardResponse.status);
      if (dashboardResponse.status === 200) {
        console.log('   Dashboard Data:', JSON.stringify(dashboardResponse.data, null, 2));
      }
      
      // Test assignments API
      console.log('\n3️⃣ Testing Assignments API...');
      const assignmentsResponse = await makeRequest(`${baseUrl}/api/student/assignments`, 'GET', null, loginResponse.cookies);
      console.log('   Assignments Status:', assignmentsResponse.status);
      if (assignmentsResponse.status === 200) {
        console.log('   Assignments Data:', JSON.stringify(assignmentsResponse.data, null, 2));
      }
      
      // Test certificates API
      console.log('\n4️⃣ Testing Certificates API...');
      const certificatesResponse = await makeRequest(`${baseUrl}/api/student/certificates`, 'GET', null, loginResponse.cookies);
      console.log('   Certificates Status:', certificatesResponse.status);
      if (certificatesResponse.status === 200) {
        console.log('   Certificates Data:', JSON.stringify(certificatesResponse.data, null, 2));
      }
      
      // Test meetings API
      console.log('\n5️⃣ Testing Meetings API...');
      const meetingsResponse = await makeRequest(`${baseUrl}/api/student/meetings`, 'GET', null, loginResponse.cookies);
      console.log('   Meetings Status:', meetingsResponse.status);
      if (meetingsResponse.status === 200) {
        console.log('   Meetings Data:', JSON.stringify(meetingsResponse.data, null, 2));
      }
      
      // Test materials API
      console.log('\n6️⃣ Testing Materials API...');
      const materialsResponse = await makeRequest(`${baseUrl}/api/student/materials`, 'GET', null, loginResponse.cookies);
      console.log('   Materials Status:', materialsResponse.status);
      if (materialsResponse.status === 200) {
        console.log('   Materials Data:', JSON.stringify(materialsResponse.data, null, 2));
      }
      
      // Test schedule API
      console.log('\n7️⃣ Testing Schedule API...');
      const scheduleResponse = await makeRequest(`${baseUrl}/api/student/schedule?date=2025-09-01`, 'GET', null, loginResponse.cookies);
      console.log('   Schedule Status:', scheduleResponse.status);
      if (scheduleResponse.status === 200) {
        console.log('   Schedule Data:', JSON.stringify(scheduleResponse.data, null, 2));
      }
      
    } else {
      console.log('   ❌ Login failed');
      console.log('   Response:', loginResponse.data);
    }
    
  } catch (error) {
    console.error('❌ Error testing APIs:', error.message);
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

testStudentAPIs().catch(console.error);
