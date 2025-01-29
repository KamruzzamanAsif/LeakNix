import styled from '@emotion/styled';
import colors from '../../styles/colors';
import { Card } from '../Form/CardV2';
import Button from '../Form/Button';
import { useState } from 'react';

const CardStyles = `
margin: 0 auto 1rem auto;
width: 95vw;
position: relative;
transition: all 0.2s ease-in-out;
display: flex;
flex-direction: column;
a {
  color: ${colors.primary};
}
.controls {
  display: flex;
  flex-wrap: wrap;
  button {
    max-width: 300px;
  }
}
small {
  margin-top: 0.5rem;
  font-size: 0.8rem;
  opacity: 0.5;
}
`;

const StyledIframe = styled.iframe`
  width: calc(100% - 2rem);
  outline: none;
  border: none;
  border-radius: 4px;
  min-height: 50vh;
  height: 100%;
  margin: 1rem;
  background: ${colors.background};
`;

const ViewRaw = (props: { jsonData: any[] }) => {
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  console.log("Given: " + props.jsonData);
  // This function processes the jsonData to return an object
  const makeResults = () => {
    const result: { [key: string]: any } = {};
  
    if (Array.isArray(props.jsonData)) {
      props.jsonData.forEach((item, index) => {
        result[`${index + 1}`] = item; // Use index as the key
      });
    } else {
      console.error('jsonData is not a valid array of objects:', props.jsonData);
    }
  
    return result;
  };

  const fetchResultsUrl = async () => {
    const resultContent = makeResults();
    const response = await fetch('https://jsonhero.io/api/create.json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'LeakNix results',
        content: resultContent,
        readOnly: true,
        ttl: 3600,
      })
    });
    if (!response.ok) {
      setError(`HTTP error! status: ${response.status}`);
    } else {
      setError(null);
    }
    await response.json().then(
      (data) => setResultUrl(data.location)
    )
  };

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(makeResults(), null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'leaknix-results.json';
    link.click();
    URL.revokeObjectURL(url);
  }
  return (
    <Card heading="View / Download Raw Data" styles={CardStyles}>
      <div className="controls">
        <Button onClick={handleDownload}>Download Results</Button>
        <Button onClick={fetchResultsUrl}>{resultUrl ? 'Update Results' : 'View Results'}</Button>
        { resultUrl && <Button onClick={() => setResultUrl('') }>Hide Results</Button> }
      </div>
      { resultUrl && !error &&
      <>
        <StyledIframe title="Results, via JSON Hero" src={resultUrl} />
        <small>Your results are available to view <a href={resultUrl}>here</a>.</small>
      </>
      }
      { error && <p className="error">{error}</p> }
      <small>
        These are the raw results generated from your URL, and in JSON format.
        You can import these into your own program, for further analysis.
      </small>
    </Card>
  );
};

export default ViewRaw;
