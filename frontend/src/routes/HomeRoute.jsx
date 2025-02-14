import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import HomePage from "../pages/HomePage";
import UserDashboard from "../pages/UserDashboard";
import TaskManagement from "../pages/TaskManagement";
import AboutPage from "../pages/AboutPage";
import LoginPage from "../pages/LoginPage";
import CreateTask from "../pages/CreateTask";
import AdminPage from "../pages/AdminPage";
import TeamPage from "../pages/TeamPage"; // Import TeamPage
import Navbar from "../layout/NavBar";

const HomeRoute = () => {
  return (
    <Router>
      <ConditionalNavbar /> {/* Navbar only on selected pages */}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/tasks" element={<TaskManagement />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/create-task" element={<CreateTask />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/team" element={<TeamPage />} /> {/* Added TeamPage route */}
      </Routes>
    </Router>
  );
};

// Function to render Navbar only on selected pages
const ConditionalNavbar = () => {
  const location = useLocation();
  const showNavbar = ["/tasks", "/about", "/dashboard", "/admin", "/team"].includes(location.pathname); // Added /team to the list

  return showNavbar ? <Navbar /> : null;
};

export default HomeRoute;
