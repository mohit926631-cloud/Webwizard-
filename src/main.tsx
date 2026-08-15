import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ClerkAuthProvider } from './components/Auth/ClerkAuthProvider.tsx';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkAuthProvider>
      <App />
    </ClerkAuthProvider>
  </StrictMode>,
);


