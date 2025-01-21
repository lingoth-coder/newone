// routes/studentRoutes.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Student = require('../models/Student');
const { uploadStudentDetailsFile } = require('../controllers/studentController');
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

// POST route for uploading student details
router.post('/uploadStudentDetails', (req, res, next) => {
    upload.single('studentDetailsFile')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ message: `Multer Error: ${err.message}` });
        } else if (err) {
            return res.status(400).json({ message: `Upload Error: ${err.message}` });
        }
        next();
    });
}, uploadStudentDetailsFile);

// Route to serve student details dynamically
// Route to fetch student details by registration number
// In studentRoutes.js
router.get('/students/:regNo', async (req, res) => {
    try {
        const student = await Student.findOne({ regNo: req.params.regNo });

        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        res.status(200).json(student);  // Send the student details as JSON response
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error fetching student details" });
    }
});



module.exports = router;
