import React from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "../pages/HomePage";
import AboutPage from "../pages/AboutPage"; // Import About Page

const HomeRoute = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<AboutPage />} /> {/* Ensure AboutPage is included */}
    </Routes>
  );
};

export default HomeRoute;
