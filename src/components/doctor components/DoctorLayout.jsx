import React, { useState, useEffect } from "react";
import Sidebar from "./DoctorSidebar";
import Header from "./DoctorHeader";

const Layout = ({ children }) => {
  const [role, setRole] = useState("");

  useEffect(() => {
    const storedRole = localStorage.getItem("role"); // Retrieve role from localStorage
    setRole(storedRole);
  }, []);

  return (
    <div className="min-h-screen flex relative">
      {/* Sidebar - fixed from top to bottom */}
      <div className="fixed top-0 left-0 w-64 h-screen z-30 shadow-lg bg-white">
        <Sidebar role={role} />
      </div>

      {/* Main Section (Header + Content) */}
      <div className="flex-1 ml-64 flex flex-col relative">
        {/* Header/Navbar - only spans the main content area */}
        <div className="w-full shadow-sm relative top-0 z-20">
          <Header />
        </div>

        {/* Background gradient - blue (top 25%) then fade quickly to white */}
        <div className="absolute top-0 left-0 w-full h-full -z-10 
          bg-gradient-to-b from-blue-100 via-blue-50/60 via-25% to-white">
        </div>

        {/* Main content below header */}
        <div className="flex-1 p-6 relative">
          <div className="relative max-w-full">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default Layout;