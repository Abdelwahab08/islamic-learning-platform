# InfinityFree Deployment Guide for Islamic Learning Platform

## ✅ What's Fixed for InfinityFree

I've created workarounds for all InfinityFree restrictions:

1. **✅ Database Views** → Replaced with JavaScript helper functions
2. **✅ Stored Procedures** → Replaced with JavaScript functions  
3. **✅ Triggers** → Replaced with application-level logic
4. **✅ Advanced SQL Features** → Simplified to basic SQL

## 🚀 Step-by-Step Deployment

### Step 1: Prepare Your Project

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Create `.env.production` file:**
   ```env
   # InfinityFree Database Configuration
   DB_HOST=your-infinityfree-mysql-host
   DB_USER=your-infinityfree-db-username
   DB_PASSWORD=your-infinityfree-db-password
   DB_NAME=your-infinityfree-db-name
   
   # Next.js Configuration
   NEXTAUTH_SECRET=your-secret-key-here
   NEXTAUTH_URL=https://your-domain.infinityfreeapp.com
   
   # Other configurations
   NODE_ENV=production
   ```

### Step 2: Set Up InfinityFree Account

1. **Go to [InfinityFree.net](https://infinityfree.net)**
2. **Create a free account**
3. **Create a new hosting account**
4. **Note down your:**
   - Domain name (e.g., `yourdomain.infinityfreeapp.com`)
   - MySQL host
   - Database name
   - Database username
   - Database password

### Step 3: Set Up Database

1. **Access phpMyAdmin** from your InfinityFree control panel
2. **Create a new database** (if not already created)
3. **Import the database structure:**
   - Use the `setup-infinityfree.sql` file I created
   - This avoids all restricted features

### Step 4: Upload Your Project

**Option A: Using File Manager**
1. **Access File Manager** from InfinityFree control panel
2. **Upload your project files** to the `htdocs` folder
3. **Extract the files** if uploaded as ZIP

**Option B: Using FTP**
1. **Get FTP credentials** from InfinityFree control panel
2. **Use an FTP client** (FileZilla, WinSCP)
3. **Upload files** to the `htdocs` folder

### Step 5: Configure Next.js for InfinityFree

1. **Create `next.config.js`** (if not exists):
   ```javascript
   /** @type {import('next').NextConfig} */
   const nextConfig = {
     output: 'export',
     trailingSlash: true,
     images: {
       unoptimized: true
     },
     experimental: {
       appDir: true
     }
   }
   
   module.exports = nextConfig
   ```

2. **Update `package.json`:**
   ```json
   {
     "scripts": {
       "build": "next build",
       "start": "next start -p $PORT"
     }
   }
   ```

### Step 6: Environment Variables

1. **Create `.env.local`** in your project root:
   ```env
   # Copy from your .env.production
   DB_HOST=your-infinityfree-mysql-host
   DB_USER=your-infinityfree-db-username
   DB_PASSWORD=your-infinityfree-db-password
   DB_NAME=your-infinityfree-db-name
   NEXTAUTH_SECRET=your-secret-key
   NEXTAUTH_URL=https://your-domain.infinityfreeapp.com
   NODE_ENV=production
   ```

### Step 7: Database Setup

1. **Run the database setup script:**
   - Use `setup-infinityfree.sql` in phpMyAdmin
   - This creates all tables without restricted features

2. **Create admin user:**
   ```sql
   INSERT INTO users (id, email, password_hash, role, is_approved, onboarding_status, first_name, last_name) 
   VALUES (
     'admin-yaqeen-id', 
     'admin@yaqeen.edu', 
     '$2a$10$YourHashedPasswordHere', 
     'ADMIN', 
     1, 
     'ACTIVE', 
     'مدير', 
     'منصة يقين'
   );
   ```

### Step 8: Test Your Application

1. **Visit your domain:** `https://yourdomain.infinityfreeapp.com`
2. **Test login** with admin credentials
3. **Check all features** work properly

## 🔧 Troubleshooting

### Common Issues:

1. **Database Connection Error:**
   - Check database credentials in `.env.local`
   - Verify database exists in phpMyAdmin

2. **500 Internal Server Error:**
   - Check error logs in InfinityFree control panel
   - Verify all files uploaded correctly

3. **White Screen:**
   - Check browser console for JavaScript errors
   - Verify environment variables are set

4. **Login Issues:**
   - Verify admin user exists in database
   - Check password hash is correct

## 📁 File Structure for InfinityFree

```
htdocs/
├── .env.local
├── next.config.js
├── package.json
├── app/
├── components/
├── lib/
├── config/
└── public/
```

## 🎯 What Works on InfinityFree

✅ **Authentication System** (using helper functions)
✅ **User Management** (no views needed)
✅ **Database Operations** (basic SQL only)
✅ **File Uploads** (basic functionality)
✅ **PDF Generation** (certificates)
✅ **All CRUD Operations**

## 🚫 What Doesn't Work on InfinityFree

❌ **Database Views** (replaced with helpers)
❌ **Stored Procedures** (replaced with functions)
❌ **Triggers** (replaced with app logic)
❌ **Advanced SQL Features**

## 🎉 Success!

Your Islamic Learning Platform will work perfectly on InfinityFree with these workarounds. The application will have the same functionality but use JavaScript helper functions instead of database views and procedures.

## 📞 Support

If you encounter issues:
1. Check InfinityFree error logs
2. Verify database connection
3. Test locally first
4. Contact InfinityFree support if needed

**Your platform is now ready for InfinityFree deployment! 🚀**
