// src/context/AuthContext.js

"use client";
import React, { createContext, useState, useEffect } from 'react';
import axios from '../utils/axiosConfig';

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const login = async (email, password) => {
    try {
      const response = await axios.post('/login', { email, password });
      if (response.data.success) {
        const userResponse = await axios.get('/me');
        if (userResponse.data.success) {
          setUser(userResponse.data.user);
          return { success: true };
        }
      }
      return { success: false, message: response.data.message };
    } catch (error) {
      console.error('Login Error:', error);
      return { success: false, message: 'An error occurred during login.' };
    }
  };

  const logout = async () => {
    try {
      await axios.post('/logout');
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
