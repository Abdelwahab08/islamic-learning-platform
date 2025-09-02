const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function main() {
  try {
    const email = process.argv[2] || 'admin@yaqeen.edu';
    const newPassword = process.argv[3] || 'admin123';

    if (!process.env.MYSQL_URL) {
      console.error('❌ MYSQL_URL not set in environment');
      process.exit(1);
    }

    console.log('🔗 Connecting to Railway MySQL...');
    const conn = await mysql.createConnection(process.env.MYSQL_URL);

    console.log(`🔐 Generating hash for ${email} ...`);
    const hash = await bcrypt.hash(newPassword, 12);

    const [res] = await conn.execute(
      'UPDATE users SET password_hash = ?, is_approved = 1, onboarding_status = "ACTIVE" WHERE email = ?',
      [hash, email]
    );
    console.log('✅ Update result:', res && res.affectedRows);

    const [rows] = await conn.execute(
      'SELECT email, role, is_approved, onboarding_status, LENGTH(password_hash) AS hash_len FROM users WHERE email = ?',
      [email]
    );
    console.log('📄 User row:', rows);

    await conn.end();
    console.log('✅ Done');
  } catch (e) {
    console.error('❌ Error:', e.message);
    process.exit(1);
  }
}

main();


