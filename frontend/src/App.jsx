import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { useSelector } from "react-redux";
import {
  selectCurrentToken,
  selectCurrentUserRole,
} from "./features/auth/authSlice";

// Layouts
import AdminLayout from "./layouts/AdminLayout";
import UserLayout from "./layouts/UserLayout";
import HomeLayout from "./layouts/HomeLayout";

// User pages
import UserDashboard from "./pages/user/UserDashboard";
import MessagingPage from "./pages/MessagingPage";

// Admin pages
import AdminMetrics from "./pages/admin/AdminMetrics";
import AdminTasks from "./pages/admin/AdminTasks";
import AdminUsers from "./pages/admin/AdminUsers";

// Public pages
import HomePage from "./pages/public/HomePage";
import LoginPage from "./pages/public/LoginPage";
import AboutPage from "./pages/public/AboutPage";

// common page
import CreateTask from "./pages/CreateTask";

// Other components
import UserRoute from "./components/route_protection/UserRoute";
import AdminRoute from "./components/route_protection/AdminRoute";
import PersistLogin from "./components/PersistLogin";
import SocketInitializer from "./features/socket/SocketInitializer";
import { NotificationProvider } from "./context/NotificationContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <Router>
      <NotificationProvider>
        <ToastContainer position="top-right" autoClose={5000} pauseOnHover />
        <SocketInitializer />

        <Routes>
          {/* Public routes with HomeNavBar */}
          <Route element={<HomeLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="login" element={<LoginPage />} />
          </Route>

          {/* Protected routes - User & Admin */}
          <Route element={<PersistLogin />}>
            {/* User routes with UserNavBar */}
            <Route element={<UserRoute />}>
              <Route element={<UserLayout />}>
                <Route path="dashboard" element={<UserDashboard />} />
                <Route path="createTask" element={<CreateTask />} />
                <Route path="messaging" element={<MessagingPage />} />
              </Route>
            </Route>

            {/* Admin routes with AdminLayout */}
            <Route element={<AdminRoute />}>
              <Route path="admin" element={<AdminLayout />}>
                <Route
                  index
                  element={<Navigate to="/admin/metrics" replace />}
                />
                <Route path="metrics" element={<AdminMetrics />} />
                <Route path="dashboard" element={<UserDashboard />} />
                <Route path="tasks" element={<AdminTasks />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="messaging" element={<MessagingPage />} />
                <Route path="createTask" element={<CreateTask />} />
              </Route>
            </Route>
          </Route>

          {/* Catch all route - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </NotificationProvider>
    </Router>
  );
}

export default App;
