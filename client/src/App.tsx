import { Routes, Route, Outlet } from 'react-router-dom';

import Home from '../src/views/Home.tsx';
import Results from '../src/views/Results.tsx';
import About from '../src/views/About.tsx';
import NotFound from '../src/views/NotFound.tsx';

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
        <Route path="/check" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="home" element={<Home />} />
          <Route path=":urlToScan" element={<Results />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route path="/fix" element={<NotFound />} />
        <Route path='/about' element={<About />} />
      </Routes>
    </ErrorBoundary>
  );
}
