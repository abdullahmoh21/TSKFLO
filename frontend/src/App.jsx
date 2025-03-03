
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
//Include Routes and Route
import NavBar from './layout/NavBar'; // Import NavBar
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import TaskDashboard from './pages/TaskDashboard';
import CreateTask from './pages/CreateTask';
import AboutPage from './pages/AboutPage';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminPage from './pages/AdminPage';

// Create a wrapper component that uses location
function AppContent() {
  const location = useLocation();
  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
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

<Route
          path="/admindashboard"
          element={
            <ProtectedRoute>
              <AdminPage />
            </ProtectedRoute>
          }
        />

      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;