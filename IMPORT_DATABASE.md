# Import Database Schema - phpMyAdmin Guide

## ✅ Application Status
- **Application**: Running successfully on http://localhost:3006
- **Database**: Connected to `islamic_db` on localhost:3306
- **Configuration**: Updated in `.env` file

## 📋 Step-by-Step Database Import

### Step 1: Open phpMyAdmin
1. Go to: http://localhost/phpmyadmin/
2. Select the `islamic_db` database from the left sidebar

### Step 2: Import Schema Files (In Order)

#### Import 01_schema.sql
1. Click on the **"Import"** tab at the top
2. Click **"Choose File"** and select: `C:\Users\hopay\islamicproj\sql\01_schema.sql`
3. Click **"Go"** at the bottom
4. You should see: "MySQL returned an empty result set (i.e. zero rows). (Query took X.XXXX sec)"

#### Import 02_logic.sql
1. Click on the **"Import"** tab again
2. Click **"Choose File"** and select: `C:\Users\hopay\islamicproj\sql\02_logic.sql`
3. Click **"Go"** at the bottom
4. You should see success messages for stored procedures and triggers

#### Import 03_seed.sql
1. Click on the **"Import"** tab again
2. Click **"Choose File"** and select: `C:\Users\hopay\islamicproj\sql\03_seed.sql`
3. Click **"Go"** at the bottom
4. You should see success messages for sample data

### Step 3: Verify Database Structure
After importing, you should see these tables in phpMyAdmin:
- `users`
- `teachers`
- `students`
- `stages`
- `groups`
- `assignments`
- `submissions`
- `materials`
- `meetings`
- `certificates`
- `notifications`
- `complaints`
- `quran_surahs`
- `quran_ayahs`
- And more...

## 🔑 Test Login Accounts

After importing, you can test the application with these accounts:

### Admin User
- **Email**: admin@islamic.edu
- **Password**: admin123
- **URL**: http://localhost:3006/auth/login

### Teacher User
- **Email**: teacher@islamic.edu
- **Password**: teacher123

### Student User
- **Email**: student@islamic.edu
- **Password**: student123

## 🌐 Test the Application

1. **Home Page**: http://localhost:3006
2. **Login Page**: http://localhost:3006/auth/login
3. **Quran Page**: http://localhost:3006/quran
4. **Admin Dashboard**: http://localhost:3006/dashboard/admin (after login)

## 🔧 Troubleshooting

### If Import Fails
1. **Check file encoding**: Make sure files are UTF-8
2. **Check file size**: Some files might be large
3. **Check MySQL version**: Should be MySQL 8.0+
4. **Check permissions**: Make sure you have import privileges

### If Connection Fails
1. **Check MySQL service**: Ensure MySQL is running
2. **Check port**: Default is 3306
3. **Check credentials**: Verify username/password in `.env`
4. **Check database name**: Should be `islamic_db`

## 📊 Expected Results

After successful import:
- ✅ 20+ tables created
- ✅ Sample data loaded
- ✅ Stored procedures created
- ✅ Triggers configured
- ✅ Views created
- ✅ Default users available for testing

## 🚀 Next Steps

1. Import the database schema using phpMyAdmin
2. Test login with admin account
3. Explore the dashboard features
4. Test Quran browsing functionality
5. Try user registration flow

## 📞 Need Help?

If you encounter any issues:
1. Check the browser console for errors
2. Check the terminal for database connection messages
3. Verify all SQL files imported successfully
4. Ensure MySQL service is running
