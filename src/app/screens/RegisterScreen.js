// src/screens/RegisterScreen.js

import React, { useState } from 'react';
import axios from '../utils/axiosConfig';
import { Link, useNavigate } from 'react-router-dom';

const RegisterScreen = () => {
  const navigate = useNavigate();

  // State variables for form inputs and feedback messages
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Handler for form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page reload

    // Reset messages
    setError('');
    setSuccess('');

    // Basic validation
    if (!username || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      // Send POST request to the backend to create a new user
      const response = await axios.post('/user', {
        username,
        email,
        password,
      });

      if (response.data.success) {
        setSuccess('Registration successful! Redirecting to login...');
        // Redirect to login after a short delay
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(response.data.message || 'Registration failed.');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'An error occurred during registration.');
    }
  };

  return (
    <div className="auth-container">
      <h2>Register</h2>
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            required
          />
        </div>

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
            placeholder="Enter a strong password"
            required
          />
        </div>

        <button type="submit" className="auth-button">
          Register
        </button>
      </form>
      <p>
        Already have an account? <Link to="/login">Login here</Link>.
      </p>
    </div>
  );
};

export default RegisterScreen;
