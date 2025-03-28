const faqService = require('../services/faqService');
const response = require('../utils/response');

const createFaq = async (req, res) => {
    try {
        const { faq_question, faq_answer, admin_id } = req.body.faq_data;
        const { token } = req.body;

        // First validate token exists
        if (!token) {
            return response.error(res, 'Token is required', 400);
        }

        // Then validate admin_id exists
        if (!admin_id) {
            return response.error(res, 'Admin ID is required', 400);
        }

        // Verify token matches admin_id
        const isTokenValid = await faqService.verifyAdminToken(admin_id, token);
        if (!isTokenValid) {
            return response.error(res, 'Invalid token for this admin', 401);
        }

        // Verify admin exists
        const isAdminValid = await faqService.verifyAdmin(admin_id);
        if (!isAdminValid) {
            return response.error(res, 'Invalid admin user', 403);
        }

        // Finally validate FAQ data
        if (!faq_question || !faq_answer) {
            return response.error(res, 'Question and answer are required', 400);
        }

        // Create FAQ entry
        const faqId = await faqService.createFaq({
            faq_question,
            faq_answer,
            admin_id
        });

        return response.success(res, null, 'FAQ created successfully', 201);
    } catch (error) {
        console.error('FAQ creation error:', error);
        return response.error(res, 'Failed to create FAQ', 500);
    }
};

const getFaqList = async (req, res) => {
    try {
        const faqs = await faqService.getFaqList();
        return response.success(res, faqs, 'FAQs fetched successfully');
    } catch (error) {
        console.error('Error fetching FAQs:', error);
        return response.error(res, 'Failed to fetch FAQs', 500);
    }
};

module.exports = {
    createFaq,
    getFaqList
}; 