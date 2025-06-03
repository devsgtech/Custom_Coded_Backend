const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const { uploadVideoMiddleware } = require('../middleware/uploadMiddleware');

// Upload video
router.post('/video', uploadVideoMiddleware, uploadController.uploadVideo);

// Get attachment by ID
router.get('/video/:uploded_id', uploadController.getAttachment);

// Get attachments by code_id
router.get('/code/:code_id', uploadController.getAttachmentsByCodeId);

module.exports = router; 