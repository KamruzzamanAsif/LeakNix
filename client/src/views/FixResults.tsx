import { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { ToastContainer } from 'react-toastify';

import colors from '../styles/colors';
import Heading from '../components/Form/Heading';
import Footer from '../components/misc/Footer';
import Nav from '../components/Form/Nav';

import Loader from '../components/misc/Loader';
import ViewRaw from '../components/misc/ViewRaw';



const ResultsOuter = styled.div`
  display: flex;
  flex-direction: column;
  .masonry-grid {
    display: flGridCard.propTypes.propTypes.propTypes.propTypes.propTypes
    width: auto;
  }
  .masonry-grid-col section { margin: 1rem 0.5rem; }
`;





const FixResults = (): JSX.Element => {
  // const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const address = 'https://galaxy.ai/ai-code-fixer';

  useEffect(() => {
    // eikhane fix api call dibo
  }, []);
  
 
  // Get the output json data from the server
  const [jsonData, setJsonData] = useState<any>(null); // State to store JSON data


//************************** End -> <Section: WebSite information Fetching> ***************************// 

  
  return (
    <ResultsOuter>

      <Nav>
        <Heading color={colors.textColor} size="medium">
          {'Leak Fixing'}
        </Heading>
      </Nav>


      {/* <Loader show={loadingJobs.filter((job: LoadingJob) => job.state !== 'loading').length < 10} /> */}
      {loading && <Loader show={true}/>} {/* Show loader until isOverviewRendered is true */}

      
      
      <ViewRaw jsonData={jsonData} />
      <Footer />
      <ToastContainer limit={3} draggablePercent={60} autoClose={2500} theme="dark" position="bottom-right" />
    </ResultsOuter>
  );
}

export default FixResults;
