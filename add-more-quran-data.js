const mysql = require('mysql2/promise');

const MYSQL_URL = 'mysql://root:IxIZLRYNpqztjoTYQijUTsGbyIXRZXOf@metro.proxy.rlwy.net:16665/railway';

async function addMoreQuranData() {
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
    
    // Add more surahs
    const surahsToAdd = [
      { id: 'surah-4', name_ar: 'النساء', ayah_count: 176 },
      { id: 'surah-5', name_ar: 'المائدة', ayah_count: 120 },
      { id: 'surah-6', name_ar: 'الأنعام', ayah_count: 165 },
      { id: 'surah-7', name_ar: 'الأعراف', ayah_count: 206 },
      { id: 'surah-8', name_ar: 'الأنفال', ayah_count: 75 },
      { id: 'surah-9', name_ar: 'التوبة', ayah_count: 129 },
      { id: 'surah-10', name_ar: 'يونس', ayah_count: 109 }
    ];
    
    console.log('📚 Adding more surahs...');
    for (const surah of surahsToAdd) {
      await connection.execute(
        'INSERT IGNORE INTO quran_surahs (id, name_ar, ayah_count) VALUES (?, ?, ?)',
        [surah.id, surah.name_ar, surah.ayah_count]
      );
    }
    
    // Add more ayahs (sample ayahs from different surahs)
    const ayahsToAdd = [
      { id: 'ayah-1-4', surah_id: 'surah-1', ayah_number: 4, text_ar: 'مَالِكِ يَوْمِ الدِّينِ' },
      { id: 'ayah-1-5', surah_id: 'surah-1', ayah_number: 5, text_ar: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ' },
      { id: 'ayah-1-6', surah_id: 'surah-1', ayah_number: 6, text_ar: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ' },
      { id: 'ayah-1-7', surah_id: 'surah-1', ayah_number: 7, text_ar: 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ' },
      { id: 'ayah-2-3', surah_id: 'surah-2', ayah_number: 3, text_ar: 'الَّذِينَ يُؤْمِنُونَ بِالْغَيْبِ وَيُقِيمُونَ الصَّلَاةَ وَمِمَّا رَزَقْنَاهُمْ يُنْفِقُونَ' },
      { id: 'ayah-2-4', surah_id: 'surah-2', ayah_number: 4, text_ar: 'وَالَّذِينَ يُؤْمِنُونَ بِمَا أُنْزِلَ إِلَيْكَ وَمَا أُنْزِلَ مِنْ قَبْلِكَ وَبِالْآخِرَةِ هُمْ يُوقِنُونَ' },
      { id: 'ayah-2-5', surah_id: 'surah-2', ayah_number: 5, text_ar: 'أُولَٰئِكَ عَلَىٰ هُدًى مِنْ رَبِّهِمْ ۖ وَأُولَٰئِكَ هُمُ الْمُفْلِحُونَ' },
      { id: 'ayah-3-1', surah_id: 'surah-3', ayah_number: 1, text_ar: 'الٓمٓ' },
      { id: 'ayah-3-2', surah_id: 'surah-3', ayah_number: 2, text_ar: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ' },
      { id: 'ayah-3-3', surah_id: 'surah-3', ayah_number: 3, text_ar: 'نَزَّلَ عَلَيْكَ الْكِتَابَ بِالْحَقِّ مُصَدِّقًا لِمَا بَيْنَ يَدَيْهِ وَأَنْزَلَ التَّوْرَاةَ وَالْإِنْجِيلَ' },
      { id: 'ayah-4-1', surah_id: 'surah-4', ayah_number: 1, text_ar: 'يَا أَيُّهَا النَّاسُ اتَّقُوا رَبَّكُمُ الَّذِي خَلَقَكُمْ مِنْ نَفْسٍ وَاحِدَةٍ وَخَلَقَ مِنْهَا زَوْجَهَا وَبَثَّ مِنْهُمَا رِجَالًا كَثِيرًا وَنِسَاءً ۚ وَاتَّقُوا اللَّهَ الَّذِي تَسَاءَلُونَ بِهِ وَالْأَرْحَامَ ۚ إِنَّ اللَّهَ كَانَ عَلَيْكُمْ رَقِيبًا' },
      { id: 'ayah-5-1', surah_id: 'surah-5', ayah_number: 1, text_ar: 'يَا أَيُّهَا الَّذِينَ آمَنُوا أَوْفُوا بِالْعُقُودِ ۚ أُحِلَّتْ لَكُمْ بَهِيمَةُ الْأَنْعَامِ إِلَّا مَا يُتْلَىٰ عَلَيْكُمْ غَيْرَ مُحِلِّي الصَّيْدِ وَأَنْتُمْ حُرُمٌ ۗ إِنَّ اللَّهَ يَحْكُمُ مَا يُرِيدُ' },
      { id: 'ayah-6-1', surah_id: 'surah-6', ayah_number: 1, text_ar: 'الْحَمْدُ لِلَّهِ الَّذِي خَلَقَ السَّمَاوَاتِ وَالْأَرْضَ وَجَعَلَ الظُّلُمَاتِ وَالنُّورَ ۖ ثُمَّ الَّذِينَ كَفَرُوا بِرَبِّهِمْ يَعْدِلُونَ' },
      { id: 'ayah-7-1', surah_id: 'surah-7', ayah_number: 1, text_ar: 'الٓمٓصٓ' },
      { id: 'ayah-8-1', surah_id: 'surah-8', ayah_number: 1, text_ar: 'يَسْأَلُونَكَ عَنِ الْأَنْفَالِ ۖ قُلِ الْأَنْفَالُ لِلَّهِ وَالرَّسُولِ ۖ فَاتَّقُوا اللَّهَ وَأَصْلِحُوا ذَاتَ بَيْنِكُمْ ۖ وَأَطِيعُوا اللَّهَ وَرَسُولَهُ إِنْ كُنْتُمْ مُؤْمِنِينَ' },
      { id: 'ayah-9-1', surah_id: 'surah-9', ayah_number: 1, text_ar: 'بَرَاءَةٌ مِنَ اللَّهِ وَرَسُولِهِ إِلَّا الَّذِينَ عَاهَدْتُمْ مِنَ الْمُشْرِكِينَ' },
      { id: 'ayah-10-1', surah_id: 'surah-10', ayah_number: 1, text_ar: 'الٓر ۚ تِلْكَ آيَاتُ الْكِتَابِ الْحَكِيمِ' }
    ];
    
    console.log('📖 Adding more ayahs...');
    for (const ayah of ayahsToAdd) {
      await connection.execute(
        'INSERT IGNORE INTO quran_ayahs (id, surah_id, ayah_number, text_ar) VALUES (?, ?, ?, ?)',
        [ayah.id, ayah.surah_id, ayah.ayah_number, ayah.text_ar]
      );
    }
    
    // Check final counts
    const [totalSurahs] = await connection.execute('SELECT COUNT(*) as count FROM quran_surahs');
    const [totalAyahs] = await connection.execute('SELECT COUNT(*) as count FROM quran_ayahs');
    
    console.log(`✅ Quran data updated:`);
    console.log(`  - Surahs: ${totalSurahs[0].count}`);
    console.log(`  - Ayahs: ${totalAyahs[0].count}`);
    
    // Test daily ayah
    const [totalAyahsForTest] = await connection.execute('SELECT COUNT(*) as count FROM quran_ayahs');
    if (totalAyahsForTest[0].count > 0) {
      const today = new Date();
      const dateString = today.toISOString().split('T')[0];
      const dateHash = dateString.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
      }, 0);
      const ayahIndex = Math.abs(dateHash) % totalAyahsForTest[0].count + 1;
      
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
        console.log('✅ Daily ayah test successful:', {
          surah: ayah[0].surah_name,
          ayah_number: ayah[0].ayah_number,
          text_preview: ayah[0].text_ar.substring(0, 50) + '...'
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

addMoreQuranData();
