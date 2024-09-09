import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router-dom";
import App from './App.tsx'
import { StaticRouter } from "react-router-dom/server";

const isSSR = import.meta.env.SSR;

const MainApp = () => (
  isSSR ? (
    <StaticRouter location={window.location.pathname}>
      <App />
    </StaticRouter>
  ) : (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  )
);

createRoot(document.getElementById('root')!).render(<MainApp />);