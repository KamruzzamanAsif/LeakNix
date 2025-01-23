import styled from '@emotion/styled';
import { type ChangeEvent, type FormEvent, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

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

const FixHome = (): JSX.Element => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (file) {
      const isMjsFile = file.name.endsWith('.zip');
      if (!isMjsFile) {
        setFileError('Please select a valid .zip file.');
        setSelectedFile(null); // Reset the file state if invalid
      } else {
        setFileError(null); // Clear any previous error
        setSelectedFile(file);
        console.log(`Selected file: ${file.name}`);
      }
    }
  };

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
            <label htmlFor="dropzone-file" className="upload-btn" style={{ borderWidth: '1.5px', padding: '20px', minWidth: '40%'}}>
                <span style={{ display: 'block', fontSize: 'large', font: 'bold', marginBottom: '20px' }}>
                    Click to upload or drag and drop
                </span>
                <span style={{ display: 'block', fontSize: 'smaller' }}>
                    Only .zip file is supported
                </span>
            </label>

          <input
            id="dropzone-file"
            type="file"
            onChange={handleFileChange}
          />
          {fileError && <p style={{ color: 'red' }}>{fileError}</p>}
          {selectedFile && <p style={{ color: 'yellow' }}>Selected: {selectedFile.name}</p>}
        </FileUploadWrapper>

        <Button type="submit" styles="width: calc(100% - 1rem);" size="large">
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
