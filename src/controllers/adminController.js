const adminService = require('../services/adminService');
const { validateEmail, validatePassword } = require('../middleware/adminValidation');
const response = require('../utils/response');

const login = async (req, res) => {
    const { email, password } = req.body;
    console.log("req",req);
    console.log("res",res);
    try {
        // Validate input
        if (!email || !password) {
            return response.error(res, 'Email and password are required', 400);
        }

        if (!validateEmail(email)) {
            return response.validationError(res, 'Invalid email format');
        }

        if (!validatePassword(password)) {
            return response.validationError(res, 'Password must be at least 6 characters long');
        }

        // Get admin from database
        const admin = await adminService.findAdminByEmail(email);
        if (!admin) {
            return response.unauthorized(res, 'Invalid email or password');
        }

        // Verify password
        const isValidPassword = await adminService.verifyPassword(password, admin.password);
        if (!isValidPassword) {
            return response.unauthorized(res, 'Invalid email or password');
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
        return response.error(res, 'Internal server error');
    }
};

module.exports = {
    login
}; 