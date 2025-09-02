const https = require('https');

const BASE_URL = 'https://yaqeen.up.railway.app';

// Test teacher login and APIs with proper cookie handling
async function testTeacherWithCookies() {
  try {
    console.log('🔐 Testing teacher login with cookie handling...');
    
    // Step 1: Login as teacher@test.com and capture cookies
    const loginData = JSON.stringify({
      email: 'teacher@test.com',
      password: 'teacher123'
    });

    const loginResponse = await makeRequestWithCookies('/api/auth/login', 'POST', loginData);
    console.log('Login Status:', loginResponse.status);
    console.log('Login Response:', loginResponse.data);
    console.log('Cookies received:', loginResponse.cookies);

    if (loginResponse.status !== 200) {
      console.log('❌ Teacher login failed, cannot proceed with API tests');
      return;
    }

    console.log('✅ Teacher login successful, cookies captured');

    // Step 2: Test all problematic APIs with cookies
    console.log('\n🔍 Testing problematic APIs with cookies...');

    // Test 1: Weekly Progress Table (جدول المتابعة الأسبوعي)
    console.log('\n📊 Testing Weekly Progress Table...');
    const weeklyProgressResponse = await makeRequestWithCookies('/api/teacher/weekly-progress', 'GET', null, loginResponse.cookies);
    console.log('Weekly Progress Status:', weeklyProgressResponse.status);
    console.log('Weekly Progress Response:', weeklyProgressResponse.data);

    // Test 2: Meetings (الاجتماعات)
    console.log('\n📅 Testing Meetings...');
    const meetingsResponse = await makeRequestWithCookies('/api/teacher/meetings', 'GET', null, loginResponse.cookies);
    console.log('Meetings Status:', meetingsResponse.status);
    console.log('Meetings Response:', meetingsResponse.data);

    // Test 3: Materials (المواد التعليمية)
    console.log('\n📚 Testing Materials...');
    const materialsResponse = await makeRequestWithCookies('/api/teacher/materials', 'GET', null, loginResponse.cookies);
    console.log('Materials Status:', materialsResponse.status);
    console.log('Materials Response:', materialsResponse.data);

    // Test 4: Groups (المجموعات)
    console.log('\n👥 Testing Groups...');
    const groupsResponse = await makeRequestWithCookies('/api/teacher/groups', 'GET', null, loginResponse.cookies);
    console.log('Groups Status:', groupsResponse.status);
    console.log('Groups Response:', groupsResponse.data);

    // Test 5: Students (for timetable page)
    console.log('\n👨‍🎓 Testing Students...');
    const studentsResponse = await makeRequestWithCookies('/api/teacher/students', 'GET', null, loginResponse.cookies);
    console.log('Students Status:', studentsResponse.status);
    console.log('Students Response:', studentsResponse.data);

    // Test 6: Teacher Stats (نظرة عامة)
    console.log('\n📈 Testing Teacher Stats...');
    const statsResponse = await makeRequestWithCookies('/api/teacher/stats', 'GET', null, loginResponse.cookies);
    console.log('Stats Status:', statsResponse.status);
    console.log('Stats Response:', statsResponse.data);

    console.log('\n✅ All API tests completed');

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
testTeacherWithCookies();
