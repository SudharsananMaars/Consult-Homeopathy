import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

const Layout = ({ children }) => {
  const [role, setRole] = useState("");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const storedRole = localStorage.getItem("role"); // Retrieve role from localStorage
    setRole(storedRole);
  }, []);

  const toggleSidebar = () => {
    setMobileSidebarOpen(!mobileSidebarOpen);
  };

  return (
    <div className="min-h-screen flex relative">
      {/* Sidebar - fixed full height with proper z-index */}
      <div className="fixed top-0 left-0 w-64 h-screen z-40 shadow-lg bg-white">
        <Sidebar 
          role={role} 
          isMobileSidebarOpen={mobileSidebarOpen}
          setIsMobileSidebarOpen={setMobileSidebarOpen}
        />
      </div>

      {/* Main Section (Header + Content) - with proper margin for sidebar */}
      <div className="flex-1 ml-0 md:ml-64 flex flex-col relative">
        {/* Header - fixed with higher z-index than sidebar */}
        <div className="fixed top-0 left-0 md:left-64 right-0 z-50 shadow-sm bg-white">
          <Header toggleSidebar={toggleSidebar} />
        </div>

        {/* Background gradient - blue (top 25%) then fade to white */}
        <div
          className="absolute top-0 left-0 w-full h-full -z-10 
          bg-gradient-to-b from-blue-100 via-blue-50/60 via-25% to-white"
        ></div>

        {/* Main content with proper top padding for fixed header */}
        <div className="flex-1 pt-16 p-6 relative min-h-screen">
          <div className="relative max-w-full">{children}</div>
        </div>
      </div>

      {/* Mobile backdrop overlay */}
      {mobileSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;
