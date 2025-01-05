// pages/index.js

import React, { useContext, useEffect } from 'react';
import { AuthContext } from '../src/app/context/AuthContext';
import { useRouter } from 'next/router';
import LoginScreen from './loginscreen'; // Adjust the path as necessary

const Home = () => {
  const { user, loading } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/game'); // Redirect authenticated users to dashboard
    }
  }, [user, loading, router]);

  return <LoginScreen />;
};

export default Home;
