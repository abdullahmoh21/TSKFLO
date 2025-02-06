import React from 'react';
import ReactDOM from 'react-dom/client';
import HomeRoute from './routes/HomeRoute'; // Ensure this path is correct
import './index.css'; // Import global styles if any

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HomeRoute />
  </React.StrictMode>
);
