const bcrypt = require('bcryptjs');
const pool = require('../config/database');
const authService = require('./authService');

const userService = {
    // Find user by code_id
    findUserByCodeID: async (code_id) => {
        try {
            console.log('Searching for user with code id:', code_id);
            const query = 'SELECT * FROM tbl_generated_code WHERE generated_code_id = ? AND is_active = 1';
            console.log('Executing query:', query);
            const [rows] = await pool.execute(query, [code_id]);
            console.log('Query result:', rows);
            return rows[0];
        } catch (error) {
            console.error('Database error in findUserByCodeID:', {
                message: error.message,
                code: error.code,
                errno: error.errno,
                sqlState: error.sqlState,
                sqlMessage: error.sqlMessage
            });
            throw new Error(`Database error: ${error.message}`);
        }
    },
    // Verify Code
    verifyCode: async (clientCode, DBCode) => {
        console.log("clientCode",clientCode)
        console.log("DBCode",DBCode)
        try {
            return clientCode === DBCode;
        } catch (error) {
            console.error('Error verifying Code:', error);
            throw new Error(`Invalid Code: ${error.message}`);
        }
    },
    // Generate User JWT token
    generateUserToken: (user) => {
        try {
            return authService.generateUserTokenAuth(user);
        } catch (error) {
            console.error('Error generating User token:', error);
            throw new Error(`User token generation failed: ${error.message}`);
        }
    },
    // Create User session with token
    createUserSession: async (code_id, token, tokenExpiry, ipAddress,log_type, session_timezone, session_country) => {
        try {
            const query = `
                INSERT INTO tbl_user_session 
                (code_id, token, token_expiry, session_start, session_ip, session_end, log_type, session_timezone, country) 
                VALUES (?, ?, ?, NOW(), ?, DATE_ADD(NOW(), INTERVAL 10 HOUR), ?, ?, ?)
            `;
            console.log('Creating session with params:', { code_id, tokenExpiry, ipAddress });
            const [result] = await pool.execute(query, [
                code_id,
                token,
                tokenExpiry,
                ipAddress,
                log_type,
                session_timezone,
                session_country
            ]);
            console.log('USER Session created with ID:', result.insertId);
            return result.insertId;
        } catch (error) {
            console.error('Error creating USER session:', {
                message: error.message,
                code: error.code,
                errno: error.errno,
                sqlState: error.sqlState,
                sqlMessage: error.sqlMessage
            });
            throw new Error(`Failed to create USER session: ${error.message}`);
        }
    },

    // Get User token expiry date
    getUserTokenExpiry: () => {
        try {
            return authService.getUserTokenExpiryAuth();
        } catch (error) {
            console.error('Error getting token expiry:', error);
            throw new Error(`Failed to get token expiry: ${error.message}`);
        }
    }
};

module.exports = userService; 