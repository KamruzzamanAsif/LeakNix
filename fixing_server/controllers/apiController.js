// import modules
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');
const fs = require('fs-extra');
const multer = require('multer');
const unzipper = require('unzipper');
const diff = require('diff');
//const Diff2Html = require('diff2html').Diff2Html;
const { exec } = require('child_process');
const { parse, html } = require('diff2html'); // Correct usage for diff2html
const archiver = require('archiver');

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
        // step 1:
        // clone the source directory to the destination
        const sourceDir = path.join(__dirname, '../codes/source_code'); 
        const destDir = path.join(__dirname, '../codes/fixed_code'); 

        // clear then copy
        clearDirectory(destDir);
        fs.copy(sourceDir, destDir, (err) => {
          if (err) {
            console.error('Error copying source code folder:', err);
          } else {
            console.log('Source code Folder copied successfully!');
          }
        });

        // step 2:
        // fix the code
        // Ensure LeakPair directory and target directory are correctly defined
        const fixingCoreDir = path.join(__dirname, '../fixing_core'); // Path to LeakPair directory
        const targetDir = path.join(__dirname, '../codes/fixed_code');; // Path to target directory

        // Use the global npx path or ensure it is installed
        const npxPath = path.resolve('C:\\Program Files\\Microsoft Visual Studio\\2022\\Community\\MSBuild\\Microsoft\\VisualStudio\\NodeJs\\npx.cmd'); // Replace with the correct global npx path if different

        // result storing output directory path
        const result_path = path.join(__dirname, '../');

        // Spawn the child process to execute the command
        const child = spawn(npxPath, ['leakpair', targetDir, result_path], { cwd: fixingCoreDir }); // cwd changes working directory

        // Capture stdout
        child.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
        });

        // Capture stderr
        child.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
        });

        // Handle process close
        // Handle process close
        child.on('close', (code) => {
          console.log(`Child process exited with code ${code}`);
          // Send JSON response instead of plain text
          res.status(200).json({
              status: 'success',
              message: 'Process completed',
              exitCode: code
          });
        });
    } catch (err) {
      console.error('Error:', err);
      res.status(500).json({
          status: 'error',
          message: 'An error occurred while fixing.',
          error: err.message
      });
  }
};


// get result
const countFiles = (dir, extensions) => {
  let count = 0;

  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      count += countFiles(filePath, extensions);
    } else if (extensions.includes(path.extname(file))) {
      count++;
    }
  });

  return count;
};

exports.getResults = async (req, res) => {
  try {
    const jsonFilePath = path.join(__dirname, '../LeakFactorStats.json'); // Replace 'results.json' with your JSON file name
    const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));

    const directoryPath = path.join(__dirname, '../codes/source_code'); 
    const extensions = ['.ts', '.js', '.tsx', '.jsx'];
    const totalFiles = countFiles(directoryPath, extensions);

    jsonData.memoryLeakFixResults.refactoring.totalFilesScanned = totalFiles; // Update the JSON object

    res.json(jsonData);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).send('Internal Server Error. Sending when fix result.');
  }
};


// Recursive function to get all files in a directory and its subdirectories
const getAllFiles = (dirPath, basePath = '') => {
  let files = [];
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  entries.forEach((entry) => {
    const fullPath = path.join(dirPath, entry.name);
    const relativePath = path.join(basePath, entry.name); // Preserve relative path structure

    if (entry.isDirectory()) {
      // Recursively process subdirectory
      files = files.concat(getAllFiles(fullPath, relativePath));
    } else if (entry.isFile()) {
      // Add file's relative path
      files.push(relativePath);
    }
  });

  return files;
};

// Helper function to normalize line endings
const normalizeLineEndings = (content) => {
  return content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
};

// Helper function to ignore whitespace changes
const ignoreWhitespace = (content) => {
  return content.split('\n').map(line => line.trim()).join('\n');
};

