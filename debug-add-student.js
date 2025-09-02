const https = require('https');

const BASE_URL = 'https://yaqeen.up.railway.app';

async function debugAddStudentToGroup() {
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

    // Step 2: Get groups to see what groups exist
    console.log('\n2️⃣ Getting teacher groups...');
    const groupsResponse = await makeRequest('/api/teacher/groups', 'GET', null, loginResponse.headers['set-cookie']);
    console.log('Groups Status:', groupsResponse.status);
    console.log('Groups Response:', groupsResponse.data);

    if (groupsResponse.status !== 200 || !groupsResponse.data.groups || groupsResponse.data.groups.length === 0) {
      console.log('❌ No groups found, cannot test adding students');
      return;
    }

    const firstGroup = groupsResponse.data.groups[0];
    console.log('✅ Found group:', firstGroup.name, 'with ID:', firstGroup.id);

    // Step 3: Get students to see what students can be added
    console.log('\n3️⃣ Getting available students...');
    const studentsResponse = await makeRequest('/api/teacher/students', 'GET', null, loginResponse.headers['set-cookie']);
    console.log('Students Status:', studentsResponse.status);
    console.log('Students Response:', studentsResponse.data);

    if (studentsResponse.status !== 200 || !studentsResponse.data.students || studentsResponse.data.students.length === 0) {
      console.log('❌ No students found, cannot test adding students to groups');
      return;
    }

    const firstStudent = studentsResponse.data.students[0];
    console.log('✅ Found student:', firstStudent.name, 'with ID:', firstStudent.id);

    // Step 4: Check current group members
    console.log('\n4️⃣ Checking current group members...');
    const groupStudentsResponse = await makeRequest(`/api/teacher/groups/${firstGroup.id}/students`, 'GET', null, loginResponse.headers['set-cookie']);
    console.log('Group Students Status:', groupStudentsResponse.status);
    console.log('Group Students Response:', groupStudentsResponse.data);

    // Step 5: Try to add student to group
    console.log('\n5️⃣ Attempting to add student to group...');
    const addStudentData = JSON.stringify({
      student_id: firstStudent.id
    });
    
    console.log('Sending data:', addStudentData);
    console.log('To endpoint:', `/api/teacher/groups/${firstGroup.id}/students`);
    
    const addStudentResponse = await makeRequest(`/api/teacher/groups/${firstGroup.id}/students`, 'POST', addStudentData, loginResponse.headers['set-cookie']);
    console.log('Add Student Status:', addStudentResponse.status);
    console.log('Add Student Response:', addStudentResponse.data);

    if (addStudentResponse.status === 200) {
      console.log('✅ Successfully added student to group!');
      
      // Step 6: Verify student was added
      console.log('\n6️⃣ Verifying student was added...');
      const verifyResponse = await makeRequest(`/api/teacher/groups/${firstGroup.id}/students`, 'GET', null, loginResponse.headers['set-cookie']);
      console.log('Verify Status:', verifyResponse.status);
      console.log('Verify Response:', verifyResponse.data);
    } else {
      console.log('❌ Failed to add student to group');
      console.log('Error details:', addStudentResponse.data);
      
      // Additional debugging
      console.log('\n🔍 Additional debugging info:');
      console.log('Request URL:', `/api/teacher/groups/${firstGroup.id}/students`);
      console.log('Request Method: POST');
      console.log('Request Data:', addStudentData);
      console.log('Response Status:', addStudentResponse.status);
      console.log('Response Headers:', addStudentResponse.headers);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Full error:', error);
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

// Run the debug test
debugAddStudentToGroup();
