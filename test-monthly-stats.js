const mysql = require('mysql2/promise');

// Railway database configuration
const railwayConfig = 'mysql://root:IxIZLRYNpqztjoTYQijUTsGbyIXRZXOf@metro.proxy.rlwy.net:16665/railway';

async function testMonthlyStats() {
  let connection;
  
  try {
    console.log('🔗 Connecting to Railway database...');
    connection = await mysql.createConnection(railwayConfig);
    console.log('✅ Connected to Railway!');

    console.log('\n🧪 Testing Fixed Monthly Statistics Query...\n');

    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - 30);
    
    const monthlyQuery = `
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        COUNT(*) as newUsers,
        0 as newCertificates,
        0 as newAssignments
      FROM users
      WHERE created_at >= ?
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY month DESC
      LIMIT 6
    `;
    
    const [monthlyStats] = await connection.execute(monthlyQuery, [dateFrom]);
    console.log(`✅ Monthly stats query successful: ${monthlyStats.length} months found`);
    
    if (monthlyStats.length > 0) {
      console.log(`   - First month: ${monthlyStats[0].month} (${monthlyStats[0].newUsers} users)`);
    }

  } catch (error) {
    console.log(`❌ Monthly stats query failed: ${error.message}`);
  } finally {
    if (connection) await connection.end();
  }
}

testMonthlyStats();
