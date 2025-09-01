const https = require('https');

async function debugActualError() {
  console.log('🔍 Debugging Actual Error Details...\n');
  
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

  // Step 2: Test the working complaints API to see what's different
  console.log('2️⃣ Testing working complaints API...');
  
  try {
    const headers = {};
    if (sessionCookie) {
      headers['Cookie'] = sessionCookie;
    }
    
    const response = await new Promise((resolve, reject) => {
      const req = https.get(baseUrl + '/api/student/complaints', { headers }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({ statusCode: res.statusCode, data }));
      });
      req.on('error', reject);
      req.setTimeout(15000, () => req.destroy());
    });
    
    console.log(`/api/student/complaints: ${response.statusCode}`);
    if (response.statusCode === 200) {
      console.log(`   ✅ Works! Response: ${response.data}`);
    }
  } catch (error) {
    console.log(`💥 Error: ${error.message}`);
  }

  console.log('\n' + '='.repeat(80) + '\n');

  // Step 3: Test a simple API to see if we can get more detailed error info
  console.log('3️⃣ Testing dashboard API with detailed error...');
  
  try {
    const headers = {};
    if (sessionCookie) {
      headers['Cookie'] = sessionCookie;
    }
    
    const response = await new Promise((resolve, reject) => {
      const req = https.get(baseUrl + '/api/student/dashboard', { headers }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({ statusCode: res.statusCode, data }));
      });
      req.on('error', reject);
      req.setTimeout(15000, () => req.destroy());
    });
    
    console.log(`/api/student/dashboard: ${response.statusCode}`);
    if (response.statusCode === 500) {
      console.log(`   ❌ 500 Error: ${response.data}`);
      
      // Try to parse the error
      try {
        const errorData = JSON.parse(response.data);
        console.log(`   📝 Error message: ${errorData.message}`);
        if (errorData.error) {
          console.log(`   📝 Detailed error: ${errorData.error}`);
        }
      } catch (e) {
        console.log(`   📝 Raw error: ${response.data}`);
      }
    }
  } catch (error) {
    console.log(`💥 Error: ${error.message}`);
  }

  console.log('\n' + '='.repeat(80) + '\n');

  // Step 4: Test if the issue is with the database connection or specific queries
  console.log('4️⃣ Testing if it\'s a database connection issue...');
  
  // Let me test a simple API that doesn't require complex joins
  try {
    const headers = {};
    if (sessionCookie) {
      headers['Cookie'] = sessionCookie;
    }
    
    const response = await new Promise((resolve, reject) => {
      const req = https.get(baseUrl + '/api/student/stats', { headers }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({ statusCode: res.statusCode, data }));
      });
      req.on('error', reject);
      req.setTimeout(15000, () => req.destroy());
    });
    
    console.log(`/api/student/stats: ${response.statusCode}`);
    if (response.statusCode === 500) {
      console.log(`   ❌ 500 Error: ${response.data}`);
    }
  } catch (error) {
    console.log(`💥 Error: ${error.message}`);
  }

  console.log('\n🎯 Analysis:');
  console.log('The issue seems to be that the APIs are still failing with 500 errors');
  console.log('This suggests that either:');
  console.log('1. The column names are still incorrect');
  console.log('2. The tables don\'t exist');
  console.log('3. There\'s a different database issue');
  console.log('4. The student data doesn\'t exist in the database');
  
  console.log('\n🔧 Next Steps:');
  console.log('1. Check if the student user exists in the database');
  console.log('2. Verify the table structure');
  console.log('3. Check if the tables have the expected data');
  console.log('4. Look at Railway logs for more detailed error information');
}

debugActualError().catch(console.error);
