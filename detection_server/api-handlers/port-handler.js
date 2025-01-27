const net = require('net');

// A list of commonly used ports to check
const PORTS = [
  20, 21, 22, 23, 25, 53, 80, 67, 68, 69,
  110, 115, 119, 123, 135, 139, 143, 156, 161, 162, 179, 194,
  389, 443, 587, 993, 995, 1433,
  3000, 3306, 3389, 5060, 5632, 5900, 8000, 8080, 8888,
  255565
];

// Function to check if a port is open on a given domain
async function checkPort(port, domain) {
    return new Promise((resolve, reject) => {
        const socket = new net.Socket();

        socket.setTimeout(1500); // Timeout after 1.5 seconds

        socket.once('connect', () => {
            socket.destroy();
            resolve(port); // If connection is successful, port is open
        });

        socket.once('timeout', () => {
            socket.destroy();
            reject(new Error(`Timeout at port: ${port}`));
        });

        socket.once('error', () => {
            socket.destroy();
            reject(new Error(`Error at port: ${port}`));
        });

        socket.connect(port, domain); // Attempt connection to the port
    });
}

// Main function to handle checking multiple ports on the given domain
async function portHandler(domain) {
    const openPorts = [];
    const failedPorts = [];

    // Loop through each port in the PORTS array and check it
    const promises = PORTS.map(port => 
        checkPort(port, domain)
            .then(() => {
                openPorts.push(port); // Add to openPorts if successful
            })
            .catch(() => {
                failedPorts.push(port); // Add to failedPorts if error/timeout
            })
    );

    // Wait for all the port checks to complete
    await Promise.all(promises);

    // Sort the open and failed ports before returning
    openPorts.sort((a, b) => a - b);
    failedPorts.sort((a, b) => a - b);

    return { openPorts, failedPorts };
}

module.exports = { portHandler };
