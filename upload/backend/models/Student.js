// models/Student.js
const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    regNo: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    parentPhone: { type: String, required: true },
    department: { type: String, required: true },
    currentSemester: { type: Number, required: true },
    cgpa: { type: Number, required: true },
    attendancePercentage: { type: Number, required: true }
});

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;
