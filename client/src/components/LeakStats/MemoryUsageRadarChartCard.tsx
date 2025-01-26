import { Card } from '../../components/Form/CardV3';
import colors from '../../styles/colors';
import AverageMemoryGrowthRadarChart from './MemoryUsageRadarChart';
import { useEffect } from 'react';
import Overview from '../Results/Overview';

const cardStyles = `
  small { 
    margin-top: 1rem; 
    opacity: 0.5; 
  }

  a {
    color: ${colors.textColor};
    text-decoration: none; /* Avoid underline by default */
  }

  details {
    display: flex;
    flex-direction: column; /* Stack content vertically */
    transition: all 0.2s ease-in-out;

    h3 {
      display: inline-block;
      margin: 0;
    }

    summary {
      padding: 0;
      margin: 1rem 0 0 0;
      cursor: pointer;
      font-weight: bold;
    }

    summary:before {
      content: "►";
      margin-right: 0.5rem;
      color: ${colors.primary};
      cursor: pointer;
      transition: transform 0.2s ease-in-out;
    }

    &[open] summary:before {
      content: "▼";
    }
  }
`;


const MemoryUsageRadarChartCard = (props: { title: string, data: any, onRenderComplete: () => void}): JSX.Element => {
  useEffect(() => {
    props.onRenderComplete(); // Notify the parent that rendering is complete
  }, [props.onRenderComplete]);

  return (
    <Card heading={props.title} styles={cardStyles}>
        <Overview jsonData={props.data}/>        
       <AverageMemoryGrowthRadarChart jsonData={props.data}></AverageMemoryGrowthRadarChart>
    </Card>
  );
}

export default MemoryUsageRadarChartCard;

