const https = require('https');

async function testTeacherDashboardAPIs() {
  console.log('🧪 Testing Teacher Dashboard APIs...\n');
  
  const baseUrl = 'https://yaqeen.up.railway.app';
  
  // Test data for a teacher login
  const teacherLoginData = {
    email: 'teacher@test.com',
    password: 'password123'
  };
  
  try {
    // 1. Login as teacher to get auth token
    console.log('1️⃣ Logging in as teacher...');
    const loginResponse = await makeRequest(`${baseUrl}/api/auth/login`, 'POST', teacherLoginData);
    
    if (loginResponse.status !== 200) {
      console.log('❌ Teacher login failed:', loginResponse.data);
      return;
    }
    
    console.log('✅ Teacher login successful');
    const authToken = loginResponse.headers?.['set-cookie']?.[0] || '';
    
    // 2. Test teacher stats API
    console.log('\n2️⃣ Testing teacher stats API...');
    const statsResponse = await makeRequest(`${baseUrl}/api/teacher/stats`, 'GET', null, authToken);
    console.log(`   Status: ${statsResponse.status}`);
    if (statsResponse.status === 200) {
      console.log('   ✅ Teacher stats API working');
      console.log('   📊 Data:', JSON.stringify(statsResponse.data, null, 2));
    } else {
      console.log('   ❌ Teacher stats API failed:', statsResponse.data);
    }
    
    // 3. Test materials API
    console.log('\n3️⃣ Testing materials API...');
    const materialsResponse = await makeRequest(`${baseUrl}/api/materials`, 'GET', null, authToken);
    console.log(`   Status: ${materialsResponse.status}`);
    if (materialsResponse.status === 200) {
      console.log('   ✅ Materials API working');
      console.log('   📊 Data count:', materialsResponse.data?.length || 0);
    } else {
      console.log('   ❌ Materials API failed:', materialsResponse.data);
    }
    
    // 4. Test groups API (if it exists)
    console.log('\n4️⃣ Testing groups API...');
    const groupsResponse = await makeRequest(`${baseUrl}/api/teacher/groups`, 'GET', null, authToken);
    console.log(`   Status: ${groupsResponse.status}`);
    if (groupsResponse.status === 200) {
      console.log('   ✅ Groups API working');
      console.log('   📊 Data count:', groupsResponse.data?.length || 0);
    } else if (groupsResponse.status === 404) {
      console.log('   ⚠️ Groups API endpoint not found');
    } else {
      console.log('   ❌ Groups API failed:', groupsResponse.data);
    }
    
    // 5. Test weekly progress API (if it exists)
    console.log('\n5️⃣ Testing weekly progress API...');
    const progressResponse = await makeRequest(`${baseUrl}/api/teacher/weekly-progress`, 'GET', null, authToken);
    console.log(`   Status: ${progressResponse.status}`);
    if (progressResponse.status === 200) {
      console.log('   ✅ Weekly progress API working');
      console.log('   📊 Data count:', progressResponse.data?.length || 0);
    } else if (progressResponse.status === 404) {
      console.log('   ⚠️ Weekly progress API endpoint not found');
    } else {
      console.log('   ❌ Weekly progress API failed:', progressResponse.data);
    }
    
    // 6. Test assignments API
    console.log('\n6️⃣ Testing assignments API...');
    const assignmentsResponse = await makeRequest(`${baseUrl}/api/teacher/assignments`, 'GET', null, authToken);
    console.log(`   Status: ${assignmentsResponse.status}`);
    if (assignmentsResponse.status === 200) {
      console.log('   ✅ Assignments API working');
      console.log('   📊 Data count:', assignmentsResponse.data?.length || 0);
    } else if (assignmentsResponse.status === 404) {
      console.log('   ⚠️ Assignments API endpoint not found');
    } else {
      console.log('   ❌ Assignments API failed:', assignmentsResponse.data);
    }
    
    console.log('\n🎯 Summary of Teacher Dashboard API Issues:');
    console.log('   - نظرة عامة (Overview): Depends on /api/teacher/stats');
    console.log('   - جدول المتابعة الأسبوعي (Weekly Progress): Needs /api/teacher/weekly-progress');
    console.log('   - المواد التعليمية (Materials): Depends on /api/materials');
    console.log('   - المجموعات (Groups): Needs /api/teacher/groups');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

function makeRequest(url, method, data, authToken = '') {
  return new Promise((resolve, reject) => {
    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    if (authToken) {
      options.headers['Cookie'] = authToken;
    }
    
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
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

testTeacherDashboardAPIs().catch(console.error);
