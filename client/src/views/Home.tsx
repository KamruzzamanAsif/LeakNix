import styled from '@emotion/styled';
import { type ChangeEvent, type FormEvent, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, type NavigateOptions } from 'react-router-dom';

import Heading from '../components/Form/Heading';
import Input from '../components/Form/Input';
import Button from '../components/Form/Button';
import { StyledCard } from '../components/Form/Card';
import Footer from '../components/misc/Footer';
import FancyBackground from '../components/misc/FancyBackground';

import docs from '../utils/docs';
import colors from '../styles/colors';
import { determineAddressType } from '../utils/address-type-checker';


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
  z-index: 2;
`;

const FixCard = styled.div`
  background: ${colors.backgroundLighter};
  box-shadow: 4px 4px 0px ${colors.bgShadowColor};
  border-radius: 8px;
  padding: 1rem;
  z-index: 5;
  margin: 1rem;
  width: calc(100% - 2rem);
  max-width: 60rem;
  z-index: 2;
  .inner {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 1rem;
    p {
      margin: 0.25rem 0;
    }
  }
  a {
    color: ${colors.textColor};
  }
  img {
    border-radius: 0.25rem;
    box-shadow: 2px 2px 0px ${colors.fgShadowColor};
    transition: box-shadow 0.2s;
    margin: 0 auto;
    display: block;
    width: 200px;
    &:hover {
      box-shadow: 4px 4px 0px ${colors.fgShadowColor};
    }
    &:active {
      box-shadow: -2px -2px 0px ${colors.fgShadowColor};
    }
  }
  .cta {
    font-size: 0.78rem;
    a { color: ${colors.primary}; }
  }
`;


const ErrorMessage = styled.p`
  color: ${colors.danger};
  margin: 0.5rem;
