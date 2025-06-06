// client/src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { PlayerProvider } from './context/PlayerContext'; // Import PlayerProvider

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <PlayerProvider> {/* Wrap with PlayerProvider */}
        <App />
      </PlayerProvider>
    </AuthProvider>
  </React.StrictMode>
);