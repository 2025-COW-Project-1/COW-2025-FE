import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import ToastProvider from './components/toast/ToastProvider';
import ConfirmProvider from './components/confirm/ConfirmProvider';

createRoot(document.getElementById('root')!).render(
  <ToastProvider>
    <ConfirmProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ConfirmProvider>
  </ToastProvider>
);
