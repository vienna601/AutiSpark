import React from 'react';
import { Auth0Provider } from '@auth0/auth0-react';
import AppRouter from './Router';

function App() {
  return (
    <Auth0Provider
      domain={import.meta.env.VITE_AUTH0_DOMAIN}
      clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: import.meta.env.VITE_AUTH0_AUDIENCE,
      }}
    >
      <AppRouter />
    </Auth0Provider>
  );
}

export default App;
