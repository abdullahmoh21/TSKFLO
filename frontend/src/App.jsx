import './App.css';
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import NavBar from './layout/NavBar'; // Import NavBar
import HomeRoute from './routes/HomeRoute'; // Import Routes

function App() {
  return (
    <Router>
      <NavBar /> {/* Ensure Navbar is always visible */}
      <HomeRoute /> {/* This will handle all routes */}
    </Router>
  );
}

export default App;
