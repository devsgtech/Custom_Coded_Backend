const faqService = require('../services/faqService');
const response = require('../utils/response');
const jwt = require('jsonwebtoken');
const { createFaqSchema,updateFaqSchema,deleteFaqSchema } = require('../middleware/Validation');
const { ERROR_MESSAGES } = require('../config/constants')

// Get all FAQs
const getFaqList = async (req, res) => {
    try {
        const faqs = await faqService.getAllFaqs();
        return response.success(res, faqs, ERROR_MESSAGES.FAQ_FETCH_SUCCESS);
    } catch (error) {
        console.error('Error in getFaqList:', error);
        return response.error(res, error.message);
    }
};

// Create FAQ
const createFaq = async (req, res) => {
    try {
        // Validate request body
        const { error, value } = createFaqSchema.validate(req.body);
        if (error) {
            return response.validationError(res, error.details[0].message.replace(/"/g, ''));
        }

        const { token, faq_data } = value;

        // Verify admin token and get admin_id from token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const admin_id = decoded.id;

        // Verify admin token
        const isTokenValid = await faqService.verifyAdminToken(admin_id, token);
        if (!isTokenValid) {
            return response.unauthorized(res, ERROR_MESSAGES.INVALID_OR_EXPIRE_TOKEN);
        }

        const faqId = await faqService.createFaq({ 
            question: faq_data.faq_question, 
            answer: faq_data.faq_answer,
            admin_id: admin_id
        });
        return response.success(res, { id: faqId, ...faq_data }, ERROR_MESSAGES.FAQ_SUCCESS);
    } catch (error) {
        console.error('Error in createFaq:', error);
        if (error.name === 'JsonWebTokenError') {
            return response.unauthorized(res, ERROR_MESSAGES.INVALID_TOKEN);
        }
        return response.error(res, error.message);
    }
};

// Update FAQ
const updateFaq = async (req, res) => {
    try {
        // Validate request body
        const { error, value } = updateFaqSchema.validate(req.body);
        if (error) {
            return response.validationError(res, error.details[0].message.replace(/"/g, ''));
        }

        const { token, faq_id, faq_question, faq_answer} = value;

        // Verify admin token and get admin_id from token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const admin_id = decoded.id;

        // Verify admin token
        const isTokenValid = await faqService.verifyAdminToken(admin_id, token);
        if (!isTokenValid) {
            return response.unauthorized(res, ERROR_MESSAGES.INVALID_OR_EXPIRE_TOKEN);
        }

        const updatedFaqId = await faqService.updateFaq(faq_id, { 
            question: faq_question, 
            answer: faq_answer 
        });
        return response.success(res, { id: updatedFaqId, faq_question, faq_answer }, ERROR_MESSAGES.FAQ_UPDATE_SUCCESS);
    } catch (error) {
        console.error('Error in updateFaq:', error);
        if (error.name === 'JsonWebTokenError') {
            return response.unauthorized(res, ERROR_MESSAGES.INVALID_TOKEN);
        }
        return response.error(res, error.message);
    }
};

// Delete FAQ
const deleteFaq = async (req, res) => {
    try {
        // Validate request body
        const { error, value } = deleteFaqSchema.validate(req.body);
        if (error) {
            return response.validationError(res, error.details[0].message.replace(/"/g, ''));
        }

        const { token, faq_id } = value;

        // Verify admin token and get admin_id from token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const admin_id = decoded.id;

        // Verify admin token
        const isTokenValid = await faqService.verifyAdminToken(admin_id, token);
        if (!isTokenValid) {
            return response.unauthorized(res, ERROR_MESSAGES.INVALID_OR_EXPIRE_TOKEN);
        }

        const deletedFaqId = await faqService.deleteFaq(faq_id);
        return response.success(res, { id: deletedFaqId }, ERROR_MESSAGES.FAQ_DELETE_SUCCESS);
    } catch (error) {
        console.error('Error in deleteFaq:', error);
        if (error.name === 'JsonWebTokenError') {
            return response.unauthorized(res, ERROR_MESSAGES.INVALID_TOKEN);
        }
        return response.error(res, error.message);
    }
};

module.exports = {
    getFaqList,
    createFaq,
    updateFaq,
    deleteFaq
}; 