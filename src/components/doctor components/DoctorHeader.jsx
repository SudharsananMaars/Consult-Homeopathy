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
import { useNavigate } from "react-router-dom";
import DoctorNotification from "./DoctorNotification";
import DoctorMessenger from "./DoctorMessenger";
import axios from "axios";
import config from "../../config";
import { useUnreadCount } from "../../contexts/UnreadCountContext";

const API_URL = config.API_URL;

const Header = () => {
  const navigate = useNavigate();
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
        // `${API_URL}/api/doctor/getAppointedPatients?id=${userId}`,

        `https://maars-2.onrender.com/api/doctor/chatPatientWithDoctorAndIsReadCount`,
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
        {/* Left section - Working Hours Display (only when checked in) */}
        <Box sx={{ flex: 1, display: "flex", alignItems: "center" }}>
          {isCheckedIn && (
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography
                variant="body2"
                sx={{
                  color: "#1e293b",
                  fontWeight: 600,
                  display: { xs: "none", sm: "block" },
                }}
              >
                Total Working Hours:{" "}
                <Box component="span" sx={{ fontWeight: 700 }}>
                  {formatTime(timer)}
                </Box>
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "#1e293b",
                  fontWeight: 600,
                  display: { xs: "block", sm: "none" },
                }}
              >
                Time:{" "}
                <Box component="span" sx={{ fontWeight: 700 }}>
                  {formatTime(timer)}
                </Box>
              </Typography>
              <Button
                onClick={handleCheckOut}
                variant="contained"
                size="small"
                sx={{
                  backgroundColor: "#ef4444",
                  "&:hover": {
                    backgroundColor: "#dc2626",
                  },
                  textTransform: "none",
                  fontWeight: 600,
                  px: 2,
                }}
              >
                <Box sx={{ display: { xs: "none", sm: "block" } }}>
                  Check Out
                </Box>
                <Box sx={{ display: { xs: "block", sm: "none" } }}>Out</Box>
              </Button>
            </Stack>
          )}
        </Box>

        {/* Right section - Month dropdown and Action buttons */}
        <Stack direction="row" spacing={1.5} alignItems="center">
          {/* Month Dropdown */}
          <Button
            onClick={toggleMonthDropdown}
            variant="outlined"
            startIcon={<CalendarToday />}
            endIcon={<KeyboardArrowDown />}
            sx={{
              backgroundColor: "white",
              borderColor: "#d1d5db",
              color: "#374151",
              textTransform: "none",
              fontWeight: 500,
              "&:hover": {
                backgroundColor: "#EFF6FF",
                borderColor: "#d1d5db",
              },
              px: 2,
              py: 1,
            }}
          >
            {selectedMonth}
          </Button>

          <Menu
            anchorEl={monthAnchorEl}
            open={isMonthDropdownOpen}
            onClose={() => setMonthAnchorEl(null)}
            PaperProps={{
              sx: {
                mt: 1,
                maxHeight: 240,
                width: 160,
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              },
            }}
          >
            {months.map((month, index) => (
              <MenuItem
                key={index}
                onClick={() => handleMonthSelect(month)}
                sx={{
                  fontSize: "0.875rem",
                  py: 1,
                  "&:hover": {
                    backgroundColor: "#EFF6FF",
                  },
                }}
              >
                {month}
              </MenuItem>
            ))}
          </Menu>

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
              <Message />
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
            <Notifications />
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
            <AccountCircle />
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
