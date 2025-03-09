import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import { useSelector } from "react-redux";
import { selectCurrentToken } from "./features/auth/authSlice";
import HomeNavBar from "./components/homeNavBar";
import UserNavbar from "./components/userNavBar";
import AdminNavbar from "./components/adminNavbar";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import UserDashboard from "./pages/UserDashboard";
import CreateTask from "./pages/CreateTask";
import AboutPage from "./pages/AboutPage";
import AdminPage from "./pages/AdminDashboard";
import MessagingPage from "./pages/MessagingPage";
import ProtectedRoute from "./components/ProtectedRoute";
import PersistLogin from "./components/PersistLogin";
import SocketInitializer from "./features/socket/SocketInitializer";

// Create a wrapper component that uses location
function AppContent() {
  const location = useLocation();
  const token = useSelector(selectCurrentToken);

  // Decide which Navbar to show based on the current path
  let NavbarComponent;
  if (location.pathname.startsWith("/admindashboard")) {
    NavbarComponent = AdminNavbar;
  } else if (
    location.pathname.startsWith("/dashboard") ||
    location.pathname.startsWith("/create-task") ||
    location.pathname.startsWith("/edit-task") ||
    location.pathname.startsWith("/messaging")
  ) {
    NavbarComponent = UserNavbar;
  } else {
    NavbarComponent = HomeNavBar;
  }

  return (
    <>
      <NavbarComponent />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/about" element={<AboutPage />} />

        <Route element={<PersistLogin />}>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <UserDashboard />
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
          <Route
            path="/messaging"
            element={
              <ProtectedRoute>
                <MessagingPage />
              </ProtectedRoute>
            }
          />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <SocketInitializer />
      <AppContent />
    </Router>
  );
}

export default App;
