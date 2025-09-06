import React, { createContext, useContext, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import config from "../config";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const userId = localStorage.getItem("userId");
  const role = localStorage.getItem("role");
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

    socketRef.current.on("botStatusChanged", ({ doctorId, patientId, status }) => {
      console.log("🔔 botStatusChanged received:", {
        doctorId,
        patientId,
        status,
      });
      // You’ll now handle this directly in Messenger/DoctorMessenger
    });

    console.log("🔌 Socket connected?", socketRef.current.connected);
    socketRef.current.on("connect", () => console.log("✅ Socket connected!"));
    socketRef.current.on("disconnect", () =>
      console.log("❌ Socket disconnected!")
    );

    return () => {
      socketRef.current.disconnect();
    };
  }, [userId, role]);

  return (
    <SocketContext.Provider value={socketRef}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
