# InfinityFree Deployment Guide for Islamic Learning Platform

## Prerequisites
- InfinityFree account (free hosting)
- Domain name (optional, InfinityFree provides free subdomain)
- MySQL database (provided by InfinityFree)

## Step 1: Prepare Your Project

### 1.1 Environment Configuration
Create a `.env.production` file with your InfinityFree database credentials:

```env
# Database Configuration
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

### 1.2 Build the Project
```bash
npm run build
```

## Step 2: InfinityFree Setup

### 2.1 Create InfinityFree Account
1. Go to [InfinityFree.net](https://infinityfree.net)
2. Sign up for a free account
3. Verify your email

### 2.2 Create Hosting Account
1. Login to InfinityFree control panel
2. Go to "Hosting" → "Create Account"
3. Choose your domain (free subdomain or custom domain)
4. Select PHP 8.1 or higher
5. Note down your FTP credentials

### 2.3 Create MySQL Database
1. Go to "MySQL Databases" in control panel
2. Create a new database
3. Note down:
   - Database name
   - Database username
   - Database password
   - Database host

## Step 3: Database Setup

### 3.1 Import Database Schema
1. Access phpMyAdmin from InfinityFree control panel
2. Select your database
3. Import the SQL schema (you'll need to create this from your local database)

### 3.2 Update Database Configuration
Update your `.env.production` with the InfinityFree database credentials.

## Step 4: File Upload

### 4.1 Prepare Files for Upload
Since InfinityFree doesn't support Node.js directly, we need to use a different approach:

#### Option A: Static Export (Recommended for InfinityFree)
```bash
# Add this to package.json scripts
"export": "next build && next export"

# Run static export
npm run export
```

#### Option B: Use Vercel (Recommended for Next.js)
1. Push your code to GitHub
2. Connect to Vercel
3. Deploy automatically

### 4.2 Upload to InfinityFree
1. Use FTP client (FileZilla, WinSCP)
2. Connect using your InfinityFree FTP credentials
3. Upload the `out` folder contents to `public_html`

## Step 5: Alternative Deployment Options

### Option 1: Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Option 2: Netlify
1. Push code to GitHub
2. Connect Netlify to GitHub
3. Build command: `npm run build`
4. Publish directory: `.next`

### Option 3: Railway
1. Connect GitHub repository
2. Railway will auto-deploy
3. Add environment variables

## Step 6: Environment Variables Setup

### For Vercel/Netlify/Railway:
Set these environment variables in your hosting platform:

```env
DB_HOST=your-infinityfree-mysql-host
DB_USER=your-infinityfree-db-username
DB_PASSWORD=your-infinityfree-db-password
DB_NAME=your-infinityfree-db-name
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://your-domain.vercel.app
```

## Step 7: Database Migration

### Create SQL Export Script
```javascript
// scripts/export-database.js
const mysql = require('mysql2/promise');
const fs = require('fs');

async function exportDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  // Export schema and data
  const tables = ['users', 'students', 'teachers', 'stages', 'groups', 'certificates', 'assignments', 'submissions', 'materials', 'meetings', 'complaints', 'notifications'];
  
  let sqlExport = '';
  
  for (const table of tables) {
    const [rows] = await connection.execute(`SHOW CREATE TABLE ${table}`);
    sqlExport += `\n-- Table structure for ${table}\n`;
    sqlExport += rows[0]['Create Table'] + ';\n\n';
    
    const [data] = await connection.execute(`SELECT * FROM ${table}`);
    if (data.length > 0) {
      sqlExport += `-- Data for ${table}\n`;
      sqlExport += `INSERT INTO ${table} VALUES\n`;
      const values = data.map(row => `(${Object.values(row).map(val => typeof val === 'string' ? `'${val.replace(/'/g, "''")}'` : val || 'NULL').join(', ')})`);
      sqlExport += values.join(',\n') + ';\n\n';
    }
  }
  
  fs.writeFileSync('database-export.sql', sqlExport);
  console.log('Database exported to database-export.sql');
  
  await connection.end();
}

exportDatabase().catch(console.error);
```

## Step 8: Post-Deployment

### 8.1 Test Your Application
1. Visit your deployed URL
2. Test all major functionalities
3. Check database connections
4. Verify file uploads work

### 8.2 SSL Certificate
- Vercel/Netlify provide automatic SSL
- For InfinityFree, SSL is included but may need activation

### 8.3 Custom Domain (Optional)
1. Purchase domain from any registrar
2. Point DNS to your hosting provider
3. Configure in hosting control panel

## Troubleshooting

### Common Issues:
1. **Database Connection**: Verify credentials and host
2. **Environment Variables**: Ensure all are set correctly
3. **Build Errors**: Check Node.js version compatibility
4. **File Permissions**: Ensure uploads directory is writable

### Support:
- InfinityFree: Community forums
- Vercel: Excellent documentation and support
- Netlify: Comprehensive guides

## Recommended Approach

For a Next.js application like yours, I recommend:

1. **Use Vercel** (best for Next.js)
   - Free tier available
   - Automatic deployments
   - Built-in SSL
   - Excellent performance

2. **Use InfinityFree MySQL** for database
   - Free MySQL hosting
   - Reliable service
   - Good for development/testing

3. **Alternative: Railway**
   - Full-stack deployment
   - Database included
   - Easy setup

## Final Notes

- InfinityFree is good for learning but has limitations
- For production, consider paid hosting or Vercel Pro
- Always backup your database before migration
- Test thoroughly before going live
