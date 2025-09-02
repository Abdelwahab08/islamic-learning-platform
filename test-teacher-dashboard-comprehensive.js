const https = require('https');

const BASE_URL = 'https://yaqeen.up.railway.app';

// Test teacher login and then test all problematic APIs
async function testTeacherDashboardComprehensive() {
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

    console.log('✅ Teacher login successful');

    // Step 2: Test all teacher dashboard APIs
    console.log('\n🔍 Testing all teacher dashboard APIs...');

    // Test 1: Teacher Stats (نظرة عامة)
    console.log('\n📈 Testing Teacher Stats (نظرة عامة)...');
    const statsResponse = await makeRequest('/api/teacher/stats', 'GET', null, loginResponse.headers['set-cookie']);
    console.log('Stats Status:', statsResponse.status);
    console.log('Stats Response:', statsResponse.data);

    // Test 2: Weekly Progress Table (جدول المتابعة الأسبوعي)
    console.log('\n📊 Testing Weekly Progress Table (جدول المتابعة الأسبوعي)...');
    const weeklyProgressResponse = await makeRequest('/api/teacher/weekly-progress', 'GET', null, loginResponse.headers['set-cookie']);
    console.log('Weekly Progress Status:', weeklyProgressResponse.status);
    console.log('Weekly Progress Response:', weeklyProgressResponse.data);

    // Test 3: Meetings (الاجتماعات)
    console.log('\n📅 Testing Meetings (الاجتماعات)...');
    const meetingsResponse = await makeRequest('/api/teacher/meetings', 'GET', null, loginResponse.headers['set-cookie']);
    console.log('Meetings Status:', meetingsResponse.status);
    console.log('Meetings Response:', meetingsResponse.data);

    // Test 4: Materials (المواد التعليمية)
    console.log('\n📚 Testing Materials (المواد التعليمية)...');
    const materialsResponse = await makeRequest('/api/teacher/materials', 'GET', null, loginResponse.headers['set-cookie']);
    console.log('Materials Status:', materialsResponse.status);
    console.log('Materials Response:', materialsResponse.data);

    // Test 5: Groups (المجموعات)
    console.log('\n👥 Testing Groups (المجموعات)...');
    const groupsResponse = await makeRequest('/api/teacher/groups', 'GET', null, loginResponse.headers['set-cookie']);
    console.log('Groups Status:', groupsResponse.status);
    console.log('Groups Response:', groupsResponse.data);

    // Test 6: Students (for timetable page)
    console.log('\n👨‍🎓 Testing Students...');
    const studentsResponse = await makeRequest('/api/teacher/students', 'GET', null, loginResponse.headers['set-cookie']);
    console.log('Students Status:', studentsResponse.status);
    console.log('Students Response:', studentsResponse.data);

    // Test 7: Create a test group
    console.log('\n➕ Testing Group Creation...');
    const groupData = JSON.stringify({
      name: 'مجموعة اختبار',
      description: 'مجموعة اختبار للتأكد من عمل النظام',
      max_students: 10
    });
    const createGroupResponse = await makeRequest('/api/teacher/groups', 'POST', groupData, loginResponse.headers['set-cookie']);
    console.log('Create Group Status:', createGroupResponse.status);
    console.log('Create Group Response:', createGroupResponse.data);

    // Test 8: Create a test meeting
    console.log('\n📅 Testing Meeting Creation...');
    const meetingData = JSON.stringify({
      title: 'درس اختبار',
      description: 'درس اختبار للتأكد من عمل النظام',
      date: '2025-01-25',
      time: '10:00',
      duration: 60,
      meeting_type: 'AGORA'
    });
    const createMeetingResponse = await makeRequest('/api/teacher/meetings', 'POST', meetingData, loginResponse.headers['set-cookie']);
    console.log('Create Meeting Status:', createMeetingResponse.status);
    console.log('Create Meeting Response:', createMeetingResponse.data);

    // Test 9: Create a test material
    console.log('\n📚 Testing Material Creation...');
    const materialData = JSON.stringify({
      title: 'مادة اختبار',
      description: 'مادة اختبار للتأكد من عمل النظام',
      type: 'document',
      content: 'محتوى المادة التعليمية'
    });
    const createMaterialResponse = await makeRequest('/api/teacher/materials', 'POST', materialData, loginResponse.headers['set-cookie']);
    console.log('Create Material Status:', createMaterialResponse.status);
    console.log('Create Material Response:', createMaterialResponse.data);

    console.log('\n✅ All API tests completed');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
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
testTeacherDashboardComprehensive();
