import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { selectCurrentToken, selectCurrentUserRole } from "./features/auth/authSlice";
import HomeNavBar from "./components/homeNavBar";
import UserNavbar from "./components/userNavBar";
import AdminNavbar from "./components/adminNavbar";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import UserDashboard from "./pages/UserDashboard";
import CreateTask from "./pages/CreateTask";
import AboutPage from "./pages/AboutPage";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import AdminPage from "./pages/AdminDashboard";
import MessagingPage from "./pages/MessagingPage";
import PersistLogin from "./components/PersistLogin";

// Create a wrapper component that uses location
function AppContent() {
  const location = useLocation();
  const token = useSelector(selectCurrentToken);
  const userRole = useSelector(selectCurrentUserRole);
  const isAdmin = userRole === 'admin';

  // Decide which Navbar to show based on the current path and user role
  let NavbarComponent;
  if (isAdmin && (location.pathname.startsWith("/admindashboard") || location.pathname.startsWith("/messaging"))) {
    NavbarComponent = AdminNavbar;
  } else if (
    location.pathname.startsWith("/dashboard") ||
    location.pathname.startsWith("/create-task") ||
    (!isAdmin && location.pathname.startsWith("/messaging"))
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
              <AdminRoute>
                <AdminPage />
              </AdminRoute>
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
        
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthCheck />
      <AppContent />
    </Router>
  );
}

// Add this new component for auth checking
function AuthCheck() {
  const token = useSelector(selectCurrentToken);
  const dispatch = useDispatch();

  useEffect(() => {
    console.log("Auth check on application start");
    // Token existence is now handled by the loadAuthState in authSlice
    // This component is a hook point for any additional auth checks or initializations
  }, []);

  return null; // This component doesn't render anything
}

export default App;
