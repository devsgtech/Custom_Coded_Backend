const pool = require('../config/database');
const authService = require('./authService');
const { ERROR_MESSAGES } = require('../config/constants');

const codeidService = {

    // Check if code exists
    checkCodeExists: async (generated_code, generated_code_id) => {
        try {
            const query = `
                SELECT generated_code, generated_code_id 
                FROM tbl_generated_code 
                WHERE generated_code = ? OR generated_code_id = ?
            `;
            const [result] = await pool.execute(query, [generated_code, generated_code_id]);
            return result.length > 0;
        } catch (error) {
            console.error('Error checking code existence:', error);
            throw error;
        }
    },

    // Generate unique codes
    generateUniqueCodes: async () => {
        let generated_code, generated_code_id;
        let isUnique = false;
        let attempts = 0;
        const maxAttempts = 5; // Prevent infinite loops

        while (!isUnique && attempts < maxAttempts) {
            generated_code = await codeidService.generate10DigitCode();
            generated_code_id = await codeidService.generate10DigitCode();
            
            const exists = await codeidService.checkCodeExists(generated_code, generated_code_id);
            if (!exists) {
                isUnique = true;
            }
            attempts++;
        }

        if (!isUnique) {
            throw new Error('Failed to generate unique codes after multiple attempts');
        }

        return { generated_code, generated_code_id };
    },

    // Create new code id
    createcodeID: async (code_data) => {
        try {
            // First validate the category_id
            await codeidService.validateCategoryId(code_data.category_id);

            // Generate unique codes
            const { generated_code, generated_code_id } = await codeidService.generateUniqueCodes();

            const query = `
                INSERT INTO tbl_generated_code (category_id, generated_code, generated_code_id, is_active, generated_time) 
                VALUES (?, ?, ?, ?, NOW())
            `;
            const [result] = await pool.execute(query, [
                code_data.category_id, 
                generated_code, 
                generated_code_id, 
                code_data.is_active
            ]);
            return result.insertId;
        } catch (error) {
            console.error('Error creating Code ID:', error);
            if (error.message === ERROR_MESSAGES.INVALID_CATEGORY_ID) {
                throw error;
            }
            throw new Error('Failed to create Code ID');
        }
    },

    // Verify admin token
    verifyAdminToken: async (adminId, token) => {
        return authService.verifyAdminToken(adminId, token);
    },

    // Validate category_id
    validateCategoryId: async (category_id) => {
        try {
            const query = `
                SELECT category_id 
                FROM tbl_category 
                WHERE category_id = ? 
                AND is_deleted = 0
            `;
            const [result] = await pool.execute(query, [category_id]);
            
            if (!result || result.length === 0) {
                throw new Error(ERROR_MESSAGES.INVALID_CATEGORY_ID);
            }
            
            return true;
        } catch (error) {
            throw error;
        }
    },

    generate10DigitCode(length = 10) {
        const characters = '0NZMJcLgAHkRIP6s8OyGfb1wYtxXKUp4vqmdE3oVuTWQzCnaBhilSjr579DeFL';
        let code = '';
        for (let i = 0; i < length; i++) {
          code += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return code;
      }

    // Create Code ID
    // createCodeId: async (codeData) => {
    //     try {
    //         // First validate the category_id
    //         await codeidService.validateCategoryId(codeData.category_id);

    //         const query = `
    //             INSERT INTO tbl_code_id (
    //                 category_id, 
    //                 code_id, 
    //                 code_name, 
    //                 code_description, 
    //                 created_on, 
    //                 modified_by
    //             ) VALUES (?, ?, ?, ?, NOW(), ?)
    //         `;
            
    //         const [result] = await db.query(query, [
    //             codeData.category_id,
    //             codeData.code_id,
    //             codeData.code_name,
    //             codeData.code_description,
    //             codeData.admin_id
    //         ]);
            
    //         return result.insertId;
    //     } catch (error) {
    //         throw error;
    //     }
    // }
};

module.exports = codeidService; 