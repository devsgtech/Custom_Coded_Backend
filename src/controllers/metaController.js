const metaService = require('../services/metaService');
const response = require('../utils/response');
const jwt = require('jsonwebtoken');
const { createmetaSchema, getmetaSchema } = require('../middleware/Validation');
const { BASE_URL_LIVE, ERROR_MESSAGES } = require('../config/constants');
const ipBanService = require('../services/ipBanService');

// Get all Metas
const getmetaList = async (req, res) => {
    try {
        const { error, value } = getmetaSchema.validate(req.body);
        if (error) {
            return response.validationError(res, error.details[0].message.replace(/"/g, ''));
        }
        const {meta_group,ip_address} = value;
        const checkIpBanned = await ipBanService.checkIpBanned(ip_address);
        
        console.log("metaGroup",meta_group);
        const metas = await metaService.getAllMetas(meta_group);

        if (metas.success) {
            const processedMetas = metas.data.map(item => {
                if (item.meta_key === "image_array_one_preview" || item.meta_key === "image_array_two_preview") {
                    return {
                        ...item,
                        meta_value: item.meta_value
                            .split(',')
                            .map(path => `${BASE_URL_LIVE}${path.trim()}`)
                    };
                }
                if (item.meta_key === "font_types_array_preview") {
                    return {
                        ...item,
                        meta_value: item.meta_value
                            .split(',')
                            .map(path => `${path.trim()}`)
                    };
                }

                if (item.meta_key === "page_logo_preview" || item.meta_key === "page_background_image_preview" || 
                    item.meta_key === "video_preview" || item.meta_key === "favicon_website_info" || 
                    item.meta_key === "logo_website_info" || item.meta_key === "backgroundVideo_home" ||
                    item.meta_key ==="backgroundImage_shop"|| item.meta_key === "backgroundImage_faq" ||
                    item.meta_key === "backgroundImage_contact") {
                    return {
                        ...item,
                        meta_value: `${BASE_URL_LIVE}${item.meta_value.trim()}`
                    };
                }

                return item;
            });
            const simplifiedObject = processedMetas.reduce((acc, item) => {
                acc[item.meta_key] = item.meta_value;
                return acc;
              }, {});
            return response.success(res, { success: true, data: {
                meta:simplifiedObject,
                checkIpBanned:checkIpBanned
            } }, ERROR_MESSAGES.META_FETCH_SUCCESS);
        } else {
            return response.success(res, { success: false, data: [] }, ERROR_MESSAGES.META_NOT_FOUND);
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
        console.log("admin_id",admin_id);

        // Verify admin token
        const isTokenValid = await metaService.verifyAdminToken(admin_id, token);
        if (!isTokenValid) {
            return response.unauthorized(res, ERROR_MESSAGES.INVALID_OR_EXPIRE_TOKEN);
        }

        const metaId = await metaService.createMeta({ 
            meta_key: meta_data.meta_key, 
            meta_value: meta_data.meta_value,
            meta_group: meta_data.meta_group,
            is_delete: 0,
            admin_id: admin_id
        });
        return response.success(res, { id: metaId, ...meta_data }, ERROR_MESSAGES.META_SUCCESS);
    } catch (error) {
        console.error('Error in createMeta:', error);
        if (error.name === 'JsonWebTokenError') {
            return response.unauthorized(res, ERROR_MESSAGES.INVALID_TOKEN);
        }
        return response.error(res, error.message);
    }
};

module.exports = {
    getmetaList,
    createmeta
    
}; 