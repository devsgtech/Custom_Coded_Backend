const pool = require('../config/database');
const authService = require('./authService');
const db = require('../config/database');
const { ERROR_MESSAGES } = require('../config/constants');

const codeidService = {
    fetchCodeIds: async(currentPage, itemsPerPage, filters, search) => {
        try {
            let whereClause = ' WHERE 1=1';
            const params = [];

            if (filters && Array.isArray(filters)) {
                filters.forEach((filter) => {
                    if (filter.field === "is_active" && Array.isArray(filter.value) && filter.value.length > 0) {
                        const placeholders = filter.value.map(() => "?").join(",");
                        whereClause += ` AND is_active IN (${placeholders})`;
                        params.push(...filter.value);
                    }
                });
            }

            if (search) {
                whereClause += ' AND (generated_code LIKE ? OR generated_code_id LIKE ?)';
                const searchKeyword = `%${search}%`;
                params.push(searchKeyword, searchKeyword);
            }

            const countQuery = `SELECT COUNT(*) as totalItems FROM tbl_generated_code${whereClause}`;
            const [countRows] = await pool.execute(countQuery, params);
            const totalItems = countRows[0].totalItems;

            let limitClause = '';
            let page = 1;
            let totalPages = 1;

            // Only apply pagination if both currentPage and itemsPerPage are provided
            if (currentPage && itemsPerPage) {
                const limit = parseInt(itemsPerPage, 10);
                page = parseInt(currentPage, 10);
                totalPages = Math.ceil(totalItems / limit) || 1;

                if (page > totalPages) page = 1;

                const offset = (page - 1) * limit;
                limitClause = ` LIMIT ${limit} OFFSET ${offset}`;
            }

            const dataQuery = `SELECT * FROM tbl_generated_code${whereClause} ORDER BY generated_time DESC${limitClause}`;
            const [codeIds] = await pool.execute(dataQuery, params);

            return { codeIds, totalItems, totalPages, currentPage: page };
        } catch (error) {
            console.error('Error fetching codeIds:', error);
            throw error;
        }
    },

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
     createcodeID: async (data) => {
        const { category_id, is_active, numberOfCodes } = data;
        try {
            // 1. Validate the category_id once.
            await codeidService.validateCategoryId(category_id);
            if(numberOfCodes < 1) {
                throw new Error("Number must be greater than 0");
            }

            const values = [];
            const generatedCodes = [];

            // 2. Loop to generate unique codes and prepare them for insertion.
            for (let i = 0; i < numberOfCodes; i++) {
                const { generated_code, generated_code_id } = await codeidService.generateUniqueCodes();
                
                //todo: Bcrypt generated_code if asked
                values.push(category_id, generated_code, generated_code_id, is_active);
                
                generatedCodes.push({ generated_code, generated_code_id });
             }
 
            if (values.length === 0) {
                return { message: "No codes to generate." };
            }

            // 3. Construct the bulk INSERT query.
            const placeholders = Array(numberOfCodes).fill('(?, ?, ?, ?, NOW())').join(', ');
            const query = `
                INSERT INTO tbl_generated_code (category_id, generated_code, generated_code_id, is_active, generated_time) 
                VALUES ${placeholders}
            `;

            // 4. Execute the single bulk query.
            const [result] = await pool.execute(query, values);

            return {
                message: `${result.affectedRows} codes created successfully.`,
                generatedCodes: generatedCodes
            };

        } catch (error) {
            console.error('Error creating Code IDs:', error);
            if (error.message === ERROR_MESSAGES.INVALID_CATEGORY_ID) {
                throw error;
            }
            throw new Error('Failed to create Code IDs');
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
            const [result] = await db.query(query, [category_id]);
            
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
      },

    deleteCodeId: async (code_id) => {
        try {
            // First, check if the code_id exists
            const [existingCode] = await db.query('SELECT * FROM tbl_generated_code WHERE code_id = ?', [code_id]);

            if (existingCode.length === 0) {
                throw new Error('Code ID not found');
            }

            // If it exists, proceed with deletion
            const deleteQuery = `DELETE FROM tbl_generated_code WHERE code_id = ?`;
            const [result] = await db.query(deleteQuery, [code_id]);

            if (result.affectedRows === 0) {
                throw new Error('Failed to delete Code ID, it may have been deleted by another process.');
            }

            return result;
        } catch (error) {
            console.error('Error deleting code ID:', error);
            throw error;
        }
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