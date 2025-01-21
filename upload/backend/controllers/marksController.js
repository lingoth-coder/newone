const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const { IAT1, IAT2, UnitTest, ModelExam, Semester } = require('../models/Marks'); // Import exam models

// Controller to handle marks file upload
const uploadMarksFile = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded.' });
    }

    console.log('File uploaded:', req.file);
    const filePath = req.file.path;

    try {
        // Read the Excel file
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0]; // Assuming the first sheet contains the marks data
        const sheet = workbook.Sheets[sheetName];

        // Parse the data into a JSON array, where each row is an object
        const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        // Extract subject names from the first row (excluding regNo)
        const headers = data[0].slice(1); // Remove the first column (regNo), keep the subjects
        console.log('Extracted Headers:', headers);

        // Array to store parsed marks data
        const marksData = [];

        // Loop through the parsed rows (excluding the header row) and process them
        for (const row of data.slice(1)) { // Skip the header row
            if (!row[0]) continue; // Skip if regNo is empty

            const regNo = row[0]; // regNo is always the first column
            const marks = { regNo, subjects: {} }; // Store the subject-mark data dynamically

            // Map each subject from the headers to the corresponding mark in the row
            headers.forEach((subject, index) => {
                marks.subjects[subject] = row[index + 1]; // index + 1 because row[0] is regNo
            });

            marksData.push(marks);
        }

        console.log('Parsed Marks Data:', marksData);

        // Insert or update marks data for each student
        const result = [];
        for (const marks of marksData) {
            let ExamModel;
            // Dynamically pick the correct exam model based on the exam type
            switch (req.body.examType) {
                case 'IAT1':
                    ExamModel = IAT1;
                    break;
                case 'IAT2':
                    ExamModel = IAT2;
                    break;
                case 'UnitTest':
                    ExamModel = UnitTest;
                    break;
                case 'ModelExam':
                    ExamModel = ModelExam;
                    break;
                case 'Semester':
                    ExamModel = Semester;
                    break;
                default:
                    return res.status(400).json({ message: 'Invalid exam type.' });
            }

            const existingMarks = await ExamModel.findOne({ regNo: marks.regNo });

            if (existingMarks) {
                // Update existing document with new exam data
                existingMarks.subjects = marks.subjects;
                const updatedMarks = await existingMarks.save();
                result.push(updatedMarks);
            } else {
                // Insert new document for the student
                const newMarks = await ExamModel.create(marks);
                result.push(newMarks);
            }
        }

        console.log('Data saved to MongoDB:', result);

        res.status(200).json({ message: 'Marks data uploaded and saved successfully!', data: result });

    } catch (error) {
        console.error('Error uploading marks:', error);
        res.status(500).json({ message: 'Error uploading marks data', error: error.message });
    } finally {
        // Cleanup temporary files
        fs.unlinkSync(filePath);
    }
};

module.exports = { uploadMarksFile };
