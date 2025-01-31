import { Card } from '../../components/Form/Card';
import colors from '../../styles/colors';
import CustomPieChart from './CustomPieChart';
import { useEffect } from 'react';

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


const PieChartCard = (props: { title: string, data: any}): JSX.Element => {
  
  return (
    <Card heading={props.title} styles={cardStyles}>        
      <CustomPieChart data={props.data} />
    </Card>
  );
}

export default PieChartCard;
