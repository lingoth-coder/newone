


require('dotenv').config();
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const port = 3001;
app.use(cors());

app.use(express.json());


var prev=[]
mongoose.connect('mongodb://localhost:27017/db-hack')
.then(()=>{
    console.log('Connected to MongoDB');
}).catch(err => console.log(err));

// Define schema template
const examSchema = new mongoose.Schema({
    regNo: { type: String, required: true },
    subjects: { type: Map, of: Number } // A Map that stores subjects as keys and marks as values
});
const prevSemSchema = new mongoose.Schema({
    regNo: { type: String, required: true },
    GPA: { type: Number, required: true},
    semester: { type: Number, required: true}
});


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

const attendanceSchema = new mongoose.Schema({
    studentRegNo: { type: String, required: true },  // Change from String to Number
    date: { type: Date, required: true },
    status: { type: String, required: true }
},{ versionKey: false });


// Create models
const Student = mongoose.model('Student', studentSchema);
const Attendance = mongoose.model('Attendance', attendanceSchema);
const IAT1 = mongoose.model('IAT1', examSchema);
const IAT2 = mongoose.model('IAT2', examSchema);
const UnitTest = mongoose.model('UnitTest', examSchema);
const ModelExam = mongoose.model('ModelExam', examSchema);
const Semester = mongoose.model('Semester', examSchema);
const prevSem=mongoose.model('PrevSem', prevSemSchema);



async function queryGemini(regno,user) {
    try {
        
       console.log(regno)
       const studentDetails = await Student.findOne({ regNo:regno });
       const attendanceData = await Attendance.find({ studentRegNo: regno });
       const iat1Data = await IAT1.findOne({ regNo:regno });
       const iat2Data = await IAT2.findOne({ regNo:regno });
       const unitTestData = await UnitTest.findOne({ regNo:regno });
       const modelExamData = await ModelExam.findOne({ regNo:regno });
       const semesterData = await Semester.findOne({ regNo:regno });
       const prevSemData = await prevSem.find({ regNo:regno });

       const semesterStartDate = new Date('2025-01-01');

       const filteredAttendance = attendanceData.filter(a => new Date(a.date) >= semesterStartDate);

       // Total classes conducted since the semester started
       const totalClasses = filteredAttendance.length;
       
       // Total classes attended
       const classesAttended = filteredAttendance.filter(a => a.status === 'Present').length;
       const attendancePercentage = totalClasses > 0
         ? (classesAttended / totalClasses) * 100
         : 0;
       
          
          prev=[...prev,user]
        const genAI = new GoogleGenerativeAI('AIzaSyD2j5MWuEFMb1uEofq_Ohmb0sKOWVhfd44');
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

     
        const prompt = `You are a teacher attending a parent-teacher meeting and speaking with a parent.
        if they ask about total give them total of each exam
        if marks is less than 40 then the student is failed
        if user ask about a specific subject give the details of only that subject
        if  user ask about a specific sem details give gpa of all sem 
        Previous conversation: ${prev}
        Current user input: ${user}
       The student's details: ${studentDetails}
        The student's attendance percentage: ${attendancePercentage.toFixed(2)}
        The student's attendance: ${filteredAttendance.map(a => a.status).join(', ')}
        The student's IAT1 marks: ${iat1Data}
        The student's IAT2 marks: ${iat2Data}
        The student's model marks: ${modelExamData}
        The student's unit test marks: ${unitTestData}
        The student's semester marks: ${semesterData}
        the student's previous marks: ${prevSemData}
        if parants ask about previous sem give them the old sem details 

        if they ask about spcific sub mark give only specific subject mark
        if parents ask about total mark give them total of each exam
        dont display in form of table
     

        
        Based on the student's marks in IAT1, IAT2, model, unit test, and semester, generate a report. If any subject is marked as "NA," do not consider it in the analysis.
        -this is current sem details
        sem started on 1/1/2025
        Your response should be in the following formal format for the first message:
        -student details
        -attendence percentage
        - IAT marks:
        - Unit test marks:
        - Model marks:
        - Semester marks:
        - Student mark analysis:
        
        Ensure that the report focuses  on analyzing the student's performance, without expressing emotions or engaging in unnecessary chat. Use professional language, similar to how a teacher would present the marks.
        If parents ask about previous sem details give them a full analysis of prev sem details
        For any subsequent messages (if ${prev} is not null), continue the conversation in a formal, teacher-like manner based on the context of the previous exchange and the student's marks, addressing any follow-up questions professionally.
        `;
        

        
      
        var result = await model.generateContent(prompt);

       
   

        const generateText= result.response.candidates[0]?.content;
        console.log(generateText.parts[0].text);
        prev=[...prev,generateText.parts[0].text || 'No content generated.']
        return generateText.parts[0].text || 'No content generated.';
    } catch (error) {
        console.error('Error querying Gemini:', error);
        return null;
    }
}

// Endpoint to handle file upload and bail petition generation
app.post('/chat', async (req, res) => {

    const { regno,user} = req.body;
      
    try {
        
        const investIQ = await queryGemini(regno,user);
        if (!investIQ) {
            return res.status(500).json({ error: 'output' });
        }
        // console.log(investIQ)
        res.json({msg: investIQ });
    } catch (error) {
        console.error('Error in output generation', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Serve the frontend files (optional if using separate frontend)
app.use(express.static('public'));

// // Start server
// app.listen(port, () => {
//     console.log(`Server running on http://localhost:${port}`);
// });




// // Initialize Express app

// // Connect to MongoDB

app.post('/add-student', async (req, res) => {
    try {
      const studentData = req.body;
      const newStudent = new Student(studentData);
      await newStudent.save();
      res.status(201).json({ message: 'Student added successfully', student: newStudent });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  
  // Route to add attendance
  app.post('/add-attendance', async (req, res) => {
    try {
      const attendanceData = req.body;
  
      // Check if the student exists
      const studentExists = await Student.findOne({ regNo: attendanceData.regNo });
      if (!studentExists) {
        return res.status(404).json({ message: 'Student not found' });
      }
  
      const newAttendance = new Attendance(attendanceData);
      await newAttendance.save();
      res.status(201).json({ message: 'Attendance added successfully', attendance: newAttendance });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post('/add-prev-sem', async (req, res) => {
    try {
      const {
        regno,
        sem,
        gpa,
        sub1_name, sub1_mark,
        sub2_name, sub2_mark,
        sub3_name, sub3_mark,
        sub4_name, sub4_mark,
        sub5_name, sub5_mark,
        sub6_name, sub6_mark,
        sub7_name, sub7_mark,
        sub8_name, sub8_mark
      } = req.body;
  
      // Check if the record already exists
      const existingRecord = await prevSem.findOne({ regno, sem });
      if (existingRecord) {
        return res.status(400).json({ message: 'Record already exists for this student and semester.' });
      }
  
      // Create a new document
      const newPrevSem = new prevSem({
        regno,
        sem,
        gpa,
        sub1_name, sub1_mark,
        sub2_name, sub2_mark,
        sub3_name, sub3_mark,
        sub4_name, sub4_mark,
        sub5_name, sub5_mark,
        sub6_name, sub6_mark,
        sub7_name, sub7_mark,
        sub8_name, sub8_mark
      });
  
      // Save to the database
      await newPrevSem.save();
  
      res.status(201).json({ message: 'Previous semester data added successfully!', data: newPrevSem });
    } catch (error) {
      res.status(500).json({ message: 'Error adding data', error: error.message });
    }
  });
  

app.listen(port, () => {
        console.log(`Server running on http://localhost:${port}`);
    });