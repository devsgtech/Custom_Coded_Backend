const mysql = require('mysql2/promise');
require('dotenv').config();

// Create a connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: process.env.SSL_ENABLED === 'true' ? {
        rejectUnauthorized: false,
        minVersion: process.env.SSL_TLS_VERSION
    } : undefined
});

// Test the connection
const testConnection = async () => {
    try {
        console.log('Attempting to connect to database...');
        
        // Try to get a connection
        const connection = await pool.getConnection();
        console.log('Database connected successfully');
        
        // Test a simple query
        const [result] = await connection.query('SELECT 1');
        console.log('Query test successful:', result);
        
        // Release the connection
        connection.release();
        return true;
    } catch (err) {
        console.error('Database connection failed:', err);
        console.error('Error details:', {
            code: err.code,
            errno: err.errno,
            sqlState: err.sqlState,
            sqlMessage: err.sqlMessage
        });
        return false;
    }
};

// Test connection immediately
testConnection();

module.exports = pool; 