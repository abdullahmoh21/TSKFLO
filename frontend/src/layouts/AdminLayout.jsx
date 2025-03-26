import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import AdminNavbar from "../components/adminNavbar";

const AdminLayout = () => {
  // Get current location to determine if we're on the messaging page
  const location = useLocation();
  const isMessagingPage = location.pathname.includes("/admin/messaging");
  const isCreateTaskPage = location.pathname.includes("/admin/createTask");

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900">
      <AdminNavbar />
      {isMessagingPage || isCreateTaskPage ? (
        // No padding or max-width on these pages
        <Outlet />
      ) : (
        // Padding and max-width for all other pages
        <div className="pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      )}
    </div>
  );
};

export default AdminLayout;
