// Load packages
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const apiRoutes = require('./routes/apiRoutes');
const WebSocket = require('ws'); // Import the ws library
const { spawn } = require('child_process'); // Assuming you need this for the child process
const path = require('path');
const fs = require('fs');

// Load .env
dotenv.config(); 

// Build Application & Options
const app = express();
app.use(express.json()); // Body parser
app.use(cors());


// Routes
app.use('/api', apiRoutes);


// Serve static files from the public folder
app.use(express.static('public'));



// Run Application
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Fix Server is running on port ${PORT}`);
});
