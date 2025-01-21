


require('dotenv').config();
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const port = 3000;
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

app.post('/marks', async (req, res) => {
    const { exam, regNo, subjects } = req.body;

    try {
        let model;
        switch (exam) {
            case 'iat1':
                model = IAT1;
                break;
            case 'iat2':
                model = IAT2;
                break;
            case 'unitTest':
                model = UnitTest;
                break;
            case 'model':
                model = ModelExam;
                break;
            case 'semester':
                model = Semester;
                break;
            default:
                return res.status(400).send('Invalid exam type');
        }

        const newExam = new model({ regNo, subjects });
        await newExam.save();
        res.send('Data saved successfully');
    } catch (error) {
        console.error('Error saving marks:', error);
        res.status(500).send('Internal server error');
    }
});

app.post('/addPrevSemData', async (req, res) => {
    try {
        const { regNo, GPA, semester } = req.body;

        // Create a new document based on the schema
        const newPrevSem = new prevSem({
            regNo,
            GPA,
            semester
        });

        // Save the document to the database
        await newPrevSem.save();

        // Send a success response
        res.status(201).json({ message: 'Data added successfully', data: newPrevSem });
    } catch (error) {
        // Handle errors and send a failure response
        console.error('Error adding data:', error);
        res.status(500).json({ message: 'Internal server error', error });
        res.status(400).json({ message: 'Error adding data', error });
    }
});
async function queryGemini(regno) {
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
       
           console.log(attendanceData);
          
         
        const genAI = new GoogleGenerativeAI('AIzaSyD2j5MWuEFMb1uEofq_Ohmb0sKOWVhfd44');
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

     
        const prompt = `you are a mark analysis
       
      
        The student's details: ${studentDetails}
        The student's attendance percentage: ${attendancePercentage.toFixed(2)}
        The student's attendance: ${filteredAttendance.map(a => a.status).join(', ')}
        The student's IAT1 marks: ${iat1Data}
        The student's IAT2 marks: ${iat2Data}
        The student's model marks: ${modelExamData}
        The student's unit test marks: ${unitTestData}
        The student's semester marks: ${semesterData}
        the student's previous marks: ${prevSemData}

        alayise all the details and give a summary of 1 lines 25 to 33 words exactly 
        address as student dont address as his or her
        ur a bot giving analysis of a student
        like ur talking to a parent
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

    const { regno} = req.body;
      
    try {
        
        const investIQ = await queryGemini(regno);
        const studentDetails = await Student.findOne({ regNo:regno });
       const attendanceData = await Attendance.find({ studentRegNo: regno });
       const iat1Data = await IAT1.findOne({ regNo:regno });
       const iat2Data = await IAT2.findOne({ regNo:regno });
       const unitTestData = await UnitTest.findOne({ regNo:regno });
       const modelExamData = await ModelExam.findOne({ regNo:regno });
       const semesterData = await Semester.findOne({ regNo:regno });
       const prevSemData = await prevSem.find({ regNo:regno });

       const semesterStartDate = new Date('2025-01-01');

       // Filter attendance data starting from the semester start date
       const filteredAttendance = attendanceData.filter(a => new Date(a.date) >= semesterStartDate);

       // Total classes conducted since the semester started
       const totalClasses = filteredAttendance.length;
       
       // Total classes attended
       const classesAttended = filteredAttendance.filter(a => a.status === 'present').length;
       const attendancePercentage = totalClasses > 0
         ? (classesAttended / totalClasses) * 100
         : 0;
       
           console.log(attendanceData);

        const data={
            studentDetails,
            attendancePercentage,
            iat1Data,
            iat2Data,
            modelExamData,
            unitTestData,
            semesterData,
            prevSemData,
            summary: investIQ

        }
        if (!investIQ) {
            return res.status(500).json({ error: 'output' });
        }
        console.log(data)
        res.json(data);
    } catch (error) {
        console.error('Error in output generation', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});






// Serve the frontend files (optional if using separate frontend)
app.use(express.static('public'));


app.listen(port,()=>console.log('listening on port 3000'));