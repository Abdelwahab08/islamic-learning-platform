import mysql from 'mysql2/promise';

// Database configuration
export const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'islamic_db',
  charset: 'utf8mb4',
  timezone: '+00:00',
  connectionLimit: 10,
  queueLimit: 5,
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test connection function
export async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully to:', dbConfig.database);
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

// Initialize connection test
testConnection();

export default pool;

// Helper function to execute queries
export async function executeQuery<T = any>(
  query: string, 
  params: any[] = []
): Promise<T[]> {
  try {
    // Create a new connection instead of using the pool
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      database: process.env.DB_NAME || 'islamic_db',
      charset: 'utf8mb4',
      timezone: '+00:00'
    });
    
    try {
      const [rows] = await connection.execute(query, params);
      
      // Debug logging
      console.log('🔍 DEBUG: Query executed successfully, result type:', typeof rows);
      console.log('🔍 DEBUG: Is array:', Array.isArray(rows));
      console.log('🔍 DEBUG: Length:', Array.isArray(rows) ? rows.length : 'Not an array');
      
      if (!rows) {
        console.log('🔍 DEBUG: Rows is null/undefined, returning empty array');
        return [];
      }
      
      if (!Array.isArray(rows)) {
        console.log('🔍 DEBUG: Rows is not an array, converting to array');
        return [rows] as T[];
      }
      
      return rows as T[];
    } finally {
      await connection.end();
    }
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Helper function to execute single row queries
export async function executeQuerySingle<T = any>(
  query: string, 
  params: any[] = []
): Promise<T | null> {
  try {
    // Create a new connection instead of using the pool
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      database: process.env.DB_NAME || 'islamic_db',
      charset: 'utf8mb4',
      timezone: '+00:00'
    });
    
    try {
      const [rows] = await connection.execute(query, params);
      const results = rows as T[];
      return results.length > 0 ? results[0] : null;
    } finally {
      await connection.end();
    }
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Helper function to execute insert/update/delete
export async function executeUpdate(
  query: string, 
  params: any[] = []
): Promise<{ affectedRows: number; insertId?: number }> {
  try {
    // Create a new connection instead of using the pool
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      database: process.env.DB_NAME || 'islamic_db',
      charset: 'utf8mb4',
      timezone: '+00:00'
    });
    
    try {
      const [result] = await connection.execute(query, params);
      return result as any;
    } finally {
      await connection.end();
    }
  } catch (error) {
    console.error('Database update error:', error);
    throw error;
  }
}
