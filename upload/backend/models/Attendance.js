const mongoose = require('mongoose');

// Define the schema for attendance
const attendanceSchema = new mongoose.Schema({
    studentRegNo: { type: String, required: true },  // Change from String to Number
    date: { type: Date, required: true },
    status: { type: String, required: true }
},{ versionKey: false });

// Create the model based on the schema
const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance;
