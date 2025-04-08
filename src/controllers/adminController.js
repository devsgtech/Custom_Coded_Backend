const adminService = require('../services/adminService');
const { adminLoginSchema } = require('../middleware/adminValidation');
const response = require('../utils/response');

const login = async (req, res) => {
    // const { email, password } = req.body;
    // console.log("req",req);
    // console.log("res",res);
    try {

        const { error, value } = adminLoginSchema.validate(req.body);
        if (error) {
            return response.validationError(res, error.details[0].message.replace(/"/g, ''));
        }

        const { email, password } = value;


        // Validate input
        // if (!email || !password) {
        //     return response.error(res, 'Email and password are required2', 400);
        // }

        // if (!validateEmail(email)) {
        //     return response.validationError(res, 'Invalid email format2');
        // }

        // if (!validatePassword(password)) {
        //     return response.validationError(res, 'Password must be at least 6 characters long2');
        // }

        // Get admin from database
        const admin = await adminService.findAdminByEmail(email);
        if (!admin) {
            return response.unauthorized(res, 'Invalid email or password 3');
        }

        // Verify password
        const isValidPassword = await adminService.verifyPassword(password, admin.password);
        if (!isValidPassword) {
            return response.unauthorized(res, 'Invalid email or password 4');
        }

        // Generate JWT token and get expiry
        const token = adminService.generateToken(admin);
        const tokenExpiry = adminService.getTokenExpiry();

        // Create admin session with token
        await adminService.createAdminSession(
            admin.admin_id,
            token,
            tokenExpiry,
            req.ip
        );

        // Return success response (without exposing token expiry)
        return response.success(res, {
            token,
            admin: {
                id: admin.admin_id,
                name: admin.name,
                email: admin.email
            }
        }, 'Login successful');

    } catch (error) {
        console.error('Login error:', error);
        return response.error(res, {
            message: error.message,
            stack: error.stack,
            code: error.code,
            sqlMessage: error.sqlMessage,
            sqlState: error.sqlState
        }, 500);
    }
};

module.exports = {
    login
}; 