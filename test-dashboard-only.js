const https = require('https');

async function testDashboardOnly() {
  console.log('🧪 Testing Dashboard API Only...\n');
  
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
    
    // Test dashboard API specifically
    console.log('\n2️⃣ Testing Dashboard API...');
    const dashboardResponse = await makeRequest(`${baseUrl}/api/student/dashboard`, 'GET', null, cookies);
    
    console.log(`   Status: ${dashboardResponse.status}`);
    
    if (dashboardResponse.status === 200) {
      console.log('   ✅ Dashboard API working!');
      console.log('\n📊 Dashboard Data:');
      console.log(JSON.stringify(dashboardResponse.data, null, 2));
      
      // Check specific fields
      const data = dashboardResponse.data;
      console.log('\n🔍 Key Fields Check:');
      console.log(`   📊 Total Assignments: ${data.stats?.totalAssignments || 'MISSING'}`);
      console.log(`   📊 Total Certificates: ${data.stats?.totalCertificates || 'MISSING'}`);
      console.log(`   📊 Upcoming Meetings: ${data.stats?.upcomingMeetings || 'MISSING'}`);
      console.log(`   📊 Total Materials: ${data.stats?.totalMaterials || 'MISSING'}`);
      console.log(`   🎓 Stage Name: ${data.currentStage?.name || 'MISSING'}`);
      console.log(`   📖 Current Page: ${data.currentStage?.currentPage || 'MISSING'}`);
      console.log(`   📖 Total Pages: ${data.currentStage?.totalPages || 'MISSING'}`);
      
      // Check if stage data is correct
      if (data.currentStage?.name && data.currentStage?.currentPage && data.currentStage?.totalPages) {
        console.log('\n✅ Stage Data is Working!');
        console.log(`   The frontend should now show: ${data.currentStage.name}`);
        console.log(`   Progress: ${data.currentStage.currentPage} / ${data.currentStage.totalPages}`);
      } else {
        console.log('\n❌ Stage Data is Missing!');
        console.log('   The Railway deployment might not be complete yet.');
      }
      
    } else {
      console.log('   ❌ Dashboard API failed:', dashboardResponse.data);
    }
    
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

testDashboardOnly().catch(console.error);
