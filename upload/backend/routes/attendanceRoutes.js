const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { uploadAttendanceFile } = require('../controllers/attendanceController');
const router = express.Router();

// Ensure the 'uploads' directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    },
});

// Multer instance with file type validation
const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(csv|xlsx)$/)) {
            return cb(new Error('Only CSV and XLSX files are allowed!'));
        }
        cb(null, true);
    },
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB size limit
});

// POST route for uploading attendance
router.post('/uploadAttendance', (req, res, next) => {
    upload.single('attendanceFile')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ message: `Multer Error: ${err.message}` });
        } else if (err) {
            return res.status(400).json({ message: `Upload Error: ${err.message}` });
        }
        next();
    });
}, uploadAttendanceFile);

module.exports = router;
