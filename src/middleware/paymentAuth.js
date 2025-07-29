const jwtUtils = require('../utils/jwtUtils');
const response = require('../utils/response');

const paymentAuth = {
    // Middleware to verify JWT token and validate code_id
    verifyTokenAndCode: (req, res, next) => {
        try {
            // 1. Verify JWT token - check multiple sources
            const token = req.headers.authorization?.replace('Bearer ', '') || 
                         req.headers.token || 
                         req.body.token ||
                         req.query.token;
            const decoded = jwtUtils.verifyTokenAndRespond(res, token, process.env.JWT_SECRET);
            if (!decoded) return; // Response already sent

            // 2. Check code_id matches user (for endpoints that require code_id)
            const code_id = req.body.code_id || req.params.code_id;
            if (code_id) {
                const user_id = decoded;
                if (code_id !== user_id.generated_code_id) {
                    return response.unauthorized(res, "Invalid Code Id");
                }
            }

            // Add decoded user info to request
            req.user = decoded;
            next();
        } catch (error) {
            console.error('Payment auth error:', error);
            return response.unauthorized(res, "Authentication failed");
        }
    },

    // Middleware to verify JWT token only (for webhook and other endpoints)
    verifyTokenOnly: (req, res, next) => {
        try {
            // 1. Verify JWT token - check multiple sources
            const token = req.headers.authorization?.replace('Bearer ', '') || 
                         req.headers.token || 
                         req.body.token ||
                         req.query.token;
            const decoded = jwtUtils.verifyTokenAndRespond(res, token, process.env.JWT_SECRET);
            if (!decoded) return; // Response already sent

            // Add decoded user info to request
            req.user = decoded;
            next();
        } catch (error) {
            console.error('Payment auth error:', error);
            return response.unauthorized(res, "Authentication failed");
        }
    }
};

module.exports = paymentAuth; 