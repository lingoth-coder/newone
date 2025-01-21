const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // Set upload destination

// Handle file upload
exports.uploadFile = upload.single('file');  // 'file' is the field name in the form

exports.processFile = async (req, res) => {
  try {
    const file = req.file; // Get the uploaded file
    // Process the file (e.g., read Excel data)
    // You can use libraries like 'xlsx' to read Excel files and save the data to MongoDB

    // After processing, send a success response
    res.status(200).json({ message: 'File uploaded and processed successfully' });
  } catch (err) {
    res.status(500).json({ message: "Error processing file", error: err });
  }
};
