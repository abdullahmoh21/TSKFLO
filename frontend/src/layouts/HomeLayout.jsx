import React from "react";
import { Outlet } from "react-router-dom";
import HomeNavBar from "../components/HomeNavBar";

const HomeLayout = () => {
  return (
    <>
      <HomeNavBar />
      <Outlet />
    </>
  );
};

export default HomeLayout;
