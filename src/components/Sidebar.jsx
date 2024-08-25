import React, { useEffect, useState } from "react";

// ICONS //
import { LuBox, LuSettings, LuFileText, LuCalendar , LuWallet } from "react-icons/lu";
import { GiMedicines } from "react-icons/gi";
import { MdOutlineOndemandVideo } from "react-icons/md";
import { Link, useLocation } from "react-router-dom";
// ICONS //

const Sidebar = () => {
    const location = useLocation(); 
    const [activeLink, setActiveLink] = useState(null);

useEffect(() => {
    const activeIndex = SIDEBAR_LINKS.findIndex(link => link.path === location.pathname);
    setActiveLink(activeIndex);
    }, [location.pathname]);

  const SIDEBAR_LINKS = [
    { id: 1, path: "/home", name: "Home", icon: LuBox },
    { id: 2, path: "/appointments", name: "Appointments", icon: LuCalendar },
    { id: 3, path: "/payments", name: "Payments", icon: LuWallet },
    { id: 4, path: "/invoices", name: "Invoices", icon: LuFileText},
    { id: 5, path: "/medicine", name: "Medicine", icon: GiMedicines },
    { id: 6, path: "/workshops", name: "Workshops", icon: MdOutlineOndemandVideo },
    { id: 7, path: "/settings", name: "Settings", icon: LuSettings },
  ];
  return (
    <div className="w-16 md:w-56 fixed left-0 top-0 z-10 h-screen boder-r pt-8 px-4 bg-gradient-to-b bg-blue-100 to-slate-200">
      {/* logo */}
      <div className="mb-8 w-10 h-1 flex items-center justify-center border-2 border-blue-100 border-spacing-10">
        <img src="/logo.svg" alt="logo" className="w-10 hidden md:flex h-10 rounded-full object-cover" />
        <img src="/logo.svg" alt="logo" className="w-8 h-8 flex md:hidden rounded-full object-cover" />
      </div>
      {/* logo */} 

      {/* Navigation Links */}
      <ul className="mt-6 space-y-4">
        {SIDEBAR_LINKS.map((link, index) => (
          <li
            key={index}
            className={`font-medium rounded-md py-2 px-5 hover:bg-blue-200 hover:text-indigo-500 ${
              activeLink === index ? "bg-blue-300 text-indigo-500" : ""
            }`}
          >
            <Link
              to={link.path}
              className="flex justify-center md:justify-start items-center md:space-x-5 "
            //   onClick={() => handleLinkClick(index)}
            >
              <span className={`text-gray-800 ${activeLink === index ? "text-indigo-500" : ""}`}>
                {React.createElement(link.icon)}
              </span>
              <span className="text-md text-gray-600 hidden md:flex">
                {link.name}
              </span>
            </Link>
          </li>   
        ))}
      </ul>
      {/* Navigation Links */}

      <div className="w-full absolute bottom-5 left-0 px-4 py-2 cursor-pointer text-center">
        <p className="flex items-center space-x-2 text-xs text-white py-2 px-5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full">
          {" "}
          <span>?</span> <span className="hidden md:flex">Need Help</span>
        </p>
      </div>
    </div>
  );
};

export default Sidebar;
