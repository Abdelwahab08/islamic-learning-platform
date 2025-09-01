# Islamic DB2 Migration to Railway

## Option 1: Export from phpMyAdmin (Recommended)

1. **Access your original islamic_db2 database** through phpMyAdmin or your database management tool

2. **Export the database:**
   - Go to phpMyAdmin
   - Select `islamic_db2` database
   - Click "Export" tab
   - Choose "Custom" export method
   - Select "Add DROP TABLE / VIEW / PROCEDURE / FUNCTION / EVENT / TRIGGER statement"
   - Select "Add CREATE TABLE statement"
   - Select "Add INSERT statement"
   - **Exclude surahs table** (uncheck it in the table list)
   - Click "Go" to download the SQL file

3. **Save the exported file** as `islamic-db2-complete.sql` in your project root

4. **Run the import script:**
   ```bash
   node import-to-railway.js
   ```

## Option 2: Use the export script

1. **Update the database connection** in `export-islamic-db2.js`:
   ```javascript
   const originalDbConfig = {
     host: 'localhost', // your original database host
     user: 'root', // your original database user
     password: 'your_password', // your original database password
     database: 'islamic_db2'
   };
   ```

2. **Run the export script:**
   ```bash
   node export-islamic-db2.js
   ```

3. **Run the import script:**
   ```bash
   node import-to-railway.js
   ```

## Option 3: Manual SQL file

If you already have a SQL export file:

1. **Place your SQL file** in the project root with one of these names:
   - `islamic-db2-complete.sql`
   - `export.sql`
   - `database.sql`

2. **Run the import script:**
   ```bash
   node import-to-railway.js
   ```

## What gets imported:

✅ **Included:**
- All table structures (CREATE TABLE statements)
- All data from users, teachers, students, certificates, materials, meetings, assignments, etc.
- All relationships and foreign keys
- All stored procedures and functions

❌ **Excluded:**
- Surahs table and related data (as requested)

## After import:

1. **Test the admin dashboard:**
   - Login as admin
   - Check "الشهادات والقوالب" (Certificates & Templates)
   - Check "المحتوى والإشعارات" (Content & Notifications)  
   - Check "التقارير العامة" (General Reports)

2. **Test student dashboard:**
   - Login as student
   - Verify all sections load without errors

3. **Test teacher dashboard:**
   - Login as teacher
   - Verify all functionality works

## Troubleshooting:

- If you get connection errors, make sure your Railway `MYSQL_URL` is set correctly
- If you get foreign key errors, the import script will skip them and continue
- If tables already exist, they will be dropped and recreated
- Check the console output for any specific error messages

## Clean up:

After successful migration, you can delete these temporary files:
- `export-islamic-db2.js`
- `import-to-railway.js`
- `MIGRATION-GUIDE.md`
- Any SQL export files

