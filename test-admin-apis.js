const fs = require('fs');
const path = require('path');

console.log('🔍 CHECKING ADMIN API ROUTES');
console.log('============================');

// Check if admin API directory exists
const adminApiPath = path.join(__dirname, 'app', 'api', 'admin');
console.log(`\n📁 Admin API path: ${adminApiPath}`);

if (fs.existsSync(adminApiPath)) {
  console.log('✅ Admin API directory exists');
  
  const files = fs.readdirSync(adminApiPath);
  console.log('\n📋 Existing admin API routes:');
  files.forEach(file => {
    console.log(`  - ${file}`);
  });
} else {
  console.log('❌ Admin API directory does not exist');
}

// Check what admin dashboard pages are trying to call
console.log('\n🔍 CHECKING ADMIN DASHBOARD PAGES');
console.log('==================================');

const adminPages = [
  'app/dashboard/admin/page.tsx',
  'app/dashboard/admin/reports/page.tsx',
  'app/dashboard/admin/users/page.tsx',
  'app/dashboard/admin/settings/page.tsx'
];

adminPages.forEach(pagePath => {
  const fullPath = path.join(__dirname, pagePath);
  if (fs.existsSync(fullPath)) {
    console.log(`\n📄 ${pagePath}:`);
    const content = fs.readFileSync(fullPath, 'utf8');
    const apiCalls = content.match(/\/api\/admin\/[^\s'"]+/g);
    if (apiCalls) {
      apiCalls.forEach(api => {
        console.log(`  - ${api}`);
      });
    } else {
      console.log('  - No API calls found');
    }
  } else {
    console.log(`\n❌ ${pagePath} not found`);
  }
});

console.log('\n🎯 SUMMARY');
console.log('===========');
console.log('Based on the dashboard pages, we need these admin APIs:');
console.log('- /api/admin/stats');
console.log('- /api/admin/reports');
console.log('- /api/admin/users');
console.log('- /api/admin/teachers/available');
console.log('- /api/admin/settings');
console.log('- /api/admin/certificates (for الشهادات والقوالب)');
console.log('- /api/admin/materials (for المحتوى والإشعارات)');
console.log('- /api/admin/notifications (for المحتوى والإشعارات)');
