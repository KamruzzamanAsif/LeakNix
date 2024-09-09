import styled from '@emotion/styled';
import type { ReactNode } from 'react';

import { StyledCard } from '../Form/Card';
import Heading from '../Form/Heading';
import colors from '../../styles/colors';

const Header = styled(StyledCard)`
  margin: 1rem auto;
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  padding: 0.5rem 1rem;
  align-items: center;
  width: 95vw;
`;

const Nav = (props: { children?: ReactNode}) => {
  return (
    <Header as="header">
    <Heading color={colors.primary} size="large">
      <img width="64" src="/leak-nix.png" alt="Leak Nix Icon" />
      <a href="/" target="_self">LeakNix</a>
    </Heading>
      {props.children && props.children}
  </Header>
  );
};

export default Nav;