exports.getDiffs = async (req, res) => {
  try {
    const sourceFolder = path.join(__dirname, '../codes/source_code');
    const fixedFolder = path.join(__dirname, '../codes/fixed_code');

    // Get all files (with relative paths) in both source and fixed folders
    const sourceFiles = getAllFiles(sourceFolder);
    const diffs = [];

    sourceFiles.forEach((relativePath) => {
      const sourceFilePath = path.join(sourceFolder, relativePath);
      const fixedFilePath = path.join(fixedFolder, relativePath);

      // Check if the file exists in both folders
      if (fs.existsSync(sourceFilePath) && fs.statSync(sourceFilePath).isFile()) {
        if (fs.existsSync(fixedFilePath) && fs.statSync(fixedFilePath).isFile()) {
          // Read file contents
          let sourceContent = fs.readFileSync(sourceFilePath, 'utf8');
          let fixedContent = fs.readFileSync(fixedFilePath, 'utf8');

          // Normalize line endings and ignore whitespace changes
          sourceContent = normalizeLineEndings(sourceContent);
          fixedContent = normalizeLineEndings(fixedContent);

          // Generate unified diff (ignore whitespace changes)
          const fileDiff = diff.createPatch(
            relativePath,
            ignoreWhitespace(sourceContent),
            ignoreWhitespace(fixedContent),
            'Source',
            'Fixed',
            { ignoreWhitespace: true }
          );

          // Generate unified diff
          // const fileDiff = diff.createPatch(relativePath, sourceContent, fixedContent);
          
          // Parse the diff into a format diff2html understands
          const diffJson = parse(fileDiff);

          // Push both full code content and diff to the response and only the changed files
          const deletedLines = parseInt(diffJson[0].deletedLines, 10);
          const addedLines = parseInt(diffJson[0].addedLines, 10);

          if (!isNaN(deletedLines) && !isNaN(addedLines) && (deletedLines !== 0 && addedLines !== 0)) {
            // console.log('Including file:', relativePath);
            // console.log('Deleted lines:', deletedLines);
            // console.log('Added lines:', addedLines);
            diffs.push({
              filename: relativePath,
              fullCode: "", // Add full code content from the source file
              diffJson: diffJson,
              rawDiff: fileDiff,
            });
          } 
        }
      }
    });

    res.json({ diffs });
    console.log('diffs sent successfully');
  } catch (err) {
    console.error('Error:', err);
    res.status(500).send('Internal Server Error');
  }
};


///////////////// Final Fix code getting section ////////////////
// Normalize paths to use forward slashes
const normalizePath = (filePath) => filePath.replace(/\\/g, '/');

// Recursive function to copy directories
const copyDirSync = (src, dest) => {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath); // Recursively copy subdirectories
    } else {
      fs.copyFileSync(srcPath, destPath); // Copy files
    }
  }
};

// Apply accepted changes and download the code as zip file
exports.applyFixes = async (req, res) => {
  const { rejectedFiles } = req.body; // Array of rejected file names
  console.log('Rejected files:', rejectedFiles);

  const sourceDir = path.join(__dirname, '../codes/source_code'); // Path to source code directory
  const fixedDir = path.join(__dirname, '../codes/fixed_code'); // Path to fixed code directory
  const finalDir = path.join(__dirname, '../codes/final_code'); // Path to final code directory

  try {
    // Step 1: Create the final code directory
    if (fs.existsSync(finalDir)) {
      fs.rmSync(finalDir, { recursive: true }); // Delete the directory if it exists
    }
    fs.mkdirSync(finalDir, { recursive: true });

    // Step 2: Copy all files from the fixed code directory to the final code directory
    copyDirSync(fixedDir, finalDir);

    // Step 3: Replace files in the final code directory with source code files (if in rejectedFiles list)
    const replaceFiles = (src, dest) => {
      const entries = fs.readdirSync(src, { withFileTypes: true });

      for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        const relativePath = normalizePath(path.relative(sourceDir, srcPath));
        

        if (entry.isDirectory()) {
          replaceFiles(srcPath, destPath); // Recursively process subdirectories
        } else {
          // Normalize the rejected file paths for comparison
          const normalizedRejectedFiles = rejectedFiles.map(normalizePath);

          // console.log('Relative path:', relativePath);
          // console.log('Normalized rejected files:', normalizedRejectedFiles);

          if (normalizedRejectedFiles.includes(relativePath)) {
            // Replace the file in the final directory with the one from the source directory
            console.log('Replacing file:', relativePath);
            fs.copyFileSync(srcPath, destPath);
          }
        }
      }
    };

    // Start replacing files from the source directory
    replaceFiles(sourceDir, finalDir);

    // Step 4: Create a zip archive of the final code directory
    const zipFilePath = path.join(__dirname, '../codes/final-code.zip');
    const output = fs.createWriteStream(zipFilePath);
    const archive = archiver('zip', { zlib: { level: 9 } }); // Compression level

    output.on('close', () => {
      console.log('Zip file created successfully:', archive.pointer() + ' total bytes');

      // Step 5: Send the zip file to the frontend
      res.download(zipFilePath, 'final-code.zip', (err) => {
        if (err) {
          console.error('Error sending zip file:', err);
          res.status(500).send('Error sending zip file');
        } else {
          console.log('Zip file sent successfully');
          // Delete the zip file and final directory after sending (optional)
          fs.unlinkSync(zipFilePath);
          fs.rmSync(finalDir, { recursive: true });
        }
      });
    });

    archive.on('error', (err) => {
      throw err;
    });

    archive.pipe(output);
    archive.directory(finalDir, false); // Add the final code directory to the zip
    archive.finalize();
  } catch (err) {
    console.error('Error processing files:', err);
    res.status(500).send('Error processing files');
  }
};