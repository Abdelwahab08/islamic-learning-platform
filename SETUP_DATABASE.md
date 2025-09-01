# Database Setup Guide for Islamic Learning Platform

## 🎉 Application Status
✅ **Application is running successfully on http://localhost:3006**

## 📋 Database Setup Instructions

### 1. Install MySQL 8.0+
You need to install MySQL 8.0 or higher. You can download it from:
- **MySQL Community Server**: https://dev.mysql.com/downloads/mysql/
- **XAMPP** (includes MySQL + phpMyAdmin): https://www.apachefriends.org/
- **WAMP** (Windows): https://www.wampserver.com/

### 2. Start MySQL Service
After installation, make sure MySQL is running:
- **Windows**: Check Services app for "MySQL80" or "MySQL"
- **XAMPP**: Start MySQL from XAMPP Control Panel
- **WAMP**: Start WAMP and ensure MySQL is running

### 3. Create Database
Open MySQL command line or phpMyAdmin and run:

```sql
CREATE DATABASE islamic_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4. Import Database Schema
Import the SQL files in this order:

#### Option A: Using phpMyAdmin
1. Open phpMyAdmin (usually http://localhost/phpmyadmin)
2. Select the `islamic_db` database
3. Go to "Import" tab
4. Import files in this order:
   - `sql/01_schema.sql`
   - `sql/02_logic.sql`
   - `sql/03_seed.sql`

#### Option B: Using MySQL Command Line
```bash
# Navigate to your project directory
cd C:\Users\hopay\islamicproj

# Import schema files
mysql -u root -p islamic_db < sql/01_schema.sql
mysql -u root -p islamic_db < sql/02_logic.sql
mysql -u root -p islamic_db < sql/03_seed.sql
```

### 5. Configure Database Connection
Update the `.env` file with your MySQL credentials:

```env
# Database Configuration
DB_HOST=127.0.0.1
DB_PORT=3306          # Change to 3306 if using default MySQL port
DB_NAME=islamic_db
DB_USER=root
DB_PASS=your_password_here  # Replace with your MySQL password
```

### 6. Test Database Connection
After setting up the database, restart the application:

```bash
# Stop the current server (Ctrl+C)
# Then restart
npm run dev
```

## 🔑 Default Users (Created by seed data)

After importing the database, you can login with these accounts:

### Admin User
- **Email**: admin@islamic.edu
- **Password**: admin123

### Teacher User
- **Email**: teacher@islamic.edu
- **Password**: teacher123

### Student User
- **Email**: student@islamic.edu
- **Password**: student123

## 🌐 Access the Application

Once everything is set up:
- **Home Page**: http://localhost:3006
- **Login**: http://localhost:3006/auth/login
- **Admin Dashboard**: http://localhost:3006/dashboard/admin (after login as admin)

## 🔧 Troubleshooting

### Database Connection Issues
1. **Check MySQL is running**: Ensure MySQL service is started
2. **Verify credentials**: Check username/password in `.env`
3. **Check port**: Default MySQL port is 3306, not 3308
4. **Test connection**: Try connecting with MySQL client

### Common Errors
- **ECONNREFUSED**: MySQL not running or wrong port
- **Access denied**: Wrong username/password
- **Database not found**: Database not created

### Reset Database
If you need to start fresh:
```sql
DROP DATABASE IF EXISTS islamic_db;
CREATE DATABASE islamic_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## 📊 Database Structure

The application includes:
- **20 tables** for complete educational management
- **Stored procedures** for business logic
- **Triggers** for automatic notifications
- **Views** for user access control
- **Sample data** for testing

## 🚀 Next Steps

After database setup:
1. Login with admin account
2. Explore the dashboard features
3. Test Quran browsing functionality
4. Try user registration and approval flow

## 📞 Support

If you encounter issues:
1. Check the console for error messages
2. Verify database connection settings
3. Ensure all SQL files were imported successfully
4. Check that MySQL is running on the correct port
