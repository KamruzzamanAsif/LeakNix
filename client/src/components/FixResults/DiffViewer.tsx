import React, { useEffect } from 'react';
import { html } from 'diff2html'; // Convert diffJson to HTML
import 'diff2html/bundles/css/diff2html.min.css'; // Import Diff2Html CSS
import hljs from 'highlight.js'; // Import Highlight.js
import 'highlight.js/styles/github.css'; // Highlight.js theme

interface DiffViewerProps {
  diffs: Array<{
    filename: string; // File name
    fullCode: string; // Full code of the file
    diffJson: Array<{
      blocks: any[]; // Diff blocks
      deletedLines: number;
      addedLines: number;
      oldName: string;
      language: string;
      newName: string;
    }>;
    rawDiff: string; // Raw diff string
  }>;
}

const DiffViewer: React.FC<DiffViewerProps> = ({ diffs }) => {
  useEffect(() => {
    // Find all code blocks in the rendered diff and apply Highlight.js
    document.querySelectorAll('.d2h-code-line-ctn').forEach((el) => {
      const codeElement = document.createElement('code');
      codeElement.className = 'language-js'; // Add syntax highlighting class
      codeElement.innerHTML = el.innerHTML; // Preserve content
      el.innerHTML = ''; // Clear existing content
      el.appendChild(codeElement); // Insert new code element
    });
    document.querySelectorAll('code.language-js').forEach((el) => {
      hljs.highlightElement(el);
    });
  }, [diffs]);

  if (!diffs || diffs.length === 0) {
    return <p>No diffs available to display.</p>;
  }

  return (
    <div style={{ padding: '1px', fontFamily: 'Arial, sans-serif' }}>
      <style>
        {`
          .d2h-code-line-ctn {
            background-color: transparent !important; /* Remove white background */
            color: white !important; /* Set default text color to white */
          }
          .hljs {
            background: transparent !important; /* Preserve background transparency */
            color: white !important; /* Set default text color to white */
          }
          .hljs-string {
            color: green !important; /* Set string color to dark blue */
          }
          .hljs-subst {
            color: white !important; /* Ensure template literals are white */
          }
        `}
      </style>
      {diffs.map((diff, index) => (
        <div
          key={index}
          style={{
            marginBottom: '0px',
            borderRadius: '5px',
            padding: '2px',
            backgroundColor: 'background.paper',
          }}
        >
          {/* Render diff using Diff2Html */}
          <div
            dangerouslySetInnerHTML={{
              __html: html(diff.rawDiff, {
                outputFormat: 'side-by-side', // Side-by-side diff view
                drawFileList: false, // Disable file list
                matching: 'lines', // Match lines for better alignment
                highlight: true,
                colorScheme: 'dark',
              }),
            }}
            style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              overflowX: 'auto',
              marginTop: '20px',
            }}
            className="diff-container"
          />
        </div>
      ))}
    </div>
  );
};

export default DiffViewer;
