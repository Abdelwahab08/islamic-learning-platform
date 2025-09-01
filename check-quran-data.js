const mysql = require('mysql2/promise');

const MYSQL_URL = 'mysql://root:IxIZLRYNpqztjoTYQijUTsGbyIXRZXOf@metro.proxy.rlwy.net:16665/railway';

async function checkQuranData() {
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
    
    // Check surahs
    const [surahs] = await connection.execute('SELECT id, name_ar, ayah_count FROM quran_surahs ORDER BY id LIMIT 10');
    console.log('📚 Quran Surahs:');
    surahs.forEach(surah => {
      console.log(`  - ${surah.id}: ${surah.name_ar} (${surah.ayah_count} ayahs)`);
    });
    
    // Check ayahs
    const [ayahs] = await connection.execute('SELECT id, surah_id, ayah_number, LEFT(text_ar, 50) as text_preview FROM quran_ayahs ORDER BY id LIMIT 10');
    console.log('\n📖 Quran Ayahs:');
    ayahs.forEach(ayah => {
      console.log(`  - ID ${ayah.id}: Surah ${ayah.surah_id}, Ayah ${ayah.ayah_number}: ${ayah.text_preview}...`);
    });
    
    // Check total counts
    const [totalSurahs] = await connection.execute('SELECT COUNT(*) as count FROM quran_surahs');
    const [totalAyahs] = await connection.execute('SELECT COUNT(*) as count FROM quran_ayahs');
    
    console.log(`\n📊 Totals:`);
    console.log(`  - Surahs: ${totalSurahs[0].count}`);
    console.log(`  - Ayahs: ${totalAyahs[0].count}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkQuranData();
