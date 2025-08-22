import React, { useEffect, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import {
  Home,
  Calendar,
  CalendarPlus,
  Wallet,
  Settings,
  Package,
  Video,
  FileText,
  Pill,
  Users,
  HelpCircle,
  LogOut,
  History,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import SidebarProfile from "./SidebarProfile";
import axios from "axios";
import config from "../../config";

const API_URL = config.API_URL;

const Sidebar = ({ isMobileSidebarOpen, setIsMobileSidebarOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // State management
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState(null);

  const SIDEBAR_LINKS = [
    {
      id: 1,
      path: "/home",
      name: "Home",
      icon: Home,
    },
    {
      id: 2,
      path: "/consulthistory",
      name: "Consultation History",
      icon: History,
    },
    {
      id: 3,
      path: "/appointments/newappointment",
      name: "Book Appointment",
      icon: CalendarPlus,
    },
    {
      id: 4,
      path: "/appointments/upcoming",
      name: "Booked Appointments",
      icon: Calendar,
    },
    {
      id: 5,
      path: "/prescription",
      name: "Prescription",
      icon: Pill,
    },
    {
      id: 6,
      path: "/patient-inventory",
      name: "Inventory",
      icon: Package,
    },
    {
      id: 7,
      path: "/payments",
      name: "Payments",
      icon: Wallet,
    },
    {
      id: 8,
      path: "/medicine",
      name: "Medicine Shipments",
      icon: Pill,
    },
    {
      id: 9,
      path: "/workshops",
      name: "Workshops",
      icon: Video,
    },
    {
      id: 10,
      path: "/patientcontent",
      name: "Content",
      icon: FileText,
    },
    {
      id: 11,
      path: "/settings",
      name: "Settings",
      icon: Settings,
    },
    {
      id: 12,
      path: "/refer",
      name: "Refer Friend",
      icon: Users,
    },
  ];

  // Check if a link is active
  const isLinkActive = (link) => {
    return link.path === location.pathname;
  };

  // Handle navigation
  const handleLinkClick = (link) => {
    navigate(link.path);
    if (window.innerWidth < 768) {
      setIsMobileSidebarOpen(false);
    }
  };

  // Handle help
  const handleHelp = () => {
    navigate("/needhelp");
    if (window.innerWidth < 768) {
      setIsMobileSidebarOpen(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      setLogoutError(null);

      const token = localStorage.getItem("token");

      if (token) {
        await axios.post(
          `${API_URL}/api/otp/logout`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 5000,
          }
        );
      }

      localStorage.clear();

      setTimeout(() => {
        window.location.href = "/login";
      }, 500);
    } catch (err) {
      console.error("Logout failed:", err);
      setLogoutError("Logout process encountered an issue. Redirecting...");
      localStorage.clear();
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    }
  };

  return (
    <>
      {/* Sidebar backdrop for mobile */}
      {isMobileSidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Main sidebar */}
      <motion.div
        className={`h-screen flex flex-col fixed top-0 left-0 w-64 z-40
          ${
            isMobileSidebarOpen
              ? "translate-x-0"
              : "-translate-x-full md:translate-x-0"
          }`}
        style={{ backgroundColor: "#EEF6FF" }}
        initial={false}
        animate={{
          x: isMobileSidebarOpen || window.innerWidth >= 768 ? 0 : -320,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* Logo section */}
        <div className="px-6 py-6 flex justify-center">
          <img
            src="/src/assets/images/doctor images/homeologo.png"
            alt="Homeopathy Logo"
            className="h-20 w-auto object-contain"
          />
        </div>

        {/* Patient Profile section */}
        <div className="px-6 pb-6 flex flex-col items-center">
          <SidebarProfile />
        </div>

        {/* Navigation links with custom scrollbar hidden */}
        <div
          className="flex-1 overflow-y-auto px-4 scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <style jsx>{`
            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          <nav className="space-y-1 pb-4">
            {SIDEBAR_LINKS.map((link) => (
              <div key={link.id} className="mb-1">
                <div
                  className={`group flex items-center w-full px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 ${
                    isLinkActive(link)
                      ? "text-gray-800 shadow-sm"
                      : "text-gray-600 hover:bg-white hover:bg-opacity-50 hover:text-gray-800"
                  }`}
                  style={{
                    backgroundColor: isLinkActive(link)
                      ? "#C7D2FE"
                      : "transparent",
                  }}
                  onClick={() => handleLinkClick(link)}
                >
                  <span
                    className={`mr-3 ${
                      isLinkActive(link) ? "text-gray-700" : "text-gray-500"
                    }`}
                  >
                    {React.createElement(link.icon, { size: 20 })}
                  </span>
                  <span className="font-medium text-sm">{link.name}</span>
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Fixed bottom section */}
        <div className="p-4 space-y-2 bg-inherit">
          {logoutError && (
            <div className="text-red-500 text-xs text-center bg-red-50 p-2 rounded-lg w-full">
              {logoutError}
            </div>
          )}

          <button
            onClick={handleHelp}
            className="flex items-center justify-start w-full space-x-3 text-sm text-gray-600 py-3 px-4 hover:bg-white hover:bg-opacity-50 rounded-xl transition-colors duration-200 font-medium"
          >
            <HelpCircle size={20} />
            <span>Need Help</span>
          </button>

          <button
            className={`flex items-center justify-start w-full space-x-3 text-sm py-3 px-4 rounded-xl transition-colors duration-200 font-medium ${
              isLoggingOut
                ? "text-gray-400 cursor-not-allowed"
                : "text-gray-600 hover:bg-white hover:bg-opacity-50"
            }`}
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? (
              <>
                <div className="w-5 h-5 border-2 border-t-transparent border-gray-400 rounded-full animate-spin"></div>
                <span>Logging out...</span>
              </>
            ) : (
              <>
                <LogOut size={20} />
                <span>Logout</span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar;