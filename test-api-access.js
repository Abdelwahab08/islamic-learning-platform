const https = require('https');

async function testAPIAccess() {
  console.log('🌐 Testing API Access...\n');
  
  const baseUrl = 'https://yaqeen.up.railway.app';
  
  // Test basic API endpoints
  const endpoints = [
    '/api/student/dashboard',
    '/api/student/assignments', 
    '/api/student/certificates',
    '/api/student/meetings',
    '/api/student/materials',
    '/api/student/schedule'
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`Testing ${endpoint}...`);
      const response = await makeSimpleRequest(`${baseUrl}${endpoint}`);
      console.log(`   Status: ${response.status}`);
      console.log(`   Response: ${response.data.substring(0, 100)}...`);
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
    console.log('');
  }
}

function makeSimpleRequest(url) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          data: data
        });
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.setTimeout(10000); // 10 second timeout
    req.end();
  });
}

testAPIAccess().catch(console.error);
