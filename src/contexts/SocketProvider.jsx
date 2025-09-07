import React, { createContext, useContext, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import config from "../config";
import { useUnreadCount } from "./UnreadCountContext";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const { setUnreadCounts } = useUnreadCount();
  const userId = localStorage.getItem("userId");
  const role = localStorage.getItem("userType");
  const API_URL = config.API_URL;

  useEffect(() => {
    if (!userId) return;

    socketRef.current = io(API_URL, {
      transports: ["websocket", "polling"],
      auth: { token: localStorage.getItem("token") },
    });

    socketRef.current.emit("join", {
      userId,
      role,
      name: localStorage.getItem(
        role === "Doctor" ? "doctorName" : "patientName"
      ),
    });

    socketRef.current.on(
      "botStatusChanged",
      ({ doctorId, patientId, status }) => {
        console.log("🔔 botStatusChanged received:", {
          doctorId,
          patientId,
          status,
        });
      }
    );

    const handleReceiveMessage = (msg) => {
      console.log(
        "📩 Global receiveMessage:",
        msg,
        "ROLE:",
        role,
        "USERID:",
        userId
      );

      // Doctor side unread
      if (
        (role.toLowerCase().trim() === "doctor" || role.toLowerCase().trim() === "admin-doctor") &&
        String(msg.receiver).trim() === String(userId).trim()
      ) {
        console.log("🔔 Doctor incrementing unread for", msg.sender);
        setUnreadCounts((prev) => ({
          ...prev,
          [msg.sender]: (prev[msg.sender] || 0) + 1,
        }));
      }

      // Patient side unread
      if (
        role.toLowerCase().trim() === "patient" &&
        String(msg.receiver).trim() === String(userId).trim()
      ) {
        console.log("🔔 Patient incrementing unread for", msg.sender);
        setUnreadCounts((prev) => ({
          ...prev,
          [msg.sender]: (prev[msg.sender] || 0) + 1,
        }));
      }
    };

    socketRef.current.on("receiveMessage", handleReceiveMessage);

    console.log("🔌 Socket connected?", socketRef.current.connected);
    socketRef.current.on("connect", () => console.log("✅ Socket connected!"));
    socketRef.current.on("disconnect", () =>
      console.log("❌ Socket disconnected!")
    );

    return () => {
      socketRef.current.off("receiveMessage", handleReceiveMessage);
      socketRef.current.disconnect();
    };
  }, [userId, role, setUnreadCounts]);

  return (
    <SocketContext.Provider value={socketRef}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
