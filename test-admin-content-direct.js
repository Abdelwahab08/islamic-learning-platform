const https = require('https');

async function testAdminContentDirect() {
  console.log('🧪 Testing Admin Content Page Directly...\n');
  
  const baseUrl = 'https://yaqeen.up.railway.app';
  
  console.log(`🔗 Testing: ${baseUrl}\n`);
  
  // Step 1: Login as admin
  console.log('1️⃣ Logging in as admin...');
  let sessionCookie = null;
  
  try {
    const loginData = JSON.stringify({
      email: 'admin@yaqeen.edu',
      password: 'admin123'
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
      console.log(`✅ Login successful`);
      
      // Extract session cookie
      const setCookie = loginResponse.headers['set-cookie'];
      if (setCookie) {
        sessionCookie = setCookie[0];
        console.log(`   🔐 Session cookie obtained`);
      }
      
      // Parse login response
      try {
        const loginResult = JSON.parse(loginResponse.data);
        console.log(`   👤 Logged in as: ${loginResult.user?.email || 'Unknown'}`);
      } catch (e) {
        console.log(`   📄 Login response: ${loginResponse.data.substring(0, 200)}`);
      }
    } else {
      console.log(`❌ Login failed: ${loginResponse.statusCode}`);
      console.log(`   Response: ${loginResponse.data.substring(0, 200)}`);
    }
  } catch (error) {
    console.log(`💥 Login error: ${error.message}`);
  }

  console.log('\n' + '='.repeat(80) + '\n');

  // Step 2: Test materials API with session
  console.log('2️⃣ Testing /api/materials with admin session...');
  try {
    const headers = {};
    if (sessionCookie) {
      headers['Cookie'] = sessionCookie;
    }
    
    const response = await new Promise((resolve, reject) => {
      const req = https.get(baseUrl + '/api/materials', { headers }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({ statusCode: res.statusCode, data, headers: res.headers }));
      });
      req.on('error', reject);
      req.setTimeout(10000, () => req.destroy());
    });
    
    console.log(`Status Code: ${response.statusCode}`);
    console.log(`Content-Type: ${response.headers['content-type'] || 'Not set'}`);
    console.log(`Response Length: ${response.data.length} characters`);
    
    if (response.statusCode === 200) {
      console.log(`✅ Materials API works with admin session!`);
      try {
        const jsonData = JSON.parse(response.data);
        if (Array.isArray(jsonData)) {
          console.log(`   📊 Materials found: ${jsonData.length} materials`);
          if (jsonData.length > 0) {
            console.log(`   📚 First material: ${jsonData[0].title}`);
            console.log(`   👨‍🏫 Teacher: ${jsonData[0].teacher_name || 'Unknown'}`);
            console.log(`   📋 Stage: ${jsonData[0].stage_name || 'Unknown'}`);
          }
        } else {
          console.log(`   📊 Response: ${Object.keys(jsonData).join(', ')}`);
        }
      } catch (e) {
        console.log(`   ❌ Invalid JSON response`);
        console.log(`   Response: ${response.data.substring(0, 500)}...`);
      }
    } else if (response.statusCode === 401 || response.statusCode === 403) {
      console.log(`🔒 Materials API still requires authentication (Status: ${response.statusCode})`);
      console.log(`   Response: ${response.data.substring(0, 200)}...`);
    } else if (response.statusCode === 500) {
      console.log(`❌ Materials API server error (Status: ${response.statusCode})`);
      console.log(`   Error: ${response.data.substring(0, 500)}...`);
    } else {
      console.log(`❓ Materials API unexpected response (Status: ${response.statusCode})`);
      console.log(`   Response: ${response.data.substring(0, 200)}...`);
    }
  } catch (error) {
    console.log(`💥 Materials API error: ${error.message}`);
  }

  console.log('\n' + '='.repeat(80) + '\n');

  // Step 3: Test the admin content page with session
  console.log('3️⃣ Testing /dashboard/admin/content page with session...');
  try {
    const headers = {};
    if (sessionCookie) {
      headers['Cookie'] = sessionCookie;
    }
    
    const response = await new Promise((resolve, reject) => {
      const req = https.get(baseUrl + '/dashboard/admin/content', { headers }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({ statusCode: res.statusCode, data, headers: res.headers }));
      });
      req.on('error', reject);
      req.setTimeout(10000, () => req.destroy());
    });
    
    console.log(`Status Code: ${response.statusCode}`);
    console.log(`Content-Type: ${response.headers['content-type'] || 'Not set'}`);
    
    if (response.statusCode === 200) {
      console.log(`✅ Admin content page loads with session`);
      
      // Check for any error messages in the HTML
      if (response.data.includes('Application error')) {
        console.log(`   ❌ Page contains "Application error"`);
      }
      if (response.data.includes('client-side exception')) {
        console.log(`   ❌ Page contains "client-side exception"`);
      }
      if (response.data.includes('Unexpected token')) {
        console.log(`   ❌ Page contains "Unexpected token"`);
      }
      if (response.data.includes('/materials')) {
        console.log(`   ✅ Page contains "/materials" references`);
      }
      if (response.data.includes('/api/materials')) {
        console.log(`   ✅ Page contains "/api/materials" references`);
      }
      
      // Look for the specific error pattern
      if (response.data.includes('"/materials"... is not valid JSON')) {
        console.log(`   ❌ Found the exact error pattern!`);
      }
      
      // Check for script tags that might contain the problematic code
      const scriptMatches = response.data.match(/<script[^>]*src="([^"]*)"[^>]*>/g);
      if (scriptMatches) {
        console.log(`   📜 Found ${scriptMatches.length} script tags`);
        scriptMatches.forEach((script, index) => {
          console.log(`      ${index + 1}. ${script}`);
        });
      }
      
    } else {
      console.log(`❌ Admin content page failed: ${response.statusCode}`);
      console.log(`   Response: ${response.data.substring(0, 500)}...`);
    }
  } catch (error) {
    console.log(`💥 Admin content page error: ${error.message}`);
  }

  console.log('\n' + '='.repeat(80) + '\n');

  // Step 4: Test the exact URL that might be causing issues
  console.log('4️⃣ Testing potential problematic URLs...');
  
  const urlsToTest = [
    '/materials',
    '/api/materials',
    '/dashboard/admin/materials',
    '/admin/materials'
  ];
  
  for (const url of urlsToTest) {
    try {
      const headers = {};
      if (sessionCookie) {
        headers['Cookie'] = sessionCookie;
      }
      
      const response = await new Promise((resolve, reject) => {
        const req = https.get(baseUrl + url, { headers }, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => resolve({ statusCode: res.statusCode, data: data.substring(0, 100) }));
        });
        req.on('error', reject);
        req.setTimeout(5000, () => req.destroy());
      });
      
      console.log(`${url}: ${response.statusCode} - ${response.data}`);
    } catch (error) {
      console.log(`${url}: Error - ${error.message}`);
    }
  }

  console.log('\n🎉 Admin Content Direct Test Complete!');
  console.log('\n📋 Analysis:');
  console.log('✅ If login works - Authentication is fine');
  console.log('✅ If materials API works - Backend is fine');
  console.log('❌ If page contains errors - Frontend issue');
  console.log('❌ If specific error found - We know the exact problem');
  
  console.log('\n🔧 Next Steps:');
  console.log('1. Check if the error pattern is found in the HTML');
  console.log('2. Look for any cached JavaScript files');
  console.log('3. Check if there are any other fetch calls');
  console.log('4. Verify the exact URL being requested');
}

testAdminContentDirect().catch(console.error);
