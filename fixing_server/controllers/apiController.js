// import modules
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const unzipper = require('unzipper');

// Uploading source code
// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../codes');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, 'source-code.zip');
  },
});
const upload = multer({ storage });
// Function to clear the folder
function clearDirectory(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.readdirSync(dirPath).forEach((file) => {
      const filePath = path.join(dirPath, file);
      if (fs.lstatSync(filePath).isDirectory()) {
        // Recursively remove directories
        clearDirectory(filePath);
        fs.rmdirSync(filePath);
      } else {
        // Remove files
        fs.unlinkSync(filePath);
      }
    });
  } else {
    fs.mkdirSync(dirPath, { recursive: true }); // Ensure the directory exists
  }
}

exports.getUploadSourceCode = async (req, res) => {
  upload.single('sourceCode')(req, res, async (err) => {
    if (err) {
      console.error('File upload error:', err.message);
      return res.status(500).json({ message: 'Error uploading source code', error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const extractPath = path.join(__dirname, '../codes/source_code');

    try {
      // Step 1: Clear the target directory
      console.log('Clearing target directory...');
      clearDirectory(extractPath);

      // Step 2: Extract the ZIP file
      // Read the zip file and filter entries
      const directoryPromises = [];
      const zipEntries = await fs
        .createReadStream(filePath)
        .pipe(unzipper.Parse())
        .on('entry', (entry) => {
          const entryName = entry.path;

          // Skip node_modules and .git directories
          if (entryName.includes('node_modules') || entryName.includes('.git')) {
            // console.log(`Skipping ${entryName}`);
            entry.autodrain();
          } else {
            const outputPath = path.join(extractPath, entryName);

            if (entry.type === 'Directory') {
              directoryPromises.push(
                fs.promises.mkdir(outputPath, { recursive: true }).catch((e) => {
                  console.error(`Error creating directory: ${outputPath}`, e.message);
                })
              );
              entry.autodrain(); // Directory doesn't require writing
            } else {
              const directory = path.dirname(outputPath);
              if (!fs.existsSync(directory)) {
                fs.mkdirSync(directory, { recursive: true });
              }
              entry.pipe(fs.createWriteStream(outputPath));
            }
          }
        })
        .promise();

      // Wait for all directory creation promises
      await Promise.all(directoryPromises);

      console.log('File extracted successfully:', extractPath);
      res.status(200).json({
        message: 'File uploaded and extracted successfully, skipping unwanted directories',
        filePath,
        extractPath,
      });
    } catch (err) {
      console.error('Error extracting file:', err.message);
      res.status(500).json({ message: 'Error extracting file', error: err.message });
    }
  });
};



// Leak Fixing
const { spawn } = require('child_process');

exports.fixLeak = async (req, res) => {
    try {
        // Ensure LeakPair directory and target directory are correctly defined
        const leakPairDir = path.resolve('C:\\Users\\DELL\\Desktop\\server\\LeakPair'); // Path to LeakPair directory
        const targetDir = 'C:\\Users\\DELL\\Desktop\\collosal'; // Path to target directory

        // Use the global npx path or ensure it is installed
        const npxPath = path.resolve('C:\\Program Files\\Microsoft Visual Studio\\2022\\Community\\MSBuild\\Microsoft\\VisualStudio\\NodeJs\\npx.cmd'); // Replace with the correct global npx path if different

        // Spawn the child process to execute the command
        const child = spawn(npxPath, ['leakpair', targetDir], { cwd: leakPairDir }); // cwd changes working directory

        // Capture stdout
        child.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
        });

        // Capture stderr
        child.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
        });

        // Handle process close
        child.on('close', (code) => {
            console.log(`child process exited with code ${code}`);
            res.status(200).send(`Process completed with code ${code}`);
        });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).send('An error occurred');
    }
};
