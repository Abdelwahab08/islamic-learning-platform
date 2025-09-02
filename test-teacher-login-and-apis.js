const https = require('https');

const BASE_URL = 'https://yaqeen.up.railway.app';

// Test teacher login and then test all problematic APIs
async function testTeacherLoginAndAPIs() {
  try {
    console.log('🔐 Testing teacher login...');
    
    // Step 1: Login as teacher@test.com
    const loginData = JSON.stringify({
      email: 'teacher@test.com',
      password: 'teacher123'
    });

    const loginResponse = await makeRequest('/api/auth/login', 'POST', loginData);
    console.log('Login Status:', loginResponse.status);
    console.log('Login Response:', loginResponse.data);

    if (loginResponse.status !== 200) {
      console.log('❌ Teacher login failed, cannot proceed with API tests');
      return;
    }

    const { token } = loginResponse.data;
    console.log('✅ Teacher login successful, token received');

    // Step 2: Test all problematic APIs with the token
    console.log('\n🔍 Testing problematic APIs...');

    // Test 1: Weekly Progress Table (جدول المتابعة الأسبوعي)
    console.log('\n📊 Testing Weekly Progress Table...');
    const weeklyProgressResponse = await makeRequest('/api/teacher/weekly-progress', 'GET', null, token);
    console.log('Weekly Progress Status:', weeklyProgressResponse.status);
    console.log('Weekly Progress Response:', weeklyProgressResponse.data);

    // Test 2: Meetings (الاجتماعات)
    console.log('\n📅 Testing Meetings...');
    const meetingsResponse = await makeRequest('/api/teacher/meetings', 'GET', null, token);
    console.log('Meetings Status:', meetingsResponse.status);
    console.log('Meetings Response:', meetingsResponse.data);

    // Test 3: Materials (المواد التعليمية)
    console.log('\n📚 Testing Materials...');
    const materialsResponse = await makeRequest('/api/teacher/materials', 'GET', null, token);
    console.log('Materials Status:', materialsResponse.status);
    console.log('Materials Response:', materialsResponse.data);

    // Test 4: Groups (المجموعات)
    console.log('\n👥 Testing Groups...');
    const groupsResponse = await makeRequest('/api/teacher/groups', 'GET', null, token);
    console.log('Groups Status:', groupsResponse.status);
    console.log('Groups Response:', groupsResponse.data);

    // Test 5: Students (for timetable page)
    console.log('\n👨‍🎓 Testing Students...');
    const studentsResponse = await makeRequest('/api/teacher/students', 'GET', null, token);
    console.log('Students Status:', studentsResponse.status);
    console.log('Students Response:', studentsResponse.data);

    // Test 6: Teacher Stats (نظرة عامة)
    console.log('\n📈 Testing Teacher Stats...');
    const statsResponse = await makeRequest('/api/teacher/stats', 'GET', null, token);
    console.log('Stats Status:', statsResponse.status);
    console.log('Stats Response:', statsResponse.data);

    console.log('\n✅ All API tests completed');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

function makeRequest(path, method, data = null, token = null) {
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

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
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
testTeacherLoginAndAPIs();
