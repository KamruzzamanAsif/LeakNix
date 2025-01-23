import { Routes, Route, Outlet } from 'react-router-dom';

import Home from '../src/views/Home.tsx';
import Results from '../src/views/Results.tsx';
import About from '../src/views/About.tsx';
import NotFound from '../src/views/NotFound.tsx';

import FixHome from '../src/views/FixHome.tsx';

import ErrorBoundary from '../src/components/boundaries/PageError.tsx';
import GlobalStyles from './styles/globals.tsx';

const Layout = () => {
  return (
  <>
    <GlobalStyles />
    <Outlet />
  </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="home" element={<Home />} />
          <Route path="/check/:urlToScan" element={<Results />} />
          <Route path="/fix" element={<FixHome />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route path='/about' element={<About />} />
      </Routes>
    </ErrorBoundary>
  );
}
