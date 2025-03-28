const pool = require('../config/database');

async function createAdminUsersTable() {
    try {
        console.log('Creating admin_users table...');
        const query = `
            CREATE TABLE IF NOT EXISTS tbl_admin_users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `;
        
        await pool.query(query);
        console.log('Admin users table created successfully');

        // Insert static admin credentials
        const insertQuery = `
            INSERT INTO tbl_admin_users (email, password) VALUES 
            ('admin1@example.com', 'Admin@123'),
            ('admin2@example.com', 'Admin@456'),
            ('admin3@example.com', 'Admin@789'),
            ('admin4@example.com', 'Admin@012')
            ON DUPLICATE KEY UPDATE
            password = VALUES(password)
        `;
        
        await pool.query(insertQuery);
        console.log('Static admin credentials inserted successfully');
    } catch (error) {
        console.error('Error creating admin users table:', error);
        throw error;
    }
}

async function runMigration() {
    try {
        await createAdminUsersTable();
        console.log('Migration completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

runMigration(); 