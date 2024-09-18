import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LuBox, LuSettings, LuFileText, LuCalendar, LuWallet } from "react-icons/lu";
import { GiMedicines } from "react-icons/gi";
import { MdOutlineOndemandVideo } from "react-icons/md";
import { Link, useLocation } from "react-router-dom";
import { CiLogout } from "react-icons/ci";
import { FaUserFriends } from "react-icons/fa";
import { AiOutlineMenu } from "react-icons/ai";

const Sidebar = ({ onToggle }) => {
    const location = useLocation();
    const [activeLink, setActiveLink] = useState(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const navigate = useNavigate();

    const handleRefer = () => {
        navigate("/refer");
    };
    const handleHelp = () => {
        navigate("/needhelp");
    };

    useEffect(() => {
        const activeIndex = SIDEBAR_LINKS.findIndex(link => link.path === location.pathname);
        setActiveLink(activeIndex);
    }, [location.pathname]);

    useEffect(() => {
        onToggle(isExpanded);
    }, [isExpanded, onToggle]);

    const SIDEBAR_LINKS = [
        { id: 1, path: "/home", name: "Home", icon: LuBox },
        { id: 2, path: "/appointments/newappointment", name: "Appointments", icon: LuCalendar },
        { id: 3, path: "/payments", name: "Payments", icon: LuWallet },
        { id: 4, path: "/invoices", name: "Invoices", icon: LuFileText },
        { id: 5, path: "/medicine", name: "Medicine", icon: GiMedicines },
        { id: 6, path: "/workshops", name: "Workshops", icon: MdOutlineOndemandVideo },
        { id: 7, path: "/settings", name: "Settings", icon: LuSettings },
    ];

    const toggleSidebar = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <div className={`fixed left-0 top-0 h-full bg-blue-200 pt-8 ${isExpanded ? "w-56" : "w-16"} transition-width duration-300`}>
            <button onClick={toggleSidebar} className="flex items-center w-full px-2 mb-8">
                <AiOutlineMenu className="text-black text-3xl ml-2" />
                {isExpanded && (
                    <div className="ml-4 flex items-center">
                        <span className="ml-2 text-lg font-bold text-gray-800">Katyayani Clinic</span>
                    </div>
                )}
            </button>

            <ul className="mt-6 space-y-4">
                {SIDEBAR_LINKS.map((link, index) => (
                    <li
                        key={index}
                        className={`font-medium rounded-md py-2 px-5 hover:bg-blue-300 hover:text-indigo-500 ${
                            activeLink === index ? "bg-blue-300 text-indigo-500" : ""
                        }`}
                    >
                        <Link to={link.path} className="flex justify-center md:justify-start items-center space-x-5">
                            <span className={`text-gray-800 text-2xl ${activeLink === index ? "text-indigo-500" : ""}`}>
                                {React.createElement(link.icon)}
                            </span>
                            {isExpanded && <span className="text-md text-gray-600">{link.name}</span>}
                        </Link>
                    </li>
                ))}
            </ul>

            <div className="absolute bottom-5 left-0 w-full flex flex-col items-center px-2 py-2 text-center space-y-4">
                <button
                    onClick={handleRefer}
                    className="flex items-center justify-center space-x-2 text-xs text-white py-2 px-4 bg-blue-500 hover:bg-blue-600 rounded-full"
                >
                    <FaUserFriends className="text-sm" />
                    {isExpanded && <span>Refer Friend</span>}
                </button>

                <button
                    onClick={handleHelp}
                    className="flex items-center justify-center space-x-2 text-xs text-white py-2 px-4 bg-blue-500 hover:bg-blue-600 rounded-full"
                >
                    <span>?</span>
                    {isExpanded && <span>Need Help</span>}
                </button>

                <button className="flex items-center justify-center space-x-2 text-xs text-white py-2 px-4 bg-red-500 hover:bg-red-600 rounded-full">
                    <CiLogout className="text-sm" />
                    {isExpanded && <span>Logout</span>}
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
