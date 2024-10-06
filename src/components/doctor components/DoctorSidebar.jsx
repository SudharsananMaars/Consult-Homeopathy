import React, { useEffect, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { LuBox, LuCalendar, LuWallet } from "react-icons/lu";
import { MdOutlineOndemandVideo } from "react-icons/md";
import { CiLogout } from "react-icons/ci";
import { FaUserFriends, FaStethoscope } from "react-icons/fa";
import { AiOutlineMedicineBox } from "react-icons/ai";
import { MdAccountBalance } from "react-icons/md";
import { FaPhotoVideo } from "react-icons/fa";
import SidebarProfile from "./DoctorSidebarProfile";

const Sidebar = () => {
  const location = useLocation();
  const [activeLink, setActiveLink] = useState(null);
  const [expandedItems, setExpandedItems] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const activeIndex = SIDEBAR_LINKS.findIndex(
      (link) => link.path === location.pathname
    );
    setActiveLink(activeIndex);
  }, [location.pathname]);

  const SIDEBAR_LINKS = [
    { id: 1, path: "/dashboard", name: "Home", icon: LuBox },
    {
      id: 2,
      name: "Appointments",
      icon: LuCalendar,
      sublinks: [
        { id: 21, path: "/appointments/calender", name: "Calender" },
        { id: 22, path: "/appointments/list", name: "Appointment List" },
      ],
    },
    {
      id: 3,
      name: "Patients",
      icon: FaUserFriends,
      sublinks: [
        { id: 31, path: "/patients", name: "Patients" },
        { id: 32, path: "/patients/card", name: "Patientcard" },
      ],
    },
   {
      id: 4,
      name: "Doctors",
      icon: FaStethoscope,
      sublinks: [
        { id: 41, path: "/assistdoc", name: "Assist Doctors" }, //assistent doctors list
        { id: 42, path: "/assistdoc/docprofile", name: "Doctor Profiles" }, //assistent doctor profile cards
        { id: 43, path: "/assistdoc/doctors", name: "Doctors" }, // main doctors from other clinics
      ],
    },
    { id: 5, path: "/docpayments", name: "Payments", icon: LuWallet },
    { id: 6, path: "/inventry", name: "Inventry", icon: AiOutlineMedicineBox },
    { id: 7, path: "/workshoppage", name: "Workshops", icon: MdOutlineOndemandVideo },
    { id: 8, path: "/content", name: "Content", icon: FaPhotoVideo },
    { id: 9, path: "/accounts", name: "Accounts", icon: MdAccountBalance },
  ];

  const toggleSubMenu = (linkId) => {
    setExpandedItems((prev) => ({
      ...prev,
      [linkId]: !prev[linkId],
    }));
  };

  const handleLinkClick = (link) => {
    if (!link.sublinks) {
      navigate(link.path);
    } else {
      toggleSubMenu(link.id);
    }
  };

  return (
    <div className="h-full flex flex-col justify-between p-8 space-y-1">
      {/* Scrollable section for links */}
      <div className="">
        <SidebarProfile />
        </div>
        <ul className="space-y-4">
          {SIDEBAR_LINKS.map((link, index) => (
            <div key={index}>
              <li
                className={`font-medium rounded-md py-2 px-5 hover:bg-indigo-200 hover:text-indigo-500 ${
                  activeLink === index ? "bg-indigo-300 text-indigo-500" : ""
                }`}
                onClick={() => handleLinkClick(link)}
              >
                <div className="flex justify-center md:justify-start items-center space-x-5 ">
                  <span
                    className={`text-gray-800 text-2xl ${
                      activeLink === index ? "text-indigo-500" : ""
                    }`}
                  >
                    {React.createElement(link.icon)}
                  </span>
                  <span className="text-md text-gray-600">{link.name}</span>
                </div>
              </li>

              {/* Render sublinks if they exist and the parent link is clicked */}
              {expandedItems[link.id] && link.sublinks && (
                <ul className="pl-6 space-y-2 pt-2">
                  {link.sublinks.map((sublink) => (
                    <li key={sublink.id} className="font-medium py-2 px-5 hover:bg-indigo-200 rounded-md">
                      <span className="mr-2 text-gray-600">•</span>
                      <Link to={sublink.path} className="text-gray-600">
                        {sublink.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </ul>

      {/* Static section for help and logout */}
      <div className="flex flex-col items-center space-y-4 pt-6">
        <button
          onClick={() => navigate("/needhelp")}
          className="flex items-center justify-center space-x-2 text-xs text-white py-2 px-4 bg-blue-500 hover:bg-blue-600 rounded-full"
        >
          <span>?</span>
          <span>Need Help</span>
        </button>

        <button className="flex items-center justify-center space-x-2 text-xs text-white py-2 px-4 bg-red-500 hover:bg-red-600 rounded-full">
          <CiLogout className="text-sm" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
