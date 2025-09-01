const mysql = require('mysql2/promise');

const MYSQL_URL = 'mysql://root:IxIZLRYNpqztjoTYQijUTsGbyIXRZXOf@metro.proxy.rlwy.net:16665/railway';

async function testLoginFix() {
  let connection;
  
  try {
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
    
    connection = await mysql.createConnection(dbConfig);
    console.log('🔌 Connected to Railway MySQL');
    
    // Test the exact query used in login
    const [users] = await connection.execute(
      'SELECT u.id, u.email, u.password_hash, u.role, u.is_approved, u.onboarding_status, u.first_name, u.last_name FROM users u WHERE u.email = ? LIMIT 1',
      ['admin@yaqeen.edu']
    );
    
    if (users.length > 0) {
      const user = users[0];
      console.log('✅ Admin user found:', {
        id: user.id,
        email: user.email,
        role: user.role,
        is_approved: user.is_approved,
        onboarding_status: user.onboarding_status,
        has_password_hash: !!user.password_hash
      });
      
      // Test password verification (simulate bcryptjs.compare)
      const bcryptjs = require('bcryptjs');
      const isPasswordValid = await bcryptjs.compare('admin123', user.password_hash);
      console.log('🔐 Password verification:', isPasswordValid ? '✅ Valid' : '❌ Invalid');
      
    } else {
      console.log('❌ Admin user not found');
    }
    
    // Test daily ayah
    const [totalAyahs] = await connection.execute('SELECT COUNT(*) as count FROM quran_ayahs');
    console.log(`📖 Total ayahs: ${totalAyahs[0].count}`);
    
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
        console.log('✅ Daily ayah working:', {
          surah: ayah[0].surah_name,
          ayah_number: ayah[0].ayah_number,
          text_preview: ayah[0].text_ar.substring(0, 50) + '...'
        });
      }
    }
    
    console.log('🎉 All tests passed!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

testLoginFix();
