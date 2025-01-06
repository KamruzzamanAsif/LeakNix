import { Card } from '../../components/Form/CardV3';
import colors from '../../styles/colors';
import OutputConsole from './OutputConsole';

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



const OutputConsoleCard = (props: { title: string, url: string, scenario_used: boolean, onJsonDataReceived: (data: any) => void}): JSX.Element => {
  return (
    <Card heading={props.title} styles={cardStyles}>
      <OutputConsole url={props.url} scenario_used={props.scenario_used} onJsonDataReceived={props.onJsonDataReceived}/>
    </Card>
  );
}

export default OutputConsoleCard;
