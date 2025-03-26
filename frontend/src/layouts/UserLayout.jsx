import React from "react";
import { Outlet } from "react-router-dom";
import UserNavBar from "../components/userNavBar";

const UserLayout = () => {
  return (
    <>
      <UserNavBar />
      <Outlet />
    </>
  );
};

export default UserLayout;
