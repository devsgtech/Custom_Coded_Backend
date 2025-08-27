const bcryptjs = require('bcryptjs');
const pool = require('../config/database');
const authService = require('./authService');
const bcrypt = require('bcryptjs');

const adminService = {
    // Find admin by email
    findAdminByEmail: async (email) => {
        try {
            const query = 'SELECT * FROM tbl_admin_users WHERE email = ? AND is_deleted = 0';
            const [rows] = await pool.execute(query, [email]);
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
            const isMatch = await bcryptjs.compare(password, hashedPassword);
            return isMatch;
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
    },

    fetchSecurityQuestions: async (admin_id) => {
        console.log('Fetching security questions for admin_id:', admin_id);
        try {
            const query = `
                SELECT
                    tsq.id,
                    tsq.question
                FROM
                    tbl_security_questions tsq
                INNER JOIN
                    tbl_security_question_ans_mapping tsqam ON tsq.id = tsqam.question_id
                WHERE
                    tsqam.admin_user_id = ?
            `;
            const [rows] = await pool.execute(query, [admin_id]);
            return rows;
        } catch (error) {
            console.error('Error fetching security questions:', {
                message: error.message,
                code: error.code,
                errno: error.errno,
                sqlState: error.sqlState,
                sqlMessage: error.sqlMessage
            });
            throw new Error(`Failed to fetch security questions: ${error.message}`);
        }
    },

    verifySecurityAnswer: async (admin_user_id, question_id, answer) => {
        try {
            const query = 'SELECT answer FROM tbl_security_question_ans_mapping WHERE admin_user_id = ? AND question_id = ?';
            const [rows] = await pool.execute(query, [admin_user_id, question_id]);
            if (rows.length === 0) {
                return false;
            }
            const hashedPassword = rows[0].answer;
            console.log(hashedPassword)
            const isMatch = await bcryptjs.compare(answer, hashedPassword);
            console.log(isMatch);
            return isMatch;
        } catch (error) {
            console.error('Error verifying security answer:', {
                message: error.message,
                code: error.code,
                errno: error.errno,
                sqlState: error.sqlState,
                sqlMessage: error.sqlMessage
            });
            throw new Error(`Failed to verify security answer: ${error.message}`);
        }
    }
};

module.exports = adminService;