import { Card } from '../Form/CardV3';
import colors from '../../styles/colors';
import styled from '@emotion/styled';

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

const StyledTotalFiles = styled.div`
  color: ${colors.primary};
  border-radius: 4px;
  padding: 0.5rem 1rem;
  text-align: center;
  font-weight: bold;
  font-size: 2rem;
  margin-top: 1rem;
  box-shadow: 2px 2px 4px ${colors.bgShadowColor};
`;

 const OverviewCard = (props: { title: string, data: any}): JSX.Element => {
  return (
    <Card heading={props.title} styles={cardStyles}>
      <StyledTotalFiles>
        {props.data}
      </StyledTotalFiles>
    </Card>
  );
}

export default OverviewCard;
