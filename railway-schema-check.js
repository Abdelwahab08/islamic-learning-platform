const mysql = require('mysql2/promise');

async function checkRailwaySchema() {
  console.log('🔍 CHECKING RAILWAY DATABASE SCHEMA');
  console.log('===================================');

  // Parse MYSQL_URL from environment
  const mysqlUrl = process.env.MYSQL_URL;
  if (!mysqlUrl) {
    console.log('❌ MYSQL_URL not found in environment');
    return;
  }

  console.log(`🔗 Connecting to: ${mysqlUrl.replace(/:[^:@]*@/, ':***@')}`);

  let connection;
  try {
    connection = await mysql.createConnection(mysqlUrl);
    console.log('✅ Connected to Railway database');

    // Get database name
    const [dbResult] = await connection.execute('SELECT DATABASE() as db_name');
    console.log(`📊 Database: ${dbResult[0].db_name}`);

    // Get all tables
    const [tables] = await connection.execute(`
      SELECT TABLE_NAME, TABLE_ROWS, TABLE_COMMENT
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
      ORDER BY TABLE_NAME
    `);

    console.log('\n📋 TABLES:');
    tables.forEach(table => {
      console.log(`  ${table.TABLE_NAME} (${table.TABLE_ROWS || 0} rows)`);
    });

    // Check certificates table specifically
    console.log('\n🏆 CERTIFICATES TABLE:');
    try {
      const [certCols] = await connection.execute(`
        SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'certificates'
        ORDER BY ORDINAL_POSITION
      `);
      
      certCols.forEach(col => {
        const nullable = col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL';
        const defaultVal = col.COLUMN_DEFAULT ? ` DEFAULT ${col.COLUMN_DEFAULT}` : '';
        console.log(`  ${col.COLUMN_NAME}: ${col.DATA_TYPE} ${nullable}${defaultVal}`);
      });

      // Check if we have data
      const [certCount] = await connection.execute('SELECT COUNT(*) as count FROM certificates');
      console.log(`  📊 Certificate count: ${certCount[0].count}`);
      
    } catch (error) {
      console.log(`❌ Error checking certificates: ${error.message}`);
    }

    // Check students table for stage column
    console.log('\n👨‍🎓 STUDENTS TABLE:');
    try {
      const [studentCols] = await connection.execute(`
        SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'students'
        ORDER BY ORDINAL_POSITION
      `);
      
      studentCols.forEach(col => {
        const nullable = col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL';
        console.log(`  ${col.COLUMN_NAME}: ${col.DATA_TYPE} ${nullable}`);
      });

      const [studentCount] = await connection.execute('SELECT COUNT(*) as count FROM students');
      console.log(`  📊 Student count: ${studentCount[0].count}`);
      
    } catch (error) {
      console.log(`❌ Error checking students: ${error.message}`);
    }

    // Check materials table
    console.log('\n📚 MATERIALS TABLE:');
    try {
      const [materialCols] = await connection.execute(`
        SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'materials'
        ORDER BY ORDINAL_POSITION
      `);
      
      materialCols.forEach(col => {
        const nullable = col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL';
        console.log(`  ${col.COLUMN_NAME}: ${col.DATA_TYPE} ${nullable}`);
      });

      const [materialCount] = await connection.execute('SELECT COUNT(*) as count FROM materials');
      console.log(`  📊 Material count: ${materialCount[0].count}`);
      
    } catch (error) {
      console.log(`❌ Error checking materials: ${error.message}`);
    }

    // Test the actual queries that are failing
    console.log('\n🧪 TESTING FAILING QUERIES:');

    // Test admin certificates query
    console.log('\n1. Admin certificates query:');
    try {
      const [adminCerts] = await connection.execute(`
        SELECT 
          c.id,
          c.serial_number AS serial,
          su.email AS student_name,
          tu.email AS teacher_name,
          st.name_ar AS stage_name,
          c.grade,
          c.status,
          c.issued_at
        FROM certificates c
        JOIN students s ON c.student_id = s.id
        JOIN users su ON s.user_id = su.id
        JOIN teachers t ON c.teacher_id = t.id
        JOIN users tu ON t.user_id = tu.id
        JOIN stages st ON c.stage_id = st.id
        ORDER BY c.issued_at DESC
        LIMIT 5
      `);
      console.log(`✅ Admin certificates query successful: ${adminCerts.length} results`);
    } catch (error) {
      console.log(`❌ Admin certificates query failed: ${error.message}`);
      
      // Try with serial instead
      try {
        const [adminCertsAlt] = await connection.execute(`
          SELECT 
            c.id,
            c.serial AS serial,
            su.email AS student_name,
            tu.email AS teacher_name,
            st.name_ar AS stage_name,
            c.grade,
            c.status,
            c.issued_at
          FROM certificates c
          JOIN students s ON c.student_id = s.id
          JOIN users su ON s.user_id = su.id
          JOIN teachers t ON c.teacher_id = t.id
          JOIN users tu ON t.user_id = tu.id
          JOIN stages st ON c.stage_id = st.id
          ORDER BY c.issued_at DESC
          LIMIT 5
        `);
        console.log(`✅ Admin certificates query (serial) successful: ${adminCertsAlt.length} results`);
      } catch (altError) {
        console.log(`❌ Admin certificates query (serial) also failed: ${altError.message}`);
      }
    }

    // Test materials query
    console.log('\n2. Materials admin query:');
    try {
      const [materials] = await connection.execute(`
        SELECT 
          m.*,
          u.email as teacher_name,
          st.name_ar as stage_name
        FROM materials m
        JOIN teachers t ON m.teacher_id = t.id
        JOIN users u ON t.user_id = u.id
        LEFT JOIN stages st ON m.stage_id = st.id
        LIMIT 5
      `);
      console.log(`✅ Materials query successful: ${materials.length} results`);
    } catch (error) {
      console.log(`❌ Materials query failed: ${error.message}`);
    }

    // Test reports stage progress query
    console.log('\n3. Reports stage progress query:');
    try {
      const [stageProgress] = await connection.execute(`
        SELECT 
          st.name_ar as stage,
          COUNT(s.id) as students,
          ROUND((COUNT(s.id) / (SELECT COUNT(*) FROM students)) * 100, 1) as completionRate
        FROM stages st
        LEFT JOIN students s ON st.id = s.stage_id
        GROUP BY st.id, st.name_ar
        ORDER BY st.id
      `);
      console.log(`✅ Stage progress query successful: ${stageProgress.length} results`);
    } catch (error) {
      console.log(`❌ Stage progress query failed: ${error.message}`);
      
      // Try with current_stage_id
      try {
        const [altProgress] = await connection.execute(`
          SELECT 
            st.name_ar as stage,
            COUNT(s.id) as students,
            ROUND((COUNT(s.id) / (SELECT COUNT(*) FROM students)) * 100, 1) as completionRate
          FROM stages st
          LEFT JOIN students s ON st.id = s.current_stage_id
          GROUP BY st.id, st.name_ar
          ORDER BY st.id
        `);
        console.log(`✅ Stage progress query (current_stage_id) successful: ${altProgress.length} results`);
      } catch (altError) {
        console.log(`❌ Stage progress query (current_stage_id) also failed: ${altError.message}`);
      }
    }

    console.log('\n✅ SCHEMA CHECK COMPLETE');

  } catch (error) {
    console.error('❌ Connection or query failed:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkRailwaySchema().catch(console.error);

