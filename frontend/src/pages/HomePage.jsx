import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaTasks, FaArrowRight, FaLightbulb, FaUsers, FaBell } from "react-icons/fa";
import backgroundGradient from "../assets/background.png"; // Use existing background or we'll create a gradient in CSS

const HomePage = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation after component mounts
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-700 to-secondary-900 text-white overflow-hidden">
      {/* Animated particles background overlay */}
      <div className="absolute inset-0 w-full h-full z-0 opacity-20">
        <div className="absolute top-0 left-0 w-full h-full bg-repeat" 
          style={{
            backgroundImage: `url(${backgroundGradient})`,
            backgroundSize: 'cover',
            filter: 'blur(4px)'
          }} 
        />
        {/* Animated shine effect */}
        <div className="absolute top-0 left-0 w-full h-full bg-white opacity-5 animate-pulse" />
      </div>

      {/* Content container */}
      <div className="relative z-10 container mx-auto px-4 pt-20 pb-12 flex flex-col min-h-screen">
        {/* Hero section */}
        <div className="flex flex-col md:flex-row items-center justify-between my-12 md:my-20">
          {/* Left side with text */}
          <div className={`w-full md:w-1/2 space-y-6 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Revolutionize Your <span className="text-primary-300">Task Management</span> Experience
            </h1>
            <p className="text-xl text-gray-200 leading-relaxed">
              Stay organized, meet deadlines, and collaborate seamlessly with our powerful and intuitive task management platform.
            </p>
            <div className="pt-4 flex flex-wrap gap-4">
              <Link to="/login" className="bg-white text-primary-800 hover:bg-primary-50 px-6 py-3 rounded-lg font-medium flex items-center gap-2 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                Get Started <FaArrowRight className="ml-1" />
              </Link>
              <Link to="/about" className="bg-transparent border border-white text-white hover:bg-white/10 px-6 py-3 rounded-lg font-medium transition-all hover:-translate-y-1">
                Learn More
              </Link>
            </div>
          </div>

          {/* Right side with floating card illustration */}
          <div className={`w-full md:w-1/2 mt-12 md:mt-0 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
            <div className="relative mx-auto w-full max-w-md">
              {/* Decorative elements */}
              <div className="absolute -top-6 -left-6 w-20 h-20 bg-primary-400 rounded-full opacity-20 animate-pulse"></div>
              <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-secondary-300 rounded-full opacity-20 animate-pulse delay-700"></div>
              
              {/* Main card */}
              <div className="glass-morphism rounded-2xl p-6 shadow-glass rotate-3 hover:rotate-0 transition-all duration-500 animate-float">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-xl">Dashboard Preview</h3>
                  <FaTasks className="text-2xl text-primary-300" />
                </div>
                
                {/* Task items for illustration */}
                {[
                  { title: "Complete Project Plan", priority: "High", status: "In Progress" },
                  { title: "Review Documentation", priority: "Medium", status: "Todo" },
                  { title: "Team Meeting", priority: "Low", status: "Done" }
                ].map((task, index) => (
                  <div key={index} className="bg-white/10 rounded-lg p-3 mb-3 hover:bg-white/20 transition-all cursor-pointer">
                    <div className="flex justify-between">
                      <span className="font-medium">{task.title}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        task.priority === "High" ? "bg-danger-500/20 text-danger-300" :
                        task.priority === "Medium" ? "bg-warning-500/20 text-warning-300" :
                        "bg-success-500/20 text-success-300"
                      }`}>{task.priority}</span>
                    </div>
                    <div className="mt-2 text-sm text-gray-300">{task.status}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Features section */}
        <div className={`mt-20 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <FaTasks />,
                title: "Task Tracking",
                description: "Keep track of all your tasks with our intuitive interface. Organize by priority, status, and due dates."
              },
              {
                icon: <FaUsers />,
                title: "Team Collaboration",
                description: "Collaborate seamlessly with team members. Assign tasks, share updates, and work together efficiently."
              },
              {
                icon: <FaBell />,
                title: "Smart Notifications",
                description: "Never miss a deadline with smart notifications. Get reminded about upcoming and overdue tasks."
              }
            ].map((feature, index) => (
              <div 
                key={index} 
                className="glass-morphism rounded-xl p-6 hover:shadow-glass transition-all duration-300 hover:-translate-y-2"
              >
                <div className="text-3xl text-primary-300 mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-auto pt-12 text-center text-sm text-gray-300">
          <p>© {new Date().getFullYear()} Task Management Platform. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default HomePage;
