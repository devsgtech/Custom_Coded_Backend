const pool = require('../config/database');

async function createUsersTable() {
    try {
        console.log('Creating users table...');
        const query = `
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `;
        
        await pool.query(query);
        console.log('Users table created successfully');
    } catch (error) {
        console.error('Error creating users table:', error);
        throw error;
    }
}

async function runMigrations() {
    try {
        await createUsersTable();
        console.log('All migrations completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

runMigrations(); 