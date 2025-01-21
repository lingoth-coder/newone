require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

// Import Routes
const marksRoutes = require('./routes/marksRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const studentRoutes = require('./routes/studentRoutes');  // Corrected to use studentRoutes.js

const app = express();

// Middleware
app.use(cors()); // CORS should be here
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

// Use Routes
app.use('/api/marks', marksRoutes);      // Marks routes
app.use('/api/attendance', attendanceRoutes); // Attendance routes
app.use('/api/studentDetails', studentRoutes);  // Student details routes (updated)

module.exports = app;
