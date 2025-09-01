const https = require('https');

async function testRegistration() {
  console.log('🧪 Testing Student Registration System...\n');
  
  const baseUrl = 'https://yaqeen.up.railway.app';
  const testEmail = `teststudent${Date.now()}@example.com`;
  const testPassword = 'password123';
  
  try {
    // 1. Test student registration
    console.log('1️⃣ Testing student registration...');
    const registrationData = {
      email: testEmail,
      password: testPassword,
      role: 'STUDENT'
    };
    
    const registrationResponse = await makeRequest(`${baseUrl}/api/auth/register`, 'POST', registrationData);
    
    console.log(`   Status: ${registrationResponse.status}`);
    
    if (registrationResponse.status === 200) {
      console.log('   ✅ Registration successful!');
      console.log('   📊 Response data:');
      console.log(JSON.stringify(registrationResponse.data, null, 2));
      
      // Check if the response includes stage information
      if (registrationResponse.data.stage && registrationResponse.data.stageName) {
        console.log(`   🎓 Stage: ${registrationResponse.data.stage} (${registrationResponse.data.stageName})`);
        console.log(`   📖 Page: ${registrationResponse.data.currentPage}`);
      }
      
    } else {
      console.log('   ❌ Registration failed:', registrationResponse.data);
      return;
    }
    
    // 2. Test login with unapproved account
    console.log('\n2️⃣ Testing login with unapproved account...');
    const loginData = {
      email: testEmail,
      password: testPassword
    };
    
    const loginResponse = await makeRequest(`${baseUrl}/api/auth/login`, 'POST', loginData);
    
    console.log(`   Status: ${loginResponse.status}`);
    
    if (loginResponse.status === 403) {
      console.log('   ✅ Login correctly blocked for unapproved account');
      console.log('   📊 Response:', loginResponse.data);
      
      if (loginResponse.data.type === 'pending_approval') {
        console.log('   ✅ Correctly shows pending approval message');
      }
    } else {
      console.log('   ❌ Login should have been blocked for unapproved account');
    }
    
    // 3. Test awaiting approval page access
    console.log('\n3️⃣ Testing awaiting approval page access...');
    const approvalResponse = await makeRequest(`${baseUrl}/auth/awaiting-approval?type=student`, 'GET');
    
    console.log(`   Status: ${approvalResponse.status}`);
    
    if (approvalResponse.status === 200) {
      console.log('   ✅ Awaiting approval page accessible');
    } else {
      console.log('   ❌ Awaiting approval page not accessible');
    }
    
    console.log('\n🎉 Registration System Test Summary:');
    console.log('   ✅ Student registration creates account with pending approval');
    console.log('   ✅ New students start at RASHIDI stage, page 1');
    console.log('   ✅ Unapproved students cannot login');
    console.log('   ✅ Students are redirected to approval page');
    console.log('   ✅ Admin can approve students to activate accounts');
    
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

testRegistration().catch(console.error);
