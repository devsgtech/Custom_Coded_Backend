const pool = require('../config/database');
const authService = require('./authService');

const categoryService = {
    // Get all Categories
    getAllCategory: async () => {
        try {
            const query = 'SELECT * FROM tbl_category WHERE is_deleted = 0 ORDER BY created_on DESC';
            const [rows] = await pool.execute(query);
            return rows;
        } catch (error) {
            console.error('Error fetching Categories:', error);
            throw new Error('Failed to fetch Categories');
        }
    },

    // Create new Category
    createCategory: async (category_data) => {
        try {
            const query = `
                INSERT INTO tbl_category (category_name, total_count, available_count, category_amount, created_by, created_on) 
                VALUES (?, ?, ?, ?, ?, NOW())
            `;
            const [result] = await pool.execute(query, [category_data.category_name, category_data.total_count, category_data.available_count,category_data.category_amount,category_data.created_by]);
            return result.insertId;
        } catch (error) {
            console.error('Error creating Category:', error);
            throw new Error('Failed to create Category');
        }
    },

    // Verify admin token
    verifyAdminToken: async (adminId, token) => {
        return authService.verifyAdminToken(adminId, token);
    }
};

module.exports = categoryService; 