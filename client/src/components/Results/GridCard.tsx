import { Card } from '../../components/Form/Card';
import colors from '../../styles/colors';
import AGgrid from './AGgrid';

const cardStyles = `
  small { margin-top: 1rem; opacity: 0.5; }
  a {
    color: ${colors.textColor};
  }
  details {
    // display: inline;
    display: flex;
    transition: all 0.2s ease-in-out;
    h3 {
      display: inline;
    }
    summary {
      padding: 0;
      margin: 1rem 0 0 0;
      cursor: pointer;
    }
    summary:before {
      content: "►";
      position: absolute;
      margin-left: -1rem;
      color: ${colors.primary};
      cursor: pointer;
    }
    &[open] summary:before {
      content: "▼";
    }
  }
`;


const GridCard = (props: { title: string}): JSX.Element => {
  return (
    <Card heading={props.title} styles={cardStyles}>
      <AGgrid/>
    </Card>
  );
}

export default GridCard;
