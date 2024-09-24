// import modules
const axios = require('axios');


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


// API method for getting website screenshot
exports.getScreenshot = async (req, res) => {
  try {
    let url = req.query.url;

    if (!url) {
      return res.status(400).json({ message: 'URL address is required.' });
    }

    // Dynamically import capture-website for use
    // because it doesn't support commonJS import
    const captureWebsite = await import('capture-website');

    // const screenshot = await captureWebsite.default.file(url, './public/screenshot.png');

    const screenshot = await captureWebsite.default.base64(url);
    // Send the location data in the response
    res.status(200).json(screenshot);

  } catch (err) {
    console.error('Error retrieving website screenshot:', err.message);
    res.status(500).json({ message: 'Error retrieving website screenshot.', error: err.message });
  }
}


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