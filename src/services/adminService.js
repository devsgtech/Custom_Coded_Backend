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
            console.error('Database error in findAdminByEmail:', error);
            throw new Error('Database error occurred');
        }
    },

    // Create admin session with token
    createAdminSession: async (adminId, token, tokenExpiry, ipAddress) => {
        try {
            const query = `
                INSERT INTO tbl_admin_session_details 
                (admin_id, token, token_expiry, session_start, session_ip, session_end) 
                VALUES (?, ?, ?, NOW(), ?, DATE_ADD(NOW(), INTERVAL 15 MINUTE))
            `;
            const [result] = await pool.execute(query, [
                adminId,
                token,
                tokenExpiry,
                ipAddress
            ]);
            console.log('Session created with ID:', result.insertId);
            return result.insertId;
        } catch (error) {
            console.error('Error creating admin session:', error);
            throw new Error('Failed to create session');
        }
    },

    // Verify password
    verifyPassword: async (password, hashedPassword) => {
        try {
            // Since we're storing plain passwords for testing, we'll do direct comparison
            return password === hashedPassword;
        } catch (error) {
            console.error('Error verifying password:', error);
            throw new Error('Password verification failed');
        }
    },

    // Generate JWT token
    generateToken: (admin) => {
        return authService.generateToken(admin);
    },

    // Get token expiry date
    getTokenExpiry: () => {
        return authService.getTokenExpiry();
    }
};

module.exports = adminService; 