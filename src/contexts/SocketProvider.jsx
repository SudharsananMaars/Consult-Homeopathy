import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
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

  // track online users, last seen, typing
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [lastSeen, setLastSeen] = useState({});
  const [typingUsers, setTypingUsers] = useState(new Set());

  useEffect(() => {
    if (!userId) return;

    // ✅ single socket connection for both roles
    socketRef.current = io(API_URL, {
      transports: ["websocket", "polling"],
      auth: { token: localStorage.getItem("token") },
    });

    // join event with role
    socketRef.current.emit("join", {
      userId,
      role,
      name: localStorage.getItem(
        role?.toLowerCase().includes("doctor") ? "doctorName" : "patientName"
      ),
    });

    // online/offline tracking
    socketRef.current.on("onlineUsers", (users) => {
      setOnlineUsers(new Set(users));
    });

    socketRef.current.on("userOnline", ({ userId: onlineId }) => {
      setOnlineUsers((prev) => new Set([...prev, onlineId]));
    });

    socketRef.current.on(
      "userOffline",
      ({ userId: offlineId, lastSeen: seen }) => {
        setOnlineUsers((prev) => {
          const copy = new Set(prev);
          copy.delete(offlineId);
          return copy;
        });
        if (seen) {
          setLastSeen((prev) => ({ ...prev, [offlineId]: seen }));
        }
      }
    );

    // typing indicator
    socketRef.current.on("userTyping", ({ userId: typingId, isTyping }) => {
      setTypingUsers((prev) => {
        const copy = new Set(prev);
        if (isTyping) copy.add(typingId);
        else copy.delete(typingId);
        return copy;
      });
    });

    // bot status
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

    
socketRef.current.on("requestFeedback", (data) => {
  console.log("🔔 SocketProvider: requestFeedback received:", data);
  // The Messenger component will also receive this via its own listener
});

    // message receive + unread
    const handleReceiveMessage = (msg) => {
      console.log(
        "📩 Global receiveMessage:",
        msg,
        "ROLE:",
        role,
        "USERID:",
        userId
      );

      // increment unread if message is for this user
      if (String(msg.receiver).trim() === String(userId).trim()) {
        setUnreadCounts((prev) => ({
          ...prev,
          [msg.sender]: (prev[msg.sender] || 0) + 1,
        }));
      }
    };

    // Handle browser tab visibility changes for patients
    if (role?.toLowerCase() === "patient") {
      const handleVisibilityChange = () => {
        if (document.visibilityState === "visible") {
          socketRef.current.emit("join", {
            userId,
            role,
            name: localStorage.getItem("patientName") || "Patient",
          });
        } else {
          socketRef.current.emit("manualOffline", { userId });
        }
      };

      document.addEventListener("visibilitychange", handleVisibilityChange);
      return () =>
        document.removeEventListener(
          "visibilitychange",
          handleVisibilityChange
        );
    }

    socketRef.current.on("receiveMessage", handleReceiveMessage);

    // connect/disconnect logs
    socketRef.current.on("connect", () => console.log("✅ Socket connected!"));
    socketRef.current.on("disconnect", () =>
      console.log("❌ Socket disconnected!")
    );

    return () => {
      socketRef.current.off("onlineUsers");
      socketRef.current.off("userOnline");
      socketRef.current.off("userOffline");
      socketRef.current.off("userTyping");
      socketRef.current.off("botStatusChanged");
      socketRef.current.off("requestFeedback");
      socketRef.current.off("receiveMessage", handleReceiveMessage);
      socketRef.current.disconnect();
    };
  }, [userId, role, setUnreadCounts]);

  // send helpers
  const sendMessage = (messageData) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("sendMessage", messageData);
    } else {
      console.error("Socket not connected. Cannot send message.");
    }
  };

  const sendTyping = (receiverId, isTyping) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("typing", { userId, receiverId, isTyping });
    }
  };

  const sendBotStatus = (doctorId, patientId, status) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("botStatusChanged", {
        doctorId,
        patientId,
        status,
      });
    }
  };

  // provide everything to children
  const value = {
    socket: socketRef,
    sendMessage,
    sendTyping,
    sendBotStatus,
    onlineUsers,
    lastSeen,
    typingUsers,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
