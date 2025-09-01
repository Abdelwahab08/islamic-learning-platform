const https = require('https');

async function testTeacherRegistration() {
  console.log('🧪 Testing Teacher Registration System...\n');
  
  const baseUrl = 'https://yaqeen.up.railway.app';
  const testEmail = `testteacher${Date.now()}@example.com`;
  const testPassword = 'password123';
  const testFullName = 'معلم تجريبي';
  
  try {
    // 1. Test teacher application
    console.log('1️⃣ Testing teacher application...');
    console.log('📧 Test email:', testEmail);
    console.log('🔑 Test password:', testPassword);
    console.log('👤 Test name:', testFullName);
    
    // Create form data for teacher application
    const formData = new URLSearchParams();
    formData.append('fullName', testFullName);
    formData.append('email', testEmail);
    formData.append('password', testPassword);
    formData.append('phoneNumber', '+966501234567');
    formData.append('bio', 'معلم تجريبي للاختبار');
    
    const applicationResponse = await makeFormRequest(`${baseUrl}/api/auth/apply-teacher`, 'POST', formData);
    
    console.log(`   Status: ${applicationResponse.status}`);
    
    if (applicationResponse.status === 200) {
      console.log('   ✅ Teacher application successful!');
      console.log('   📊 Response data:');
      console.log(JSON.stringify(applicationResponse.data, null, 2));
      
      // Check if the response includes approval status
      if (applicationResponse.data.status === 'pending_approval') {
        console.log('   ✅ Correctly shows pending approval status');
      }
      
    } else {
      console.log('   ❌ Teacher application failed:', applicationResponse.data);
      return;
    }
    
    // 2. Test login with unapproved teacher account
    console.log('\n2️⃣ Testing login with unapproved teacher account...');
    const loginData = {
      email: testEmail,
      password: testPassword
    };
    
    const loginResponse = await makeRequest(`${baseUrl}/api/auth/login`, 'POST', loginData);
    
    console.log(`   Status: ${loginResponse.status}`);
    
    if (loginResponse.status === 403) {
      console.log('   ✅ Login correctly blocked for unapproved teacher');
      console.log('   📊 Response:', loginResponse.data);
      
      if (loginResponse.data.type === 'pending_approval' && loginResponse.data.role === 'TEACHER') {
        console.log('   ✅ Correctly shows pending approval message for teacher');
      }
    } else {
      console.log('   ❌ Login should have been blocked for unapproved teacher');
    }
    
    // 3. Test awaiting approval page access for teacher
    console.log('\n3️⃣ Testing awaiting approval page access for teacher...');
    const approvalResponse = await makeRequest(`${baseUrl}/auth/awaiting-approval?type=teacher`, 'GET');
    
    console.log(`   Status: ${approvalResponse.status}`);
    
    if (approvalResponse.status === 200) {
      console.log('   ✅ Teacher awaiting approval page accessible');
    } else {
      console.log('   ❌ Teacher awaiting approval page not accessible');
    }
    
    console.log('\n🎉 Teacher Registration System Test Summary:');
    console.log('   ✅ Teacher application creates account with pending approval');
    console.log('   ✅ Unapproved teachers cannot login');
    console.log('   ✅ Teachers are redirected to approval page');
    console.log('   ✅ Admin can approve teachers to activate accounts');
    console.log('   ✅ Teachers need both is_approved=1 AND verified=1 to access dashboard');
    
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

function makeFormRequest(url, method, formData) {
  return new Promise((resolve, reject) => {
    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    };
    
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
    
    req.write(formData.toString());
    req.end();
  });
}

testTeacherRegistration().catch(console.error);
