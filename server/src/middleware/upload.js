// upload.js — handles file uploads using Multer
//
// Multer is Express middleware for multipart/form-data,
// which is how browsers send files (like student photos).
//
// Without Multer, req.body would be empty when a form sends a file.
// Multer reads the file from the request, saves it to disk,
// and adds req.file (single) or req.files (multiple) to the request.

const multer = require('multer');
const path   = require('path');
const fs     = require('fs');

// Create the uploads folder if it doesn't exist
const uploadDir = process.env.UPLOAD_PATH || 'uploads/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 'diskStorage' tells Multer to save files to the filesystem
// (the alternative is 'memoryStorage' which keeps them in RAM)
const storage = multer.diskStorage({
  // destination: where to save the file
  destination: (req, file, cb) => {
    cb(null, uploadDir); // cb(error, folder_path) — null means no error
  },

  // filename: what to name the saved file
  // We use a timestamp + random number to avoid collisions.
  // e.g. "photo-1722531234567-483920174.jpg"
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname); // get extension: ".jpg", ".png"
    cb(null, 'photo-' + uniqueSuffix + ext);
  },
});

// fileFilter: only allow image files — reject PDFs, executables, etc.
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);  // true = accept the file
  } else {
    // false = reject the file, and the error message is returned to the client
    cb(new Error('Only JPEG, PNG, and WebP images are allowed'), false);
  }
};

// Create the multer instance with our settings
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB max
  },
});

module.exports = upload;
