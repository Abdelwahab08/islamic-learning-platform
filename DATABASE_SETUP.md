# Database Setup Guide

## ✅ Current Status
- **Database**: `islamic_db` on localhost:3306
- **Connection**: ✅ Working (tested)
- **Tables**: 21 tables created
- **Sample Data**: 3 users (admin, teacher, student)
- **Configuration**: Updated and working

## 🔧 Database Configuration

### Environment Variables (.env)
```env
# Database Configuration
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=islamic_db
DB_USER=root
DB_PASS=

# JWT Secret
JWT_SECRET=islamic_learning_platform_secret_key_2024

# Quran Audio Configuration
QURAN_AUDIO_BASE_URL=https://cdn.example.com/quran
DEFAULT_RECITER=mishary

# Session Configuration
SESSION_SECRET=islamic_learning_session_secret_2024

# File Upload Configuration
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
```

### Configuration Files
- **`config/database.ts`** - Main database configuration
- **`lib/db.ts`** - Re-exports from config (backward compatibility)

## 📋 Database Schema Status

### ✅ Imported Files
1. **`sql/01_schema.sql`** - All 20 tables created
2. **`sql/02_logic_minimal.sql`** - Views, functions, procedures
3. **`sql/03_seed.sql`** - Sample data (3 users, stages, Quran surahs)

### 📊 Database Structure
- **Tables**: 21 total
- **Users**: 3 sample users
- **Stages**: 5 learning stages
- **Quran**: 114 surahs
- **Views**: 1 (v_user_access)

## 🔐 Test Accounts

### Admin Account
- **Email**: `admin@islamic.edu`
- **Password**: `admin123`
- **Role**: ADMIN
- **Access**: `/dashboard/admin`

### Teacher Account
- **Email**: `teacher@islamic.edu`
- **Password**: `teacher123`
- **Role**: TEACHER
- **Access**: `/dashboard/teacher`

### Student Account
- **Email**: `student@islamic.edu`
- **Password**: `student123`
- **Role**: STUDENT
- **Access**: `/dashboard/student`

## 🚀 Testing the Application

### 1. Start the Application
```bash
npm run dev
```
Application runs on: http://localhost:3006

### 2. Test Login
1. Go to: http://localhost:3006/auth/login
2. Use any of the test accounts above
3. Should redirect to appropriate dashboard

### 3. Test Database Connection
```bash
node test-db.js
```

## 🔍 Troubleshooting

### If Login Doesn't Work:
1. **Check Database**: Run `node test-db.js`
2. **Check Environment**: Ensure `.env` file exists
3. **Check phpMyAdmin**: Verify `islamic_db` exists
4. **Check Tables**: Ensure all 21 tables are present

### Common Issues:
- **Port 3006 in use**: Run `taskkill /f /im node.exe`
- **Database connection failed**: Check MySQL service
- **Tables missing**: Re-import SQL files in phpMyAdmin

## 📁 File Structure
```
islamicproj/
├── config/
│   └── database.ts          # Database configuration
├── lib/
│   └── db.ts               # Database utilities
├── sql/
│   ├── 01_schema.sql       # Database schema
│   ├── 02_logic_minimal.sql # Views & procedures
│   └── 03_seed.sql         # Sample data
├── .env                    # Environment variables
├── test-db.js             # Database test script
└── DATABASE_SETUP.md      # This file
```

## ✅ Verification Checklist

- [ ] Database `islamic_db` exists in phpMyAdmin
- [ ] All 21 tables are created
- [ ] Sample users are present (3 users)
- [ ] Environment file `.env` is configured
- [ ] Application starts without errors
- [ ] Login works with test accounts
- [ ] Dashboards are accessible

## 🎯 Next Steps

1. **Test Login**: Try logging in with test accounts
2. **Explore Dashboards**: Check admin, teacher, and student views
3. **Test Quran Module**: Visit `/quran` page
4. **Add Real Data**: Create actual users and content

---

**Database is now fully configured and ready to use!** 🎉
