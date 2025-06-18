const jwt = require('jsonwebtoken');
const { ERROR_MESSAGES } = require('../config/constants');
const response = require('./response');

const jwtUtils = {
    /**
     * Verify JWT token with comprehensive error handling
     * @param {string} token - JWT token to verify
     * @param {string} secret - JWT secret key
     * @returns {Object} - { success: boolean, decoded: Object|null, error: Object|null }
     */
    verifyToken: (token, secret) => {
        try {
            if (!token) {
                return {
                    success: false,
                    decoded: null,
                    error: {
                        name: 'TokenMissingError',
                        message: ERROR_MESSAGES.TOKEN_MISSING,
                        statusCode: 401
                    }
                };
            }

            const decoded = jwt.verify(token, secret);
            return {
                success: true,
                decoded: decoded,
                error: null
            };
        } catch (error) {
            let errorResponse = {
                success: false,
                decoded: null,
                error: {
                    name: error.name,
                    message: ERROR_MESSAGES.INVALID_TOKEN,
                    statusCode: 401
                }
            };

            // Handle specific JWT error types
            switch (error.name) {
                case 'TokenExpiredError':
                    errorResponse.error.message = ERROR_MESSAGES.TOKEN_EXPIRED;
                    break;
                case 'JsonWebTokenError':
                    errorResponse.error.message = ERROR_MESSAGES.TOKEN_MALFORMED;
                    break;
                case 'NotBeforeError':
                    errorResponse.error.message = 'Token is not yet valid';
                    break;
                default:
                    errorResponse.error.message = ERROR_MESSAGES.INVALID_TOKEN;
            }

            return errorResponse;
        }
    },

    /**
     * Verify JWT token and send appropriate response
     * @param {Object} res - Express response object
     * @param {string} token - JWT token to verify
     * @param {string} secret - JWT secret key
     * @returns {Object|null} - Returns decoded token if valid, null if invalid (response already sent)
     */
    verifyTokenAndRespond: (res, token, secret) => {
        const result = jwtUtils.verifyToken(token, secret);
        
        if (!result.success) {
            response.unauthorized(res, result.error.message);
            return null;
        }
        
        return result.decoded;
    }
};

module.exports = jwtUtils; 