import styled from '@emotion/styled';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import Heading from '../components/Form/Heading';
import Button from '../components/Form/Button';
import { StyledCard } from '../components/Form/Card';
import Footer from '../components/misc/Footer';
import FancyBackground from '../components/misc/FancyBackground';

import docs from '../utils/docs';
import colors from '../styles/colors';

const HomeContainer = styled.section`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  font-family: 'PTMono';
  padding: 1.5rem 1rem 4rem 1rem;
  footer {
    z-index: 1;
  }
`;

const UserInputMain = styled.form`
  background: ${colors.backgroundLighter};
  box-shadow: 4px 4px 0px ${colors.bgShadowColor};
  border-radius: 8px;
  padding: 1rem;
  z-index: 5;
  margin: 1rem;
  width: calc(100% - 2rem);
  max-width: 60rem;
`;

const SiteFeaturesWrapper = styled(StyledCard)`
  margin: 1rem;
  width: calc(100% - 2rem);
  max-width: 60rem;
  .links {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
    a {
      width: 100%;
      button {
        width: calc(100% - 2rem);
      }
    }
    @media (max-width: 600px) {
      flex-wrap: wrap;
    }
  }
  ul {
    -webkit-column-width: 150px;
    -moz-column-width: 150px;
    column-width: 150px;
    list-style: none;
    padding: 0 1rem;
    font-size: 0.9rem;
    color: ${colors.textColor};
    li {
      margin: 0.1rem 0;
      text-indent: -1.2rem;
      break-inside: avoid-column;
    }
    li:before {
      content: '✓';
      color: ${colors.primary};
      margin-right: 0.5rem;
    }
  }
  a {
    color: ${colors.primary};
  }
`;

const FileUploadWrapper = styled.div`
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  label {
    font-size: 1rem;
    color: ${colors.textColor};
    margin-bottom: 0.5rem;
    text-align: center;
  }
  input[type='file'] {
    display: none;
  }
  .upload-btn {
    display: inline-block;
    padding: 0.5rem 1rem;
    font-size: 1rem;
    color: ${colors.textColor};
    background: ${colors.backgroundLighter};
    border: 1px solid ${colors.primary};
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.3s ease, color 0.3s ease;
    &:hover {
      background: ${colors.primary};
      color: ${colors.backgroundLighter};
    }
  }
`;

const ProgressBar = styled.div`
  width: 100%;
  background-color: ${colors.backgroundDarker};
  border-radius: 4px;
  overflow: hidden;
  margin-top: 1rem;
  .progress {
    height: 8px;
    background-color: ${colors.success};
    width: ${(props: { progress: number }) => `${props.progress}%`};
    transition: width 0.3s ease-in-out;
  }
`;




const FixHome = (): JSX.Element => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadCompleted, setUploadCompleted] = useState<boolean>(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (file) {
      const isValidZip = file.name.endsWith('.zip');
      if (!isValidZip) {
        setFileError('Please select a valid .zip file.');
        setSelectedFile(null);
        setUploadProgress(0);
        setUploadCompleted(false);
      } else {
        setFileError(null);
        setSelectedFile(file);
        setUploadProgress(0);
        setUploadCompleted(false);
        startUpload(file); // Automatically upload the file
      }
    }
  };

  const startUpload = (file: File) => {
    const formData = new FormData();
    formData.append('sourceCode', file);

    // Phase 1: Start early progress simulation
    let simulatedProgress = 0;
    const progressInterval = setInterval(() => {
      simulatedProgress += 5;
      if (simulatedProgress >= 50) {
        clearInterval(progressInterval); // Stop at 50%
      }
      setUploadProgress(simulatedProgress);
    }, 100);

    // Simulate a backend upload with fetch or axios
    fetch('http://localhost:5000/api/upload-source-code', {
      method: 'POST',
      body: formData,
    })
    .then((response) => {
      if (!response.ok) throw new Error('Upload failed');
      return response.json();
    })
    .then(() => {
      // Phase 2: Complete the progress after response
      const remainingProgressInterval = setInterval(() => {
        simulatedProgress += 10;
        if (simulatedProgress >= 100) {
          clearInterval(remainingProgressInterval);
          setUploadCompleted(true);
        }
        setUploadProgress(simulatedProgress);
      }, 100);
    })
    .catch(() => {
      setFileError('Failed to upload file.');
      setUploadProgress(0);
      setUploadCompleted(false);
    });
};

  const handleFixButtonClick = () => {
    navigate(`/fix/results`);
  }

  useEffect(() => {
    // Placeholder for potential redirection logic
  }, []);

  return (
    <HomeContainer>
      <FancyBackground />

      <UserInputMain>
        <a href="/">
          <Heading as="h1" size="xLarge" align="center" color={colors.primary}>
            <img width="64" src="/leak-nix.png" alt="LeakNix Icon" />
            LeakNix
          </Heading>
        </a>

        <Heading as="p" size="medium" align="left" color={colors.primaryLighter}>
            Upload Source Code
        </Heading>
        
        <FileUploadWrapper>
          <label
            htmlFor="file-upload"
            className="upload-btn"
            style={{
              marginTop: '40px',
              padding: '20px',
              minWidth: '50%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
            </svg>
            <span>Click to upload or drag and drop</span>
            <span style={{ fontSize: 'smaller' }}>Only .zip file is supported</span>
          </label>
          <input
            id="file-upload"
            type="file"
            onChange={handleFileChange}
          />
          {fileError && <p style={{ color: 'red' }}>{fileError}</p>}
          {selectedFile && <p style={{ color: 'yellow' }}>Selected: {selectedFile.name}</p>}
          {uploadProgress > 0 && (
            <ProgressBar progress={uploadProgress}>
              <div className="progress"></div>
            </ProgressBar>
          )}
        </FileUploadWrapper>

        <Button
          type="button"
          size="large"
          styles="width: calc(100% - 1rem);"
          disabled={!uploadCompleted}
          onClick={handleFixButtonClick}
        >
          Fix Leaks!
        </Button>
      </UserInputMain>

      <SiteFeaturesWrapper>
        <div className="features">
          <Heading as="h2" size="small" color={colors.primary}>
            Key Features
          </Heading>
          <ul>
            {docs.map((doc, index) => (
              <li key={index}>{doc.title}</li>
            ))}
            <li>
              <Link to="/about">+ more!</Link>
            </li>
          </ul>
        </div>
        <div className="links">
          <a
            target="_blank"
            rel="noreferrer"
            href="https://github.com/KamruzzamanAsif/LeakNix"
            title="Check out the source code and documentation on GitHub, and get support or contribute"
          >
            <Button>View on GitHub</Button>
          </a>
          <a
            target="_blank"
            rel="noreferrer"
            href="https://app.netlify.com/start/deploy?repository=https://github.com/KamruzzamanAsif/LeakNix"
            title="Deploy your own private or public instance of LeakNix to Netlify"
          >
            <Button>Deploy your own</Button>
          </a>
          <Link
            to="/about#api-documentation"
            title="View the LeakNix documentation, to know uses of LeakNix"
          >
            <Button>LeakNix Docs</Button>
          </Link>
        </div>
      </SiteFeaturesWrapper>
      <Footer isFixed={true} />
    </HomeContainer>
  );
};

export default FixHome;
