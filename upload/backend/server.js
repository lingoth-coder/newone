const app = require('./app'); // Import app from app.js
const dotenv = require('dotenv');
dotenv.config(); // Load environment variables from .env file

const PORT = process.env.PORT || 3000; // Default to 3000 if no port is provided

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
