const codeidService = require('../services/codeidService');
const response = require('../utils/response');
const jwt = require('jsonwebtoken');
const { createcodeidSchema } = require('../middleware/Validation');
const { ERROR_MESSAGES } = require('../config/constants');
const crypto = require('crypto');

// Create 
const createcodeid = async (req, res) => {
    try {
        // Validate request body


        const { error, value } = createcodeidSchema.validate(req.body);
        if (error) {
            return response.validationError(res, error.details[0].message.replace(/"/g, ''));
        }

        const { token, code_data } = value;

        // Verify admin token and get admin_id from token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const admin_id = decoded.id;

        // Verify admin token
        const isTokenValid = await codeidService.verifyAdminToken(admin_id, token);
        if (!isTokenValid) {
            return response.unauthorized(res, ERROR_MESSAGES.INVALID_OR_EXPIRE_TOKEN);
        }

        const codeId = await codeidService.createcodeID({ 
            category_id: code_data.category_id,
            is_active: 0
        });
        return response.success(res, { id: codeId, ...code_data }, ERROR_MESSAGES.CODE_SUCCESS);
    } catch (error) {
        console.error('Error in createcodeID:', error);
        if (error.name === 'JsonWebTokenError') {
            return response.unauthorized(res, ERROR_MESSAGES.INVALID_TOKEN);
        }
        if (error.message === ERROR_MESSAGES.INVALID_CATEGORY_ID) {
            return response.validationError(res, ERROR_MESSAGES.INVALID_CATEGORY_ID);
        }
        return response.error(res, error.message);
    }
};

// function generate10DigitCode(length = 10) {
//     const characters = '0NZMJcLgAHkRIP6s8OyGfb1wYtxXKUp4vqmdE3oVuTWQzCnaBhilSjr579DeFL';
//     let code = '';
//     for (let i = 0; i < length; i++) {
//       code += characters.charAt(Math.floor(Math.random() * characters.length));
//     }
//     return code;
//   }

module.exports = {
    createcodeid,
    // generate10DigitCode
}; 