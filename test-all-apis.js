const https = require('https');

async function testAllAPIs() {
  console.log('🧪 Testing All Student APIs...\n');
  
  const baseUrl = 'https://yaqeen.up.railway.app';
  const testData = {
    email: 'student@test.com',
    password: 'password123'
  };
  
  try {
    // First login to get session
    console.log('1️⃣ Logging in...');
    const loginResponse = await makeRequest(`${baseUrl}/api/auth/login`, 'POST', testData);
    
    if (loginResponse.status !== 200) {
      console.log('❌ Login failed:', loginResponse.data);
      return;
    }
    
    console.log('✅ Login successful!');
    const cookies = loginResponse.cookies;
    
    // Test all APIs
    const apis = [
      { name: 'Dashboard', url: '/api/student/dashboard' },
      { name: 'Assignments', url: '/api/student/assignments' },
      { name: 'Certificates', url: '/api/student/certificates' },
      { name: 'Meetings', url: '/api/student/meetings' },
      { name: 'Materials', url: '/api/student/materials' },
      { name: 'Schedule', url: '/api/student/schedule?date=2025-09-01' }
    ];
    
    for (const api of apis) {
      console.log(`\n2️⃣ Testing ${api.name} API...`);
      const response = await makeRequest(`${baseUrl}${api.url}`, 'GET', null, cookies);
      
      console.log(`   Status: ${response.status}`);
      
      if (response.status === 200) {
        console.log(`   ✅ ${api.name} API working!`);
        
        // Show data summary
        if (api.name === 'Dashboard') {
          const data = response.data;
          console.log(`   📊 Stats: ${data.stats.totalAssignments} assignments, ${data.stats.totalCertificates} certificates, ${data.stats.upcomingMeetings} meetings, ${data.stats.totalMaterials} materials`);
        } else if (api.name === 'Assignments') {
          const data = response.data;
          console.log(`   📋 Found ${data.assignments?.length || 0} assignments`);
        } else if (api.name === 'Certificates') {
          const data = response.data;
          console.log(`   🏆 Found ${data.certificates?.length || 0} certificates`);
        } else if (api.name === 'Meetings') {
          const data = response.data;
          console.log(`   📅 Found ${data.meetings?.length || 0} meetings`);
        } else if (api.name === 'Materials') {
          const data = response.data;
          console.log(`   📚 Found ${data.materials?.length || 0} materials`);
        } else if (api.name === 'Schedule') {
          const data = response.data;
          console.log(`   📅 Found ${data.scheduleItems?.length || 0} schedule items`);
        }
      } else {
        console.log(`   ❌ ${api.name} API failed:`, response.data);
      }
    }
    
    console.log('\n🎉 API Testing Complete!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

function makeRequest(url, method, data, cookies = '') {
  return new Promise((resolve, reject) => {
    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies
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
            data: parsedData,
            cookies: res.headers['set-cookie'] ? res.headers['set-cookie'].join('; ') : cookies
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: responseData,
            cookies: res.headers['set-cookie'] ? res.headers['set-cookie'].join('; ') : cookies
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

testAllAPIs().catch(console.error);
