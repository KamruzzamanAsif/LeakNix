import React, { useEffect } from 'react';
import { html } from 'diff2html'; // Import `html` to convert diffJson to HTML
import 'diff2html/bundles/css/diff2html.min.css'; // Ensure CSS is imported for diff2html styling
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css'; // Import a highlight.js theme
import 'diff2html/bundles/css/diff2html.min.css';

interface DiffViewerProps {
  diffs: Array<{
    filename: string;  // File name
    fullCode: string;  // Full code of the file
    diffJson: Array<{
      blocks: any[];  // Diff blocks
      deletedLines: number;
      addedLines: number;
      oldName: string;
      language: string;
      newName: string;
    }>;
  }>;
}

const DiffViewer: React.FC<DiffViewerProps> = ({ diffs }) => {
  useEffect(() => {
    // Apply syntax highlighting after the component mounts
    hljs.highlightAll();
  }, [diffs]);

  if (!diffs || diffs.length === 0) {
    return <p>No diffs available to display.</p>; // If diffs is empty or undefined
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ textAlign: 'center', color: '#333' }}>Code Diffs</h1>
      {diffs.map((diff, index) => (
        <div key={index} style={{ marginBottom: '40px', border: '1px solid #ddd', borderRadius: '8px', padding: '20px', backgroundColor: '#f9f9f9' }}>
          {/* Display Diffs and Highlight Changes */}
          {diff.diffJson && diff.diffJson.length > 0 ? (
            <div
              dangerouslySetInnerHTML={{
                __html: html(diff.diffJson, { outputFormat: 'side-by-side', drawFileList: true, matching: 'lines', highlight: true, highlightLanguages: true, colorScheme: 'dark' }), // Convert the diffJson to HTML and highlight changes
              }}
              style={{ border: '1px solid #ddd', borderRadius: '8px', marginTop: '20px' }}
            />
          ) : (
            <p>No diff available for this file.</p> // Fallback if diffJson is empty
          )}
        </div>
      ))}
    </div>
  );
};

export default DiffViewer;
