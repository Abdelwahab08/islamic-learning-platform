# InfinityFree Setup Guide

## Step 1: Get Your Database Credentials

1. **Log into InfinityFree** (infinityfree.net)
2. **Go to your hosting control panel**
3. **Find MySQL database details:**
   - Host: `sql.infinityfree.com` (or similar)
   - Database name: `yourusername_dbname`
   - Username: `yourusername_dbname`
   - Password: (your database password)

## Step 2: Create Environment File

Create `.env.local` in your project root:

```env
DB_HOST=your-infinityfree-mysql-host
DB_USER=your-infinityfree-db-username
DB_PASSWORD=your-infinityfree-db-password
DB_NAME=your-infinityfree-db-name
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=https://your-domain.infinityfreeapp.com
NODE_ENV=production
```

## Step 3: Set Up Database

1. **Access phpMyAdmin** from InfinityFree control panel
2. **Create database** (if not exists)
3. **Import the SQL file:**
   - Use `setup-infinityfree.sql` in phpMyAdmin
   - This creates all tables without restricted features

## Step 4: Create Admin User

Run this script to create admin user:

```bash
node setup-infinityfree-simple.js
```

**Login credentials:**
- Email: `admin@yaqeen.edu`
- Password: `Admin321&yakeen`

## Step 5: Upload to InfinityFree

1. **Build your project:**
   ```bash
   npm run build
   ```

2. **Upload files** to `htdocs` folder using:
   - File Manager in InfinityFree control panel, OR
   - FTP client (FileZilla, WinSCP)

3. **Upload these files:**
   - `.env.local`
   - `package.json`
   - `next.config.js`
   - `app/` folder
   - `components/` folder
   - `lib/` folder
   - `config/` folder
   - `public/` folder

## Step 6: Test Your Application

1. **Visit your domain:** `https://yourdomain.infinityfreeapp.com`
2. **Login with admin credentials**
3. **Test all features**

## What's Fixed for InfinityFree

✅ **Database Views** → Replaced with JavaScript helper functions
✅ **Stored Procedures** → Replaced with JavaScript functions  
✅ **Triggers** → Replaced with application-level logic
✅ **Advanced SQL Features** → Simplified to basic SQL

## Troubleshooting

- **Database connection error:** Check credentials in `.env.local`
- **500 error:** Check error logs in InfinityFree control panel
- **White screen:** Check browser console for JavaScript errors
- **Login issues:** Verify admin user exists in database

Your platform is now ready for InfinityFree! 🚀
