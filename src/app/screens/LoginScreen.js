// src/screens/LoginScreen.js

import React, { useState, useContext } from 'react';
import axios from '../utils/axiosConfig';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { io } from 'socket.io-client';

const LoginScreen = () => {
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);

  // State variables for form inputs and feedback messages
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Initialize Socket.io client
  const socket = io('http://localhost:3001', {
    withCredentials: true,
  });

  // Handler for form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page reload

    // Reset messages
    setError('');

    // Basic validation
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);

    try {
      // Send POST request to the backend to authenticate the user
      const response = await axios.post('/login', {
        email,
        password,
      });

      if (response.data.success) {
        // Fetch user data after login
        const userResponse = await axios.get('/me');
        if (userResponse.data.success) {
          setUser(userResponse.data.user);

          // Authenticate Socket.io connection
          socket.emit('authenticate', { token: null }); // Token is sent via cookies

          // Handle Socket.io authentication response
          socket.on('authenticated', (data) => {
            if (data.success) {
              console.log('Socket authenticated successfully.');
              navigate('/dashboard');
            } else {
              setError(data.message || 'Socket authentication failed.');
            }
          });

          // Handle potential socket errors
          socket.on('error', (data) => {
            setError(data.message || 'An error occurred with the socket connection.');
          });
        }
      } else {
        setError(response.data.message || 'Login failed.');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'An error occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />
        </div>

        <button type="submit" className="auth-button" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <p>
        Don't have an account? <Link to="/register">Register here</Link>.
      </p>
    </div>
  );
};

export default LoginScreen;
