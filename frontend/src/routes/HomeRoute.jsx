=======
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import UserDashboard from '../pages/UserDashboard';
import TaskManagement from '../pages/TaskManagement';
import AboutPage from "../pages/AboutPage"; // Import About Page

const HomeRoute = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/tasks" element={<TaskManagement />} />
        <Route path="/about" element={<AboutPage />} />
      </Routes>
    </Router>
  );
};

export default HomeRoute;
