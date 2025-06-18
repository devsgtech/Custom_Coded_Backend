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

module.exports = {
    uploadVideoMiddleware
}; 