// Load packages
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const apiRoutes = require('./routes/apiRoutes');

// Load .env
dotenv.config(); 

// Build Application & Options
const app = express();
app.use(express.json()); // Body parser
app.use(cors());


// DB connection
TODO: 'Work with Database'


// Routes
app.use('/api', apiRoutes);




// Run Application
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
