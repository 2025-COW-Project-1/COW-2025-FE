import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import ToastProvider from './components/toast/ToastProvider';
import ConfirmProvider from './components/confirm/ConfirmProvider';

createRoot(document.getElementById('root')!).render(
  // StrictMode : 개발자용; 버그 더 빨리 드러냄
  <StrictMode>
    <ToastProvider>
      <ConfirmProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ConfirmProvider>
    </ToastProvider>
  </StrictMode>
);
