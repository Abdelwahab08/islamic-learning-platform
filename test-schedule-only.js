const https = require('https');

async function testScheduleOnly() {
  console.log('🧪 Testing Schedule API Only...\n');
  
  const baseUrl = 'https://yaqeen.up.railway.app';
  const testData = {
    email: 'student@test.com',
    password: 'password123'
  };
  
  try {
    // First login to get session
    console.log('1️⃣ Logging in...');
    const loginResponse = await makeRequest(`${baseUrl}/api/auth/login`, 'POST', testData);
    
    if (loginResponse.status !== 200) {
      console.log('❌ Login failed:', loginResponse.data);
      return;
    }
    
    console.log('✅ Login successful!');
    const cookies = loginResponse.cookies;
    
    // Test schedule API specifically
    console.log('\n2️⃣ Testing Schedule API...');
    const scheduleResponse = await makeRequest(`${baseUrl}/api/student/schedule?date=2025-09-01`, 'GET', null, cookies);
    
    console.log(`   Status: ${scheduleResponse.status}`);
    
    if (scheduleResponse.status === 200) {
      console.log('   ✅ Schedule API working!');
      console.log('\n📅 Schedule Data:');
      console.log(JSON.stringify(scheduleResponse.data, null, 2));
      
      // Check if schedule has data
      if (Array.isArray(scheduleResponse.data) && scheduleResponse.data.length > 0) {
        console.log('\n✅ Schedule has data!');
        console.log(`   Found ${scheduleResponse.data.length} schedule items`);
        console.log('   The frontend should now show meetings instead of "لا توجد أحداث"');
      } else {
        console.log('\n❌ Schedule is empty!');
        console.log('   This might indicate the Railway deployment is not complete yet.');
      }
      
    } else {
      console.log('   ❌ Schedule API failed:', scheduleResponse.data);
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

testScheduleOnly().catch(console.error);
