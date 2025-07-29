const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const { uploadVideoMiddleware } = require('../middleware/uploadMiddleware');
const multer = require('multer');
const upload = multer();
const uploadMediaToVideo = require('../middleware/uploadMediaToVideo');
const authenticate = require('../middleware/Validation');

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
router.post('/upload-media-to-video', uploadMediaToVideo, uploadController.uploadMediaToVideoController);
router.post('/upload-media-file', upload.single('file'), uploadController.uploadMediaFileChunkless);
router.post('/process-media-to-video', uploadController.processMediaToVideoFromPath);

module.exports = router;