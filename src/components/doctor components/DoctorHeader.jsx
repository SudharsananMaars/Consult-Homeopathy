import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Box,
  IconButton,
  Badge,
  Button,
  Typography,
  Menu,
  MenuItem,
  Chip,
  Stack,
} from "@mui/material";
import {
  AccountCircle,
  Message,
  Notifications,
  CalendarToday,
  KeyboardArrowDown,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import DoctorNotification from "./DoctorNotification";
import DoctorMessenger from "./DoctorMessenger";
import axios from "axios";
import config from "../../config";
import { useUnreadCount } from "../../contexts/UnreadCountContext";

const API_URL = config.API_URL;

// Configuration for icon types - set USE_GIF_ICONS to true to use GIFs
const USE_GIF_ICONS = true; // Change this to false to use Material-UI icons

// GIF icon paths - Update these paths to your actual GIF files
const GIF_ICONS = {
  message: "/src/assets/images/doctor images/Messenger.gif", // Replace with your message GIF path
  notification: "/src/assets/images/doctor images/Notification.gif", // Replace with your notification GIF path
  profile: "/src/assets/images/doctor images/Profile.gif" // Replace with your profile GIF path
};

// Page title function
function getPageTitle(pathname) {
  // Define route mappings for page titles
  const routeMap = {
    // Main routes
    '/dashboard': 'Home',
    
    // Appointments
    '/appointments/list': 'Appointment List',
    '/appointments/calender': 'Appointment Calendar',
    '/appointments': 'Appointments',
    
    // Patients & Doctors
    '/patients': 'Patients',
    '/assistdoc': 'Assistant Doctors',
    '/assistdoc/docprofile': 'Doctor Profiles',
    '/assistdoc/doctors': 'External Doctors',
    
    // Payments & Financial
    '/docpayments': 'Payments',
    '/overview': 'Overview',
    
    // Medicine & Inventory
    '/medicine-preparation': 'Medicine Preparation',
    '/medicine-preparation/preparation': 'Medicine Preparation Dashboard',
    '/doctor-inventory': 'Patient Inventory',
    '/inventory': 'Inventory',
    
    // Content & Workshops
    '/workshoppage': 'Workshops',
    '/content': 'Content',
    
    // Specialized Features
    '/lekagedetection': 'Leakage Detection',
    '/doctor-dashboard/all': 'Doctor CRM',
    '/doctor-dashboard': 'Doctor CRM',
    '/allocation': 'Doctor Allocation',
    
    // Management & Settings
    '/hrm': 'HR Management',
    '/docsettings': 'Settings',
    '/assistleave': 'Leave Management',
    '/newprofile': 'Profile',
    '/needhelp': 'Help & Support',
    
    // Default fallback
    '/': 'Home'
  };

  // First, try exact match
  if (routeMap[pathname]) {
    return routeMap[pathname];
  }

  // Handle dynamic routes or partial matches
  for (const route in routeMap) {
    if (pathname.startsWith(route) && route !== '/') {
      return routeMap[route];
    }
  }

  // Handle nested routes by extracting meaningful parts
  const pathSegments = pathname.split('/').filter(segment => segment);
  
  if (pathSegments.length > 0) {
    // Convert kebab-case or camelCase to Title Case
    const lastSegment = pathSegments[pathSegments.length - 1];
    return lastSegment
      .split(/[-_]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  return 'Dashboard'; // Default fallback
}

// Icon component that can render either GIF or Material-UI icon
const IconComponent = ({ type, materialIcon: MaterialIcon }) => {
  if (USE_GIF_ICONS) {
    return (
      <img
        src={GIF_ICONS[type]}
        alt={`${type} icon`}
        style={{
          width: 24,
          height: 26,
          objectFit: 'contain'
        }}
      />
    );
  }
  return <MaterialIcon />;
};

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMessageActive, setIsMessageActive] = useState(false);
  const [isNotifyActive, setIsNotifyActive] = useState(false);
  const [isProfileActive, setIsProfileActive] = useState(false);

  const [showNotification, setShowNotification] = useState(false);
  const [showMessenger, setShowMessenger] = useState(false);

  // Month dropdown state
  const [selectedMonth, setSelectedMonth] = useState("Month");
  const [monthAnchorEl, setMonthAnchorEl] = useState(null);
  const isMonthDropdownOpen = Boolean(monthAnchorEl);

  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [timer, setTimer] = useState(0);
  const [intervalId, setIntervalId] = useState(null);
  const [elapsedTime, setElapsedTime] = useState("00:00:00");
  const [startTime, setStartTime] = useState(null);

  const currentPageTitle = getPageTitle(location.pathname);
  const doctorId = localStorage.getItem("token");
  const { totalUnread, setUnreadCounts } = useUnreadCount();

  console.log("🔔 DoctorHeader unread:", totalUnread);

  // Months array
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const fetchPatients = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        `${API_URL}/api/doctor/chatPatientWithDoctorAndIsReadCount`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const counts = {};
      response.data.unreadCounts.forEach((item) => {
        counts[item.patientId] = item.isReadFalseCount;
      });
      setUnreadCounts(counts);
    } catch (error) {
      console.error("Failed to fetch patients:", error);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    if (!doctorId) return;

    const storedIsCheckedIn =
      localStorage.getItem(`${doctorId}_isCheckedIn`) === "true";
    const storedStartTime = localStorage.getItem(`${doctorId}_startTime`);
    const storedPausedTime =
      parseInt(localStorage.getItem(`${doctorId}_pausedTimer`), 10) || 0;

    if (storedIsCheckedIn) {
      const startTimestamp = Number(storedStartTime);
      setIsCheckedIn(true);
      setStartTime(startTimestamp);

      const newIntervalId = setInterval(() => {
        const now = Date.now();
        const secondsElapsed =
          Math.floor((now - startTimestamp) / 1000) + storedPausedTime;
        setTimer(secondsElapsed);
      }, 1000);

      setIntervalId(newIntervalId);
    } else if (storedPausedTime > 0) {
      setTimer(storedPausedTime);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [doctorId]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}:${String(secs).padStart(2, "0")}`;
  };

  const handleCheckIn = async () => {
    if (!doctorId) {
      console.error("Doctor ID not found");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Authentication token not found");
        return;
      }

      const pausedTime =
        parseInt(localStorage.getItem(`${doctorId}_pausedTimer`), 10) || 0;

      const response = await axios.post(
        `${API_URL}/api/attendance/checkin`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setIsCheckedIn(true);
      const startTimestamp = Date.now();
      setStartTime(startTimestamp);

      localStorage.setItem(`${doctorId}_isCheckedIn`, "true");
      localStorage.setItem(`${doctorId}_startTime`, startTimestamp.toString());
      localStorage.setItem(`${doctorId}_timer`, pausedTime.toString());

      const newIntervalId = setInterval(() => {
        const now = Date.now();
        const secondsElapsed =
          Math.floor((now - startTimestamp) / 1000) + pausedTime;
        setTimer(secondsElapsed);
        localStorage.setItem(`${doctorId}_timer`, secondsElapsed.toString());
      }, 1000);

      setIntervalId(newIntervalId);
    } catch (error) {
      console.error("Error during check-in:", error);
    }
  };

  const handleCheckOut = async () => {
    if (!doctorId) {
      console.error("Doctor ID not found");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Authentication token not found");
        return;
      }

      const response = await axios.post(
        `${API_URL}/api/attendance/checkout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const { totalElapsedTime, breakTime } = response.data;

      const currentTimerValue = timer;
      localStorage.setItem(
        `${doctorId}_pausedTimer`,
        currentTimerValue.toString()
      );

      setElapsedTime(totalElapsedTime);
      setIsCheckedIn(false);
      clearInterval(intervalId);
      setIntervalId(null);

      localStorage.removeItem(`${doctorId}_isCheckedIn`);
      localStorage.removeItem(`${doctorId}_startTime`);

      console.log("Break Time:", breakTime);
    } catch (error) {
      console.error("Error during check-out:", error);
    }
  };

  const handleNotify = () => {
    setIsNotifyActive(!isNotifyActive);
    setShowNotification(!showNotification);
    setShowMessenger(false);
    setMonthAnchorEl(null);
  };

  const handleProfile = () => {
    setIsProfileActive(!isProfileActive);
    navigate("/newprofile");
    setMonthAnchorEl(null);
  };

  const handleMessage = () => {
    setIsMessageActive(!isMessageActive);
    setShowMessenger(!showMessenger);
    setShowNotification(false);
    setMonthAnchorEl(null);
  };

  const handleMonthSelect = (month) => {
    setSelectedMonth(month);
    setMonthAnchorEl(null);
    console.log("Selected month:", month);
  };

  const toggleMonthDropdown = (event) => {
    setMonthAnchorEl(monthAnchorEl ? null : event.currentTarget);
    setShowNotification(false);
    setShowMessenger(false);
  };

  return (
    <AppBar
      position="static"
      elevation={1}
      sx={{
        backgroundColor: "#EFF6FF",
        borderBottom: "1px solid #EFF6FF",
      }}
    >
      <Toolbar
        sx={{
          justifyContent: "space-between",
          minHeight: "64px !important",
          px: 3,
        }}
      >
        {/* Left section - App Title and Current Page */}
        <div className="flex flex-1 items-center">
          <div className="flex items-center gap-3">
            <h2 className="text-xl text-[#757575] font-semibold text-slate-800">
              Consult Homeopathy
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">|</span>
              <span className="text-lg text-[#757575] font-semibold  text-slate-800">
                {currentPageTitle}
              </span>
            </div>
          </div>
        </div>

        {/* Right section - Month dropdown and Action buttons */}
        <Stack direction="row" spacing={1.5} alignItems="center">

          {/* Action Buttons */}
          <Badge
            badgeContent={totalUnread}
            color="error"
            overlap="circular"
            anchorOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
          >
            <IconButton
              onClick={handleMessage}
              sx={{
                backgroundColor: "white",
                boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
                color: "#6b7280",
                "&:hover": {
                  backgroundColor: "#EFF6FF",
                  color: "#374151",
                },
                width: 44,
                height: 44,
              }}
            >
              <IconComponent type="message" materialIcon={Message} />
            </IconButton>
          </Badge>

          <IconButton
            onClick={handleNotify}
            sx={{
              backgroundColor: "white",
              boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
              color: "#6b7280",
              "&:hover": {
                backgroundColor: "#EFF6FF",
                color: "#374151",
              },
              width: 44,
              height: 44,
            }}
          >
            <IconComponent type="notification" materialIcon={Notifications} />
          </IconButton>

          <IconButton
            onClick={handleProfile}
            sx={{
              backgroundColor: "white",
              boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
              color: "#6b7280",
              "&:hover": {
                backgroundColor: "#EFF6FF",
                color: "#000000ff",
              },
              width: 44,
              height: 44,
            }}
          >
            <IconComponent type="profile" materialIcon={AccountCircle} />
          </IconButton>
        </Stack>
      </Toolbar>

      {/* Conditionally Render Messenger Popup */}
      {showMessenger && (
        <DoctorMessenger
          toggleMessenger={handleMessage}
          isVisible={showMessenger}
        />
      )}

      {/* Conditionally Render Notification Popup */}
      {showNotification && <DoctorNotification togglePopup={handleNotify} />}
    </AppBar>
  );
};

export default Header;