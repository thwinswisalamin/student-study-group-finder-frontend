// ============================================================
// src/main.jsx - React application entry point
// Mounts the App component into the #root div in index.html
// ============================================================

import React    from 'react';
import ReactDOM from 'react-dom/client';
import App      from './App.jsx';

// Import global styles (vanilla CSS)
import './styles/main.css';

// Mount the React app into the <div id="root"> in index.html
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
