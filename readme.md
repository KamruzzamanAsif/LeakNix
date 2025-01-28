# LeakNix

LeakNix is a tool designed for automated memory leak detection and resolution in Single Page Applications (SPAs). Leveraging browser-based simulations, LeakNix identifies persistent memory leaks, analyzes their impact, and generates patches to resolve them. With its user-friendly design, detailed reporting, and advanced features, LeakNix empowers developers to build more efficient and reliable web applications.

---

## Features

### Automated Memory Leak Detection
- Detects various types of memory leaks, including:
  - Unreleased objects
  - Leaking event listeners
  - Persistent DOM nodes
  - Collections such as Arrays, Maps, and Sets

### Browser-Based Simulation
- Simulates real user interactions on SPAs using Puppeteer.
- Analyzes memory profiles in real time to identify persistent memory leaks.

### Automated Code Fixing
- Provides basic patches to fix detected memory leaks based on research-backed solutions.
- Ensures source code integrity while applying fixes.

### Enhanced Reporting
- Generates detailed reports specifying:
  - Type, size, and source of memory leaks
  - Heap memory statistics and their impact
  - Summary of applied fixes and their expected performance improvements

### Human-in-the-Loop Fixing
- Allows developers to review and approve fixes before application.

---

## Project Modules

### 1. Detection Module
The detection module identifies memory leaks through a sequence of actions:
1. **Setup Module**: Users input the URL and upload custom user-defined simulations.
2. **BrowserSimulator**: Simulates real user interactions using Puppeteer.
3. **MemoryProfiler**: Captures memory profiles before, during, and after simulations.
4. **MemoryAnalyzer**: Analyzes memory profiles to detect leaks across:
   - Collections
   - Unreleased objects
   - Event listeners
   - Persistent DOM nodes
5. **DetectionReportGenerator**: Generates detailed reports based on the analysis.

### 2. Fixing Module
- Accepts uploaded source code.
- Suggests and applies basic patches for identified memory leaks.
- Provides an optional human-in-the-loop mechanism for developers to review patches.

---

## Technical Details

### Input Requirements
- **URL**: Target URL for SPA simulation.
- **Source Code**: JavaScript/TypeScript source code for patch generation.
- **Custom Simulations** (Optional): User-defined scenarios for testing.

### Output
- **Detection Report**: Detailed report with memory leak statistics and insights.
- **Fixes**: Generated patches for resolving memory leaks.

### Puppeteer Version
- LeakNix uses **Puppeteer v22** with updated syntax (`waitForSelector()` and `::-p-xpath`).

### Analysis Categories
#### Collections
- Type, SizeBefore, SizeAfter, Delta, deltaPerIteration, sizeIncreasedAt, Preview
#### Unreleased Objects
- Name, retainedSizeDelta, retainedSizeDeltaPerIteration, countDelta, countDeltaPerIteration, numOfIteration
#### Event Listeners
- Type/Name, After, Before, Delta, deltaPerIteration, leakingNodes
#### Persistent DOM Nodes
- Delta, deltaPerIteration, Nodes

---

## Installation

### Prerequisites
- Node.js (v16 or higher)
- Puppeteer v22

### Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/leaknix.git
   ```
2. Navigate to the project directory:
   ```bash
   cd leaknix
   ```
3. Navigate to the client directory:
   ```bash
   cd client
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Run the application:
   ```bash
   npm run dev
   ```
5. Follow step 3-4 for both server directories
---

## Usage

1. **Configure Simulation**
   - Provide the target URL and upload custom scenarios (if needed).
2. **Run Leak Detection**
   - Execute the detection module to generate reports.
3. **Upload Source Code**
   - Upload the application's source code for automatic patch generation.
4. **Review and Apply Fixes**
   - Review suggested patches and apply approved fixes.

---

## Contributing
Contributions are welcome! To contribute:
1. Fork the repository.
2. Create a new branch for your feature/bugfix.
3. Submit a pull request with detailed changes.

---

## License
This project is licensed under the MIT License. See the LICENSE file for details.

---

## Contact
For questions or support, please contact:
- Email: asif720kamruzzaman@gmail.com
- GitHub: [KamruzzamanAsif](https://github.com/KamruzzamruzzamAsif)

---

### Acknowledgments
- [LEAKPAIR: ProactiveRepairingof MemoryLeaks inSinglePageWebApplications](https://arxiv.org/pdf/2308.08144)


