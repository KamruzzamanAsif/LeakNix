import { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { ToastContainer, toast } from 'react-toastify';


import colors from '../styles/colors';
import Heading from '../components/Form/Heading';
import Footer from '../components/misc/Footer';
import Nav from '../components/Form/Nav';

import Loader from '../components/misc/Loader';
import ViewRaw from '../components/misc/ViewRaw';


import FixOverview from '../components/FixResults/FixOverview';
import PatchTableCard from '../components/FixResults/PatchTaleCard';

const ResultsOuter = styled.div`
  display: flex;
  flex-direction: column;
  .masonry-grid {
    display: flGridCard.propTypes.propTypes.propTypes.propTypes.propTypes
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



const FixResults = (): JSX.Element => {
  const [loading, setLoading] = useState(true);
  const [fixResult, setFixResult] = useState<any>(null);
  const [diffData, setDiffData] = useState<any>(null); // Store diffs data

  useEffect(() => {
    const runFixProcess = async () => {
      try {
        setLoading(true);
        toast.info('Starting the leak-fixing process...', { autoClose: 2000 });

        // Step 1: Call fix-leak
        const fixLeakResponse = await fetch('http://localhost:5000/api/fix-leak', {
          method: 'POST',
        });
        if (!fixLeakResponse.ok) throw new Error('Failed to fix leaks');
        const fixLeakResult = await fixLeakResponse.json();
        toast.success('Leak-fixing completed successfully!', { autoClose: 2000 });

        // Step 2: Call get-results
        const resultsResponse = await fetch('http://localhost:5000/api/get-results');
        if (!resultsResponse.ok) throw new Error('Failed to fetch results');
        const resultsData = await resultsResponse.json();
        setFixResult(resultsData);
        console.log(fixResult);
        toast.success('Fetched results successfully!', { autoClose: 2000 });

        // Step 3: Call get-diffs
        const diffsResponse = await fetch('http://localhost:5000/api/get-diffs');
        if (!diffsResponse.ok) throw new Error('Failed to fetch diffs');
        const diffsData = await diffsResponse.json();
        setDiffData(diffsData.diffs);
        toast.success('Fetched diffs successfully!', { autoClose: 2000 });
      } catch (error) {
        console.error('Error in leak-fixing process:', error);
        toast.error(`Error: ${error.message}`, { autoClose: 3000 });
      } finally {
        setLoading(false);
      }
    };

    runFixProcess();
  }, []);

  return (
    <ResultsOuter>
      <Nav>
        <Heading color={colors.textColor} size="medium">
          {'Leak Fixing'}
        </Heading>
      </Nav>

      {loading && <Loader show={true} />} 
      {/* <PatchTableCard title={'Detailed Patch Breakdown'} fixResult={fixResult} diffData={diffData}/> */}

      {!loading && fixResult && (
        <>
          {fixResult && <FixOverview data={fixResult} />}
         <PatchTableCard title={'Detailed Patch Breakdown'} fixResult={fixResult} diffData={diffData}/>
        </>
      )}

      {fixResult && <ViewRaw jsonData={[fixResult]} />}

      <Footer />
      <ToastContainer limit={3} draggablePercent={60} autoClose={2500} theme="dark" position="bottom-right" />
    </ResultsOuter>
  );
};

export default FixResults;


