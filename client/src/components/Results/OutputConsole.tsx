import React, { useState, useEffect, useRef } from 'react';
import './OutputConsole.css';

interface OutputConsoleProps {
  url: string;
  scenario_used: boolean;
  onJsonDataReceived: (data: any) => void; // Callback to pass JSON data to parent or other components
}

const OutputConsole: React.FC<OutputConsoleProps> = ({ url, scenario_used, onJsonDataReceived }) => {
  const [output, setOutput] = useState<string>(''); // Stores console output
  const [expanded, setExpanded] = useState<boolean>(false); // Track expanded state
  const textareaRef = useRef<HTMLTextAreaElement>(null); // Ref for auto-scroll
  const wsRef = useRef<WebSocket | null>(null); // WebSocket reference

  useEffect(() => {
    // Connect to WebSocket server
    const ws = new WebSocket('ws://localhost:4001');
    wsRef.current = ws;

    ws.onopen = () => {
      setOutput((prev) => prev + 'Connected to WebSocket server\n');
      // Send the URL to the server
      ws.send(JSON.stringify({ url, scenario_used }));
    };

    ws.onmessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);

        // If JSON file content is received
        if (data.fileContent) {
          const jsonData = JSON.parse(data.fileContent); // Parse the JSON
          console.log("Json data inside output console: " + jsonData)
          onJsonDataReceived(jsonData); // Pass it to the parent or other components
          setOutput((prev) => prev + 'JSON file content received\n');
        } else {
          // Handle regular messages
          setOutput((prev) => {
            const newOutput = prev + event.data + '\n';
            if (textareaRef.current) {
              textareaRef.current.scrollTop = textareaRef.current.scrollHeight; // Auto-scroll
            }
            return newOutput;
          });
        }
      } catch {
        // Handle regular messages
        setOutput((prev) => {
          const newOutput = prev + event.data + '\n';
          if (textareaRef.current) {
            textareaRef.current.scrollTop = textareaRef.current.scrollHeight; // Auto-scroll
          }
          return newOutput;
        });
      }
    };

    ws.onclose = () => {
      setOutput((prev) => prev + 'WebSocket connection closed\n');
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setOutput((prev) => prev + 'WebSocket encountered an error\n');
    };

    return () => {
      // Clean up the WebSocket connection
      ws.close();
    };
  }, [url]);

  const toggleExpand = () => setExpanded((prev) => !prev);

  return (
    <div className={`console-container ${expanded ? 'expanded' : 'collapsed'}`}>
      <div className="console-header">
        <button className="toggle-button" onClick={toggleExpand}>
          {expanded ? '▲ Collapse' : '▼ Expand'}
        </button>
      </div>
      {expanded && (
        <textarea
          ref={textareaRef}
          value={output}
          readOnly
          rows={10} // Fixed number of rows
          className="console-textarea"
        />
      )}
    </div>
  );
};

export default OutputConsole;
