// src/utils/axiosConfig.js

import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:3001', // Backend URL
  withCredentials: true, // Include cookies in requests
});

export default instance;
