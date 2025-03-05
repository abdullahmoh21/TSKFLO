<<<<<<< Updated upstream
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
=======
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
>>>>>>> Stashed changes
import HomePage from "../pages/HomePage";
import UserDashboard from "../pages/UserDashboard";
import TaskManagement from "../pages/TaskManagement";
import AboutPage from "../pages/AboutPage";
import LoginPage from "../pages/LoginPage";
import CreateTask from "../pages/CreateTask";
<<<<<<< Updated upstream
=======
import AdminPage from "../pages/AdminPage";
import TeamPage from "../pages/TeamPage"; // Import TeamPage
import Navbar from "../layout/NavBar";
>>>>>>> Stashed changes

const HomeRoute = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/tasks" element={<TaskManagement />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/create-task" element={<CreateTask />} />
        <Route path="/login" element={<LoginPage />} />
<<<<<<< Updated upstream
=======
        <Route path="/admindashboard" element={<AdminPage />} />
        <Route path="/team" element={<TeamPage />} />{" "}
        {/* Added TeamPage route */}
>>>>>>> Stashed changes
      </Routes>
    </Router>
  );
};

<<<<<<< Updated upstream
=======
// Function to render Navbar only on selected pages
const ConditionalNavbar = () => {
  const location = useLocation();
  const showNavbar = ["/tasks", "/about", "/dashboard", "/admin"].includes(
    location.pathname
  ); // Added /team to the list

  return !showNavbar ? <Navbar /> : null;
};

>>>>>>> Stashed changes
export default HomeRoute;
