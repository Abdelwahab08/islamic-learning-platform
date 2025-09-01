const https = require('https');

async function checkTableStructure() {
  console.log('🔍 Checking Database Table Structure...\n');
  
  const baseUrl = 'https://yaqeen.up.railway.app';
  
  // Step 1: Login as admin to access database info
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
      console.log(`✅ Admin login successful`);
      const setCookie = loginResponse.headers['set-cookie'];
      if (setCookie) {
        sessionCookie = setCookie[0];
        console.log(`   🔐 Session cookie obtained`);
      }
    } else {
      console.log(`❌ Admin login failed: ${loginResponse.statusCode}`);
      return;
    }
  } catch (error) {
    console.log(`💥 Admin login error: ${error.message}`);
    return;
  }

  console.log('\n' + '='.repeat(80) + '\n');

  // Step 2: Create a simple API endpoint to check table structure
  console.log('2️⃣ Creating a temporary API to check table structure...');
  
  // Let me create a simple test API that we can call to check the database structure
  const testApiCode = `
import { NextResponse } from 'next/server'
import { executeQuery } from '@/config/database'

export async function GET() {
  try {
    // Check students table structure
    const studentsStructure = await executeQuery('DESCRIBE students')
    
    // Check assignments table structure
    const assignmentsStructure = await executeQuery('DESCRIBE assignments')
    
    // Check assignment_targets table structure
    const assignmentTargetsStructure = await executeQuery('DESCRIBE assignment_targets')
    
    // Check certificates table structure
    const certificatesStructure = await executeQuery('DESCRIBE certificates')
    
    // Check meetings table structure
    const meetingsStructure = await executeQuery('DESCRIBE meetings')
    
    // Check submissions table structure
    const submissionsStructure = await executeQuery('DESCRIBE submissions')
    
    // Check materials table structure
    const materialsStructure = await executeQuery('DESCRIBE materials')
    
    return NextResponse.json({
      students: studentsStructure,
      assignments: assignmentsStructure,
      assignment_targets: assignmentTargetsStructure,
      certificates: certificatesStructure,
      meetings: meetingsStructure,
      submissions: submissionsStructure,
      materials: materialsStructure
    })
  } catch (error) {
    console.error('Error checking table structure:', error)
    return NextResponse.json(
      { message: 'حدث خطأ في الخادم', error: error.message },
      { status: 500 }
    )
  }
}
`;

  // Create the temporary API file
  const fs = require('fs');
  const path = require('path');
  
  try {
    // Create the directory if it doesn't exist
    const apiDir = path.join(__dirname, 'app', 'api', 'debug', 'structure');
    if (!fs.existsSync(apiDir)) {
      fs.mkdirSync(apiDir, { recursive: true });
    }
    
    // Write the API file
    fs.writeFileSync(path.join(apiDir, 'route.ts'), testApiCode);
    console.log('   ✅ Created temporary API at /api/debug/structure');
  } catch (error) {
    console.log(`   ❌ Failed to create API: ${error.message}`);
    return;
  }

  console.log('\n' + '='.repeat(80) + '\n');

  // Step 3: Test the temporary API
  console.log('3️⃣ Testing the temporary API...');
  
  try {
    const headers = {};
    if (sessionCookie) {
      headers['Cookie'] = sessionCookie;
    }
    
    const response = await new Promise((resolve, reject) => {
      const req = https.get(baseUrl + '/api/debug/structure', { headers }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({ statusCode: res.statusCode, data }));
      });
      req.on('error', reject);
      req.setTimeout(15000, () => req.destroy());
    });
    
    console.log(`/api/debug/structure: ${response.statusCode}`);
    
    if (response.statusCode === 200) {
      console.log(`   ✅ Success!`);
      try {
        const tableData = JSON.parse(response.data);
        
        console.log('\n📊 Table Structure Analysis:');
        console.log('='.repeat(50));
        
        // Analyze each table
        Object.keys(tableData).forEach(tableName => {
          console.log(`\n🔍 ${tableName.toUpperCase()} table:`);
          if (Array.isArray(tableData[tableName])) {
            tableData[tableName].forEach(column => {
              console.log(`   ${column.Field} (${column.Type}) ${column.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
            });
          } else {
            console.log(`   ❌ No structure data for ${tableName}`);
          }
        });
        
        // Look for student-related columns
        console.log('\n🎯 Student-related columns found:');
        console.log('='.repeat(50));
        
        Object.keys(tableData).forEach(tableName => {
          if (Array.isArray(tableData[tableName])) {
            const studentColumns = tableData[tableName].filter(col => 
              col.Field.toLowerCase().includes('student') || 
              col.Field.toLowerCase().includes('user')
            );
            if (studentColumns.length > 0) {
              console.log(`\n📋 ${tableName}:`);
              studentColumns.forEach(col => {
                console.log(`   ${col.Field} (${col.Type})`);
              });
            }
          }
        });
        
      } catch (e) {
        console.log(`   ❌ Could not parse response: ${response.data.substring(0, 200)}`);
      }
    } else {
      console.log(`   ❌ Failed: ${response.data}`);
    }
  } catch (error) {
    console.log(`💥 Error: ${error.message}`);
  }

  console.log('\n' + '='.repeat(80) + '\n');

  // Step 4: Clean up the temporary API
  console.log('4️⃣ Cleaning up temporary API...');
  
  try {
    const apiFile = path.join(__dirname, 'app', 'api', 'debug', 'structure', 'route.ts');
    if (fs.existsSync(apiFile)) {
      fs.unlinkSync(apiFile);
      console.log('   ✅ Removed temporary API file');
    }
    
    // Try to remove the directory if empty
    const apiDir = path.join(__dirname, 'app', 'api', 'debug', 'structure');
    if (fs.existsSync(apiDir)) {
      const files = fs.readdirSync(apiDir);
      if (files.length === 0) {
        fs.rmdirSync(apiDir);
        console.log('   ✅ Removed empty directory');
      }
    }
  } catch (error) {
    console.log(`   ⚠️ Cleanup warning: ${error.message}`);
  }

  console.log('\n🎯 Next Steps:');
  console.log('Based on the table structure, we need to:');
  console.log('1. Update the SQL queries to use the correct column names');
  console.log('2. Fix the student dashboard API');
  console.log('3. Fix all other student APIs that have similar issues');
}

checkTableStructure().catch(console.error);
