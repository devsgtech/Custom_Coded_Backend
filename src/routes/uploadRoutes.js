const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const { uploadVideoMiddleware } = require('../middleware/uploadMiddleware');
const multer = require('multer');

// Upload video
router.post('/video', uploadController.uploadVideo);

// Get attachment by ID
router.get('/video/:uploded_id', uploadController.getAttachment);

// Get attachments by code_id
router.get('/code/:code_id', uploadController.getAttachmentsByCodeId);

// Multer for chunk upload (store in memory, field name 'chunk')
const chunkUpload = multer({ storage: multer.memoryStorage() }).single('chunk');

// Upload video chunk (chunked upload)
router.post('/chunk', chunkUpload, uploadController.uploadVideoChunk);

router.post('/status', uploadController.checkVideoStatus);

module.exports = router; 