`;

const SiteFeaturesWrapper = styled(StyledCard)`
  margin: 1rem;
  width: calc(100% - 2rem);
  max-width: 60rem;
  z-index: 2;
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
    @media(max-width: 600px) {
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
  flex-direction: row;
  align-items: center;
  width: 100%;
  label {
    font-size: 1rem;
    color: ${colors.textColor};
    margin-bottom: 0.5rem;
    padding-right: 2rem;
  }
  input[type="file"] {
    display: none;
  }
  .upload-btn {
    display: inline-block;
    padding: 0.5rem 1rem;
    margin-right: 0.5rem;
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


const Home = (): JSX.Element => {
  const defaultPlaceholder = 'e.g. https://dsse.iit.du.ac.bd';
  const [userInput, setUserInput] = useState('');
  const [errorMsg, setErrMsg] = useState('');
  const [placeholder] = useState(defaultPlaceholder);
  const [inputDisabled] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const navigate = useNavigate();

  const location = useLocation();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (file) {
      const isMjsFile = file.name.endsWith('.mjs');
      if (!isMjsFile) {
        setFileError('Please upload a valid .mjs file.');
        setSelectedFile(null); // Reset the file state if invalid
      } else {
        setFileError(null); // Clear any previous error
        setSelectedFile(file);
        console.log(`Selected file: ${file.name}`);
      }
    }
  };

  /* Redirect strait to results, if somehow we land on /check?url=[] */
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const urlFromQuery = query.get('url');
    if (urlFromQuery) {
      navigate(`/check/${encodeURIComponent(urlFromQuery)}`, { replace: true });
    }
  }, [navigate, location.search]);

  /* Check is valid address, either show err or redirect to results page */
  const submit = (custom_scenario:boolean) => {
    let address = userInput.endsWith("/") ? userInput.slice(0, -1) : userInput;
    const addressType = determineAddressType(address);
    console.log('Sending custom scenario: ', custom_scenario);
    const scenario = custom_scenario;
  
    if (addressType === 'empt') {
      setErrMsg('Field must not be empty');
    } else if (addressType === 'err') {
      setErrMsg('Must be a valid URL, IPv4 or IPv6 Address');
    } else {
      // if the addressType is 'url' and address doesn't start with 'http://' or 'https://', prepend 'https://'
      if (addressType === 'url' && !/^https?:\/\//i.test(address)) {
        address = 'https://' + address;
      }
      const resultRouteParams: NavigateOptions = { state: { address, addressType, scenario} };
      navigate(`/check/${encodeURIComponent(address)}`, resultRouteParams);
    }
  };

  const clickFixNow = () => {
    navigate(`/fix`);
  }
  
  /* Update user input state, and hide error message if field is valid */
  const inputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setUserInput(event.target.value);
    const isError = ['err', 'empt'].includes(determineAddressType(event.target.value));
    if (!isError) setErrMsg('');
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      // submit();
    }
  };

  const formSubmitEvent = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  
    if (!selectedFile) {
      submit(false);
      return;
    }
  
    const formData = new FormData();
    formData.append('scenarioFile', selectedFile);
  
    try {
      const response = await fetch('http://localhost:4000/api/upload-scenario-file', {
        method: 'POST',
        body: formData,
      });
  
      if (!response.ok) {
        throw new Error('File upload failed');
      }
  
      const data = await response.json();
      console.log('File upload response:', data);
      setFileError(null);

      // Add a delay before calling submit()
      setTimeout(() => {
        submit(true);
      }, 2000); // Delay in milliseconds (e.g., 2000ms = 2 seconds)
    } catch (error) {
      console.error('Error uploading file:', error);
      setFileError('Failed to upload file. Please try again.');
    }
  };
  

  return (
    <HomeContainer>
      <FancyBackground />

      <UserInputMain onSubmit={formSubmitEvent}>
        <a href="/">
          <Heading as="h1" size="xLarge" align="center" color={colors.primary}>
            <img width="64" src="/leak-nix.png" alt="LeakNix Icon" />
            LeakNix
          </Heading>
        </a>
        <Input
          id="user-input"
          value={userInput}
          label="Enter a URL"
          size="large"
          orientation="vertical"
          name="url"
          placeholder={placeholder}
          disabled={inputDisabled}
          handleChange={inputChange}
          handleKeyDown={handleKeyPress}
        />
        { errorMsg && <ErrorMessage>{errorMsg}</ErrorMessage>}

        <FileUploadWrapper>
          <label htmlFor="file-upload">Upload a Scenario File (optional, must be .mjs)</label>
          <input
            id="file-upload"
            type="file"
            onChange={handleFileChange}
          />
          <label htmlFor="file-upload" className="upload-btn">
            Choose File
          </label>
          {selectedFile && <p>Selected: {selectedFile.name}</p>}
          {fileError && <ErrorMessage>{fileError}</ErrorMessage>}
        </FileUploadWrapper>

        <Button type="submit" styles="width: calc(100% - 1rem);" size="large">Analyze!</Button>
      </UserInputMain>

      <FixCard>
        <Heading as="h2" size="small" color={colors.primary}>Already Leaks?</Heading>
        <div className="inner">
          <p>
            LeakNix - Automatically finds and fixes potential leaks from source code.
            <br />
            <span className="cta">
              Save your time if you know it already leaks. Because LeakNix doesn't require to check first.
            </span>
          </p>
          <a
            target="_blank"
            rel="noreferrer"
            href="">
            <Button type="submit" styles="width: calc(100% - 1rem);" size="medium" onClick={clickFixNow}>Fix Now!</Button>
          </a>
        </div>
      </FixCard>

      <SiteFeaturesWrapper>
        <div className="features">
          <Heading as="h2" size="small" color={colors.primary}>Key Features</Heading>
          <ul>
            {docs.map((doc, index) => (<li key={index}>{doc.title}</li>))}
            <li><Link to="/about">+ more!</Link></li>
          </ul>
        </div>
        <div className="links">
          <a target="_blank" rel="noreferrer" href="https://github.com/KamruzzamanAsif/LeakNix" title="Check out the source code and documentation on GitHub, and get support or contribute">
            <Button>View on GitHub</Button>
          </a>
          <a target="_blank" rel="noreferrer" href="https://app.netlify.com/start/deploy?repository=https://github.com/KamruzzamanAsif/LeakNix" title="Deploy your own private or public instance of LeakNix to Netlify">
            <Button>Deploy your own</Button>
          </a>
          <Link to="/about#api-documentation" title="View the LeakNix documentation, to know uses of LeakNix">
            <Button>LeakNix Docs</Button>
          </Link>
        </div>
      </SiteFeaturesWrapper>
      <Footer isFixed={true} />
    </HomeContainer>
  );
}

export default Home;
