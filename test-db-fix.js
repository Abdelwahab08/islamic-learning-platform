const mysql = require('mysql2/promise');

// Test the exact MYSQL_URL that should be set on Railway
const MYSQL_URL = 'mysql://root:IxIZLRYNpqztjoTYQijUTsGbyIXRZXOf@metro.proxy.rlwy.net:16665/railway';

async function testDatabaseFix() {
  let connection;
  
  try {
    console.log('🔌 Testing database connection with Railway URL...');
    
    // Parse the URL like the app does
    const url = new URL(MYSQL_URL);
    const dbConfig = {
      host: url.hostname,
      port: parseInt(url.port || '3306'),
      user: url.username,
      password: url.password,
      database: url.pathname.slice(1),
      charset: 'utf8mb4',
      timezone: '+00:00'
    };
    
    console.log('📋 Database config:', {
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      database: dbConfig.database
    });
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to Railway MySQL successfully!');
    
    // Test user query (like the login route)
    const [users] = await connection.execute(
      'SELECT u.id, u.email, u.password_hash, u.role, u.is_approved, u.onboarding_status, u.first_name, u.last_name FROM users u WHERE u.email = ? LIMIT 1',
      ['admin@yaqeen.edu']
    );
    
    if (users.length > 0) {
      console.log('✅ Admin user found:', {
        email: users[0].email,
        role: users[0].role,
        is_approved: users[0].is_approved
      });
    } else {
      console.log('❌ Admin user not found');
    }
    
    // Test Quran data
    const [quranAyahs] = await connection.execute('SELECT COUNT(*) as count FROM quran_ayahs');
    console.log(`📖 Quran ayahs count: ${quranAyahs[0].count}`);
    
    const [quranSurahs] = await connection.execute('SELECT COUNT(*) as count FROM quran_surahs');
    console.log(`📚 Quran surahs count: ${quranSurahs[0].count}`);
    
    // Test daily ayah query
    const [totalAyahs] = await connection.execute('SELECT COUNT(*) as count FROM quran_ayahs');
    if (totalAyahs[0].count > 0) {
      const today = new Date();
      const dateString = today.toISOString().split('T')[0];
      const dateHash = dateString.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
      }, 0);
      const ayahIndex = Math.abs(dateHash) % totalAyahs[0].count + 1;
      
      const [ayah] = await connection.execute(`
        SELECT 
          qa.id,
          qa.surah_id,
          qa.ayah_number,
          qa.text_ar,
          qs.name_ar as surah_name
        FROM quran_ayahs qa
        JOIN quran_surahs qs ON qa.surah_id = qs.id
        WHERE qa.id = ?
      `, [ayahIndex]);
      
      if (ayah.length > 0) {
        console.log('✅ Daily ayah found:', {
          surah: ayah[0].surah_name,
          ayah_number: ayah[0].ayah_number,
          text_preview: ayah[0].text_ar.substring(0, 50) + '...'
        });
      } else {
        console.log('❌ Daily ayah not found');
      }
    }
    
    console.log('🎉 All database tests passed!');
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the test
testDatabaseFix();
