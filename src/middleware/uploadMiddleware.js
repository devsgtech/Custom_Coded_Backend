const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'public/videos/attachements';
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Generate unique filename with original extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, uniqueSuffix + ext);
    }
});

// File filter to only allow video files
const fileFilter = (req, file, cb) => {
    // Accept video files only
    if (!file.originalname.match(/\.(mp4|mov|avi|wmv|flv|mkv)$/i)) {
        return cb(new Error('Only video files are allowed!'), false);
    }
    
    cb(null, true);
};

// Configure multer upload
const uploadVideoMiddleware = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB limit
    }
}).single('video');

// Add request logging wrapper
const uploadVideoMiddlewareWithLogging = (req, res, next) => {
    console.log('=== UPLOAD REQUEST DEBUG ===');
    console.log('Request headers:', req.headers);
    console.log('Request method:', req.method);
    console.log('Request URL:', req.url);
    console.log('Content-Type:', req.headers['content-type']);
    console.log('Content-Length:', req.headers['content-length']);
    
    // Check if it's multipart/form-data
    if (!req.headers['content-type'] || !req.headers['content-type'].includes('multipart/form-data')) {
        return res.status(422).json({
            status: false,
            statusCode: 422,
            message: 'Content-Type must be multipart/form-data. Current Content-Type: ' + (req.headers['content-type'] || 'not set'),
            errors: null,
            timestamp: new Date().toISOString()
        });
    }
    
    console.log('✅ Content-Type is correct');
    
    uploadVideoMiddleware(req, res, (err) => {
        if (err) {
            // Handle specific multer errors
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(422).json({
                    status: false,
                    statusCode: 422,
                    message: 'File size too large. Maximum size is 100MB.',
                    errors: null,
                    timestamp: new Date().toISOString()
                });
            }
            
            if (err.code === 'LIMIT_FILE_COUNT') {
                return res.status(422).json({
                    status: false,
                    statusCode: 422,
                    message: 'Too many files uploaded. Only one file allowed.',
                    errors: null,
                    timestamp: new Date().toISOString()
                });
            }
            
            if (err.code === 'LIMIT_UNEXPECTED_FILE') {
                return res.status(422).json({
                    status: false,
                    statusCode: 422,
                    message: 'Unexpected file field. Expected field name: "video"',
                    errors: null,
                    timestamp: new Date().toISOString()
                });
            }
            
            if (err.message && err.message.includes('Only video files are allowed')) {
                return res.status(422).json({
                    status: false,
                    statusCode: 422,
                    message: 'Invalid file type. Only video files (mp4, mov, avi, wmv, flv, mkv) are allowed.',
                    errors: null,
                    timestamp: new Date().toISOString()
                });
            }
            
            // Generic multer error
            return res.status(422).json({
                status: false,
                statusCode: 422,
                message: 'File upload error: ' + err.message,
                errors: null,
                timestamp: new Date().toISOString()
            });
        }
        
        // Check if file was actually received
        if (!req.file) {
            return res.status(422).json({
                status: false,
                statusCode: 422,
                message: 'No file received. Please ensure you are sending a file with field name "video"',
                errors: null,
                timestamp: new Date().toISOString()
            });
        }
        
        console.log('✅ Multer processing completed');
        console.log('File received:', req.file);
        next();
    });
};

module.exports = {
    uploadVideoMiddleware: uploadVideoMiddlewareWithLogging
}; 