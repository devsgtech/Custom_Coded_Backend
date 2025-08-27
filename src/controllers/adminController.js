const adminService = require('../services/adminService');
const { adminLoginSchema, securityQuestionsSchema, verifySecurityAnswerSchema } = require('../middleware/adminValidation');
const response = require('../utils/response');
const { ERROR_MESSAGES, CAPTCHA_VERIFY_URL } = require('../config/constants');
const axios = require('axios');

const login = async (req, res) => {
    try {
        const { error, value } = adminLoginSchema.validate(req.body);
        if (error) {
            return response.validationError(res, error.details[0].message.replace(/"/g, ''));
        }

        const { email, password, recaptcha_token } = value;

        // Step 1: Verify CAPTCHA before proceeding
        const verifyUrl = CAPTCHA_VERIFY_URL;
        const captchaResponse = await axios.post(verifyUrl, null, {
          params: {
            secret: process.env.CAPTCHA_SECRET_KEY,
            response: recaptcha_token,
            // remoteip: req.ip,
          },
        });
        if (!captchaResponse.data.success) {
          return response.validationError(
            res,
            ERROR_MESSAGES.CAPTCHA_VERIFICATON_FAILED
          );
        }

        // Get admin from database
        const admin = await adminService.findAdminByEmail(email);
        if (!admin) {
            return response.unauthorized(res, ERROR_MESSAGES.INVALID_EMAIL_OR_PASSWORD);
        }

        // Verify password
        const isValidPassword = await adminService.verifyPassword(password, admin.password);
        if (!isValidPassword) {
            return response.unauthorized(res, ERROR_MESSAGES.INVALID_EMAIL_OR_PASSWORD);
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
        }, ERROR_MESSAGES.LOGIN_SUCCESS);

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

const securityQuestions = async (req, res) => {
    try {
        const questions = await adminService.fetchSecurityQuestions(req.user.id);
        if (!questions || questions.length === 0) {
            return response.notFound(res, ERROR_MESSAGES.NO_SECURITY_QUESTIONS_FOUND);
        }
        return response.success(res, questions, ERROR_MESSAGES.SECURITY_QUESTIONS_FETCHED_SUCCESSFULLY);
    } catch (error) {
        console.error('Error fetching security questions:', error);
        return response.error(res, {
            message: error.message,
            stack: error.stack,
            code: error.code,
            sqlMessage: error.sqlMessage,
            sqlState: error.sqlState
        }, 500);
    }
}

const verifySecurityAnswer = async (req, res) => {
    try {
        const { error, value } = verifySecurityAnswerSchema.validate(req.body);
        if (error) {
            return response.validationError(res, error.details[0].message.replace(/"/g, ''));
        }

        const { questions } = value;
        const admin_user_id = req.user.id;

        for (const question of questions) {
            console.log(question)
            const isMatch = await adminService.verifySecurityAnswer(admin_user_id, question.question_id, question.answer);
            // console.log(isMatch)
            if (!isMatch) {
                return response.error(res, 'Incorrect answer for one or more questions', 401);
            }
        }

        return response.success(res, null, 'Answers verified successfully');
    } catch (error) {
        console.error('Error verifying security answer:', error);
        return response.error(res, {
            message: error.message,
            stack: error.stack,
            code: error.code,
            sqlMessage: error.sqlMessage,
            sqlState: error.sqlState
        }, 500);
    }
}

module.exports = {
    login,
    securityQuestions,
    verifySecurityAnswer
}; 