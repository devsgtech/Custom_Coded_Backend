const pool = require('../config/database');

async function updateAdminSessionTable() {
    try {
        console.log('Adding token columns to admin session table...');
        
        // Add only token and token_expiry columns
        const alterQueries = [
            `ALTER TABLE tbl_admin_session_details 
             ADD COLUMN token VARCHAR(500) NOT NULL AFTER admin_id`,
            
            `ALTER TABLE tbl_admin_session_details 
             ADD COLUMN token_expiry DATETIME NOT NULL AFTER token`
        ];

        // Execute each alter query
        for (const query of alterQueries) {
            try {
                await pool.query(query);
                console.log('Successfully added column');
            } catch (error) {
                // Ignore errors for columns that already exist
                if (error.code === 'ER_DUP_FIELDNAME') {
                    console.log('Column already exists, skipping...');
                } else {
                    throw error;
                }
            }
        }

        console.log('Admin session table updated successfully');
    } catch (error) {
        console.error('Error updating admin session table:', error);
        throw error;
    }
}

async function runMigration() {
    try {
        await updateAdminSessionTable();
        console.log('Migration completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

runMigration(); 