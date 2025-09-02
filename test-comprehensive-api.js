const https = require('https');

const BASE_URL = 'https://yaqeen.up.railway.app';

// Test the comprehensive weekly progress API
async function testComprehensiveAPI() {
  try {
    console.log('🔐 Testing teacher login...');
    
    // Step 1: Login as teacher@test.com
    const loginData = JSON.stringify({
      email: 'teacher@test.com',
      password: 'teacher123'
    });

    const loginResponse = await makeRequestWithCookies('/api/auth/login', 'POST', loginData);
    console.log('Login Status:', loginResponse.status);

    if (loginResponse.status !== 200) {
      console.log('❌ Teacher login failed');
      return;
    }

    console.log('✅ Teacher login successful');

    // Step 2: Test the comprehensive weekly progress API
    console.log('\n🔍 Testing comprehensive weekly progress API...');
    
    const comprehensiveResponse = await makeRequestWithCookies('/api/teacher/weekly-progress', 'GET', null, loginResponse.cookies);
    console.log('Comprehensive API Status:', comprehensiveResponse.status);
    
    if (comprehensiveResponse.status === 200) {
      const data = comprehensiveResponse.data;
      console.log('\n📊 Weekly Progress Data:');
      console.log(`  Students: ${data.weeklyProgress?.length || 0}`);
      if (data.weeklyProgress) {
        data.weeklyProgress.forEach((student, index) => {
          console.log(`    ${index + 1}. ${student.studentName} - ${student.stageName} (${student.progressPercentage}%)`);
        });
      }

      console.log('\n📅 Meetings Data:');
      console.log(`  Meetings: ${data.meetings?.length || 0}`);
      if (data.meetings) {
        data.meetings.forEach((meeting, index) => {
          console.log(`    ${index + 1}. ${meeting.title} - ${meeting.stage_name} (${meeting.duration_minutes} min)`);
        });
      }

      console.log('\n📚 Materials Data:');
      console.log(`  Materials: ${data.materials?.length || 0}`);
      if (data.materials) {
        data.materials.forEach((material, index) => {
          console.log(`    ${index + 1}. ${material.title} - ${material.stage_name}`);
        });
      }

      console.log('\n👨‍🎓 Students Data:');
      console.log(`  Students: ${data.students?.length || 0}`);
      if (data.students) {
        data.students.forEach((student, index) => {
          console.log(`    ${index + 1}. ${student.name} - ${student.current_stage} (${student.progress_percentage}%)`);
        });
      }
    } else {
      console.log('Comprehensive API Error:', comprehensiveResponse.data);
    }

    console.log('\n✅ Comprehensive API test completed');

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
testComprehensiveAPI();
