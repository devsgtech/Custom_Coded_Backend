const bcrypt = require('bcryptjs');
const pool = require('../config/database');
const authService = require('./authService');

const adminService = {
    // Find admin by email
    findAdminByEmail: async (email) => {
        try {
            console.log('Searching for admin with email:', email);
            const query = 'SELECT * FROM tbl_admin_users WHERE email = ? AND is_deleted = 0';
            console.log('Executing query:', query);
            const [rows] = await pool.execute(query, [email]);
            console.log('Query result:', rows);
            return rows[0];
        } catch (error) {
            console.error('Database error in findAdminByEmail:', {
                message: error.message,
                code: error.code,
                errno: error.errno,
                sqlState: error.sqlState,
                sqlMessage: error.sqlMessage
            });
            throw new Error(`Database error: ${error.message}`);
        }
    },

    // Create admin session with token
    createAdminSession: async (adminId, token, tokenExpiry, ipAddress) => {
        try {
            const query = `
                INSERT INTO tbl_admin_session_details 
                (admin_id, token, token_expiry, session_start, session_ip, session_end) 
                VALUES (?, ?, ?, NOW(), ?, DATE_ADD(NOW(), INTERVAL 10 HOUR))
            `;
            console.log('Creating session with params:', { adminId, tokenExpiry, ipAddress });
            const [result] = await pool.execute(query, [
                adminId,
                token,
                tokenExpiry,
                ipAddress
            ]);
            console.log('Session created with ID:', result.insertId);
            return result.insertId;
        } catch (error) {
            console.error('Error creating admin session:', {
                message: error.message,
                code: error.code,
                errno: error.errno,
                sqlState: error.sqlState,
                sqlMessage: error.sqlMessage
            });
            throw new Error(`Failed to create session: ${error.message}`);
        }
    },

    // Verify password
    verifyPassword: async (password, hashedPassword) => {
        try {
            // Since we're storing plain passwords for testing, we'll do direct comparison
            return password === hashedPassword;
        } catch (error) {
            console.error('Error verifying password:', error);
            throw new Error(`Password verification failed: ${error.message}`);
        }
    },

    // Generate JWT token
    generateToken: (admin) => {
        try {
            return authService.generateToken(admin);
        } catch (error) {
            console.error('Error generating token:', error);
            throw new Error(`Token generation failed: ${error.message}`);
        }
    },

    // Get token expiry date
    getTokenExpiry: () => {
        try {
            return authService.getTokenExpiry();
        } catch (error) {
            console.error('Error getting token expiry:', error);
            throw new Error(`Failed to get token expiry: ${error.message}`);
        }
    }
};

module.exports = adminService; 