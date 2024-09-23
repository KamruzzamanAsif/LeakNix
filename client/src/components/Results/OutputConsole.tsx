import React, { useState, useEffect, useRef } from 'react';

// Define the type for the props
interface OutputConsoleProps {
  url: string;
}

const OutputConsole: React.FC<OutputConsoleProps> = ({ url }) => {
  const [output, setOutput] = useState<string>('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const wsRef = useRef<WebSocket | null>(null); // WebSocket instance

  useEffect(() => {
    // Ensure a new WebSocket connection is only created once
    const ws = new WebSocket('ws://localhost:4001');
    wsRef.current = ws;

    ws.onopen = () => {
      setOutput((prevOutput) => prevOutput + 'Connected to server\n');
      // Send the URL to the server once the connection is open
      ws.send(JSON.stringify({ url }));
    };

    ws.onmessage = (event: MessageEvent) => {
      setOutput((prevOutput) => {
        const newOutput = prevOutput + event.data + '\n';
        if (textareaRef.current) {
          textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
        }
        return newOutput;
      });
    };

    ws.onclose = () => {
      setOutput((prevOutput) => prevOutput + 'Disconnected from server\n');
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setOutput((prevOutput) => prevOutput + 'WebSocket error occurred\n');
    };

    // Cleanup WebSocket connection on component unmount
    return () => {
      ws.close();
    };
  }, [url]); // Re-run only if `url` changes

  return (
    <div>
      <h2>Output Console</h2>
      <textarea
        ref={textareaRef}
        value={output}
        readOnly
        rows={20}
        cols={80}
        style={{ width: '100%', height: '400px', fontFamily: 'monospace', marginTop: '10px' }}
      />
    </div>
  );
};

export default OutputConsole;
