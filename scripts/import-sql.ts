import fs from "fs";
import path from "path";
import { executeQuery } from "../config/database";

function prep(sql: string) {
  return sql
    .replace(/\uFEFF/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/^\s*DELIMITER\s+.*$/gmi, "")
    .replace(/\/\*![0-9]+\s*/g, "/*!" )
    .replace(/DEFINER=`[^`]+`@`[^`]+`/g, "");
}

async function main() {
  const file = process.argv[2] || "db/railway_islamic_db.sql";
  const abs = path.resolve(process.cwd(), file);
  const raw = fs.readFileSync(abs, "utf8");
  const sql = prep(raw);
  const parts = sql
    .split(/;\s*\n/g)
    .map(s => s.trim())
    .filter(Boolean)
    .filter(s => !/^(--|#)/.test(s));

  let i = 0;
  for (const stmt of parts) {
    await executeQuery(stmt + ";");
    i++;
    if (i % 50 === 0) console.log(`Executed ${i} statements...`);
  }
  console.log(`Done. Executed ${i} statements.`);
  process.exit(0);
}

main().catch(e => {
  console.error("IMPORT FAILED:", e?.message || e);
  process.exit(1);
});


