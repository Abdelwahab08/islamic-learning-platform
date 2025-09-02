const https = require('https');

async function testSimpleGroupAPI() {
  try {
    console.log('1️⃣ Testing simple group students API...');

    // Test the GET endpoint directly
    const getResponse = await makeRequest('/api/teacher/groups/3a97ae30-12e5-46bd-85a4-37912d1af9fe/students', 'GET');
    console.log('GET Response Status:', getResponse.status);
    console.log('GET Response Data:', getResponse.data);

    // Test the POST endpoint directly
    const postData = JSON.stringify({ student_id: 'student-profile-1756745622686' });
    const postResponse = await makeRequest('/api/teacher/groups/3a97ae30-12e5-46bd-85a4-37912d1af9fe/students', 'POST', postData);
    console.log('POST Response Status:', postResponse.status);
    console.log('POST Response Data:', postResponse.data);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

function makeRequest(path, method, data = null) {
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
testSimpleGroupAPI();
