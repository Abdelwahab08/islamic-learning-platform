# PowerShell script to update .env file for phpMyAdmin
Write-Host "Updating .env file for phpMyAdmin connection..." -ForegroundColor Green

$envContent = @"
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
"@

$envContent | Out-File -FilePath ".env" -Encoding UTF8

Write-Host ".env file updated successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Import the database schema using phpMyAdmin" -ForegroundColor White
Write-Host "2. Restart the application" -ForegroundColor White
Write-Host ""
Write-Host "Database schema files to import:" -ForegroundColor Cyan
Write-Host "- sql/01_schema.sql" -ForegroundColor White
Write-Host "- sql/02_logic.sql" -ForegroundColor White
Write-Host "- sql/03_seed.sql" -ForegroundColor White
