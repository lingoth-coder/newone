const express = require('express');
const multer = require('multer');
const { uploadMarksFile } = require('../controllers/marksController'); // Import the controller function

const router = express.Router();

// Setup Multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Define the upload folder
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname); // Append a timestamp to file name to avoid duplicates
    }
});
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

router.post('/uploadMarks', (req, res, next) => {
    upload.single('marksFile')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ message: `Multer Error: ${err.message}` });
        } else if (err) {
            return res.status(400).json({ message: `Upload Error: ${err.message}` });
        }
        next();
    });
}, uploadMarksFile);
// Route for uploading marks file (Excel/CSV)
//router.post('/uploadMarks', upload.single('marksFile'), uploadMarksFile);

module.exports = router;
