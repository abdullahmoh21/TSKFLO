import React from "react";
import Navbar from "../components/homeNavBar"; // Ensure Navbar is included
import backgroundImage from "../assets/background.png"; // Use the same animated background

const AboutPage = () => {
  return (
    <div
      className="relative w-full h-screen bg-cover bg-center bg-no-repeat animate-background"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        minHeight: "100vh",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Overlay for better text contrast */}
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>

      {/* Content Container */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white z-20 px-6">
        <Navbar />
        <div className="max-w-3xl bg-white bg-opacity-90 shadow-2xl rounded-xl p-10 text-gray-800">
          <h1 className="text-4xl font-extrabold text-gray-900">About Us</h1>
          <p className="mt-4 text-lg leading-relaxed">
            Our Task Management System is designed to help teams efficiently
            collaborate, manage tasks, and stay organized with ease.
          </p>
          <p className="mt-4 text-lg leading-relaxed">
            Whether you're tracking project progress, assigning tasks, or
            setting deadlines, our platform provides seamless integration for a
            smoother workflow.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
