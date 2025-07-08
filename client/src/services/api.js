// client/src/services/api.js
import axios from 'axios';
import { notifyError } from '../utils/notifications'; // Import notifyError

// Create an Axios instance
const apiClient = axios.create({
  // baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api', // Default to backend dev server
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://music-platform-t5so.onrender.com/api', // Default to backend dev server
  headers: {
    'Content-Type': 'application/json',
  },
});

// Optional: Interceptor to add JWT token to requests
// We'll set this up properly when we implement auth context
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Or get from auth context
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
apiClient.interceptors.response.use(
  (response) => response, // Simply return response if successful
  (error) => {
    // Handle different types of errors
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const message = error.response.data?.message || error.message || 'An API error occurred';
      // Don't show toast for 401/403 as AuthContext or components might handle these with redirects/specific UI
      if (error.response.status !== 401 && error.response.status !== 403) {
         notifyError(`API Error: ${message} (Status: ${error.response.status})`);
      }
    } else if (error.request) {
      // The request was made but no response was received
      notifyError('Network Error: Could not connect to the server.');
    } else {
      // Something happened in setting up the request that triggered an Error
      notifyError(`Error: ${error.message}`);
    }
    return Promise.reject(error); // Important to re-throw the error for component-level catch blocks
  }
);

export default apiClient;
