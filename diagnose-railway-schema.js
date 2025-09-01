const { executeQuery, executeQuerySingle } = require('./lib/db');

async function diagnoseRailwaySchema() {
  console.log('🔍 DIAGNOSING RAILWAY DATABASE SCHEMA');
  console.log('=====================================');
  
  try {
    // Check database name
    const dbName = await executeQuerySingle('SELECT DATABASE() as db_name');
    console.log(`📊 Connected to database: ${dbName?.db_name || 'unknown'}`);

    // Get all table names
    console.log('\n📋 EXISTING TABLES:');
    const tables = await executeQuery(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
      ORDER BY TABLE_NAME
    `);
    
    const tableNames = tables.map(t => t.TABLE_NAME);
    tableNames.forEach(name => console.log(`  ✅ ${name}`));

    // Check critical tables and their columns
    const criticalTables = ['users', 'students', 'teachers', 'certificates', 'materials', 'stages', 'assignments', 'meetings'];
    
    for (const tableName of criticalTables) {
      if (tableNames.includes(tableName)) {
        console.log(`\n📊 ${tableName.toUpperCase()} TABLE STRUCTURE:`);
        const columns = await executeQuery(`
          SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT, EXTRA
          FROM INFORMATION_SCHEMA.COLUMNS 
          WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?
          ORDER BY ORDINAL_POSITION
        `, [tableName]);
        
        columns.forEach(col => {
          const nullable = col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL';
          const extra = col.EXTRA ? ` (${col.EXTRA})` : '';
          const defaultVal = col.COLUMN_DEFAULT ? ` DEFAULT ${col.COLUMN_DEFAULT}` : '';
          console.log(`  ${col.COLUMN_NAME}: ${col.DATA_TYPE} ${nullable}${defaultVal}${extra}`);
        });
      } else {
        console.log(`\n❌ ${tableName.toUpperCase()} TABLE MISSING`);
      }
    }

    // Test problematic queries
    console.log('\n🧪 TESTING PROBLEMATIC QUERIES:');
    
    // Test certificates serial column
    console.log('\n1. Testing certificates serial column:');
    try {
      const certTest = await executeQuery('SELECT COUNT(*) as count FROM certificates');
      console.log(`✅ Certificates table accessible: ${certTest[0]?.count || 0} records`);
      
      // Check which serial column exists
      const serialCol = await executeQuery(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'certificates' 
        AND COLUMN_NAME IN ('serial', 'serial_number')
      `);
      console.log(`📍 Serial columns found: ${serialCol.map(c => c.COLUMN_NAME).join(', ')}`);
    } catch (error) {
      console.log(`❌ Certificates test failed: ${error.message}`);
    }

    // Test materials query
    console.log('\n2. Testing materials admin query:');
    try {
      const materialsTest = await executeQuery(`
        SELECT COUNT(*) as count
        FROM materials m
        JOIN teachers t ON m.teacher_id = t.id
        JOIN users u ON t.user_id = u.id
      `);
      console.log(`✅ Materials join successful: ${materialsTest[0]?.count || 0} records`);
    } catch (error) {
      console.log(`❌ Materials join failed: ${error.message}`);
    }

    // Test students stage join
    console.log('\n3. Testing students stage join:');
    try {
      const stageTest = await executeQuery(`
        SELECT COUNT(*) as count
        FROM stages st
        LEFT JOIN students s ON st.id = s.stage_id
      `);
      console.log(`✅ Students stage_id join: ${stageTest[0]?.count || 0} stage records`);
    } catch (error) {
      console.log(`❌ Students stage_id join failed: ${error.message}`);
      
      // Try current_stage_id
      try {
        const altStageTest = await executeQuery(`
          SELECT COUNT(*) as count
          FROM stages st
          LEFT JOIN students s ON st.id = s.current_stage_id
        `);
        console.log(`✅ Students current_stage_id join: ${altStageTest[0]?.count || 0} stage records`);
      } catch (altError) {
        console.log(`❌ Students current_stage_id join also failed: ${altError.message}`);
      }
    }

    // Test reports query components
    console.log('\n4. Testing reports query components:');
    const reportTables = ['users', 'teachers', 'students', 'certificates', 'assignments', 'submissions', 'materials', 'meetings', 'complaints'];
    for (const table of reportTables) {
      try {
        const count = await executeQuerySingle(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`✅ ${table}: ${count?.count || 0} records`);
      } catch (error) {
        console.log(`❌ ${table}: ${error.message}`);
      }
    }

    // Check for views (might be missing)
    console.log('\n📊 CHECKING FOR VIEWS:');
    const views = await executeQuery(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.VIEWS 
      WHERE TABLE_SCHEMA = DATABASE()
    `);
    if (views.length > 0) {
      views.forEach(view => console.log(`  📊 ${view.TABLE_NAME}`));
    } else {
      console.log('  ℹ️ No views found');
    }

    // Check for stored procedures
    console.log('\n🔧 CHECKING FOR STORED PROCEDURES:');
    const procedures = await executeQuery(`
      SELECT ROUTINE_NAME 
      FROM INFORMATION_SCHEMA.ROUTINES 
      WHERE ROUTINE_SCHEMA = DATABASE() AND ROUTINE_TYPE = 'PROCEDURE'
    `);
    if (procedures.length > 0) {
      procedures.forEach(proc => console.log(`  🔧 ${proc.ROUTINE_NAME}`));
    } else {
      console.log('  ℹ️ No stored procedures found');
    }

    console.log('\n✅ DIAGNOSIS COMPLETE');

  } catch (error) {
    console.error('❌ Diagnosis failed:', error);
  }
}

diagnoseRailwaySchema().catch(console.error);
