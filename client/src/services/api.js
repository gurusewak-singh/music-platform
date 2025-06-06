// client/src/services/api.js
import axios from 'axios';

// Create an Axios instance
const apiClient = axios.create({
  // baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api', // Default to backend dev server
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api', // Default to backend dev server
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

export default apiClient;