/*
  Robust SQL importer for Railway MySQL.
  - Handles DELIMITER changes (e.g., $$) used by procedures/triggers
  - Streams the file line-by-line to avoid memory spikes
  Usage:
    MYSQL_URL="mysql://root:pass@host:port/db" node scripts/import_sql.js "C:\\path\\to\\file.sql"
*/
const fs = require('fs');
const readline = require('readline');
const mysql = require('mysql2/promise');

async function importSql(filePath, mysqlUrl) {
  if (!filePath) throw new Error('Missing SQL file path');
  if (!mysqlUrl) throw new Error('Missing MYSQL_URL');

  const connection = await mysql.createConnection(mysqlUrl);
  console.log(`🔗 Connected to DB: ${mysqlUrl.replace(/:\\S+@/, '://****@')}`);

  const rl = readline.createInterface({
    input: fs.createReadStream(filePath, { encoding: 'utf8' }),
    crlfDelay: Infinity,
  });

  let delimiter = ';';
  let buffer = '';
  let total = 0;
  let ok = 0;
  let fail = 0;

  function isDelimiterLine(line) {
    const m = line.trim().match(/^DELIMITER\s+(.+)$/i);
    return m ? m[1] : null;
  }

  async function flushIfComplete(lineEnd) {
    const trimmed = buffer.trim();
    if (!trimmed) return;
    try {
      await connection.query(trimmed);
      ok += 1;
    } catch (err) {
      fail += 1;
      // Ignore idempotent/exists errors; log others succinctly
      const msg = String(err && err.message || err);
      if (!/already exists|Duplicate entry|Unknown column/.test(msg)) {
        console.warn(`⚠️  SQL error: ${msg.substring(0, 180)}`);
      }
    } finally {
      total += 1;
      buffer = '';
      if (total % 25 === 0) {
        console.log(`... processed ${total} statements (✅ ${ok}, ❌ ${fail})`);
      }
    }
  }

  for await (const rawLine of rl) {
    let line = rawLine;
    const newDelim = isDelimiterLine(line);
    if (newDelim !== null) {
      // Flush any pending statement before delimiter change
      if (buffer.trim()) {
        await flushIfComplete();
      }
      delimiter = newDelim;
      continue;
    }

    // Accumulate
    buffer += line + '\n';

    // Check if buffer ends with current delimiter at end of line (ignoring whitespace)
    const endTrim = buffer.trimEnd();
    if (endTrim.endsWith(delimiter)) {
      // Remove trailing delimiter
      buffer = endTrim.slice(0, -delimiter.length);
      await flushIfComplete();
    }
  }

  // Final flush
  if (buffer.trim()) {
    await flushIfComplete();
  }

  console.log(`\n✅ Import finished. Total: ${total}, OK: ${ok}, Failed: ${fail}`);
  await connection.end();
}

(async () => {
  try {
    const filePath = process.argv[2];
    const mysqlUrl = process.env.MYSQL_URL;
    console.log(`📄 Importing file: ${filePath}`);
    await importSql(filePath, mysqlUrl);
  } catch (err) {
    console.error('❌ Import failed:', err);
    process.exit(1);
  }
})();


