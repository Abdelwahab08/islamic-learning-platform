const https = require('https');

async function checkStudentDataDebug() {
  console.log('🔍 Checking Student Data and Database Issues...\n');
  
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
      
      // Parse login response to get user info
      try {
        const userData = JSON.parse(loginResponse.data);
        console.log(`   👤 User ID: ${userData.user?.id || 'Unknown'}`);
        console.log(`   👤 User Role: ${userData.user?.role || 'Unknown'}`);
      } catch (e) {
        console.log(`   ❌ Could not parse user data`);
      }
    } else {
      console.log(`❌ Student login failed: ${loginResponse.statusCode}`);
      console.log(`   Response: ${loginResponse.data}`);
    }
  } catch (error) {
    console.log(`💥 Student login error: ${error.message}`);
  }

  console.log('\n' + '='.repeat(80) + '\n');

  // Step 2: Test a simple database query to see if the issue is with specific APIs
  console.log('2️⃣ Testing a simple database query...');
  
  try {
    const headers = {};
    if (sessionCookie) {
      headers['Cookie'] = sessionCookie;
    }
    
    // Test a simple API that should work
    const response = await new Promise((resolve, reject) => {
      const req = https.get(baseUrl + '/api/student/complaints', { headers }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({ statusCode: res.statusCode, data }));
      });
      req.on('error', reject);
      req.setTimeout(10000, () => req.destroy());
    });
    
    console.log(`/api/student/complaints: ${response.statusCode}`);
    if (response.statusCode === 200) {
      console.log(`   ✅ Database connection works!`);
      console.log(`   📊 Response: ${response.data}`);
    } else {
      console.log(`   ❌ Database issue: ${response.data}`);
    }
  } catch (error) {
    console.log(`💥 Error: ${error.message}`);
  }

  console.log('\n' + '='.repeat(80) + '\n');

  // Step 3: Test the most basic student API to see what the exact error is
  console.log('3️⃣ Testing basic student API with detailed error...');
  
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
      
      // The error message is generic, but let's see if we can get more info
      console.log(`   🔍 This suggests a database query error`);
      console.log(`   🔍 Likely causes:`);
      console.log(`      - Student record doesn't exist in students table`);
      console.log(`      - SQL query syntax error`);
      console.log(`      - Missing table or column`);
    }
  } catch (error) {
    console.log(`💥 Error: ${error.message}`);
  }

  console.log('\n' + '='.repeat(80) + '\n');

  // Step 4: Test if we can access the user profile or any user-related data
  console.log('4️⃣ Testing user profile access...');
  
  try {
    const headers = {};
    if (sessionCookie) {
      headers['Cookie'] = sessionCookie;
    }
    
    // Try to access user profile or any user-related endpoint
    const response = await new Promise((resolve, reject) => {
      const req = https.get(baseUrl + '/api/auth/me', { headers }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({ statusCode: res.statusCode, data }));
      });
      req.on('error', reject);
      req.setTimeout(10000, () => req.destroy());
    });
    
    console.log(`/api/auth/me: ${response.statusCode}`);
    if (response.statusCode === 200) {
      console.log(`   ✅ User profile accessible`);
      try {
        const userData = JSON.parse(response.data);
        console.log(`   👤 User ID: ${userData.id || 'Unknown'}`);
        console.log(`   👤 User Role: ${userData.role || 'Unknown'}`);
        console.log(`   👤 User Email: ${userData.email || 'Unknown'}`);
      } catch (e) {
        console.log(`   ❌ Could not parse user data`);
      }
    } else {
      console.log(`   ❌ User profile error: ${response.data}`);
    }
  } catch (error) {
    console.log(`💥 Error: ${error.message}`);
  }

  console.log('\n' + '='.repeat(80) + '\n');

  // Step 5: Test a different approach - try to access admin APIs to see if it's a general issue
  console.log('5️⃣ Testing admin APIs to compare...');
  
  try {
    // Login as admin first
    const adminLoginData = JSON.stringify({
      email: 'admin@yaqeen.edu',
      password: 'admin123'
    });
    
    const adminLoginResponse = await new Promise((resolve, reject) => {
      const req = https.request(baseUrl + '/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(adminLoginData)
        }
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({ statusCode: res.statusCode, data, headers: res.headers }));
      });
      
      req.on('error', reject);
      req.write(adminLoginData);
      req.end();
      req.setTimeout(10000, () => req.destroy());
    });
    
    if (adminLoginResponse.statusCode === 200) {
      console.log(`✅ Admin login successful`);
      
      const adminSetCookie = adminLoginResponse.headers['set-cookie'];
      if (adminSetCookie) {
        const adminSessionCookie = adminSetCookie[0];
        
        // Test admin API
        const adminResponse = await new Promise((resolve, reject) => {
          const req = https.get(baseUrl + '/api/admin/users', { 
            headers: { 'Cookie': adminSessionCookie } 
          }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ statusCode: res.statusCode, data: data.substring(0, 100) }));
          });
          req.on('error', reject);
          req.setTimeout(10000, () => req.destroy());
        });
        
        console.log(`/api/admin/users: ${adminResponse.statusCode}`);
        if (adminResponse.statusCode === 200) {
          console.log(`   ✅ Admin API works fine`);
        } else {
          console.log(`   ❌ Admin API error: ${adminResponse.data}`);
        }
      }
    } else {
      console.log(`❌ Admin login failed: ${adminLoginResponse.statusCode}`);
    }
  } catch (error) {
    console.log(`💥 Admin test error: ${error.message}`);
  }

  console.log('\n🎯 Analysis:');
  console.log('The issue appears to be specific to student APIs that query the database');
  console.log('Since /api/student/complaints works but others don\'t, the problem is likely:');
  console.log('1. Missing student record in the students table');
  console.log('2. SQL query errors in the failing APIs');
  console.log('3. Missing related data (assignments, certificates, etc.)');
  
  console.log('\n🔧 Next Steps:');
  console.log('1. Check if student@test.com has a record in the students table');
  console.log('2. Verify the SQL queries in the failing APIs');
  console.log('3. Check if related tables have data');
  console.log('4. Look at Railway logs for specific SQL errors');
}

checkStudentDataDebug().catch(console.error);
