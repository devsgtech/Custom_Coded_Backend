const pool = require('../config/database');
const authService = require('./authService');

const faqService = {
    // Get all FAQs
    getAllFaqs: async () => {
        try {
            const query = 'SELECT * FROM tbl_faq WHERE is_deleted = 0 ORDER BY created_on DESC';
            const [rows] = await pool.execute(query);
            return rows;
        } catch (error) {
            console.error('Error fetching FAQs:', error);
            throw new Error('Failed to fetch FAQs');
        }
    },

    // Create new FAQ
    createFaq: async (faqData) => {
        try {
            const query = `
                INSERT INTO tbl_faq (faq_question, faq_answer, created_on, modified_by) 
                VALUES (?, ?, NOW(), ?)
            `;
            const [result] = await pool.execute(query, [faqData.question, faqData.answer, faqData.admin_id]);
            return result.insertId;
        } catch (error) {
            console.error('Error creating FAQ:', error);
            throw new Error('Failed to create FAQ');
        }
    },

    // Update FAQ
    updateFaq: async (faqId, faqData) => {
        try {
            const query = `
                UPDATE tbl_faq 
                SET faq_question = ?, 
                    faq_answer = ?, 
                    modified_on = NOW()
                WHERE faq_id = ? AND is_deleted = 0
            `;
            const [result] = await pool.execute(query, [faqData.question, faqData.answer, faqId]);
            
            if (result.affectedRows === 0) {
                throw new Error('FAQ not found');
            }
            
            return faqId;
        } catch (error) {
            console.error('Error updating FAQ:', error);
            throw new Error('Failed to update FAQ');
        }
    },

    // Delete FAQ (soft delete)
    deleteFaq: async (faq_id) => {
        try {
            // First check if FAQ exists and is not already deleted
            const checkQuery = 'SELECT faq_id, is_deleted FROM tbl_faq WHERE faq_id = ?';
            const [checkResult] = await pool.execute(checkQuery, [faq_id]);
            
            if (checkResult.length === 0) {
                throw new Error('Invalid FAQ ID');
            }

            if (checkResult[0].is_deleted === 1) {
                throw new Error('FAQ is already deleted');
            }

            // If FAQ exists and is not deleted, proceed with soft delete
            const query = `
                UPDATE tbl_faq 
                SET is_deleted = 1,
                    modified_on = NOW()
                WHERE faq_id = ? AND is_deleted = 0
            `;
            const [result] = await pool.execute(query, [faq_id]);
            
            if (result.affectedRows === 0) {
                throw new Error('FAQ not found');
            }
            
            return faq_id;
        } catch (error) {
            console.error('Error deleting FAQ:', error);
            throw new Error(error.message || 'Failed to delete FAQ');
        }
    },

    // Verify admin token
    verifyAdminToken: async (adminId, token) => {
        return authService.verifyAdminToken(adminId, token);
    }
};

module.exports = faqService; 