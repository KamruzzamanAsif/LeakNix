import { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { ToastContainer } from 'react-toastify';
import Masonry from 'react-masonry-css'


import colors from '../styles/colors';
import Heading from '../components/Form/Heading';
import Footer from '../components/misc/Footer';
import Nav from '../components/Form/Nav';

import Loader from '../components/misc/Loader';
import ViewRaw from '../components/misc/ViewRaw';

import DiffViewer from '../components/FixResults/DiffViewer';
import CustomPieChart from '../components/FixResults/CustomPieChart';
import PieChartCard from '../components/FixResults/PieChartCard';

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
  // const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [diffJsonData, setDiffJsonData] = useState<any>(null); // State to store JSON data

  // useEffect(() => {
  //   // Fetch JSON data (your API endpoint here)
  //   fetch('http://localhost:5000/api/get-diffs') // Replace with your actual API endpoint
  //     .then((response) => response.json())
  //     .then((data) => {
  //       setDiffJsonData(data.diffs);  // Set the fetched data
  //       setLoading(false);  // Set loading to false after data is fetched
  //     })
  //     .catch((error) => {
  //       console.error('Error fetching data:', error);
  //       setLoading(false);  // Set loading to false even in case of error
  //     });
  // }, []);
  
 


//************************** End -> <Section: WebSite information Fetching> ***************************// 
 
    
  return (
    <ResultsOuter>

      <Nav>
        <Heading color={colors.textColor} size="medium">
          {'Leak Fixing'}
        </Heading>
      </Nav>


      
      {/* {loading && <Loader show={true}/>} Show loader until isOverviewRendered is true */}

      {/* {diffJsonData && <DiffViewer diffs={diffJsonData} />} */}

      

      <ResultsContent>
        <Masonry
          breakpointCols={{ 10000: 12, 4000: 9, 3600: 8, 3200: 7, 2800: 6, 2400: 5, 2000: 4, 1600: 3, 1200: 2, 800: 1 }}
          className="masonry-grid"
          columnClassName="masonry-grid-col">
          {
            <PieChartCard title='Pie Chart' data={"xy"}/>
          }
          </Masonry>
      </ResultsContent>
      

      <ViewRaw jsonData={diffJsonData} />
      <Footer />
      <ToastContainer limit={3} draggablePercent={60} autoClose={2500} theme="dark" position="bottom-right" />
    </ResultsOuter>
  );
}

export default FixResults;
