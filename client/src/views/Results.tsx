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

  const parseJson = (response: Response): Promise<any> => {
    return new Promise((resolve) => {
        response.json()
          .then(data => resolve(data))
          .catch(error => resolve(
            { error: `Failed to get a valid response 😢\n`
            + 'This is likely due the target not exposing the required data, '
            + 'or limitations in imposed by the infrastructure this instance '
            + 'of Web Check is running on.\n\n'
            + `Error info:\n${error}`}
          ));
    });
  };

  // Get IP address location info
  const [locationResults, updateLocationResults] = useMotherHook<ServerLocation>({
    jobId: 'location',
    updateLoadingJobs,
    addressInfo: { address: '103.245.96.147', addressType: 'ipV4', expectedAddressTypes: ['ipV4', 'ipV6'] },
    fetchRequest: () => fetch(`https://ipapi.co/${'103.245.96.147'}/json/`)
      .then(res => parseJson(res))
      .then(res => getLocation(res)),
  });

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
    }
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

      <ProgressBar loadStatus={loadingJobs} showModal={showErrorModal} showJobDocs={showInfo} />

      <Loader show={loadingJobs.filter((job: LoadingJob) => job.state !== 'loading').length < 1} />

      <FilterButtons>{ showFilters ? <>
        <div className="one-half">
        <span className="group-label">Filter by</span>
        {['server', 'client', 'meta'].map((tag: string) => (
          <button
            key={tag}
            className={tags.includes(tag) ? 'selected' : ''}
            onClick={() => updateTags(tag)}>
              {tag}
          </button>
        ))}
        {(tags.length > 0 || searchTerm.length > 0) && <span onClick={clearFilters} className="clear">Clear Filters</span> }
        </div>
        <div className="one-half">
        <span className="group-label">Search</span>
        <input 
          type="text" 
          placeholder="Filter Results" 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <span className="toggle-filters" onClick={() => setShowFilters(false)}>Hide</span>
        </div>
        </> : (
          <div className="control-options">
            <span className="toggle-filters" onClick={() => setShowFilters(true)}>Show Filters</span>
            <a href="#view-download-raw-data"><span className="toggle-filters">Export Data</span></a>
            <a href="/about"><span className="toggle-filters">Learn about the Results</span></a>
            <a href="/about#additional-resources"><span className="toggle-filters">More tools</span></a>
            <a target="_blank" rel="noreferrer" href="https://github.com/lissy93/web-check"><span className="toggle-filters">View GitHub</span></a>
          </div>
      ) }
      </FilterButtons>

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
              && (result && !result.error);
              return show ? (
                <ErrorBoundary title={title} key={`eb-${index}`}>
                  <Component
                    key={`${title}-${index}`}
                    data={{...result}}
                    title={title}
                    actionButtons={refresh ? makeActionButtons(title, refresh, () => showInfo(id)) : undefined}
                  />
                </ErrorBoundary>
            ) : null})
          }
          </Masonry>
      </ResultsContent>

      <ViewRaw everything={resultCardData} />
      <Footer />
      <Modal isOpen={modalOpen} closeModal={()=> setModalOpen(false)}>{modalContent}</Modal>
      <ToastContainer limit={3} draggablePercent={60} autoClose={2500} theme="dark" position="bottom-right" />
    </ResultsOuter>
  );
}

export default Results;
