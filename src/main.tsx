import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import '@fontsource-variable/dm-sans';
import '@fontsource-variable/fraunces';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './styles/main.scss';
import { i18nReady } from './i18n/index.ts';
import App from './App.tsx';
import { AuthProvider } from './auth/AuthContext.tsx';

const container = document.getElementById('root');
if (!container) throw new Error('Root element not found');

// Wait for the texts, otherwise the first screen would flash the raw keys. When the file cannot
// be loaded the app still starts, with the keys as text, and the error is in the console.
await i18nReady.catch((error: unknown) => {
    console.error(error);
});

createRoot(container).render(
    <StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <App />
            </AuthProvider>
        </BrowserRouter>
    </StrictMode>,
);
