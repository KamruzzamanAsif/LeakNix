import styled from '@emotion/styled';

import { type ReactNode } from 'react';
import ErrorBoundary from '../misc/ErrorBoundary';
import Heading from '../Form/Heading';
import colors from '../../styles/colors';

export const StyledCard = styled.section<{ styles?: string }>`
  background: ${colors.backgroundLighter};
  color: ${colors.textColor};
  box-shadow: 4px 4px 0px ${colors.bgShadowColor};
  border-radius: 8px;
  padding: 1rem;
  position: inline;
  margin: 0.5rem auto; /* Center horizontally */
  max-height: 64rem;
  overflow: auto;
  width: 50%;
  
  justify-content: center; /* Center content horizontally */
  align-items: center; /* Center content vertically */
  ${props => props.styles}
`;


interface CardProps {
  children: ReactNode;
  heading?: string,
  styles?: string;
  actionButtons?: ReactNode | undefined;
};

export const Card = (props: CardProps): JSX.Element => {
  const { children, heading, styles} = props;
  return (
    <ErrorBoundary title={heading}>
      <StyledCard styles={styles}>
        { heading && <Heading className="inner-heading" as="h2" align="center" font-size='large' color={colors.primary}>{heading}</Heading> }
        {children}
      </StyledCard>
    </ErrorBoundary>
  );
}

export default StyledCard;
