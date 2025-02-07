import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomeRoute from './routes/HomeRoute'; 
import LoginRoute from './routes/LoginRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomeRoute />} />
        <Route path="/login" element={<LoginRoute />} /> {/* Add Login Route */}
      </Routes>
    </Router>
  );
}

export default App;
