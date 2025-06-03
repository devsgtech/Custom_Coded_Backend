const uploadService = require('../services/uploadService');
const response = require('../utils/response');
const { uploadVideoSchema } = require('../middleware/Validation');
const { ERROR_MESSAGES } = require('../config/constants');
const path = require('path');
const jwt = require('jsonwebtoken');

// Upload video
const uploadVideo = async (req, res) => {
    try {
        // Validate request body
        const { error, value } = uploadVideoSchema.validate(req.body);
        if (error) {
            return response.validationError(res, error.details[0].message.replace(/"/g, ''));
        }

        if (!req.file) {
            return response.validationError(res, 'No video file uploaded');
        }

        const { token, code_id } = value;
console.log("token",token)
        // Verify user token and get user_id from token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user_id = decoded.id;
        console.log("user_id",user_id)
        // Create relative path for database storage
        const relativePath = path.join('videos', req.file.filename).replace(/\\/g, '/');

        // Create attachment record
        const result = await uploadService.createAttachment({
            uploded_video_path: relativePath,
            code_id: code_id
        });

        if (!result.success) {
            return response.error(res, result.error);
        }

        return response.success(res, {
            uploded_id: result.data.uploded_id,
            uploded_video_path: result.data.uploded_video_path
        }, ERROR_MESSAGES.VIDEO_UPLOAD_SUCCESS);

    } catch (error) {
        console.error('Error in uploadVideo:', error);
        return response.error(res, ERROR_MESSAGES.VIDEO_UPLOAD_FAIL);
    }
};

// Get attachment by ID
const getAttachment = async (req, res) => {
    try {
        const { uploded_id } = req.params;
        
        const result = await uploadService.getAttachmentById(uploded_id);
        
        if (!result.success) {
            return response.error(res, result.error);
        }

        if (!result.data) {
            return response.notFound(res, ERROR_MESSAGES.VIDEO_NOT_FOUND);
        }

        return response.success(res, result.data);

    } catch (error) {
        console.error('Error in getAttachment:', error);
        return response.error(res, ERROR_MESSAGES.VIDEO_FETCH_FAIL);
    }
};

// Get attachments by code_id
const getAttachmentsByCodeId = async (req, res) => {
    try {
        const { code_id } = req.params;
        
        const result = await uploadService.getAttachmentsByCodeId(code_id);
        
        if (!result.success) {
            return response.error(res, result.error);
        }

        return response.success(res, result.data);

    } catch (error) {
        console.error('Error in getAttachmentsByCodeId:', error);
        return response.error(res, ERROR_MESSAGES.VIDEO_FETCH_FAIL);
    }
};

module.exports = {
    uploadVideo,
    getAttachment,
    getAttachmentsByCodeId
}; 