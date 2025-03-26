import React, { useState, useEffect } from "react";
import {
  FaLaptopCode,
  FaTasks,
  FaUsers,
  FaComments,
  FaChartLine,
  FaShieldAlt,
  FaCheck,
  FaClock,
  FaLightbulb,
  FaCubes,
  FaMedal,
  FaRocket,
  FaGithub,
} from "react-icons/fa";

const AboutPage = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState("mission");

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-secondary-900 text-secondary-900 dark:text-white overflow-hidden">
      {/* Hero section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-800 dark:to-secondary-900">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <div
            className={`max-w-4xl mx-auto text-center transition-all duration-1000 ${
              isLoaded
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
              Transforming Task Management for Teams
            </h1>
            <p className="mt-6 text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              We provide powerful, intuitive tools that help teams collaborate
              efficiently, meet deadlines, and achieve their goals together.
            </p>
          </div>
        </div>

        {/* Wave separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1440 100"
            className="fill-white dark:fill-secondary-900"
          >
            <path d="M0,32L60,42.7C120,53,240,75,360,74.7C480,75,600,53,720,58.7C840,64,960,96,1080,96C1200,96,1320,64,1380,48L1440,32L1440,100L1380,100C1320,100,1200,100,1080,100C960,100,840,100,720,100C600,100,480,100,360,100C240,100,120,100,60,100L0,100Z"></path>
          </svg>
        </div>
      </div>

      {/* Content section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        {/* Tabs for different sections */}
        <div
          className={`max-w-4xl mx-auto mb-12 transition-all duration-1000 delay-300 ${
            isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-12">
            {[
              { id: "mission", label: "Our Mission", icon: <FaRocket /> },
              { id: "team", label: "Our Team", icon: <FaUsers /> },
              { id: "technology", label: "Technology", icon: <FaLaptopCode /> },
              { id: "values", label: "Core Values", icon: <FaMedal /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-4 py-2 rounded-full text-sm sm:text-base transition-all
                  ${
                    activeTab === tab.id
                      ? "bg-primary-500 text-white shadow-md"
                      : "bg-white dark:bg-secondary-800 text-secondary-700 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-700"
                  }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Mission Tab */}
          <div
            className={`transition-all duration-500 ${
              activeTab === "mission" ? "block opacity-100" : "hidden opacity-0"
            }`}
          >
            <div className="bg-white dark:bg-secondary-800 rounded-2xl shadow-lg overflow-hidden">
              <div className="grid md:grid-cols-2 gap-0">
                <div className="p-8 sm:p-10">
                  <h2 className="text-3xl font-bold mb-6 text-secondary-900 dark:text-white">
                    Our Mission
                  </h2>
                  <p className="text-secondary-700 dark:text-secondary-300 mb-6 leading-relaxed">
                    We're a team of five passionate students who built this
                    project as part of our university coursework, but we believe
                    it has the potential to be something much bigger. Our goal
                    is to simplify task management and collaboration through an
                    intuitive platform that helps teams stay organized and
                    efficient.
                  </p>
                  <p className="text-secondary-700 dark:text-secondary-300 mb-6 leading-relaxed">
                    We designed this system to reduce friction in team
                    coordination, eliminate miscommunication, and provide clear
                    visibility into project progress.
                  </p>
                  <div className="space-y-4">
                    {[
                      "Built by students, designed for real-world use",
                      "Streamline teamwork with ease",
                      "Make task management simple and enjoyable",
                      "Help teams meet their goals effectively",
                    ].map((point, index) => (
                      <div key={index} className="flex items-start">
                        <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center mt-0.5">
                          <FaCheck size={12} />
                        </div>
                        <p className="ml-3 text-secondary-700 dark:text-secondary-300">
                          {point}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-primary-500/90 to-primary-700 p-8 sm:p-10 flex items-center justify-center">
                  <div className="text-center text-white">
                    <FaRocket className="mx-auto text-5xl mb-6 text-white/90" />
                    <h3 className="text-2xl font-semibold mb-4">
                      Founded in 2025
                    </h3>
                    <p className="max-w-md mx-auto text-white/80 leading-relaxed">
                      What started as a university project is now taking shape
                      into something bigger. While it’s still a work in
                      progress, we’ve built the foundation for a platform that
                      aims to help teams streamline their workflows and manage
                      tasks more efficiently. We’re continuously refining and
                      improving it, hoping to make it truly impactful in the
                      future.
                    </p>
                    <div className="mt-8 grid grid-cols-3 gap-4 max-w-xs mx-auto">
                      {[
                        { number: "5", label: "Team Members" },
                        { number: "50+", label: "Tasks Tracked" },
                        { number: "100%", label: "Passion" },
                      ].map((stat, index) => (
                        <div key={index} className="text-center">
                          <div className="text-2xl font-bold text-white">
                            {stat.number}
                          </div>
                          <div className="text-sm text-white/70">
                            {stat.label}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Team Tab */}
          <div
            className={`transition-all duration-500 ${
              activeTab === "team" ? "block opacity-100" : "hidden opacity-0"
            }`}
          >
            <div className="bg-white dark:bg-secondary-800 rounded-2xl shadow-lg overflow-hidden p-8 sm:p-10">
              <h2 className="text-3xl font-bold mb-10 text-secondary-900 dark:text-white text-center">
                Meet Our Leadership Team
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
                {[
                  {
                    name: "Khizar Aamir",
                    role: "CEO & Co-Founder",
                    bio: "Former project manager who experienced firsthand the challenges of team coordination.",
                    image: "/images/khizar.JPG",
                    github: "https://github.com/Khizar2004",
                  },
                  {
                    name: "Haider Ali",
                    role: "CTO & Co-Founder",
                    bio: "Software architect with extensive experience building enterprise collaboration tools.",
                    image: "/images/haider.jpeg",
                    github: "https://github.com/haiderali077",
                  },
                  {
                    name: "Abdullah Mohsin",
                    role: "Lead Backend Developer",
                    bio: "Backend specialist focused on creating intuitive user experiences.",
                    image: "/images/mohsin.jpeg",
                    github: "https://github.com/abdullahmoh21",
                  },
                  {
                    name: "Abdur Rehman",
                    role: "Lead Navbar Expert",
                    bio: "Experienced developer specializing in creating robust and scalable navigation.",
                    image: "/images/qazi.jpeg",
                    github: "https://github.com/abdur026",
                  },
                  {
                    name: "Abdullah Munir",
                    role: "Lead Frontend Developer",
                    bio: "Creative designer with a passion for building beautiful and functional interfaces.",
                    image: "/images/munir.jpeg",
                    github: "https://github.com/abdullahmunir24",
                  },
                ].map((member, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center text-center"
                  >
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-32 h-32 rounded-full object-cover ring-4 ring-primary-100 dark:ring-primary-900/30 mb-4"
                    />
                    <h3 className="text-xl font-semibold text-secondary-900 dark:text-white">
                      {member.name}
                    </h3>
                    <p className="text-primary-600 dark:text-primary-400 mb-2">
                      {member.role}
                    </p>
                    <p className="text-secondary-600 dark:text-secondary-400 text-sm">
                      {member.bio}
                    </p>
                    <div className="flex gap-4 mt-4">
                      <a
                        href={member.github}
                        className="text-secondary-400 hover:text-secondary-600 dark:hover:text-secondary-300 transition-colors"
                      >
                        <FaGithub />
                      </a>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-16 text-center">
                <h3 className="text-2xl font-semibold mb-6 text-secondary-900 dark:text-white">
                  Backed by a Team of Experts
                </h3>
                <p className="text-secondary-700 dark:text-secondary-300 max-w-2xl mx-auto">
                  Our full team includes talented engineers, designers, product
                  managers, and customer success specialists all committed to
                  making your task management experience exceptional.
                </p>
              </div>
            </div>
          </div>

          {/* Technology Tab */}
          <div
            className={`transition-all duration-500 ${
              activeTab === "technology"
                ? "block opacity-100"
                : "hidden opacity-0"
            }`}
          >
            <div className="bg-white dark:bg-secondary-800 rounded-2xl shadow-lg overflow-hidden">
              <div className="p-8 sm:p-10">
                <h2 className="text-3xl font-bold mb-8 text-secondary-900 dark:text-white">
                  Our Technology Stack
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                  <div>
                    <h3 className="text-xl font-semibold mb-4 flex items-center text-secondary-900 dark:text-white">
                      <FaCubes className="mr-3 text-primary-500" />
                      Modern Architecture
                    </h3>
                    <p className="text-secondary-700 dark:text-secondary-300 leading-relaxed">
                      Our platform is built using a modern microservices
                      architecture, ensuring scalability, reliability, and fast
                      performance. We employ continuous integration and delivery
                      practices to ship new features and improvements regularly.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-4 flex items-center text-secondary-900 dark:text-white">
                      <FaShieldAlt className="mr-3 text-primary-500" />
                      Security First
                    </h3>
                    <p className="text-secondary-700 dark:text-secondary-300 leading-relaxed">
                      Security is at the core of our development process. We
                      implement industry best practices for data protection,
                      regular security audits, and comply with privacy
                      regulations to ensure your data is always safe.
                    </p>
                  </div>
                </div>

                <h3 className="text-xl font-semibold mb-6 text-secondary-900 dark:text-white">
                  Technology Stack
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {["React", "Node.js", "MongoDB", "TailwindCSS"].map(
                    (tech, index) => (
                      <div
                        key={index}
                        className="bg-secondary-50 dark:bg-secondary-700/30 rounded-lg p-4 text-center"
                      >
                        <span className="font-medium text-secondary-800 dark:text-secondary-200">
                          {tech}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>

              <div className="bg-gradient-to-br from-secondary-50 to-secondary-100 dark:from-secondary-800 dark:to-secondary-900 p-8 sm:p-10 border-t border-secondary-200 dark:border-secondary-700">
                <h3 className="text-xl font-semibold mb-6 text-secondary-900 dark:text-white flex items-center">
                  <FaLightbulb className="mr-3 text-primary-500" />
                  Continuous Innovation
                </h3>
                <p className="text-secondary-700 dark:text-secondary-300 mb-6 leading-relaxed">
                  Our product roadmap is guided by user feedback and industry
                  trends. We're constantly exploring new technologies and
                  approaches to improve your experience.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {[
                    {
                      title: "AI-Powered Insights",
                      description:
                        "Exploring machine learning to provide task prioritization suggestions.",
                    },
                    {
                      title: "Enhanced Integrations",
                      description:
                        "Expanding our ecosystem with more third-party integrations.",
                    },
                    {
                      title: "Mobile Experience",
                      description:
                        "Continually improving our responsive design for all devices.",
                    },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="bg-white dark:bg-secondary-700 rounded-lg p-5 shadow-sm"
                    >
                      <h4 className="font-semibold mb-2 text-secondary-900 dark:text-white">
                        {item.title}
                      </h4>
                      <p className="text-sm text-secondary-600 dark:text-secondary-400">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Values Tab */}
          <div
            className={`transition-all duration-500 ${
              activeTab === "values" ? "block opacity-100" : "hidden opacity-0"
            }`}
          >
            <div className="bg-white dark:bg-secondary-800 rounded-2xl shadow-lg overflow-hidden p-8 sm:p-10">
              <h2 className="text-3xl font-bold mb-10 text-secondary-900 dark:text-white text-center">
                Our Core Values
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[
                  {
                    icon: <FaUsers />,
                    title: "Users First",
                    description:
                      "Every decision we make starts with the question: 'How does this benefit our users?' We're committed to creating tools that genuinely solve problems.",
                  },
                  {
                    icon: <FaLightbulb />,
                    title: "Innovation",
                    description:
                      "We embrace creativity and aren't afraid to challenge convention. We're constantly seeking better ways to help teams work together.",
                  },
                  {
                    icon: <FaShieldAlt />,
                    title: "Trust & Security",
                    description:
                      "We treat your data with the utmost care. Building and maintaining trust is fundamental to everything we do.",
                  },
                  {
                    icon: <FaClock />,
                    title: "Efficiency",
                    description:
                      "We value your time. Our platform is designed to reduce busywork and help teams focus on what truly matters.",
                  },
                ].map((value, index) => (
                  <div
                    key={index}
                    className="bg-secondary-50 dark:bg-secondary-700/30 rounded-xl p-6 flex"
                  >
                    <div className="flex-shrink-0 w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg text-primary-600 dark:text-primary-400 flex items-center justify-center mr-5">
                      {value.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-3 text-secondary-900 dark:text-white">
                        {value.title}
                      </h3>
                      <p className="text-secondary-700 dark:text-secondary-300">
                        {value.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-12 text-center">
                <blockquote className="text-xl italic text-secondary-700 dark:text-secondary-300 max-w-3xl mx-auto">
                  "We believe that great tools should empower teams without
                  getting in their way. That's the philosophy that guides us
                  every day."
                </blockquote>
                <cite className="block mt-4 text-sm text-secondary-600 dark:text-secondary-400">
                  — Khizar Aamir, CEO
                </cite>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-700 dark:from-primary-800 dark:to-primary-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div
            className={`max-w-3xl mx-auto transition-all duration-1000 delay-500 ${
              isLoaded
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Ready to Transform Your Team's Productivity?
            </h2>
            <p className="text-xl text-white/80 mb-8">
              Join thousands of teams who've improved their workflow with our
              platform.
            </p>
            <a
              href="/login"
              className="inline-block px-8 py-4 bg-white text-primary-700 font-medium rounded-lg shadow-md hover:shadow-lg transform transition-all hover:-translate-y-1"
            >
              Get Started For Free
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
