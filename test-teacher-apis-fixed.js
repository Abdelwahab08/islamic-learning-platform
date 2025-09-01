const https = require('https');

async function testTeacherAPIsFixed() {
  console.log('🧪 Testing Teacher APIs (Fixed Version)...\n');
  
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
    
    // 3. Test groups API
    console.log('\n3️⃣ Testing groups API...');
    const groupsResponse = await makeRequest(`${baseUrl}/api/teacher/groups`, 'GET', null, authToken);
    console.log(`   Status: ${groupsResponse.status}`);
    if (groupsResponse.status === 200) {
      console.log('   ✅ Groups API working');
      console.log('   📊 Data count:', groupsResponse.data?.length || 0);
      console.log('   📋 Data:', JSON.stringify(groupsResponse.data, null, 2));
    } else {
      console.log('   ❌ Groups API failed:', groupsResponse.data);
    }
    
    // 4. Test creating a group
    console.log('\n4️⃣ Testing group creation...');
    const groupData = {
      name: 'مجموعة تجريبية',
      stageId: null
    };
    const createGroupResponse = await makeRequest(`${baseUrl}/api/teacher/groups`, 'POST', groupData, authToken);
    console.log(`   Status: ${createGroupResponse.status}`);
    if (createGroupResponse.status === 200) {
      console.log('   ✅ Group creation successful');
      console.log('   📊 Response:', JSON.stringify(createGroupResponse.data, null, 2));
    } else {
      console.log('   ❌ Group creation failed:', createGroupResponse.data);
    }
    
    // 5. Test groups API again after creation
    console.log('\n5️⃣ Testing groups API after creation...');
    const groupsAfterResponse = await makeRequest(`${baseUrl}/api/teacher/groups`, 'GET', null, authToken);
    console.log(`   Status: ${groupsAfterResponse.status}`);
    if (groupsAfterResponse.status === 200) {
      console.log('   ✅ Groups API working after creation');
      console.log('   📊 Data count:', groupsAfterResponse.data?.length || 0);
      console.log('   📋 Data:', JSON.stringify(groupsAfterResponse.data, null, 2));
    } else {
      console.log('   ❌ Groups API failed after creation:', groupsAfterResponse.data);
    }
    
    // 6. Test weekly progress API
    console.log('\n6️⃣ Testing weekly progress API...');
    const progressResponse = await makeRequest(`${baseUrl}/api/teacher/weekly-progress`, 'GET', null, authToken);
    console.log(`   Status: ${progressResponse.status}`);
    if (progressResponse.status === 200) {
      console.log('   ✅ Weekly progress API working');
      console.log('   📊 Data count:', progressResponse.data?.length || 0);
      console.log('   📋 Data:', JSON.stringify(progressResponse.data, null, 2));
    } else {
      console.log('   ❌ Weekly progress API failed:', progressResponse.data);
    }
    
    // 7. Test materials API
    console.log('\n7️⃣ Testing materials API...');
    const materialsResponse = await makeRequest(`${baseUrl}/api/materials`, 'GET', null, authToken);
    console.log(`   Status: ${materialsResponse.status}`);
    if (materialsResponse.status === 200) {
      console.log('   ✅ Materials API working');
      console.log('   📊 Data count:', materialsResponse.data?.length || 0);
    } else {
      console.log('   ❌ Materials API failed:', materialsResponse.data);
    }
    
    // 8. Test meetings API
    console.log('\n8️⃣ Testing meetings API...');
    const meetingsResponse = await makeRequest(`${baseUrl}/api/meetings`, 'GET', null, authToken);
    console.log(`   Status: ${meetingsResponse.status}`);
    if (meetingsResponse.status === 200) {
      console.log('   ✅ Meetings API working');
      console.log('   📊 Data count:', meetingsResponse.data?.length || 0);
    } else {
      console.log('   ❌ Meetings API failed:', meetingsResponse.data);
    }
    
    console.log('\n🎯 Summary of Test Results:');
    console.log('   - Teacher Stats: ' + (statsResponse.status === 200 ? '✅' : '❌'));
    console.log('   - Groups API: ' + (groupsResponse.status === 200 ? '✅' : '❌'));
    console.log('   - Group Creation: ' + (createGroupResponse.status === 200 ? '✅' : '❌'));
    console.log('   - Groups After Creation: ' + (groupsAfterResponse.status === 200 ? '✅' : '❌'));
    console.log('   - Weekly Progress: ' + (progressResponse.status === 200 ? '✅' : '❌'));
    console.log('   - Materials: ' + (materialsResponse.status === 200 ? '✅' : '❌'));
    console.log('   - Meetings: ' + (meetingsResponse.status === 200 ? '✅' : '❌'));
    
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

testTeacherAPIsFixed().catch(console.error);
