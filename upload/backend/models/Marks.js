const mongoose = require('mongoose');

// Schema for Exam Data with dynamic subjects
const examSchema = new mongoose.Schema({
    regNo: { type: String, required: true },
    subjects: { type: Map, of: Number } // A Map that stores subjects as keys and marks as values
});

// Create models for each exam type dynamically
const IAT1 = mongoose.model('IAT1', examSchema);
const IAT2 = mongoose.model('IAT2', examSchema);
const UnitTest = mongoose.model('UnitTest', examSchema);
const ModelExam = mongoose.model('ModelExam', examSchema);
const Semester = mongoose.model('Semester', examSchema);

module.exports = { IAT1, IAT2, UnitTest, ModelExam, Semester };
