const https = require('https');

async function testTeacherSimple() {
  console.log('🧪 Testing Teacher Application (Simple)...\n');
  
  const baseUrl = 'https://yaqeen.up.railway.app';
  const testEmail = `test${Date.now()}@example.com`;
  const testPassword = 'password123';
  const testFullName = 'Test Teacher';
  
  try {
    console.log('📧 Test email:', testEmail);
    console.log('🔑 Test password:', testPassword);
    console.log('👤 Test name:', testFullName);
    
    // Create form data for teacher application
    const formData = new URLSearchParams();
    formData.append('fullName', testFullName);
    formData.append('email', testEmail);
    formData.append('password', testPassword);
    formData.append('phoneNumber', '+966501234567');
    formData.append('bio', 'Test teacher bio');
    
    console.log('📤 Sending teacher application request...');
    console.log('📋 Form data:', formData.toString());
    
    const response = await makeFormRequest(`${baseUrl}/api/auth/apply-teacher`, 'POST', formData);
    
    console.log(`📊 Response Status: ${response.status}`);
    console.log('📄 Response Data:');
    console.log(JSON.stringify(response.data, null, 2));
    
    if (response.status === 200) {
      console.log('✅ Teacher application successful!');
    } else {
      console.log('❌ Teacher application failed');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
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

testTeacherSimple().catch(console.error);
