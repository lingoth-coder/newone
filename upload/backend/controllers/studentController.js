// controllers/studentController.js
const fs = require('fs');
const xlsx = require('xlsx');
const csv = require('csv-parser');
const Student = require('../models/Student');

// Function to convert XLSX to CSV
const convertXlsxToCsv = (xlsxFilePath, csvFilePath) => {
    const workbook = xlsx.readFile(xlsxFilePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const csvData = xlsx.utils.sheet_to_csv(sheet);
    fs.writeFileSync(csvFilePath, csvData);
};

// Controller to handle student details file upload
const uploadStudentDetailsFile = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded.' });
    }

    console.log('File uploaded:', req.file);
    const filePath = req.file.path;
    let csvFilePath = filePath;
    
    // Convert XLSX to CSV if necessary
    if (req.file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        req.file.mimetype === 'application/vnd.ms-excel') {
        csvFilePath = filePath.replace(/\.xlsx$/, '.csv');
        convertXlsxToCsv(filePath, csvFilePath);
    }

    // Array to store parsed student data
    const studentData = [];

    try {
        await new Promise((resolve, reject) => {
            fs.createReadStream(csvFilePath)
                .pipe(csv({ headers: ['regNo', 'name', 'email', 'phone', 'parentPhone', 'department', 'currentSemester', 'cgpa', 'attendancePercentage'], skipLines: 1 }))
                .on('data', (row) => {
                    try {
                        const regNo = parseInt(row.regNo?.trim(), 10);
                        if (!isNaN(regNo) && row.name && row.email && row.phone && row.parentPhone && row.department) {
                            studentData.push({
                                regNo,
                                name: row.name.trim(),
                                email: row.email.trim(),
                                phone: row.phone.trim(),
                                parentPhone: row.parentPhone.trim(),
                                department: row.department.trim(),
                                currentSemester: parseInt(row.currentSemester?.trim(), 10),
                                cgpa: parseFloat(row.cgpa?.trim()),
                                attendancePercentage: parseFloat(row.attendancePercentage?.trim())
                            });
                        } else {
                            console.warn('Skipping invalid row:', row);
                        }
                    } catch (error) {
                        console.warn('Error parsing row:', row, error);
                    }
                })
                .on('end', resolve)
                .on('error', reject);
        });

        console.log('Parsed CSV data:', studentData);
        const result = await Student.insertMany(studentData);
        console.log('Data saved to MongoDB:', result);

        res.status(200).json({ message: 'Student details uploaded and saved successfully!', data: result });
    } catch (error) {
        console.error('Error processing file or saving to MongoDB:', error);
        res.status(500).json({ message: 'Failed to process file or save data', error: error.message });
    } finally {
        // Cleanup temporary files
        if (filePath !== csvFilePath) {
            fs.unlinkSync(csvFilePath);
        }
        fs.unlinkSync(filePath);
    }
};

module.exports = { uploadStudentDetailsFile };
