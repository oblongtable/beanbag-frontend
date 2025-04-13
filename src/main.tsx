// /home/seven7een/Documents/dev/beanbag-frontend/src/main.tsx
import { createRoot } from 'react-dom/client';
import { Auth0Provider } from '@auth0/auth0-react';
import App from './App.tsx';
import './index.css'

const container = document.getElementById('root');
const root = createRoot(container!);

const domain = import.meta.env.VITE_AUTH0_DOMAIN;
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
const audience = import.meta.env.VITE_AUTH0_AUDIENCE;

// if (!domain || !clientId || !audience) {
//   throw new Error('Missing Auth0 environment variables: VITE_AUTH0_DOMAIN, VITE_AUTH0_CLIENT_ID, or VITE_AUTH0_AUDIENCE');
// }

const providerConfig = {
  domain: domain,
  clientId: clientId,
  authorizationParams: {
    redirect_uri: window.location.origin,
    audience: audience,
  },
  cacheLocation: "localstorage" as const, // Use 'localstorage' for persistence
};

root.render(
  <Auth0Provider
    {...providerConfig}
  >
    <App />
  </Auth0Provider>,
);
