// client/src/context/AuthContext.js
import React, { createContext, useReducer, useEffect, useCallback, useContext } from 'react';
import apiClient from '../services/api';
import { PlayerContext } from './PlayerContext'; // Import PlayerContext for logout
import { notifySuccess, notifyError, notifyInfo } from '../utils/notifications';

// Initial state
const initialState = {
  token: localStorage.getItem('token'), // Load token from localStorage
  isAuthenticated: null, // null initially, true/false after check
  isLoading: true, // To show loading state while checking token
  user: null,
  error: null,
};

// Action Types
export const AUTH_SUCCESS = 'AUTH_SUCCESS'; // For login/register success
export const AUTH_ERROR = 'AUTH_ERROR';
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const REGISTER_SUCCESS = 'REGISTER_SUCCESS';
export const ARTIST_REGISTER_SUCCESS = 'ARTIST_REGISTER_SUCCESS';
export const LOGOUT = 'LOGOUT';
export const USER_LOADED = 'USER_LOADED'; // After verifying token
export const CLEAR_ERRORS = 'CLEAR_ERRORS';
export const SET_LOADING = 'SET_LOADING';

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case SET_LOADING:
      return { ...state, isLoading: true };
    case USER_LOADED:
      return {
        ...state,
        isAuthenticated: true,
        isLoading: false,
        user: action.payload,
        error: null,
      };
    case LOGIN_SUCCESS:
    case REGISTER_SUCCESS:
    case ARTIST_REGISTER_SUCCESS:
      localStorage.setItem('token', action.payload.token);
      return {
        ...state,
        ...action.payload, // token and user object
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case AUTH_ERROR:
    case LOGOUT:
      localStorage.removeItem('token');
      return {
        ...state,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        user: null,
        error: action.payload, // error message for AUTH_ERROR
      };
    case CLEAR_ERRORS:
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

// Create Context
export const AuthContext = createContext(initialState);

// Provider Component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const playerContext = useContext(PlayerContext); // Access PlayerContext

  // Helper to set token in apiClient headers
  const setAuthToken = (token) => {
    if (token) {
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete apiClient.defaults.headers.common['Authorization'];
    }
  };

  // Load user on component mount if token exists
  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (token) {
      setAuthToken(token); // Set token for subsequent requests
      try {
        dispatch({ type: SET_LOADING });
        const res = await apiClient.get('/auth/me'); // Your backend endpoint
        dispatch({ type: USER_LOADED, payload: res.data.user });
      } catch (err) {
        console.error('Load User Error:', err.response ? err.response.data : err.message);
        dispatch({ type: AUTH_ERROR, payload: err.response ? err.response.data.message : 'Token verification failed' });
        notifyError(err.response?.data?.message || 'Session expired or invalid. Please log in again.');
      }
    } else {
      dispatch({ type: AUTH_ERROR }); // No token, not authenticated
    }
  }, [dispatch]); // dispatch is stable, no need to include it here as per React docs usually

  useEffect(() => {
    loadUser();
  }, [loadUser]); // Call loadUser once on mount

  // Login User Action
  const login = async (formData) => {
    try {
      dispatch({ type: SET_LOADING });
      const res = await apiClient.post('/auth/login', formData);
      dispatch({
        type: LOGIN_SUCCESS,
        payload: res.data, // Should contain token and user object
      });
      setAuthToken(res.data.token); // Set token for future requests
      notifySuccess("Logged in successfully!");
      // loadUser(); // Re-load user to ensure state consistency (optional, login_success already sets user)
    } catch (err) {
      dispatch({
        type: AUTH_ERROR,
        payload: err.response ? err.response.data.message : 'Login failed',
      });
      notifyError(err.response?.data?.message || 'Login failed');
    }
  };

  // Register User Action
  const register = async (formData) => {
    try {
      dispatch({ type: SET_LOADING });
      const res = await apiClient.post('/auth/register', formData);
      dispatch({
        type: REGISTER_SUCCESS,
        payload: res.data,
      });
      setAuthToken(res.data.token);
      notifySuccess("Registration successful! Welcome!");
      // loadUser();
    } catch (err) {
      dispatch({
        type: AUTH_ERROR,
        payload: err.response ? err.response.data.message : 'Registration failed',
      });
      notifyError(err.response?.data?.message || 'Registration failed');
    }
  };

  // Register Artist Action
  const registerArtist = async (formData) => {
     try {
      dispatch({ type: SET_LOADING });
      const res = await apiClient.post('/auth/register-artist', formData);
      dispatch({
        type: ARTIST_REGISTER_SUCCESS,
        payload: res.data,
      });
      setAuthToken(res.data.token);
      notifySuccess("Artist registration submitted. Verification pending.");
      // loadUser();
    } catch (err) {
      dispatch({
        type: AUTH_ERROR,
        payload: err.response ? err.response.data.message : 'Artist registration failed',
      });
      notifyError(err.response?.data?.message || 'Artist registration failed');
    }
  };


  // Logout Action
  const logout = () => {
    dispatch({ type: LOGOUT });
    setAuthToken(null); // Remove token from apiClient headers
    if (playerContext && typeof playerContext.clearQueue === 'function') {
      playerContext.clearQueue(); // Clear the player queue on logout
    }
    notifyInfo("Logged out successfully.");
  };

  // Clear Errors Action
  const clearErrors = () => dispatch({ type: CLEAR_ERRORS });

  return (
    <AuthContext.Provider
      value={{
        ...state,
        loadUser,
        login,
        register,
        registerArtist,
        logout,
        clearErrors,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};