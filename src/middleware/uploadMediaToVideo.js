const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Helper to create directories if not exist
function ensureDirSync(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const userId = req.user ? req.user.id : 'guest';
    const timestamp = req._uploadTimestamp || Date.now();
    req._uploadTimestamp = timestamp;
    let baseDir = path.join(__dirname, '../../uploads');
    let subDir = file.fieldname === 'photos'
      ? `photos/${userId}/${timestamp}`
      : `audio/${userId}/${timestamp}`;
    let dir = path.join(baseDir, subDir);
    ensureDirSync(dir);
    file._uploadDir = dir; // Save for later
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    if (file.fieldname === 'photos') {
      cb(null, `photo_${Date.now()}_${file.originalname}`);
    } else if (file.fieldname === 'audio') {
      cb(null, `audio_${Date.now()}${path.extname(file.originalname)}`);
    }
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 3 * 1024 * 1024 // 3MB for photos, will check audio in controller
  },
  fileFilter: function (req, file, cb) {
    if (file.fieldname === 'photos') {
      if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.mimetype)) {
        return cb(new Error('Only JPG, JPEG, PNG images are allowed for photos'));
      }
    } else if (file.fieldname === 'audio') {
      if (!['audio/mpeg', 'audio/wav', 'audio/aac'].includes(file.mimetype)) {
        return cb(new Error('Only MP3, WAV, AAC audio files are allowed'));
      }
    }
    cb(null, true);
  }
});

module.exports = upload.fields([
  { name: 'photos', maxCount: 20 },
  { name: 'audio', maxCount: 1 }
]); 