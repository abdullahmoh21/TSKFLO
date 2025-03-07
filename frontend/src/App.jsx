import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { selectCurrentToken, setCredentials } from "./features/auth/authSlice";
import { useRefreshMutation, useGetUserProfileQuery } from "./features/auth/authApiSlice";
//Include Routes and Route
import HomeNavBar from "./components/homeNavBar";
import UserNavbar from "./components/userNavBar";
import AdminNavbar from "./components/adminNavbar";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import UserDashboard from "./pages/UserDashboard";
import CreateTask from "./pages/CreateTask";
import EditTask from "./pages/EditTask";
import AboutPage from "./pages/AboutPage";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminPage from "./pages/AdminDashboard";
import MessagingPage from "./pages/MessagingPage";

// Create a wrapper component that uses location
function AppContent() {
  const location = useLocation();
  const dispatch = useDispatch();
  const token = useSelector(selectCurrentToken);
  const [isInitializing, setIsInitializing] = useState(true);
  
  // Get refresh and user profile hooks
  const [refresh, { isLoading: isRefreshing }] = useRefreshMutation();
  
  // Fetch user profile if token exists
  const { refetch: refetchUserProfile } = useGetUserProfileQuery(undefined, {
    skip: !token, // Skip the query if no token exists
  });

  // On component mount, check for token in localStorage and refresh if needed
  useEffect(() => {
    const verifyToken = async () => {
      try {
        // First check if we have a token in redux state
        if (token) {
          console.log("Token exists in Redux state, refreshing...");
          await refresh().unwrap();
          await refetchUserProfile();
        } 
        // If no token in Redux state, check localStorage
        else {
          const localToken = localStorage.getItem('token');
          if (localToken) {
            console.log("Token found in localStorage, setting credentials...");
            // First set the token in Redux state
            dispatch(setCredentials({ accessToken: localToken }));
            // Then refresh it to verify it's still valid
            try {
              await refresh().unwrap();
              await refetchUserProfile();
            } catch (err) {
              console.log("Stored token is invalid, clearing it");
              localStorage.removeItem('token');
            }
          }
        }
      } catch (error) {
        console.error('Token verification failed:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    verifyToken();
  }, []);

  // If still initializing, could show a loading spinner
  if (isInitializing) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

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
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/about" element={<AboutPage />} />

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
          path="/edit-task/:taskId"
          element={
            <ProtectedRoute>
              <EditTask />
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
        
        {/* Messaging route */}
        <Route
          path="/messaging"
          element={
            <ProtectedRoute>
              <MessagingPage />
            </ProtectedRoute>
          }
        />
        
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
