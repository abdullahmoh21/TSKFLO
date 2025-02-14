import './App.css';
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'; // Include useLocation
import NavBar from './layout/NavBar'; // Import NavBar
import HomeRoute from './routes/HomeRoute'; // Import HomeRoute
import LoginRoute from './routes/LoginRoute';
import DashboardPage from './pages/DashboardPage'; // Import DashboardPage
import AdminPage from './pages/AdminPage'; // Import AdminPage
import TeamPage from './pages/TeamPage'; // Import TeamPage

function App() {
  const location = useLocation();

  return (
    <Router>
      {/* Only show NavBar if not on login, dashboard, or team page */}
      {(location.pathname !== '/login' && location.pathname !== '/dash' && location.pathname !== '/team') && <NavBar />}

      <Routes>
        <Route path="/" element={<HomeRoute />} />
        <Route path="/login" element={<LoginRoute />} />
        <Route path="/dash" element={<DashboardPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/team" element={<TeamPage />} /> {/* Add the TeamPage route */}
      </Routes>
    </Router>
  );
}

export default App;
