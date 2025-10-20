import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import SmartCalendarApp from './smart-calendar-app';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <GoogleOAuthProvider clientId="49159840579-ima1rfuscnt5bshe19ksnc8fvkl5a7ei.apps.googleusercontent.com">
    <SmartCalendarApp />
  </GoogleOAuthProvider>
);