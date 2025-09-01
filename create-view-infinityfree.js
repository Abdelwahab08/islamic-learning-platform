const mysql = require('mysql2/promise');

// InfinityFree database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'sql.infinityfree.com',
  user: process.env.DB_USER || 'if0_39829212',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'if0_39829212_islamic_db',
  port: 3306
};

async function createView() {
  let connection;
  
  try {
    console.log('🔌 Connecting to InfinityFree database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected successfully!');

    // Method 1: Try creating view with simple syntax
    console.log('📝 Attempting to create v_user_access view...');
    
    const createViewQuery = `
      CREATE VIEW v_user_access AS 
      SELECT 
        u.id,
        u.email,
        u.password_hash,
        u.role,
        u.is_approved,
        u.onboarding_status,
        CASE 
          WHEN u.role = 'ADMIN' THEN '/dashboard/admin'
          WHEN u.role = 'TEACHER' AND u.is_approved = 1 THEN '/dashboard/teacher'
          WHEN u.role = 'TEACHER' AND u.is_approved = 0 THEN '/auth/awaiting-approval?type=teacher'
          WHEN u.role = 'STUDENT' AND u.is_approved = 1 THEN '/dashboard/student'
          WHEN u.role = 'STUDENT' AND u.is_approved = 0 THEN '/auth/awaiting-approval?type=student'
          WHEN u.role = 'ACADEMIC_MOD' THEN '/dashboard/admin'
          ELSE '/'
        END AS redirect_path,
        CASE 
          WHEN u.role = 'ADMIN' THEN 'المدير'
          WHEN u.role = 'TEACHER' THEN 'المعلم'
          WHEN u.role = 'STUDENT' THEN 'الطالب'
          WHEN u.role = 'ACADEMIC_MOD' THEN 'المشرف الأكاديمي'
          ELSE 'مستخدم'
        END AS role_name_ar
      FROM users u
    `;

    await connection.execute(createViewQuery);
    console.log('✅ View created successfully!');

    // Test the view
    console.log('🧪 Testing the view...');
    const testQuery = 'SELECT * FROM v_user_access LIMIT 1';
    const [testResult] = await connection.execute(testQuery);
    console.log('✅ View test successful:', testResult);

  } catch (error) {
    console.error('❌ Error creating view:', error.message);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('🔒 Access denied - InfinityFree doesn\'t allow view creation');
      console.log('💡 Solution: Use direct queries (already implemented in login route)');
    } else if (error.code === 'ER_TABLE_EXISTS') {
      console.log('ℹ️ View already exists');
    } else {
      console.log('🔧 Trying alternative method...');
      
      try {
        // Method 2: Try with different syntax
        const alternativeQuery = `
          CREATE OR REPLACE VIEW v_user_access AS 
          SELECT 
            u.id,
            u.email,
            u.password_hash,
            u.role,
            u.is_approved,
            u.onboarding_status
          FROM users u
        `;
        
        await connection.execute(alternativeQuery);
        console.log('✅ Alternative view created successfully!');
      } catch (altError) {
        console.error('❌ Alternative method also failed:', altError.message);
        console.log('💡 Recommendation: Use direct queries instead of views');
      }
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Check if we have the required environment variables
if (!process.env.DB_PASSWORD) {
  console.log('❌ DB_PASSWORD environment variable is required');
  console.log('💡 Please set your InfinityFree database password');
  process.exit(1);
}

createView();
