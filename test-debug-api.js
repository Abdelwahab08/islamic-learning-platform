const https = require('https');

async function testDebugAPI() {
  console.log('🔍 Testing Debug API with static data...\n');
  
  const baseUrl = 'https://yaqeen.up.railway.app';
  
  // Step 1: Login as student
  console.log('1️⃣ Logging in as student...');
  let sessionCookie = null;
  
  try {
    const loginData = JSON.stringify({
      email: 'student@test.com',
      password: 'student123'
    });
    
    const loginResponse = await new Promise((resolve, reject) => {
      const req = https.request(baseUrl + '/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(loginData)
        }
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({ statusCode: res.statusCode, data, headers: res.headers }));
      });
      
      req.on('error', reject);
      req.write(loginData);
      req.end();
      req.setTimeout(10000, () => req.destroy());
    });
    
    if (loginResponse.statusCode === 200) {
      console.log(`✅ Student login successful`);
      const setCookie = loginResponse.headers['set-cookie'];
      if (setCookie) {
        sessionCookie = setCookie[0];
        console.log(`   🔐 Session cookie obtained`);
      }
    } else {
      console.log(`❌ Student login failed: ${loginResponse.statusCode}`);
      return;
    }
  } catch (error) {
    console.log(`💥 Student login error: ${error.message}`);
    return;
  }

  console.log('\n' + '='.repeat(80) + '\n');

  // Step 2: Test the debug API
  console.log('2️⃣ Testing debug API...');
  
  try {
    const headers = {};
    if (sessionCookie) {
      headers['Cookie'] = sessionCookie;
    }
    
    const response = await new Promise((resolve, reject) => {
      const req = https.get(baseUrl + '/api/student/debug', { headers }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({ statusCode: res.statusCode, data }));
      });
      req.on('error', reject);
      req.setTimeout(15000, () => req.destroy());
    });
    
    console.log(`/api/student/debug: ${response.statusCode}`);
    
    if (response.statusCode === 200) {
      console.log(`   ✅ Success!`);
      try {
        const data = JSON.parse(response.data);
        console.log(`   📝 Message: ${data.message}`);
        console.log(`   👤 User ID: ${data.user?.id}`);
        console.log(`   👤 User Role: ${data.user?.role}`);
        
        console.log(`\n📊 Dashboard Data:`);
        console.log(`   Total Assignments: ${data.dashboard?.stats?.totalAssignments}`);
        console.log(`   Total Certificates: ${data.dashboard?.stats?.totalCertificates}`);
        console.log(`   Total Meetings: ${data.dashboard?.stats?.upcomingMeetings}`);
        
        console.log(`\n📋 Sample Data:`);
        console.log(`   Assignments: ${data.assignments?.length || 0} items`);
        console.log(`   Certificates: ${data.certificates?.length || 0} items`);
        console.log(`   Meetings: ${data.meetings?.length || 0} items`);
        console.log(`   Materials: ${data.materials?.length || 0} items`);
        console.log(`   Schedule: ${data.schedule?.length || 0} items`);
        
        console.log(`\n🎯 Conclusion:`);
        console.log(`   ✅ Student authentication works`);
        console.log(`   ✅ API structure works`);
        console.log(`   ✅ Static data is being returned correctly`);
        console.log(`   ❌ The issue is with database queries, not the API structure`);
        
      } catch (e) {
        console.log(`   ❌ Could not parse response: ${response.data.substring(0, 200)}`);
      }
    } else if (response.statusCode === 500) {
      console.log(`   ❌ 500 Error: ${response.data}`);
      try {
        const errorData = JSON.parse(response.data);
        console.log(`   📝 Error: ${errorData.error}`);
        if (errorData.stack) {
          console.log(`   📝 Stack: ${errorData.stack.substring(0, 500)}`);
        }
      } catch (e) {
        console.log(`   📝 Raw error: ${response.data}`);
      }
    } else {
      console.log(`   ❌ Unexpected: ${response.statusCode} - ${response.data}`);
    }
  } catch (error) {
    console.log(`💥 Error: ${error.message}`);
  }

  console.log('\n🎯 Next Steps:');
  console.log('1. If this debug API works, the issue is with database queries');
  console.log('2. Check Railway logs for specific database errors');
  console.log('3. Verify database table structure and column names');
  console.log('4. Check if student data exists in the database');
}

testDebugAPI().catch(console.error);
