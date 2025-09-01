const mysql = require('mysql2/promise');

// Railway database configuration
const railwayConfig = 'mysql://root:IxIZLRYNpqztjoTYQijUTsGbyIXRZXOf@metro.proxy.rlwy.net:16665/railway';

async function testAdminAPIs() {
  let connection;
  
  try {
    console.log('🔗 Connecting to Railway database...');
    connection = await mysql.createConnection(railwayConfig);
    console.log('✅ Connected to Railway!');

    console.log('\n🧪 Testing Admin APIs...\n');

    // Test 1: Admin Users API Query
    console.log('1️⃣ Testing Admin Users API Query...');
    try {
      const usersQuery = `
        SELECT 
          u.id,
          u.email,
          u.role,
          u.is_approved,
          u.onboarding_status,
          u.created_at,
          u.first_name,
          u.last_name,
          CASE 
            WHEN u.role = 'STUDENT' THEN (
              SELECT JSON_OBJECT(
                'id', t.id,
                'name', CONCAT(u2.first_name, ' ', u2.last_name),
                'email', u2.email
              )
              FROM teacher_students ts
              JOIN teachers t ON ts.teacher_id = t.id
              JOIN users u2 ON t.user_id = u2.id
              JOIN students s ON ts.student_id = s.id
              WHERE s.user_id = u.id
              LIMIT 1
            )
            ELSE NULL
          END as assigned_teacher
        FROM users u
        ORDER BY u.created_at DESC
      `;
      
      const [users] = await connection.execute(usersQuery);
      console.log(`✅ Users query successful: ${users.length} users found`);
      
      if (users.length > 0) {
        console.log(`   - First user: ${users[0].email} (${users[0].role})`);
      }
    } catch (error) {
      console.log(`❌ Users query failed: ${error.message}`);
    }

    // Test 2: Admin Reports API Query
    console.log('\n2️⃣ Testing Admin Reports API Query...');
    try {
      // Test basic statistics
      const [totalUsers] = await connection.execute('SELECT COUNT(*) as count FROM users');
      const [totalTeachers] = await connection.execute('SELECT COUNT(*) as count FROM teachers');
      const [totalStudents] = await connection.execute('SELECT COUNT(*) as count FROM students');
      const [pendingApprovals] = await connection.execute('SELECT COUNT(*) as count FROM users WHERE is_approved = 0');
      
      console.log(`✅ Basic stats query successful:`);
      console.log(`   - Total users: ${totalUsers[0].count}`);
      console.log(`   - Total teachers: ${totalTeachers[0].count}`);
      console.log(`   - Total students: ${totalStudents[0].count}`);
      console.log(`   - Pending approvals: ${pendingApprovals[0].count}`);
    } catch (error) {
      console.log(`❌ Basic stats query failed: ${error.message}`);
    }

    // Test 3: Monthly Statistics Query
    console.log('\n3️⃣ Testing Monthly Statistics Query...');
    try {
      const dateFrom = new Date();
      dateFrom.setDate(dateFrom.getDate() - 30);
      
      const monthlyQuery = `
        SELECT 
          DATE_FORMAT(created_at, '%Y-%m') as month,
          COUNT(*) as newUsers,
          (SELECT COUNT(*) FROM certificates WHERE DATE_FORMAT(issued_at, '%Y-%m') = DATE_FORMAT(users.created_at, '%Y-%m')) as newCertificates,
          (SELECT COUNT(*) FROM assignments WHERE DATE_FORMAT(created_at, '%Y-%m') = DATE_FORMAT(users.created_at, '%Y-%m')) as newAssignments
        FROM users
        WHERE created_at >= ?
        GROUP BY DATE_FORMAT(created_at, '%Y-%m')
        ORDER BY month DESC
        LIMIT 6
      `;
      
      const [monthlyStats] = await connection.execute(monthlyQuery, [dateFrom]);
      console.log(`✅ Monthly stats query successful: ${monthlyStats.length} months found`);
    } catch (error) {
      console.log(`❌ Monthly stats query failed: ${error.message}`);
    }

    // Test 4: Top Teachers Query
    console.log('\n4️⃣ Testing Top Teachers Query...');
    try {
      const topTeachersQuery = `
        SELECT 
          CONCAT(u.first_name, ' ', u.last_name) as name,
          COUNT(DISTINCT ts.student_id) as students,
          COUNT(c.id) as certificates
        FROM teachers t
        JOIN users u ON t.user_id = u.id
        LEFT JOIN teacher_students ts ON t.id = ts.teacher_id
        LEFT JOIN certificates c ON t.id = c.teacher_id
        GROUP BY t.id, u.first_name, u.last_name
        ORDER BY students DESC, certificates DESC
        LIMIT 5
      `;
      
      const [topTeachers] = await connection.execute(topTeachersQuery);
      console.log(`✅ Top teachers query successful: ${topTeachers.length} teachers found`);
      
      if (topTeachers.length > 0) {
        console.log(`   - Top teacher: ${topTeachers[0].name} (${topTeachers[0].students} students)`);
      }
    } catch (error) {
      console.log(`❌ Top teachers query failed: ${error.message}`);
    }

    // Test 5: Stage Progress Query
    console.log('\n5️⃣ Testing Stage Progress Query...');
    try {
      const stageProgressQuery = `
        SELECT 
          CONCAT('المرحلة ', st.id) as stage,
          COUNT(s.id) as students,
          ROUND((COUNT(s.id) / (SELECT COUNT(*) FROM students)) * 100, 1) as completionRate
        FROM stages st
        LEFT JOIN students s ON st.id = COALESCE(s.stage_id, s.current_stage_id)
        GROUP BY st.id
        ORDER BY st.id
      `;
      
      const [stageProgress] = await connection.execute(stageProgressQuery);
      console.log(`✅ Stage progress query successful: ${stageProgress.length} stages found`);
      
      if (stageProgress.length > 0) {
        console.log(`   - First stage: ${stageProgress[0].stage} (${stageProgress[0].students} students)`);
      }
    } catch (error) {
      console.log(`❌ Stage progress query failed: ${error.message}`);
    }

    // Test 6: Materials Query
    console.log('\n6️⃣ Testing Materials Query...');
    try {
      const materialsQuery = `
        SELECT 
          m.*,
          CONCAT(u.first_name, ' ', u.last_name) as teacher_name,
          COALESCE(m.stage_id, 'عام') as stage_name
        FROM materials m
        JOIN teachers t ON m.teacher_id = t.id
        JOIN users u ON t.user_id = u.id
        WHERE 1=1
        ORDER BY m.created_at DESC
      `;
      
      const [materials] = await connection.execute(materialsQuery);
      console.log(`✅ Materials query successful: ${materials.length} materials found`);
      
      if (materials.length > 0) {
        console.log(`   - First material: ${materials[0].title} by ${materials[0].teacher_name}`);
      }
    } catch (error) {
      console.log(`❌ Materials query failed: ${error.message}`);
    }

    // Test 7: Admin Stats Query
    console.log('\n7️⃣ Testing Admin Stats Query...');
    try {
      const [totalUsers] = await connection.execute('SELECT COUNT(*) as count FROM users');
      const [pendingApprovals] = await connection.execute('SELECT COUNT(*) as count FROM users WHERE is_approved = 0 OR onboarding_status = "PENDING_REVIEW"');
      const [totalTeachers] = await connection.execute('SELECT COUNT(*) as count FROM teachers');
      const [totalStudents] = await connection.execute('SELECT COUNT(*) as count FROM students');
      const [certificateStats] = await connection.execute(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) as pending
        FROM certificates
      `);
      const [activeToasts] = await connection.execute('SELECT COUNT(*) as count FROM notifications WHERE read_flag = 0');
      const [totalComplaints] = await connection.execute('SELECT COUNT(*) as count FROM complaints');
      
      console.log(`✅ Admin stats query successful:`);
      console.log(`   - Total users: ${totalUsers[0].count}`);
      console.log(`   - Pending approvals: ${pendingApprovals[0].count}`);
      console.log(`   - Total teachers: ${totalTeachers[0].count}`);
      console.log(`   - Total students: ${totalStudents[0].count}`);
      console.log(`   - Total certificates: ${certificateStats[0].total}`);
      console.log(`   - Pending certificates: ${certificateStats[0].pending}`);
      console.log(`   - Active notifications: ${activeToasts[0].count}`);
      console.log(`   - Total complaints: ${totalComplaints[0].count}`);
    } catch (error) {
      console.log(`❌ Admin stats query failed: ${error.message}`);
    }

    console.log('\n🎉 Admin API Testing Complete!');
    console.log('\n📋 Summary:');
    console.log('If you see ✅ for all tests, the admin dashboard should work perfectly!');
    console.log('If you see ❌ for any test, that specific API will return 500 errors.');

  } catch (error) {
    console.error('❌ Connection error:', error);
  } finally {
    if (connection) await connection.end();
  }
}

testAdminAPIs();