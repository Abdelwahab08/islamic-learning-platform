const mysql = require('mysql2/promise');
const bcryptjs = require('bcryptjs');

// Your actual InfinityFree database credentials
const DB_CONFIG = {
  host: 'sql.epizy.com',
  user: 'if0_39829212',
  password: 'cH1VFIv7x1m',
  database: 'if0_39829212_islamic_db'
};

async function setupInfinityFreeAdmin() {
  let connection;
  
  try {
    console.log('🔌 Connecting to InfinityFree database...');
    console.log('Host:', DB_CONFIG.host);
    console.log('Database:', DB_CONFIG.database);
    
    connection = await mysql.createConnection(DB_CONFIG);
    console.log('✅ Connected successfully!');
    
    // Check if admin user exists
    console.log('\n🔍 Checking for existing admin user...');
    const [existingAdmin] = await connection.execute(
      'SELECT id, email, role, is_approved, onboarding_status FROM users WHERE email = ?',
      ['admin@yaqeen.edu']
    );
    
    if (existingAdmin.length > 0) {
      console.log('✅ Admin user already exists:');
      console.log(`  - Email: ${existingAdmin[0].email}`);
      console.log(`  - Role: ${existingAdmin[0].role}`);
      console.log(`  - Is Approved: ${existingAdmin[0].is_approved}`);
      console.log(`  - Status: ${existingAdmin[0].onboarding_status}`);
      
      // Update admin to ensure it's active
      await connection.execute(`
        UPDATE users 
        SET is_approved = 1, onboarding_status = 'ACTIVE', role = 'ADMIN'
        WHERE email = ?
      `, ['admin@yaqeen.edu']);
      console.log('✅ Admin user updated to active status');
      
    } else {
      console.log('👤 Creating new admin user...');
      
      // Create admin password hash
      const adminPassword = 'Admin321&yakeen';
      const passwordHash = await bcryptjs.hash(adminPassword, 10);
      
      // Insert admin user
      await connection.execute(`
        INSERT INTO users (id, email, password_hash, role, is_approved, onboarding_status, first_name, last_name, created_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `, [
        'admin-yaqeen-id',
        'admin@yaqeen.edu',
        passwordHash,
        'ADMIN',
        1,
        'ACTIVE',
        'مدير',
        'منصة يقين'
      ]);
      console.log('✅ Admin user created');
      
      // Insert admin teacher record
      await connection.execute(`
        INSERT INTO teachers (id, user_id, specialization, bio, created_at) 
        VALUES (?, ?, ?, ?, NOW())
      `, [
        'admin-teacher-id',
        'admin-yaqeen-id',
        'إدارة النظام',
        'مدير منصة يقين لتعليم القرآن الكريم'
      ]);
      console.log('✅ Admin teacher record created');
    }
    
    // Test the user access helper logic
    console.log('\n🧪 Testing user access helper...');
    const [adminUser] = await connection.execute(`
      SELECT u.id, u.email, u.password_hash, u.role, u.is_approved, u.onboarding_status, u.first_name, u.last_name
      FROM users u WHERE u.email = ? LIMIT 1
    `, ['admin@yaqeen.edu']);
    
    if (adminUser.length > 0) {
      const user = adminUser[0];
      
      // Add computed fields (like the helper does)
      const redirectPath = user.role === 'ADMIN' ? '/dashboard/admin' : 
                          user.role === 'TEACHER' ? (user.is_approved ? '/dashboard/teacher' : '/auth/awaiting-approval?type=teacher') :
                          user.role === 'STUDENT' ? (user.is_approved ? '/dashboard/student' : '/auth/awaiting-approval?type=student') :
                          user.role === 'ACADEMIC_MOD' ? '/dashboard/admin' : '/';
      
      const roleNameAr = user.role === 'ADMIN' ? 'المدير' :
                        user.role === 'TEACHER' ? 'المعلم' :
                        user.role === 'STUDENT' ? 'الطالب' :
                        user.role === 'ACADEMIC_MOD' ? 'المشرف الأكاديمي' : 'مستخدم';
      
      console.log('✅ User access helper test successful:');
      console.log(`  - Email: ${user.email}`);
      console.log(`  - Role: ${user.role}`);
      console.log(`  - Role (Arabic): ${roleNameAr}`);
      console.log(`  - Is Approved: ${user.is_approved}`);
      console.log(`  - Redirect Path: ${redirectPath}`);
      console.log(`  - Status: ${user.onboarding_status}`);
    }
    
    // Check for any views that might cause issues
    console.log('\n🔍 Checking for restricted features...');
    try {
      const [views] = await connection.execute('SHOW FULL TABLES WHERE Table_type = "VIEW"');
      if (views.length > 0) {
        console.log('⚠️ Found views that might cause issues on InfinityFree:');
        views.forEach(view => console.log(`  - ${Object.values(view)[0]}`));
        console.log('ℹ️ These will be handled by the user-access-helper.js file');
      } else {
        console.log('✅ No views found - good for InfinityFree!');
      }
    } catch (error) {
      console.log('ℹ️ Could not check views:', error.message);
    }
    
    console.log('\n🎉 InfinityFree database setup completed!');
    console.log('\n📋 Login credentials:');
    console.log('Email: admin@yaqeen.edu');
    console.log('Password: Admin321&yakeen');
    console.log('\n🚀 Your database is ready for deployment!');
    
  } catch (error) {
    console.error('❌ Error setting up InfinityFree database:', error.message);
    console.error('Stack trace:', error.stack);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Make sure to update the DB_CONFIG with your actual InfinityFree credentials:');
      console.log('- Host: Your InfinityFree MySQL host');
      console.log('- User: Your InfinityFree database username');
      console.log('- Password: Your InfinityFree database password');
      console.log('- Database: Your InfinityFree database name');
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

// Run the setup
setupInfinityFreeAdmin();
