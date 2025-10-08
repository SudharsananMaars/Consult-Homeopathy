import React, { useEffect, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import {
  Home,
  Calendar,
  Wallet,
  Settings,
  ChevronDown,
  ChevronRight,
  Users,
  Stethoscope,
  Package,
  Video,
  FileText,
  PieChart,
  Pill,
  Boxes,
  Droplet,
  CreditCard,
  UserCheck,
  HelpCircle,
  LogOut,
  Syringe
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import SidebarProfile from "./DoctorSidebarProfile";
import axios from "axios";
import config from "../../config";

const Sidebar = ({ role }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const API_URL = config.API_URL;

  // State management
  const [expandedItems, setExpandedItems] = useState({});
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState(null);
  const [doctorRole, setDoctorRole] = useState(null);

  const SIDEBAR_LINKS =
    role === "admin-doctor"
      ? [
          { id: 1, path: "/dashboard", name: "Home", icon: Home },
          {
            id: 2,
            name: "Appointments",
            icon: Calendar,
            path: "/appointments/list"
          },
          {
            id: 3,
            name: "Patients",
            icon: Users,
            path: "/patients"
          },
          {
            id: 4,
            name: "Doctors",
            icon: Stethoscope,
            sublinks: [
              { id: 41, path: "/assistdoc", name: "Assistant Doctors" },
              {
                id: 42,
                path: "/assistdoc/docprofile",
                name: "Doctor Profiles",
              },
              { id: 43, path: "/assistdoc/doctors", name: "External Doctors" },
            ],
          },
          { id: 5, path: "/docpayments", name: "Payments", icon: Wallet },
          {
            id: 6,
            path: "/overview",
            name: "Overview",
            icon: PieChart,
          },
          {
            id: 7,
            path: "/medicine-preparation",
            name: "Medicine Preparation",
            icon: Syringe,
          },
          {
            id: 8,
            path: "/medicine-preparation/preparation",
            name: "Medicine Preparation Dashboard",
            icon: Pill,
          },
          {
            id: 9,
            path: "/doctor-inventory",
            name: "Patient Inventory",
            icon: Package,
          },
          {
            id: 10,
            path: "/workshoppage",
            name: "Workshops",
            icon: Video,
          },
           {
            id: 11,
            path: "/debitcredit",
            name: "Credit and Debit Notes",
            icon: FileText,
          },
          { id: 12, path: "/content", name: "Content", icon: FileText },
          {
            id: 13,
            path: "/lekagedetection",
            name: "Leakage Detection",
            icon: Droplet,
          },
          {
            id: 14,
            path: "/doctor-dashboard/all",
            name: "Doctor CRM",
            icon: Stethoscope,
          },
          {
            id: 15,
            path: "/allocation",
            name: "Doctor Allocation",
            icon: UserCheck,
          },
          { id: 16, path: "/docsettings", name: "Settings", icon: Settings },
          { id: 17, path: "/hrm", name: "HR Management", icon: Users },
        ]
      : role === "assistant-doctor"
      ? [
          { id: 1, path: "/dashboard", name: "Home", icon: Home },
          {
            id: 2,
            name: "Appointments",
            icon: Calendar,
            sublinks: [
              { id: 21, path: "/appointments/calender", name: "Calendar" },
              { id: 22, path: "/appointments/list", name: "Appointment List" },
            ],
          },
          { id: 3, path: "/docpayments", name: "Payments", icon: Wallet },
          {
            id: 4,
            path: "/inventory",
            name: "Inventory",
            icon: Package,
          },
          { id: 5, path: "/content", name: "Content", icon: FileText },
          {
            id: 6,
            path: "/doctor-dashboard",
            name: "Doctor CRM",
            icon: Stethoscope,
          },
          { id: 7, path: "/assistleave", name: "Leave", icon: Calendar },
          { id: 8, path: "/docsettings", name: "Settings", icon: Settings },
        ]
      : [];

  // Initialize expanded items based on current path
  useEffect(() => {
    SIDEBAR_LINKS.forEach((link) => {
      if (link.sublinks) {
        const sublink = link.sublinks.find(
          (sub) => sub.path === location.pathname
        );
        if (sublink) {
          setExpandedItems((prev) => ({ ...prev, [link.id]: true }));
        }
      }
    });
  }, []);

  // Check if a link or its sublinks are active
  const isLinkActive = (link) => {
    if (link.path === location.pathname) return true;
    if (link.sublinks) {
      return link.sublinks.some(
        (sublink) => sublink.path === location.pathname
      );
    }
    return false;
  };

  // Check if a specific sublink is active
  const isSubLinkActive = (path) => {
    return path === location.pathname;
  };

  // Toggle submenu expansion
  const toggleSubMenu = (e, linkId) => {
    e.stopPropagation();
    setExpandedItems((prev) => ({
      ...prev,
      [linkId]: !prev[linkId],
    }));
  };

  // Handle navigation for links
  const handleLinkClick = (e, link) => {
    if (link.sublinks) {
      toggleSubMenu(e, link.id);
    } else {
      navigate(link.path);
      if (window.innerWidth < 768) {
        setIsMobileSidebarOpen(false);
      }
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
          `${API_URL}/api/work-hours/check-out`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            timeout: 5000,
          }
        );
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
      console.error("Failed to record clock-out:", err);
      setLogoutError("Logout process encountered an issue. Redirecting...");
      localStorage.clear();
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    }
  };

  // Animation variants for menu items
  const itemVariants = {
    open: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
    closed: { opacity: 0, y: 20, transition: { duration: 0.2 } },
  };

  return (
    <>
      {/* Mobile hamburger menu */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          className="bg-white shadow-lg text-gray-600 p-2 rounded-lg hover:bg-gray-50"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>

      {/* Sidebar backdrop for mobile */}
      {isMobileSidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Main sidebar - New Design */}
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
        {/* Doctor Profile section */}
        <div className="px-6 pb-6 py-9 flex flex-col items-center">
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
                  className={`group flex items-center justify-between w-full px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 ${
                    isLinkActive(link)
                      ? "text-gray-800 shadow-sm"
                      : "text-gray-600 hover:bg-white hover:bg-opacity-50 hover:text-gray-800"
                  }`}
                  style={{
                    backgroundColor: isLinkActive(link)
                      ? "#C7D2FE"
                      : "transparent",
                  }}
                  onClick={(e) => handleLinkClick(e, link)}
                >
                  <div className="flex items-center">
                    <span
                      className={`mr-3 ${
                        isLinkActive(link) ? "text-gray-700" : "text-gray-500"
                      }`}
                    >
                      {React.createElement(link.icon, { size: 20 })}
                    </span>
                    <span className="font-medium text-sm">{link.name}</span>
                  </div>

                  {link.sublinks && (
                    <button
                      onClick={(e) => toggleSubMenu(e, link.id)}
                      className={`p-1 rounded-md transition-transform duration-200 ${
                        expandedItems[link.id] ? "rotate-180" : "rotate-0"
                      } ${
                        isLinkActive(link) ? "text-gray-700" : "text-gray-400"
                      }`}
                      aria-label={
                        expandedItems[link.id] ? "Collapse menu" : "Expand menu"
                      }
                    >
                      <ChevronDown size={16} />
                    </button>
                  )}
                </div>

                {/* Submenu items with animation */}
                <AnimatePresence>
                  {expandedItems[link.id] && link.sublinks && (
                    <motion.div
                      initial="closed"
                      animate="open"
                      exit="closed"
                      variants={{
                        open: { opacity: 1, height: "auto" },
                        closed: { opacity: 0, height: 0 },
                      }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden mt-1 ml-10"
                    >
                      {link.sublinks.map((sublink) => (
                        <motion.div
                          key={sublink.id}
                          variants={itemVariants}
                          className={`py-2.5 px-4 my-1 rounded-lg transition-all duration-150 ${
                            isSubLinkActive(sublink.path)
                              ? "text-gray-800 font-medium shadow-sm"
                              : "text-gray-500 hover:bg-white hover:bg-opacity-50 hover:text-gray-700"
                          }`}
                          style={{
                            backgroundColor: isSubLinkActive(sublink.path)
                              ? "#C7D2FE"
                              : "transparent",
                          }}
                        >
                          <Link
                            to={sublink.path}
                            className="flex items-center w-full text-sm"
                            onClick={() => {
                              if (window.innerWidth < 768) {
                                setIsMobileSidebarOpen(false);
                              }
                            }}
                          >
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-3"></span>
                            <span>{sublink.name}</span>
                          </Link>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
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
            onClick={() => navigate("/needhelp")}
            className="flex items-center justify-start w-full space-x-3 text-sm text-gray-600 py-3 px-4 hover:bg-white hover:bg-opacity-50 rounded-xl transition-colors duration-200 font-medium"
          >
            <HelpCircle size={20} />
            <span>Help</span>
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