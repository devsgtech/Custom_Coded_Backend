const metaService = require('../services/metaService');
const response = require('../utils/response');
const jwt = require('jsonwebtoken');
const { createmetaSchema, getmetaSchema } = require('../middleware/Validation');
const { BASE_URL_LIVE } = require('../config/constants')

// Get all Metas
const getmetaList = async (req, res) => {
    try {
        const { error, value } = getmetaSchema.validate(req.body);
        if (error) {
            return response.validationError(res, error.details[0].message.replace(/"/g, ''));
        }

        const metaGroup = value;
        const metas = await metaService.getAllMetas(metaGroup.meta_group);

        if (metas.success) {
            const processedMetas = metas.data.map(item => {
                if (item.meta_key === "image_array_one" || item.meta_key === "image_array_two") {
                    return {
                        ...item,
                        meta_value: item.meta_value
                            .split(',')
                            .map(path => `${BASE_URL_LIVE}${path.trim()}`)
                    };
                }
                if (item.meta_key === "font_types_array") {
                    return {
                        ...item,
                        meta_value: item.meta_value
                            .split(',')
                            .map(path => `${path.trim()}`)
                    };
                }

                if (item.meta_key === "page_logo" || item.meta_key === "page_background_image" || item.meta_key === "video") {
                    return {
                        ...item,
                        meta_value: `${BASE_URL_LIVE}${item.meta_value.trim()}`
                    };
                }

                return item;
            });

            return response.success(res, { success: true, data: processedMetas }, 'Metas fetched successfully');
        } else {
            return response.success(res, { success: false, data: [] }, 'Meta data not found');
        }
    } catch (error) {
        console.error('Error in getMetaList:', error);
        return response.error(res, error.message);
    }
};


// Create meta
const createmeta = async (req, res) => {
    try {
        // Validate request body
        const { error, value } = createmetaSchema.validate(req.body);
        if (error) {
            return response.validationError(res, error.details[0].message.replace(/"/g, ''));
        }

        const { token, meta_data } = value;

        // Verify admin token and get admin_id from token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const admin_id = decoded.id;

        // Verify admin token
        const isTokenValid = await metaService.verifyAdminToken(admin_id, token);
        if (!isTokenValid) {
            return response.unauthorized(res, 'Invalid or expired token');
        }

        const metaId = await metaService.createMeta({ 
            meta_key: meta_data.meta_key, 
            meta_value: meta_data.meta_value,
            meta_group: meta_data.meta_group,
            is_delete: 0,
            admin_id: admin_id
        });
        return response.success(res, { id: metaId, ...meta_data }, 'Meta created successfully');
    } catch (error) {
        console.error('Error in createMeta:', error);
        if (error.name === 'JsonWebTokenError') {
            return response.unauthorized(res, 'Invalid token');
        }
        return response.error(res, error.message);
    }
};

module.exports = {
    getmetaList,
    createmeta
    
}; 