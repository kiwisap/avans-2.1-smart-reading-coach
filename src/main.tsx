import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import '@fontsource-variable/dm-sans';
import '@fontsource-variable/fraunces';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './styles/main.scss';
import './i18n/index.ts';
import App from './App.tsx';
import { AuthProvider } from './auth/AuthContext.tsx';

const container = document.getElementById('root');
if (!container) throw new Error('Root element not found');

createRoot(container).render(
    <StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <App />
            </AuthProvider>
        </BrowserRouter>
    </StrictMode>,
);
