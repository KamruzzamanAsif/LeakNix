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


// web socket connection
const wss = new WebSocket.Server({ port: 4001 });
wss.on('connection', (ws) => {
  console.log('Client connected');

  // Listen for messages from the client (expecting a URL)
  ws.on('message', (message) => {
    try {
      const clientData = JSON.parse(message);
      const url = clientData.url;
      const scenario_used = clientData.scenario_used;
      console.log("scenario used:" ,scenario_used)

      if (!url) {
        ws.send('No URL provided');
        return;
      }

      // Start the child process using the provided URL
      // const childProcess = spawn('node', ['fuite\\src\\cli.js', '--scenario', 'fuite\\src\\custom-scenario.mjs', '--output', 'fuite\\output', url]);
      // if(scenario_used){
      //   const childProcess = spawn('node', ['fuite\\src\\cli.js', '--scenario', 'fuite\\src\\custom-scenario.mjs', '--output', 'fuite\\output', url]);
      // }
      // else{
      //   const childProcess = spawn('node', ['fuite\\src\\cli.js', '--output', 'fuite\\output', url]);
      // }

      // Build the arguments array dynamically
      const args = ['fuite\\src\\cli.js'];

      if (scenario_used) {
        args.push('--scenario', 'fuite\\src\\custom-scenario.mjs');
      }

      args.push('--output', 'fuite\\output', url);

      // Start the child process using the constructed arguments array
      const childProcess = spawn('node', args);

      // Calculate time
      const startTime = Date.now(); // Start time

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
        const endTime = Date.now(); // End time
        const elapsedTime = ((endTime - startTime) / 1000).toFixed(2); // Elapsed time in seconds

        if (ws.readyState === WebSocket.OPEN) {
          ws.send(`Execution completed with code ${code}.`);
          ws.send(`Total time elapsed: ${elapsedTime} seconds.`);

          // Read JSON file after process completes
          const jsonFilePath = path.resolve('fuite/output');
          fs.readFile(jsonFilePath, 'utf8', (err, data) => {
            if (err) {
              ws.send(`Error reading JSON file: ${err.message}`);
            } else {
              ws.send(JSON.stringify({ fileContent: data }));
              // console.log(JSON.stringify({ fileContent: data }));
              console.log("output json file sent successfully")
            }
          });

           // Send the final "end signal"
          setTimeout(() => {
            ws.send('Execution finished. Closing WebSocket.');
            ws.close();
          }, 50);
        }
      });

      // Handle client disconnection
      ws.on('close', () => {
        console.log('Client disconnected');
        childProcess.kill(); // Terminate the process if the client disconnects
      });
    } catch (error) {
      ws.send('Invalid message format');
      ws.close();
    }
  });
});


// Run Application
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
