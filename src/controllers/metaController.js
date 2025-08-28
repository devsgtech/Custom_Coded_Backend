const metaService = require('../services/metaService');
const response = require('../utils/response');
const jwt = require('jsonwebtoken');
const { createmetaSchema, getmetaSchema } = require('../middleware/Validation');
const { BASE_URL_LIVE, ERROR_MESSAGES } = require('../config/constants');
const ipBanService = require('../services/ipBanService');
const fs = require('fs');
const path = require('path');

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
            meta_remarks: meta_data.meta_remarks ? meta_data.meta_remarks : null,
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

const getTemplatesList = async (req, res) => {
    try {
        // --- Fetch color list from metaService ---
        let color_list = [];
        let background_list = [];
        let overlay_list = [];
        let open_list = [];
        let font_type_list = [];
        try {
            const metas = await metaService.getAllMetas("9,10,11,12,13,14");
            if (metas.success && Array.isArray(metas.data)) {
                color_list = metas.data.filter(item => item.meta_key === 'font_color').map(item => ({
                        id: item.meta_id,
                        type: item.meta_key,
                        color_code: item.meta_value,
                        name: item.remarks || ''
                    }));
                // Build background list with associated background_image_path by meta_group "id_<meta_id>"
                const bgVideoItems = metas.data.filter(item => item.meta_key === 'background_video_path');
                background_list = [];
                for (const item of bgVideoItems) {
                    let image_path = null;
                    try {
                        const imageGroup = `id_${item.meta_id}`;
                        const imageMetas = await metaService.getAllMetas(imageGroup);
                        if (imageMetas.success && Array.isArray(imageMetas.data)) {
                            const imgRow = imageMetas.data.find(m => m.meta_key === 'background_image_path');
                            if (imgRow && imgRow.meta_value) {
                                image_path = `${BASE_URL_LIVE}${imgRow.meta_value.trim()}`;
                            }
                        }
                    } catch (e) {
                        console.error('Error fetching background_image_path for', item.meta_id, e.message);
                    }

                    background_list.push({
                        id: item.meta_id,
                        type: item.meta_key,
                        path: `${BASE_URL_LIVE}${item.meta_value.trim()}`,
                        name: item.remarks || '',
                        image_path
                    });
                }
                // Build overlay list with associated overlay_image_path by meta_group "id_<meta_id>"
                const overlayVideoItems = metas.data.filter(item => item.meta_key === 'overlay_video_path');
                overlay_list = [];
                for (const item of overlayVideoItems) {
                    let image_path = null;
                    try {
                        const imageGroup = `id_${item.meta_id}`;
                        const imageMetas = await metaService.getAllMetas(imageGroup);
                        if (imageMetas.success && Array.isArray(imageMetas.data)) {
                            const imgRow = imageMetas.data.find(m => m.meta_key === 'overlay_image_path');
                            if (imgRow && imgRow.meta_value) {
                                image_path = `${BASE_URL_LIVE}${imgRow.meta_value.trim()}`;
                            }
                        }
                    } catch (e) {
                        console.error('Error fetching overlay_image_path for', item.meta_id, e.message);
                    }

                    overlay_list.push({
                        id: item.meta_id,
                        type: item.meta_key,
                        path: `${BASE_URL_LIVE}${item.meta_value.trim()}`,
                        name: item.remarks || '',
                        image_path
                    });
                }
                // Build opening list with associated open_image_path by meta_group "id_<meta_id>"
                const openVideoItems = metas.data.filter(item => item.meta_key === 'open_video_path');
                open_list = [];
                for (const item of openVideoItems) {
                    let image_path = null;
                    try {
                        const imageGroup = `id_${item.meta_id}`;
                        const imageMetas = await metaService.getAllMetas(imageGroup);
                        if (imageMetas.success && Array.isArray(imageMetas.data)) {
                            const imgRow = imageMetas.data.find(m => m.meta_key === 'open_image_path');
                            if (imgRow && imgRow.meta_value) {
                                image_path = `${BASE_URL_LIVE}${imgRow.meta_value.trim()}`;
                            }
                        }
                    } catch (e) {
                        console.error('Error fetching open_image_path for', item.meta_id, e.message);
                    }

                    open_list.push({
                        id: item.meta_id,
                        type: item.meta_key,
                        path: `${BASE_URL_LIVE}${item.meta_value.trim()}`,
                        name: item.remarks || '',
                        image_path
                    });
                }
                font_type_list = metas.data.filter(item => item.meta_key === 'font_type').map(item => ({
                    id: item.meta_id,
                    type: item.meta_key,
                    path: `${BASE_URL_LIVE}${item.meta_value.trim()}`,
                    name: item.remarks || ''
                }));
            }
        } catch (metaError) {
            console.error('Error fetching color list:', metaError);
        }
        // --- End color list logic ---

        return res.json({
            status: true,
            color_list,
            background_list,
            overlay_list,
            open_list,
            font_type_list
        });
    } catch (error) {
        console.error('Error in getTemplatesList:', error);
        return res.status(500).json({
            status: false,
            message: 'Failed to fetch templates',
            error: error.message
        });
    }
};

module.exports = {
    getmetaList,
    createmeta,
    getTemplatesList
}; 