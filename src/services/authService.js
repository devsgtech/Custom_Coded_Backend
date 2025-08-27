const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const { SessionTime } = require("../config/constants")

const authService = {
    // ---------------------------------------- ADMIN ------------------------------------
    // Generate JWT token
    generateToken: (admin) => {
        try {
            const token = jwt.sign(
                { 
                    id: admin.admin_id,
                    email: admin.email,
                    name: admin.name,
                    role: admin.role
                },
                process.env.JWT_SECRET,
                { expiresIn: SessionTime.ADMIN_JWT_TOKEN_EXPIRE_TIME } // Set a longer expiry since we'll handle inactivity separately
            );
            return token;
        } catch (error) {
            console.error('Error generating admin token:', error);
            throw new Error('Admin token generation failed');
        }
    },

    // Get token expiry date (24 hours from now)
    getTokenExpiry: () => {
        const expiry = new Date();
        expiry.setHours(expiry.getHours() + SessionTime.ADMIN_TOKEN_EXPIRY_TIME);
        return expiry;
    },

    // Verify admin exists
    verifyAdmin: async (adminId) => {
        try {
            const query = 'SELECT admin_id FROM tbl_admin_users WHERE admin_id = ?';
            const [rows] = await pool.execute(query, [adminId]);
            return rows.length > 0;
        } catch (error) {
            console.error('Error verifying admin:', error);
            throw new Error('Failed to verify admin');
        }
    },

    // Update session end time
    updateSessionEnd: async (adminId, token) => {
        try {
            // const query = `
            //     UPDATE tbl_admin_session_details 
            //     SET session_end = DATE_ADD(NOW(), INTERVAL 15 MINUTE)
            //     WHERE admin_id = ? AND token = ?
            // `;

            const query = `
                UPDATE tbl_admin_session_details 
                SET session_end = DATE_ADD(NOW(), INTERVAL 10 HOUR)
                WHERE admin_id = ? AND token = ?
            `;
            await pool.execute(query, [adminId, token]);
            return true;
        } catch (error) {
            console.error('Error updating session end:', error);
            return false;
        }
    },

    // Verify admin token
    verifyAdminToken: async (adminId, token) => {
        try {
            console.log('Verifying token for admin_id:', adminId);
            console.log('Token:', token);
            
            // // First verify the token is valid and get the payload
            // const decoded = jwt.verify(token, process.env.JWT_SECRET);
            // console.log('Decoded token:', decoded.id);
            // console.log("adminId", adminId);
            
            // // Check if the token payload matches the admin_id
            // if (decoded.id != adminId) {
            //     console.log('Token admin_id mismatch');
            //     return false;
            // }

            // Check if token exists and session hasn't expired
            const query = `
                SELECT * FROM tbl_admin_session_details 
                WHERE admin_id = ? AND token = ? 
                AND session_end > NOW()
            `;
            const [rows] = await pool.execute(query, [adminId, token]);
            
            if (rows.length > 0) {
                console.log('Token verified successfully');
                // Update session end time to current time + 15 minutes
                await authService.updateSessionEnd(adminId, token);
                return true;
            }
            
            console.log('Token session expired');
            return false;
        } catch (error) {
            console.error('Error verifying admin token:', {
                message: error.message,
                stack: error.stack,
                adminId
            });
            return false;
        }
    },

// ---------------------------------------- USER ------------------------------------
    // Generate User JWT token
    generateUserTokenAuth: (user) => {
        try {
            const token = jwt.sign(
                { 
                    code_id: user.code_id,
                    generated_code_id: user.generated_code_id,
                },
                process.env.JWT_SECRET,
                { expiresIn: SessionTime.USER_JWT_TOKEN_EXPIRE_TIME } // Set a longer expiry since we'll handle inactivity separately
            );
            return token;
        } catch (error) {
            console.error('Error generating User token:', error);
            throw new Error('User token generation failed');
        }
    },

    // Get token expiry date (24 hours from now)
    getUserTokenExpiryAuth: () => {
        const expiry = new Date();
        expiry.setHours(expiry.getHours() + SessionTime.USER_TOKEN_EXPIRY_TIME);
        return expiry;
    },
};

module.exports = authService; 