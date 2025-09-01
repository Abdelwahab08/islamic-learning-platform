@echo off
echo Updating .env file for phpMyAdmin...

(
echo # Database Configuration
echo DB_HOST=127.0.0.1
echo DB_PORT=3306
echo DB_NAME=islamic_db
echo DB_USER=root
echo DB_PASS=
echo.
echo # JWT Secret
echo JWT_SECRET=islamic_learning_platform_secret_key_2024
echo.
echo # Quran Audio Configuration
echo QURAN_AUDIO_BASE_URL=https://cdn.example.com/quran
echo DEFAULT_RECITER=mishary
echo.
echo # Session Configuration
echo SESSION_SECRET=islamic_learning_session_secret_2024
echo.
echo # File Upload Configuration
echo UPLOAD_DIR=./uploads
echo MAX_FILE_SIZE=10485760
) > .env

echo .env file updated successfully!
echo.
echo Please make sure to:
echo 1. Set your MySQL password in the DB_PASS field if needed
echo 2. Import the database schema using phpMyAdmin
echo 3. Restart the application
pause
