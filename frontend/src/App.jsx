import './App.css';
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
//Include Routes and Route
import NavBar from './layout/NavBar'; // Import NavBar
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import TaskDashboard from './pages/TaskDashboard';
import CreateTask from './pages/CreateTask';
import AboutPage from './pages/AboutPage';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
function App() {
  const location = useLocation();

  return (
    <AuthProvider>
      <Router>
        <NavBar /> {/* Ensure Navbar is always visible */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} /> {/* Add Login Route */}
          <Route path="/about" element={<AboutPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <TaskDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-task"
            element={
              <ProtectedRoute>
                <CreateTask />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
export default App;