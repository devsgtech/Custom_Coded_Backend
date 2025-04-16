const categoryService = require('../services/categoryService');
const response = require('../utils/response');
const jwt = require('jsonwebtoken');
const { createCategotySchema } = require('../middleware/Validation');



const getCategory = async (req, res) => {
    try {
        const categories = await categoryService.getAllCategory();

        const parsedCategories = categories.map(category => {
            let parsedTierPricing = {};
            try {
                // Remove line breaks or trailing commas
                const cleanJson = category.tier_pricing
                    ?.replace(/,\s*}/g, '}') // Remove trailing comma before }
                    ?.replace(/\n/g, ''); // Remove newline characters

                parsedTierPricing = JSON.parse(cleanJson);
            } catch (err) {
                console.warn('Failed to parse tier_pricing:', category.tier_pricing, err.message);
            }
            // Calculate availability status
            let availability = 'unknown';
            const count = category.available_count;
            if (count > 0 && count < 20) {
                availability = 'Low';
            } else if (count >= 20 && count < 50) {
                availability = 'Medium';
            } else if (count >= 50) {
                availability = 'High';
            }

            return {
                ...category,
                tier_pricing: parsedTierPricing,
                availability
            };
        });

        return response.success(res, parsedCategories, 'Categories fetched successfully');
    } catch (error) {
        console.error('Error in getCategory:', error);
        return response.error(res, error.message);
    }
};
// const getCategory = async (req, res) => {
//     try {
//         const Category = await categoryService.getAllCategory();
//         console.log("&&&&&&&#####",Category)
//         return response.success(res, Category, 'Categories fetched successfully');
//     } catch (error) {
//         console.error('Error in getCategory:', error);
//         return response.error(res, error.message);
//     }
// };

const createCategory = async (req, res) => {
    try {
        // Validate request body
        const { error, value } = createCategotySchema.validate(req.body);
        if (error) {
            return response.validationError(res, error.details[0].message.replace(/"/g, ''));
        }

        const { token, category_data } = value;

        // Verify admin token and get admin_id from token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const admin_id = decoded.id;

        // Verify admin token
        const isTokenValid = await categoryService.verifyAdminToken(admin_id, token);
        if (!isTokenValid) {
            return response.unauthorized(res, 'Invalid or expired token');
        }

        const categoryId = await categoryService.createCategory({ 
            category_name: category_data.category_name, 
            total_count: category_data.total_count,
            available_count: category_data.available_count,
            category_amount: category_data.category_amount,
            created_by: admin_id
        });
        return response.success(res, { id: categoryId, ...category_data }, 'Category created successfully');
    } catch (error) {
        console.error('Error in createCategory:', error);
        if (error.name === 'JsonWebTokenError') {
            return response.unauthorized(res, 'Invalid token');
        }
        return response.error(res, error.message);
    }
};



module.exports = {
    createCategory,
    getCategory
}; 