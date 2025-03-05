import React from "react";
import Navbar from "../components/homeNavBar"; // Import Navbar from layout folder
import backgroundImage from "../assets/background.png"; // Import the image

const HomePage = () => {
  return (
    <div
      className="relative w-full h-screen bg-cover bg-center bg-no-repeat animate-background"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        minHeight: "100vh", // Ensure the height is 100vh
        backgroundSize: "cover", // Ensures the background covers the full container
        backgroundPosition: "center", // Centers the background image
        backgroundAttachment: "fixed", // Keeps the background fixed while scrolling
      }}
    >
      {/* Center the content using flex */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white z-20 px-4">
        <Navbar />
        <h1 className="text-6xl font-semibold mb-4">Welcome to Our Website</h1>
        <p className="text-lg">This is a sample homepage with a navbar.</p>
      </div>
    </div>
  );
};

export default HomePage;
