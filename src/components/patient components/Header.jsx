import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Box,
  Badge,
  IconButton,
  Typography,
  Breadcrumbs,
  Link,
  Stack,
} from "@mui/material";
import {
  AccountCircle,
  Message,
  Notifications,
  Menu as MenuIcon,
  NavigateNext,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import Notification from "./Notification";
import Messenger from "./Messenger";
import { useUnreadCount } from "../../contexts/UnreadCountContext";

const Header = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMessageActive, setIsMessageActive] = useState(false);
  const [isNotifyActive, setIsNotifyActive] = useState(false);
  const [isProfileActive, setIsProfileActive] = useState(false);

  const [showNotification, setShowNotification] = useState(false);
  const [showMessenger, setShowMessenger] = useState(false);
  const { totalUnread } = useUnreadCount();

  // Function to get page title from pathname
  const getPageTitle = (pathname) => {
    const routes = {
      "/home": "Home",
      "/consulthistory": "Consultation History",
      "/appointments/newappointment": "Book Appointment",
      "/appointments/upcoming": "Booked Appointments",
      "/prescription": "Prescription",
      "/patient-inventory": "Inventory",
      "/payments": "Payments",
      "/medicine": "Medicine Shipments",
      "/workshops": "Workshops",
      "/patientcontent": "Content",
      "/settings": "Settings",
      "/refer": "Refer Friend",
      "/profile": "Profile",
      "/needhelp": "Need Help",
    };

    return routes[pathname] || "Dashboard";
  };

  const handleNotify = () => {
    setIsNotifyActive(!isNotifyActive);
    setShowNotification(!showNotification);
    setShowMessenger(false);
  };

  const handleProfile = () => {
    setIsProfileActive(!isProfileActive);
    navigate("/profile");
  };

  const handleMessage = () => {
    setIsMessageActive(!isMessageActive);
    setShowMessenger(!showMessenger);
    setShowNotification(false);
  };

  const currentPageTitle = getPageTitle(location.pathname);

  return (
    <AppBar
      position="static"
      elevation={1}
      sx={{
        backgroundColor: "#EFF6FF",
        borderBottom: "1px solid #e5e7eb",
        width: "100%",
      }}
    >
      <Toolbar
        sx={{
          justifyContent: "space-between",
          minHeight: "64px !important",
          px: 3,
        }}
      >
        {/* Left section - Sidebar toggle, Logo and Breadcrumbs */}
        <Box sx={{ flex: 1, display: "flex", alignItems: "center", gap: 2 }}>
          {/* Sidebar Toggle Button */}
          <IconButton
            onClick={toggleSidebar}
            sx={{
              backgroundColor: "white",
              boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
              color: "#6b7280",
              "&:hover": {
                backgroundColor: "#f9fafb",
                color: "#374151",
              },
              width: 40,
              height: 40,
              display: { xs: "flex", md: "none" },
            }}
          >
            <MenuIcon />
          </IconButton>

          {/* Logo and Title Section */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {/* Breadcrumbs */}
            <Box sx={{ display: { xs: "none", sm: "block" } }}>
              <Breadcrumbs
                separator={
                  <NavigateNext fontSize="small" sx={{ color: "#9ca3af" }} />
                }
                sx={{
                  "& .MuiBreadcrumbs-separator": {
                    mx: 1,
                  },
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    color: "#5b5b5bff",
                    fontWeight: 700,
                    fontSize: "1rem",
                  }}
                >
                  Consult Homeopathy
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    color: "#5b5b5bff",
                    fontWeight: 600,
                    fontSize: "1rem",
                  }}
                >
                  {currentPageTitle}
                </Typography>
              </Breadcrumbs>
            </Box>

            {/* Mobile Title */}
            <Box sx={{ display: { xs: "block", sm: "none" } }}>
              <Typography
                variant="h6"
                sx={{
                  color: "#1e293b",
                  fontWeight: 600,
                  fontSize: "1rem",
                }}
              >
                {currentPageTitle}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Right section - Action buttons */}
        <Stack direction="row" spacing={1.5} alignItems="center">
          {/* Message Button */}
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
              <Message />
            </IconButton>
          </Badge>

          {/* Notification Button */}
          <IconButton
            onClick={handleNotify}
            sx={{
              backgroundColor: isNotifyActive ? "#c7d2fe" : "white",
              boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
              color: isNotifyActive ? "#4c1d95" : "#6b7280",
              "&:hover": {
                backgroundColor: "#c7d2fe",
                color: "#4c1d95",
              },
              width: 44,
              height: 44,
            }}
          >
            <Notifications />
          </IconButton>

          {/* Profile Button */}
          <IconButton
            onClick={handleProfile}
            sx={{
              backgroundColor: isProfileActive ? "#c7d2fe" : "white",
              boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
              color: isProfileActive ? "#4c1d95" : "#6b7280",
              "&:hover": {
                backgroundColor: "#c7d2fe",
                color: "#4c1d95",
              },
              width: 44,
              height: 44,
            }}
          >
            <AccountCircle />
          </IconButton>
        </Stack>
      </Toolbar>

      {/* Conditionally Render Messenger Popup */}
      {showMessenger && (
        <Messenger toggleMessenger={handleMessage} isVisible={showMessenger} />
      )}

      {/* Conditionally Render Notification Popup */}
      {showNotification && <Notification togglePopup={handleNotify} />}
    </AppBar>
  );
};

export default Header;
