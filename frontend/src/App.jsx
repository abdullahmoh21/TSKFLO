
import './App.css';
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // Include Routes and Route
import NavBar from './layout/NavBar'; // Import NavBar
import HomeRoute from './routes/HomeRoute'; // Import HomeRoute
import LoginRoute from './routes/LoginRoute';

function App() {
  return (
    <Router>
      <NavBar /> {/* Ensure Navbar is always visible */}
      <Routes>
        <Route path="/" element={<HomeRoute />} />
        <Route path="/login" element={<LoginRoute />} /> {/* Add Login Route */}
      </Routes>
    </Router>
  );
}

export default App;
