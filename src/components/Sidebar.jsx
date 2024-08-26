import React, { useEffect, useState } from "react";

// ICONS //
import { LuBox, LuSettings, LuFileText, LuCalendar , LuWallet } from "react-icons/lu";
import { GiMedicines } from "react-icons/gi";
import { MdOutlineOndemandVideo } from "react-icons/md";
import { Link, useLocation } from "react-router-dom";
import { CiLogout } from "react-icons/ci";
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
    <div className="w-16 md:w-56 fixed left-0 top-0 z-10 h-screen boder-r pt-8 px-4 bg-gradient-to-b bg-blue-200 to-slate-200">
      {/* logo */}
      <div className="mb-8 w-full flex items-center">
  <div className="w-10 h-10 flex-shrink-0">
    <img src="/logo.svg" alt="logo" className="hidden md:flex w-10 h-10 rounded-full object-cover" />
    <img src="/logo.svg" alt="logo" className="flex md:hidden w-8 h-8 rounded-full object-cover" />
  </div>
  <div className="ml-4">
    <p className="text-lg md:text-xl font-bold text-gray-800">Katyayani Clinic</p>
  </div>
</div>
      {/* logo */} 

      {/* Navigation Links */}  
      <ul className="mt-6 space-y-4">
        {SIDEBAR_LINKS.map((link, index) => (
          <li
            key={index}
            className={`font-medium rounded-md py-2 px-5 hover:bg-blue-300 hover:text-indigo-500 ${
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

      <div className="w-full absolute bottom-5 left-0 px-2 py-2 cursor-pointer text-center pl-9">
    <button className="flex items-center justify-center space-x-2 text-xs text-white py-2 px-8 bg-blue-500 hover:bg-blue-600 rounded-full">
    <span>?</span>
    <span className="hidden md:flex">Need Help</span>
  </button>
  <button className="mt-4 flex items-center justify-center space-x-2 text-xs text-white py-2 px-8 bg-red-500 hover:bg-red-600 rounded-full">
    <CiLogout className="text-sm" />
    <span className="hidden md:flex">Logout</span>
  </button>
</div>
    </div>
  );
};

export default Sidebar;
