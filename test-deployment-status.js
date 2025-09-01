const https = require('https');

async function testDeploymentStatus() {
  console.log('🔍 Checking Railway Deployment Status...\n');
  
  const baseUrl = 'https://yaqeen.up.railway.app';
  
  try {
    // Test home page
    console.log('1️⃣ Testing home page...');
    const homeResponse = await makeRequest(`${baseUrl}/`, 'GET');
    console.log(`   Status: ${homeResponse.status}`);
    
    // Test teacher application page
    console.log('\n2️⃣ Testing teacher application page...');
    const teacherPageResponse = await makeRequest(`${baseUrl}/auth/apply-teacher`, 'GET');
    console.log(`   Status: ${teacherPageResponse.status}`);
    
    // Test student registration page
    console.log('\n3️⃣ Testing student registration page...');
    const studentPageResponse = await makeRequest(`${baseUrl}/auth/register-student`, 'GET');
    console.log(`   Status: ${studentPageResponse.status}`);
    
    // Test a simple API endpoint
    console.log('\n4️⃣ Testing simple API...');
    const apiResponse = await makeRequest(`${baseUrl}/api/quran/daily-ayah`, 'GET');
    console.log(`   Status: ${apiResponse.status}`);
    
    // Test student registration API (should work now)
    console.log('\n5️⃣ Testing student registration API...');
    const studentRegData = {
      email: `test${Date.now()}@example.com`,
      password: 'password123',
      role: 'STUDENT'
    };
    const studentRegResponse = await makeRequest(`${baseUrl}/api/auth/register`, 'POST', studentRegData);
    console.log(`   Status: ${studentRegResponse.status}`);
    
    if (homeResponse.status === 200 && teacherPageResponse.status === 200 && studentPageResponse.status === 200) {
      console.log('\n✅ Frontend pages are accessible');
    } else {
      console.log('\n❌ Some frontend pages are not accessible');
    }
    
    if (apiResponse.status === 200) {
      console.log('✅ API endpoints are working');
    } else {
      console.log('❌ API endpoints are not working');
    }
    
    if (studentRegResponse.status === 200) {
      console.log('✅ Student registration API is working (deployment complete)');
    } else {
      console.log('❌ Student registration API not working (deployment may not be complete)');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

function makeRequest(url, method, data) {
  return new Promise((resolve, reject) => {
    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/json'
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
            data: parsedData
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: responseData
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

testDeploymentStatus().catch(console.error);
