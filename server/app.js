// Load packages
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const apiRoutes = require('./routes/apiRoutes');
const WebSocket = require('ws'); // Import the ws library
const { spawn } = require('child_process'); // Assuming you need this for the child process

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


// web socket connection
const wss = new WebSocket.Server({ port: 4001 });
wss.on('connection', (ws) => {
  console.log('Client connected');

  // Listen for messages from the client (expecting a URL)
  ws.on('message', (message) => {
    try {
      const clientData = JSON.parse(message);
      const url = clientData.url;

      if (!url) {
        ws.send('No URL provided');
        return;
      }

      // Start the child process using the provided URL
      const childProcess = spawn('node', ['C:\\Deep Learning\\fuite\\src\\cli.js', '--scenario', 'C:\\Deep Learning\\fuite\\src\\myScenario.mjs', url]);

      // Notify the client that execution has started
      ws.send('Starting execution...');

      // Send stdout data to the connected client
      childProcess.stdout.on('data', (data) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(data.toString());
        }
      });

      // Send stderr data to the connected client
      childProcess.stderr.on('data', (data) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(`Error: ${data.toString()}`);
        }
      });

      // Notify the client when the process closes
      childProcess.on('close', (code) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(`Execution completed with code ${code}.`);
          ws.close(); // Optionally close the WebSocket connection
        }
      });

      // Handle client disconnection
      ws.on('close', () => {
        console.log('Client disconnected');
        childProcess.kill(); // Terminate the process if the client disconnects
      });
    } catch (error) {
      ws.send('Invalid message format');
    }
  });
});


// Run Application
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
