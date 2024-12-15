// import modules
const axios = require('axios');
const cheerio = require('cheerio');
const urlLib = require('url');
const Detector = require('technology-detector-node');
const path = require('path');
const fs = require('fs');

// All the api handler methods
const {dnsHandler} = require('../api-handlers/dns-handler');
const {portHandler} = require('../api-handlers/port-handler');


// API method for retrieving DNS records
exports.getDnsRecords = async (req, res) => {
    try {
      let url = req.query.url;
      let hostname = url;
  
      // Extract hostname from URL if it starts with http/https
      if (hostname.startsWith('http://') || hostname.startsWith('https://')) {
        hostname = new URL(hostname).hostname;
      }
  
      // Remove 'www.' if present
      if (hostname.startsWith('www.')) {
        hostname = hostname.replace('www.', '');
      }
  
      console.log(`Fetching DNS records for: ${hostname}`);
  
      const dnsRecords = await dnsHandler(hostname);

      res.status(200).json(dnsRecords);
    } catch (err) {
      console.error('Error retrieving DNS records:', err.message);
      res.status(500).json({ message: 'Error retrieving DNS records', error: err.message });
    }
};


// API method for retrieving Location info
exports.getLocationInfo = async (req, res) => {
    try {
      let ip = req.query.ip;
  
      if (!ip) {
        return res.status(400).json({ message: 'IP address is required.' });
      }
  
      // Fetch location information from ipapi.co
      const response = await axios.get(`https://ipapi.co/${ip}/json/`);
      
      // Extract location data from the response
      const locationData = response.data;
  
      // Send the location data in the response
      res.status(200).json(locationData);
  
    } catch (err) {
      console.error('Error retrieving location info:', err.message);
      res.status(500).json({ message: 'Error retrieving location info.', error: err.message });
    }
};


// API method for getting linked pages
exports.getLinkedPages = async (req, res) => {
   // the url must be like this: https://xyz.com
   let url = req.query.url;
   // Ensure the URL starts with either "http://" or "https://"
   let normalizedUrl = url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
   // Remove 'www.' if it exists
   if (normalizedUrl.includes('www.')) {
     normalizedUrl = normalizedUrl.replace('www.', '');
   }
   url = normalizedUrl; // update the url
 
   console.log(normalizedUrl);
   try {
     const response = await axios.get(url);
     console.log("Response:", response);
     const html = response.data;
     const $ = cheerio.load(html);
     const internalLinksMap = new Map();
     const externalLinksMap = new Map();
 
     $('a[href]').each((i, link) => {
       const href = $(link).attr('href');
       const absoluteUrl = urlLib.resolve(url, href);
 
       if (absoluteUrl.startsWith(url)) {
         const count = internalLinksMap.get(absoluteUrl) || 0;
         internalLinksMap.set(absoluteUrl, count + 1);
       } else if (href.startsWith('http://') || href.startsWith('https://')) {
         const count = externalLinksMap.get(absoluteUrl) || 0;
         externalLinksMap.set(absoluteUrl, count + 1);
       }
     });
 
     const internalLinks = [...internalLinksMap.entries()].sort((a, b) => b[1] - a[1]).map(entry => entry[0]);
     const externalLinks = [...externalLinksMap.entries()].sort((a, b) => b[1] - a[1]).map(entry => entry[0]);
 
     if (internalLinks.length === 0 && externalLinks.length === 0) {
       return res.status(400).json({
         skipped: 'No internal or external links found. This may be due to dynamic rendering.',
       });
     }
 
     res.json({ internal: internalLinks, external: externalLinks });
   } catch (error) {
     // console.error('Error fetching the page:', error); // Enhanced error logging
     res.status(500).json({ error: 'Error fetching the page.', details: error.message });
   }
};


// API method for getting website screenshot
exports.getScreenshot = async (req, res) => {
  try {
    let url = req.query.url;

    if (!url) {
      return res.status(400).json({ message: 'URL address is required.' });
    }

    // Check if the URL starts with http:// or https://, else prepend https://
    if (!/^https?:\/\//i.test(url)) {
      url = `https://${url}`;
    }

    // Check if the URL contains 'www.', if not, add 'www.' after the protocol
    if (!/^https?:\/\/www\./i.test(url)) {
      url = url.replace(/^https?:\/\//i, '$&www.');
    }

    // Dynamically import capture-website for use
    // because it doesn't support commonJS import
    const captureWebsite = await import('capture-website');

    
    // File path for the screenshot
    const screenshotPath = path.join('public', 'screenshots', 'screenshot.png');

    // Check if screenshot file exists, and delete it
    if (fs.existsSync("C:/Users/DELL/Desktop/LeakNix/server/public/screenshots/screenshot.png")) {
      fs.unlinkSync("C:/Users/DELL/Desktop/LeakNix/server/public/screenshots/screenshot.png"); // Delete the existing file
      console.log('Old screenshot deleted.');
    }

    try {
      // Capture website screenshot and save to public directory
      await captureWebsite.default.file(url, screenshotPath);

      // Construct the full image URL
      const imageUrl = `C:/Users/DELL/Desktop/LeakNix/server/public/screenshots/screenshot.png`;

      // Respond with the image URL
      res.status(200).json({ imageUrl });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to capture screenshot' });
    }
  } catch (err) {
    console.error('Error retrieving website screenshot:', err.message);
    res.status(500).json({ message: 'Error retrieving website screenshot.', error: err.message });
  }
};


// API method for getting technologies information
exports.getTechnologies = async (req, res) => {
  const url = req.query.url;

  const options = {
    debug: false,
    delay: 500,
    headers: {},
    maxDepth: 3,
    maxUrls: 10,
    maxWait: 5000,
    recursive: true,
    probe: true,
    proxy: false,
    userAgent: 'Wappalyzer',
    htmlMaxCols: 2000,
    htmlMaxRows: 2000,
    noScripts: false,
    noRedirect: false,
  };
  
  const detector = new Detector(options);

  try {
    await detector.init()

    // Optionally set additional request headers
    const headers = {}

    // Optionally set local and/or session storage
    const storage = {
      local: {},
      session: {}
    }

    const site = await detector.open(url, headers, storage)

    // Optionally capture and output errors
    // site.on('error', console.error)

    const results = await site.analyze()

    // send the results as JSON response
    res.status(200).json(results);
  } catch (error) {
    console.error('Error getting technologies:', err.message);
    res.status(500).json({ message: 'Error getting technologies.', error: err.message });
  }

  await detector.destroy()
}; 


// API method for getting open and failed ports
exports.getPorts = async (req, res) => {
  try {
      let url = req.query.url;
      
      if (!url) {
          return res.status(400).json({ message: 'URL is required.' });
      }
      
      // Remove protocol (http/https) from URL
      let domain = url.replace(/(^\w+:|^)\/\//, '');
      
      // Call the portsHandler function to check ports
      const { openPorts, failedPorts } = await portHandler(domain);
      
      // Send the result as a JSON response
      res.status(200).json({ 
          openPorts, 
          failedPorts
      });
  } catch (err) {
      console.error('Error checking ports:', err.message);
      res.status(500).json({ message: 'Error checking ports.', error: err.message });
  }
};