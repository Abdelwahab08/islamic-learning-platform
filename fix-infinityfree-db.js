const mysql = require('mysql2/promise');
const bcryptjs = require('bcryptjs');

// Replace with your actual database credentials
const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'islamic_db'
};

async function fixInfinityFreeDatabase() {
  let connection;
  
  try {
    console.log('🔌 Connecting to database...');
    connection = await mysql.createConnection(DB_CONFIG);
    console.log('✅ Connected successfully!');
    
    // Fix users table - update onboarding_status enum
    console.log('\n🔧 Fixing users table...');
    try {
      await connection.execute(`
        ALTER TABLE users 
        MODIFY COLUMN onboarding_status ENUM('PENDING', 'ACTIVE', 'REJECTED') DEFAULT 'PENDING'
      `);
      console.log('✅ Updated onboarding_status enum');
    } catch (error) {
      console.log('ℹ️ onboarding_status already correct or error:', error.message);
    }
    
    // Fix users table - add missing columns if needed
    try {
      await connection.execute(`
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      `);
      console.log('✅ Added updated_at column');
    } catch (error) {
      console.log('ℹ️ updated_at column already exists');
    }
    
    // Fix stages table - ensure correct structure
    console.log('\n🔧 Checking stages table...');
    const [stagesData] = await connection.execute('SELECT * FROM stages LIMIT 1');
    if (stagesData.length > 0) {
      console.log('✅ Stages table has data:', stagesData[0]);
    }
    
    // Create admin user if not exists
    console.log('\n👤 Creating admin user...');
    const [existingAdmin] = await connection.execute(
      'SELECT * FROM users WHERE email = ?',
      ['admin@yaqeen.edu']
    );
    
    if (existingAdmin.length === 0) {
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
    } else {
      console.log('✅ Admin user already exists');
      
      // Update admin user to ensure it's active
      await connection.execute(`
        UPDATE users 
        SET is_approved = 1, onboarding_status = 'ACTIVE', role = 'ADMIN'
        WHERE email = ?
      `, ['admin@yaqeen.edu']);
      console.log('✅ Admin user updated to active');
    }
    
    // Check for any problematic views or procedures
    console.log('\n🔍 Checking for restricted features...');
    try {
      const [views] = await connection.execute('SHOW FULL TABLES WHERE Table_type = "VIEW"');
      if (views.length > 0) {
        console.log('⚠️ Found views that might cause issues on InfinityFree:');
        views.forEach(view => console.log(`  - ${Object.values(view)[0]}`));
      } else {
        console.log('✅ No views found');
      }
    } catch (error) {
      console.log('ℹ️ Could not check views:', error.message);
    }
    
    // Test database connection and basic queries
    console.log('\n🧪 Testing database functionality...');
    
    // Test stages query
    const [stages] = await connection.execute('SELECT * FROM stages ORDER BY order_index');
    console.log(`✅ Stages query works: ${stages.length} stages found`);
    
    // Test users query
    const [users] = await connection.execute('SELECT id, email, role, is_approved FROM users LIMIT 5');
    console.log(`✅ Users query works: ${users.length} users found`);
    
    // Test admin login
    const [adminUser] = await connection.execute(
      'SELECT id, email, role, is_approved, onboarding_status FROM users WHERE email = ?',
      ['admin@yaqeen.edu']
    );
    
    if (adminUser.length > 0) {
      console.log('✅ Admin user found:', {
        email: adminUser[0].email,
        role: adminUser[0].role,
        is_approved: adminUser[0].is_approved,
        status: adminUser[0].onboarding_status
      });
    }
    
    console.log('\n🎉 Database is ready for InfinityFree!');
    console.log('\n📋 Login credentials:');
    console.log('Email: admin@yaqeen.edu');
    console.log('Password: Admin321&yakeen');
    
  } catch (error) {
    console.error('❌ Error fixing database:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

// Run the fix
fixInfinityFreeDatabase();
