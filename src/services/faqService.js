const pool = require('../config/database');
const authService = require('./authService');

const faqService = {
    // Create new FAQ entry
    createFaq: async (faqData) => {
        try {
            const { faq_question, faq_answer, admin_id } = faqData;
            
            const query = `
                INSERT INTO tbl_faq 
                (faq_question, faq_answer, is_deleted, modified_by, created_on) 
                VALUES (?, ?, 0, ?, NOW())
            `;
            
            const [result] = await pool.execute(query, [
                faq_question,
                faq_answer,
                admin_id
            ]);
            
            return result.insertId;
        } catch (error) {
            console.error('Error creating FAQ:', error);
            throw new Error('Failed to create FAQ');
        }
    },

    // Get all FAQs
    getFaqList: async () => {
        try {
            const query = `
                SELECT faq_question, faq_answer 
                FROM tbl_faq 
                WHERE is_deleted = 0 
                ORDER BY created_on DESC
            `;
            const [rows] = await pool.execute(query);
            return rows;
        } catch (error) {
            console.error('Error fetching FAQs:', error);
            throw new Error('Failed to fetch FAQs');
        }
    },

    // Verify admin exists
    verifyAdmin: async (adminId) => {
        return authService.verifyAdmin(adminId);
    },

    // Verify admin token
    verifyAdminToken: async (adminId, token) => {
        return authService.verifyAdminToken(adminId, token);
    }
};

module.exports = faqService; 