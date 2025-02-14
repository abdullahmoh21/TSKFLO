import React from "react";
import Navbar from "../layout/NavBar";

const AdminPage = () => {
  return (
    <div>
      <Navbar /> {/* Ensure Navbar is only shown on AdminPage */}
      <div className="p-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to the admin panel.</p>
      </div>
    </div>
  );
};

export default AdminPage;
