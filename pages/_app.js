// pages/_app.js

import React from 'react';
import AuthProvider from '../src/app/context/AuthContext'; // Adjust the path as necessary
//import '../styles/globals.css'; // Import your global styles

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}

export default MyApp;
