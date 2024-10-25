import React, { useState } from "react";
import { CgProfile } from "react-icons/cg";
import { BiMessageRoundedDetail } from "react-icons/bi";
import { MdOutlineNotificationsNone } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import DoctorNotification from "./DoctorNotification";
import DoctorMessenger from "./DoctorMessenger";
import homeologo from "/src/assets/images/doctor images/homeologo.png";
import { FaSearch } from "react-icons/fa";

const Header = () => {
  const navigate = useNavigate();
  const [isMessageActive, setIsMessageActive] = useState(false); // State to track active message button
  const [isNotifyActive, setIsNotifyActive] = useState(false);
  const [isProfileActive, setIsProfileActive] = useState(false);

  const [showNotification, setShowNotification] = useState(false); // For notification popup
  const [showMessenger, setShowMessenger] = useState(false); // For messenger popup

  const handleNotify = () => {
    setIsNotifyActive(!isNotifyActive);
    setShowNotification(!showNotification); // Toggle notification
    setShowMessenger(false); // Close messenger when notification is open
  };

  const handleProfile = () => {
    setIsProfileActive(!isProfileActive);
    navigate("/newprofile");
  };

  const handleMessage = () => {
    setIsMessageActive(!isMessageActive); // Set message button as active
    setShowMessenger(!showMessenger); // Toggle messenger
    setShowNotification(false); // Close notification when messenger is open
  };

  return (
    <div className="flex justify-between items-center px-5 py-3 fixed w-full top-0 bg-indigo-200 shadow-lg z-50">
      <div className="flex pt-1 ">
      <img src={homeologo} alt="Logo" className="w-20"/>
      <span className="ml-4 text-2xl font-bold text-gray-800">Consult Homeopathy</span>
      </div>
      <div className="flex items-center space-x-5">
      <div className="bg-white border rounded-lg shadow-md w-full max-w-lg"> {/* Increased width */}
      <div className="flex items-center">
        <input
          type="text"
          placeholder="Search"
          className="w-full p-3 rounded-l-full focus:outline-none focus:border-gray-500"
        />
        <button className="p-3 bg-white text-gray-500 rounded-r-lg hover:text-gray-700">
          <FaSearch />
        </button>
      </div>
    </div>

        {/* Messenger Button */}
        <button onClick={handleMessage}>
          <div
            className={`shadow-lg rounded-full p-2 ${
              isMessageActive
                ? "bg-purple-400 text-white"
                : "bg-white text-purple-700 hover:text-white hover:bg-purple-400"
            }`}
          >
            <BiMessageRoundedDetail size={25} />
          </div>
        </button>

        {/* Notification Button */}
        <button onClick={handleNotify}>
          <div
            className={`shadow-lg rounded-full p-2 ${
              isNotifyActive
                ? "bg-blue-400 text-white"
                : "bg-white text-blue-600 hover:text-white hover:bg-blue-400"
            }`}
          >
            <MdOutlineNotificationsNone size={23} />
          </div>
        </button>

        {/* Profile Button */}
        <button onClick={handleProfile}>
          <div
            className={`shadow-lg rounded-full p-2 ${
              isProfileActive
                ? "bg-indigo-400 text-white"
                : "bg-white text-indigo-600 hover:text-white hover:bg-indigo-400"
            }`}
          >
            <CgProfile size={23} />
          </div>
        </button>
      </div>

      {/* Conditionally Render Messenger Popup */}
      {showMessenger && <DoctorMessenger toggleMessenger={handleMessage} isVisible={showMessenger}/>}

      {/* Conditionally Render Notification Popup */}
      {showNotification && <DoctorNotification togglePopup={handleNotify} />}
    </div>
  );
};

export default Header;
