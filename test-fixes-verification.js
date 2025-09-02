const https = require('https');

const BASE_URL = 'https://yaqeen.up.railway.app';

// Test that creating items actually saves them and they can be retrieved
async function testFixesVerification() {
  try {
    console.log('1️⃣ Testing teacher login...');

    // Step 1: Login as teacher@test.com
    const loginData = JSON.stringify({
      email: 'teacher@test.com',
      password: 'teacher123'
    });

    const loginResponse = await makeRequest('/api/auth/login', 'POST', loginData);
    console.log('Login Status:', loginResponse.status);
    console.log('Login Response:', loginResponse.data);

    if (loginResponse.status !== 200) {
      console.log('❌ Teacher login failed, cannot proceed with tests');
      return;
    }

    console.log('✅ Teacher login successful');

    // Step 2: Test initial state (should be empty or have existing data)
    console.log('\n2️⃣ Testing initial state...');
    
    console.log('\n📅 Initial Meetings:');
    const initialMeetings = await makeRequest('/api/teacher/meetings', 'GET', null, loginResponse.headers['set-cookie']);
    console.log('Status:', initialMeetings.status);
    console.log('Meetings:', initialMeetings.data);

    console.log('\n📚 Initial Materials:');
    const initialMaterials = await makeRequest('/api/teacher/materials', 'GET', null, loginResponse.headers['set-cookie']);
    console.log('Status:', initialMaterials.status);
    console.log('Materials:', initialMaterials.data);

    console.log('\n👥 Initial Groups:');
    const initialGroups = await makeRequest('/api/teacher/groups', 'GET', null, loginResponse.headers['set-cookie']);
    console.log('Status:', initialGroups.status);
    console.log('Groups:', initialGroups.data);

    // Step 3: Create a test meeting
    console.log('\n3️⃣ Creating a test meeting...');
    const meetingData = JSON.stringify({
      title: 'درس اختبار - الاجتماعات',
      description: 'درس اختبار للتأكد من حفظ الاجتماعات في قاعدة البيانات',
      date: '2025-01-26',
      time: '11:00',
      duration: 90,
      meeting_type: 'AGORA',
      stage_id: null
    });
    
    const createMeetingResponse = await makeRequest('/api/teacher/meetings', 'POST', meetingData, loginResponse.headers['set-cookie']);
    console.log('Create Meeting Status:', createMeetingResponse.status);
    console.log('Create Meeting Response:', createMeetingResponse.data);

    if (createMeetingResponse.status === 200) {
      console.log('✅ Meeting created successfully');
    } else {
      console.log('❌ Failed to create meeting');
    }

    // Step 4: Create a test material
    console.log('\n4️⃣ Creating a test material...');
    const materialData = JSON.stringify({
      title: 'مادة اختبار - المواد التعليمية',
      description: 'مادة اختبار للتأكد من حفظ المواد التعليمية في قاعدة البيانات',
      type: 'document',
      content: 'محتوى المادة التعليمية للاختبار',
      file_url: '/uploads/materials/test-material.pdf',
      stage_id: null
    });
    
    const createMaterialResponse = await makeRequest('/api/teacher/materials', 'POST', materialData, loginResponse.headers['set-cookie']);
    console.log('Create Material Status:', createMaterialResponse.status);
    console.log('Create Material Response:', createMaterialResponse.data);

    if (createMaterialResponse.status === 200) {
      console.log('✅ Material created successfully');
    } else {
      console.log('❌ Failed to create material');
    }

    // Step 5: Create a test group
    console.log('\n5️⃣ Creating a test group...');
    const groupData = JSON.stringify({
      name: 'مجموعة اختبار - المجموعات',
      description: 'مجموعة اختبار للتأكد من حفظ المجموعات في قاعدة البيانات',
      max_students: 15
    });
    
    const createGroupResponse = await makeRequest('/api/teacher/groups', 'POST', groupData, loginResponse.headers['set-cookie']);
    console.log('Create Group Status:', createGroupResponse.status);
    console.log('Create Group Response:', createGroupResponse.data);

    if (createGroupResponse.status === 200) {
      console.log('✅ Group created successfully');
    } else {
      console.log('❌ Failed to create group');
    }

    // Step 6: Wait a moment for database operations to complete
    console.log('\n6️⃣ Waiting for database operations to complete...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Step 7: Test that the created items can be retrieved
    console.log('\n7️⃣ Testing retrieval of created items...');
    
    console.log('\n📅 Updated Meetings (should include the new meeting):');
    const updatedMeetings = await makeRequest('/api/teacher/meetings', 'GET', null, loginResponse.headers['set-cookie']);
    console.log('Status:', updatedMeetings.status);
    console.log('Meetings Count:', updatedMeetings.data.meetings?.length || 0);
    console.log('Meetings:', updatedMeetings.data.meetings);

    console.log('\n📚 Updated Materials (should include the new material):');
    const updatedMaterials = await makeRequest('/api/teacher/materials', 'GET', null, loginResponse.headers['set-cookie']);
    console.log('Status:', updatedMaterials.status);
    console.log('Materials Count:', updatedMaterials.data.materials?.length || 0);
    console.log('Materials:', updatedMaterials.data.materials);

    console.log('\n👥 Updated Groups (should include the new group):');
    const updatedGroups = await makeRequest('/api/teacher/groups', 'GET', null, loginResponse.headers['set-cookie']);
    console.log('Status:', updatedGroups.status);
    console.log('Groups Count:', updatedGroups.data?.length || 0);
    console.log('Groups:', updatedGroups.data);

    // Step 8: Verify the counts increased
    console.log('\n8️⃣ Verifying data persistence...');
    
    const initialMeetingsCount = initialMeetings.data.meetings?.length || 0;
    const updatedMeetingsCount = updatedMeetings.data.meetings?.length || 0;
    const initialMaterialsCount = initialMaterials.data.materials?.length || 0;
    const updatedMaterialsCount = updatedMaterials.data.materials?.length || 0;
    const initialGroupsCount = initialGroups.data?.length || 0;
    const updatedGroupsCount = updatedGroups.data?.length || 0;

    console.log(`Meetings: ${initialMeetingsCount} → ${updatedMeetingsCount} ${updatedMeetingsCount > initialMeetingsCount ? '✅' : '❌'}`);
    console.log(`Materials: ${initialMaterialsCount} → ${updatedMaterialsCount} ${updatedMaterialsCount > initialMaterialsCount ? '✅' : '❌'}`);
    console.log(`Groups: ${initialGroupsCount} → ${updatedGroupsCount} ${updatedGroupsCount > initialGroupsCount ? '✅' : '❌'}`);

    if (updatedMeetingsCount > initialMeetingsCount && 
        updatedMaterialsCount > initialMaterialsCount && 
        updatedGroupsCount > initialGroupsCount) {
      console.log('\n🎉 SUCCESS: All items are being created and persisted correctly!');
    } else {
      console.log('\n⚠️  WARNING: Some items may not be persisting correctly');
    }

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
testFixesVerification();
