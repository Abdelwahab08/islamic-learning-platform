const mysql = require('mysql2/promise');
const bcryptjs = require('bcryptjs');

// Replace these with your actual InfinityFree database credentials
const DB_CONFIG = {
  host: process.env.DB_HOST || 'your-infinityfree-mysql-host',
  user: process.env.DB_USER || 'your-infinityfree-db-username', 
  password: process.env.DB_PASSWORD || 'your-infinityfree-db-password',
  database: process.env.DB_NAME || 'your-infinityfree-db-name'
};

async function setupDatabase() {
  let connection;
  
  try {
    console.log('🔌 Connecting to InfinityFree database...');
    connection = await mysql.createConnection(DB_CONFIG);
    console.log('✅ Connected successfully!');
    
    // Create admin password hash
    const adminPassword = 'Admin321&yakeen';
    const passwordHash = await bcryptjs.hash(adminPassword, 10);
    
    // Insert admin user
    await connection.execute(`
      INSERT IGNORE INTO users (id, email, password_hash, role, is_approved, onboarding_status, first_name, last_name) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
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
      INSERT IGNORE INTO teachers (id, user_id, specialization, bio) 
      VALUES (?, ?, ?, ?)
    `, [
      'admin-teacher-id',
      'admin-yaqeen-id',
      'إدارة النظام',
      'مدير منصة يقين لتعليم القرآن الكريم'
    ]);
    console.log('✅ Admin teacher record created');
    
    console.log('\n🎉 Database setup completed!');
    console.log('Email: admin@yaqeen.edu');
    console.log('Password: Admin321&yakeen');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

setupDatabase();
