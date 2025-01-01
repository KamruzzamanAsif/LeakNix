import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import styled from '@emotion/styled';
import { ToastContainer } from 'react-toastify';
import Masonry from 'react-masonry-css'

import colors from '../styles/colors';
import Heading from '../components/Form/Heading';
import Modal from '../components/Form/Modal';
import Footer from '../components/misc/Footer';
import Nav from '../components/Form/Nav';
import type { RowProps }  from '../components/Form/Row';
import DocContent from '../components/misc/DocContent';

import Loader from '../components/misc/Loader';
import ErrorBoundary from '../components/misc/ErrorBoundary';
import ProgressBar, { type LoadingJob, type LoadingState, initialJobs } from '../components/misc/ProgressBar';
import ActionButtons from '../components/misc/ActionButtons';
import AdditionalResources from '../components/misc/AdditionalResources';
import ViewRaw from '../components/misc/ViewRaw';

import ServerLocationCard from '../components/Results/ServerLocation';
import ContentLinksCard from '../components/Results/ContentLinks';
import DnsRecordsCard from '../components/Results/DnsRecords';
import OpenPortsCard from '../components/Results/OpenPorts';
import ScreenshotCard from '../components/Results/Screenshot';
import OutputConsole from '../components/Results/OutputConsole';

import keys from '../utils/get-keys';
import { determineAddressType, type AddressType } from '../utils/address-type-checker';
import useMotherHook from '../hooks/motherOfAllHooks';
import {
  getLocation, type ServerLocation,
  type Cookie,
  applyWhoIsResults, type Whois,
  parseShodanResults, type ShodanResults
} from '../utils/result-processor';

const ResultsOuter = styled.div`
  display: flex;
  flex-direction: column;
  .masonry-grid {
    display: flex;
    width: auto;
  }
  .masonry-grid-col section { margin: 1rem 0.5rem; }
`;

const ResultsContent = styled.section`
  width: 95vw;
  display: grid;
  grid-auto-flow: dense;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1rem;
  margin: auto;
  width: calc(100% - 2rem);
  padding-bottom: 1rem;
`;

const FilterButtons = styled.div`
  width: 95vw;
  margin: auto;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 1rem;
  .one-half {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    align-items: center;
  }
  button, input, .toggle-filters {
    background: ${colors.backgroundLighter};
    color: ${colors.textColor};
    border: none;
    border-radius: 4px;
    font-family: 'PTMono';
    padding: 0.25rem 0.5rem;
    border: 1px solid transparent;
    transition: all 0.2s ease-in-out;
  }
  button, .toggle-filters {
    cursor: pointer;
    text-transform: capitalize;
    box-shadow: 2px 2px 0px ${colors.bgShadowColor};
    transition: all 0.2s ease-in-out;
    &:hover {
      box-shadow: 4px 4px 0px ${colors.bgShadowColor};
      color: ${colors.primary};
    }
    &.selected {
      border: 1px solid ${colors.primary};
      color: ${colors.primary};
    }
  }
  input:focus {
    border: 1px solid ${colors.primary};
    outline: none;
  }
  .clear {
    color: ${colors.textColor};
    text-decoration: underline;
    cursor: pointer;
    font-size: 0.8rem;
    opacity: 0.8;
  }
  .toggle-filters  {
    font-size: 0.8rem;
  }
  .control-options {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    align-items: center;
    a {
      text-decoration: none;
    }
  }
`;

