// src/app/components/PrivateRoute.js

'use client'; // Ensure this is a Client Component in Next.js 13

import { useRouter } from 'next/navigation';
import { useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext'; // Ensure you have AuthContext set up

const PrivateRoute = ({ children }) => {
  const { user } = useContext(AuthContext); // Assuming AuthContext provides 'user'
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      // Redirect to login if not authenticated
      router.push('/login');
    }
  }, [user, router]);

  // If user exists, render the children components
  return user ? children : null;
};

export default PrivateRoute;
