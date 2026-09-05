import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { NorthernSsireumSpecialPage } from './pages/NorthernSsireumSpecialPage';
import './index.css';

const isNorthernSsireumSpecialPage =
  typeof window !== 'undefined' &&
  window.location.pathname.startsWith('/special/northern-ssireum');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isNorthernSsireumSpecialPage ? <NorthernSsireumSpecialPage /> : <App />}
  </StrictMode>,
);