const Results = (props: { address?: string } ): JSX.Element => {
  const startTime = new Date().getTime();

  const address = props.address || useParams().urlToScan || '';

  const [ addressType, setAddressType ] = useState<AddressType>('empt');

  const [loadingJobs, setLoadingJobs] = useState<LoadingJob[]>(initialJobs);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<ReactNode>(<></>);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  

  const clearFilters = () => {
    setTags([]);
    setSearchTerm('');
  };
  const updateTags = (tag: string) => {
    // Remove current tag if it exists, otherwise add it
    // setTags(tags.includes(tag) ? tags.filter(t => t !== tag) : [...tags, tag]);
    setTags(tags.includes(tag) ? tags.filter(t => t !== tag) : [tag]);
  };

  const updateLoadingJobs = useCallback((jobs: string | string[], newState: LoadingState, error?: string, retry?: () => void, data?: any) => {
    (typeof jobs === 'string' ? [jobs] : jobs).forEach((job: string) => {
    const now = new Date();
    const timeTaken = now.getTime() - startTime;
    setLoadingJobs((prevJobs) => {
      const newJobs = prevJobs.map((loadingJob: LoadingJob) => {
        if (job.includes(loadingJob.name)) {
          return { ...loadingJob, error, state: newState, timeTaken, retry };
        }
        return loadingJob;
      });

      const timeString = `[${now.getHours().toString().padStart(2, '0')}:`
        +`${now.getMinutes().toString().padStart(2, '0')}:`
        + `${now.getSeconds().toString().padStart(2, '0')}]`;


      if (newState === 'success') {
        console.log(
          `%cFetch Success - ${job}%c\n\n${timeString}%c The ${job} job succeeded in ${timeTaken}ms`
          + `\n%cRun %cwindow.webCheck['${job}']%c to inspect the raw the results`,
          `background:${colors.success};color:${colors.background};padding: 4px 8px;font-size:16px;`,
          `font-weight: bold; color: ${colors.success};`,
          `color: ${colors.success};`,
          `color: #1d8242;`,`color: #1d8242;text-decoration:underline;`,`color: #1d8242;`,
        );
        if (!(window as any).webCheck) (window as any).webCheck = {};
        if (data) (window as any).webCheck[job] = data;
      }
  
      if (newState === 'error') {
        console.log(
          `%cFetch Error - ${job}%c\n\n${timeString}%c The ${job} job failed `
          +`after ${timeTaken}ms, with the following error:%c\n${error}`,
          `background: ${colors.danger}; color:${colors.background}; padding: 4px 8px; font-size: 16px;`,
          `font-weight: bold; color: ${colors.danger};`,
          `color: ${colors.danger};`,
          `color: ${colors.warning};`,
        );
      }

      if (newState === 'timed-out') {
        console.log(
          `%cFetch Timeout - ${job}%c\n\n${timeString}%c The ${job} job timed out `
          +`after ${timeTaken}ms, with the following error:%c\n${error}`,
          `background: ${colors.info}; color:${colors.background}; padding: 4px 8px; font-size: 16px;`,
          `font-weight: bold; color: ${colors.info};`,
          `color: ${colors.info};`,
          `color: ${colors.warning};`,
        );
      }

      return newJobs;
    });
  });
  }, [startTime]);


  //************************** Start -> <Section: WebSite information Fetching> ***************************// 

  const parseJson = (response: Response): Promise<any> => {
    return new Promise((resolve) => {
      response.json()
        .then(data => resolve(data))
        .catch(error => resolve(
          { error: `Failed to get a valid response 😢\n`
          + 'This is likely due to the target not exposing the required data, '
          + 'or limitations imposed by the infrastructure this instance '
          + 'of LeakNix is running on.\n\n'
          + `Error info:\n${error}`}
        ));
    });
  };

  const extractDomain = (url: string): string => {
    return url.replace(/^https?:\/\//, '').split('/')[0]; // Remove 'http://' or 'https://' and get the domain part
  };
  
  const urlTypeOnly = ['url'] as AddressType[]; // Many jobs only run with these address types
  
  
  // Fetch and parse IP address for given URL
  const [ipAddress, setIpAddress] = useMotherHook({
    jobId: 'get-ip',
    updateLoadingJobs,
    addressInfo: { address, addressType, expectedAddressTypes: urlTypeOnly },
    fetchRequest: () => {
      const domain = extractDomain(address).split(':')[0]; // Extract the domain name & Remove any port numbers after ':' from the domain
      return fetch(`https://dns.google/resolve?name=${domain}&type=A`)
        .then(res => parseJson(res))
        .then(res => {
          // Check for errors in DNS status
          if (res.Status !== 0) {
            console.error(`DNS query failed with status: ${res.Status}`);
            return `DNS query failed with status: ${res.Status}`;
          }
          // Check if the response contains the "Answer" array
          if (res.Answer && res.Answer.length > 0) {
            return res.Answer[0].data; // IP address is in the "data" field of the first "Answer"
          } 
          else if(domain == "localhost"){
            return '127.0.0.1'; // IP address of localhost
          }
          else {
            return 'No IP found'; // Handle case where no IP address is returned
          }
        });
    }
  });

  useEffect(() => {
    if (!addressType || addressType === 'empt') {
      setAddressType(determineAddressType(address || ''));
    }
    if (addressType === 'ipV4' && address) {
      setIpAddress(address);
    }
  }, [address, addressType, setIpAddress]);
  
  // Get IP address location info
  const [locationResults, updateLocationResults] = useMotherHook<ServerLocation>({
    jobId: 'location',
    updateLoadingJobs,
    addressInfo: { address: ipAddress, addressType: 'ipV4', expectedAddressTypes: ['ipV4', 'ipV6'] },
    fetchRequest: () => fetch(`https://ipapi.co/${ipAddress}/json/`)
      .then(res => parseJson(res))
      .then(res => getLocation(res)),
  });

  // Get list of links included in the page content
  const [linkedPagesResults, updateLinkedPagesResults] = useMotherHook({
    jobId: 'linked-pages',
    updateLoadingJobs,
    addressInfo: { address, addressType, expectedAddressTypes: urlTypeOnly },
    fetchRequest: () => fetch(`http://localhost:4000/api/linked-pages?url=${address}`).then(res => parseJson(res)),
  });

  // Get DNS records
  const [dnsResults, updateDnsResults] = useMotherHook({
    jobId: 'dns',
    updateLoadingJobs,
    addressInfo: { address, addressType, expectedAddressTypes: urlTypeOnly },
    fetchRequest: () => fetch(`http://localhost:4000/api/dns-records?url=${address}`).then(res => parseJson(res)),
  });

  // Check for open ports
  const [portsResults, updatePortsResults] = useMotherHook({
    jobId: 'ports',
    updateLoadingJobs,
    addressInfo: { address: ipAddress, addressType: 'ipV4', expectedAddressTypes: ['ipV4', 'ipV6'] },
    fetchRequest: () => fetch(`http://localhost:4000/api/check-ports?url=${address}`)
      .then(res => parseJson(res)),
  });

   // Take a screenshot of the website
   const [screenshotResult, updateScreenshotResult] = useMotherHook({
    jobId: 'screenshot',
    updateLoadingJobs,
    addressInfo: { address, addressType, expectedAddressTypes: urlTypeOnly },
    fetchRequest: () =>
      fetch(`http://localhost:4000/api/screenshot?url=${address}`)
        .then(res => parseJson(res)),
  });


//************************** End -> <Section: WebSite information Fetching> ***************************// 


  const makeSiteName = (address: string): string => {
    try {
      return new URL(address).hostname.replace('www.', '');
    } catch (error) {
      return address;
    }
  }

  // A list of state sata, corresponding component and title for each card
  const resultCardData = [
    {
      id: 'location',
      title: 'Server Location',
      result: locationResults,
      Component: ServerLocationCard,
      refresh: updateLocationResults,
      tags: ['server'],
    }, 
    {
      id: 'linked-pages',
      title: 'Linked Pages',
      result: linkedPagesResults,
      Component: ContentLinksCard,
      refresh: updateLinkedPagesResults,
      tags: ['client', 'meta'],
    },
    {
      id: 'dns',
      title: 'DNS Records',
      result: dnsResults,
      Component: DnsRecordsCard,
      refresh: updateDnsResults,
      tags: ['server'],
    },
    {
      id: 'ports',
      title: 'Open Ports',
      result: portsResults,
      Component: OpenPortsCard,
      refresh: updatePortsResults,
      tags: ['server'],
    },
    {
      id: 'screenshot',
      title: 'Screenshot',
      result: screenshotResult,
      Component: ScreenshotCard,
      refresh: updateScreenshotResult,
      tags: ['client', 'meta'],
    }, 
  ];

  const makeActionButtons = (title: string, refresh: () => void, showInfo: (id: string) => void): ReactNode => {
    const actions = [
      { label: `Info about ${title}`, onClick: showInfo, icon: 'ⓘ'},
      { label: `Re-fetch ${title} data`, onClick: refresh, icon: '↻'},
    ];
    return (
      <ActionButtons actions={actions} />
    );
  };

  const showInfo = (id: string) => {
    setModalContent(DocContent(id));
    setModalOpen(true);
  };

  const showErrorModal = (content: ReactNode) => {
    setModalContent(content);
    setModalOpen(true);
  };
  
  return (
    <ResultsOuter>

      <Nav>
      { address && 
        <Heading color={colors.textColor} size="medium">
          { addressType === 'url' && <a target="_blank" rel="noreferrer" href={address}><img width="32px" src={`https://icon.horse/icon/${makeSiteName(address)}`} alt="" /></a> }
          {makeSiteName(address)}
        </Heading>
        }
      </Nav>

      {/* <ProgressBar loadStatus={loadingJobs} showModal={showErrorModal} showJobDocs={showInfo} /> */}

      <Loader show={loadingJobs.filter((job: LoadingJob) => job.state !== 'loading').length < 10} />

      <ResultsContent>
        <Masonry
          breakpointCols={{ 10000: 12, 4000: 9, 3600: 8, 3200: 7, 2800: 6, 2400: 5, 2000: 4, 1600: 3, 1200: 2, 800: 1 }}
          className="masonry-grid"
          columnClassName="masonry-grid-col">
          {
            resultCardData
            .map(({ id, title, result, tags, refresh, Component }, index: number) => {
              const show = (tags.length === 0 || tags.some(tag => tags.includes(tag)))
              && title.toLowerCase().includes(searchTerm.toLowerCase())
              // && (result && !result.error);
              return show ? (
                <ErrorBoundary title={title} key={`eb-${index}`}>
                  <Component
                    key={`${title}-${index}`}
                    data={{...result}}
                    title={title}
                    url={""}
                    actionButtons={refresh ? makeActionButtons(title, refresh, () => showInfo(id)) : undefined}
                  />
                </ErrorBoundary>
            ) : null})
          }
          </Masonry>
      </ResultsContent>

      

      // Output Console
      <OutputConsole url={address} />
      
      <ViewRaw everything={resultCardData} />
      <Footer />
      <Modal isOpen={modalOpen} closeModal={()=> setModalOpen(false)}>{modalContent}</Modal>
      <ToastContainer limit={3} draggablePercent={60} autoClose={2500} theme="dark" position="bottom-right" />
    </ResultsOuter>
  );
}

export default Results;
