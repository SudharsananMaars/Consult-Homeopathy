"use client";

import { useState, useEffect, useRef } from "react";
import {
  Search,
  Send,
  MoreHorizontal,
  Paperclip,
  Phone,
  Video,
  Info,
  Circle,
  X,
  Image,
  FileText,
  Download,
} from "lucide-react";
import axios from "axios";
import { io } from "socket.io-client";
import PatientInfoModal from "./PatientInfoModal";
import config from "../../config";
import { format, isToday, isYesterday } from "date-fns";
import { useSocket } from "../../contexts/SocketProvider";

const API_URL = config.API_URL;

function DoctorMessenger() {
  const [message, setMessage] = useState("");
  const [activeChat, setActiveChat] = useState("");
  const [patients, setPatients] = useState([]);
  const [messages, setMessages] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

  // Online/Offline status states
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [lastSeen, setLastSeen] = useState({});
  const [typingUsers, setTypingUsers] = useState(new Set());

  // ✅ File upload states
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadPreview, setUploadPreview] = useState(null);

  // ✅ Consultation Notes states
  const [consultationNote, setConsultationNote] = useState("");
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [noteSaveStatus, setNoteSaveStatus] = useState(""); // 'success', 'error', or ''
  const [existingNotes, setExistingNotes] = useState({}); // Store notes for each patient
  const [unreadCounts, setUnreadCounts] = useState({});
  // const [selectedPatientId, setSelectedPatientId] = useState(null);

  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [trackingData, setTrackingData] = useState({
    trackingId: "",
    deliveryPartner: "",
    shippedDate: "",
    arrivalDate: "",
    shipmentImage: null,
  });
  const [prescriptionId, setPrescriptionId] = useState(null);
  const socket = useSocket();

  // ✅ Handle file selection
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10MB");
      return;
    }

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];

    if (!allowedTypes.includes(file.type)) {
      alert(
        "File type not supported. Please upload images, PDFs, or documents."
      );
      return;
    }

    setSelectedFile(file);

    // Create preview
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadPreview({
          type: "image",
          url: e.target.result,
          name: file.name,
          size: file.size,
        });
      };
      reader.readAsDataURL(file);
    } else {
      setUploadPreview({
        type: "file",
        name: file.name,
        size: file.size,
      });
    }
  };

  // ✅ Upload file to Cloudinary
  const uploadToCloudinary = async (file) => {
    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(
        `${API_URL}/api/upload/cloudinary`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Upload failed:", error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  // ✅ Clear file selection
  const clearFileSelection = () => {
    setSelectedFile(null);
    setUploadPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSelectPatient = (patientId) => {
    setActiveChat(patientId);

    // reset unread count for that patient
    setUnreadCounts((prev) => ({
      ...prev,
      [patientId]: 0,
    }));
  };

  // ✅ Get file size in readable format
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // ✅ FIX 1: Enhanced file attachment rendering with proper null checks
  const renderFileAttachment = (fileAttachment) => {
    if (!fileAttachment || !fileAttachment.fileName || !fileAttachment.fileSize)
      return null;

    const isImage = fileAttachment.fileType?.startsWith("image/");
    const isPDF = fileAttachment.fileType === "application/pdf";

    return (
      <div className="mt-2">
        {isImage ? (
          <div className="relative">
            <img
              src={fileAttachment.url}
              alt={fileAttachment.fileName}
              className="max-w-xs rounded-lg cursor-pointer hover:opacity-90"
              onClick={() => window.open(fileAttachment.url, "_blank")}
            />
          </div>
        ) : (
          <div className="flex items-center gap-2 p-2 bg-white bg-opacity-50 rounded-lg border">
            {isPDF ? (
              <svg
                className="w-4 h-4 text-red-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M4 18h12V6l-4-4H4v16zm8-12V2l4 4h-4z" />
              </svg>
            ) : (
              <FileText className="w-4 h-4 text-gray-600" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-800 truncate">
                {fileAttachment.fileName}
              </p>
              <p className="text-xs text-gray-600">
                {formatFileSize(fileAttachment.fileSize)} •{" "}
                {isPDF ? "PDF Document" : "Document"}
              </p>
            </div>
            <button
              onClick={() => {
                // ✅ For PDFs, force download with correct filename
                if (isPDF) {
                  const link = document.createElement("a");
                  link.href = fileAttachment.url;
                  link.download = fileAttachment.fileName;
                  link.target = "_blank";
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                } else {
                  window.open(fileAttachment.url, "_blank");
                }
              }}
              className="p-1 hover:bg-gray-200 rounded-full"
            >
              <Download className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        )}
      </div>
    );
  };

  // ✅ Function to save consultation notes with clearing after save
  const saveConsultationNotes = async () => {
    if (!consultationNote.trim() || !activeChat) {
      alert("Please enter consultation notes before saving.");
      return;
    }

    setIsSavingNote(true);
    setNoteSaveStatus("");

    const notesData = {
      patientId: activeChat,
      userId: userId,
      note: consultationNote.trim(),
      date: new Date().toISOString(),
    };

    try {
      const response = await axios.post(
        `${API_URL}/api/doctor/consultationNotes`,
        notesData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Notes saved successfully:", response.data);
      setNoteSaveStatus("success");

      // ✅ Clear the consultation note area after successful save
      setConsultationNote("");

      // Store locally but don't reload into textarea
      setExistingNotes((prev) => ({
        ...prev,
        [activeChat]: consultationNote.trim(),
      }));

      // Clear the success status after 3 seconds
      setTimeout(() => {
        setNoteSaveStatus("");
      }, 3000);
    } catch (error) {
      console.error("Error saving notes:", error);
      setNoteSaveStatus("error");

      setTimeout(() => {
        setNoteSaveStatus("");
      }, 3000);
    } finally {
      setIsSavingNote(false);
    }
  };

  // ✅ Simplified useEffect - just clear textarea when switching patients
  useEffect(() => {
    setConsultationNote(""); // Always start with empty textarea
    clearFileSelection(); // Clear any selected files when switching patients
  }, [activeChat]);

  // FIXED: Initialize socket connection with proper message deduplication
  useEffect(() => {
    socketRef.current = io(API_URL, {
      transports: ["websocket", "polling"],
      auth: {
        token: localStorage.getItem("token"),
      },
    });

    socketRef.current.emit("join", {
      userId,
      role: "doctor",
      name: localStorage.getItem("doctorName") || "Doctor",
    });

    // ✅ Online users
    socketRef.current.on("onlineUsers", (users) => {
      setOnlineUsers(new Set(users));
    });

    socketRef.current.on("userOnline", (userData) => {
      setOnlineUsers((prev) => new Set([...prev, userData.userId]));
    });

    socketRef.current.on("userOffline", (userData) => {
      setOnlineUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userData.userId);
        return newSet;
      });

      if (userData.lastSeen) {
        setLastSeen((prev) => ({
          ...prev,
          [userData.userId]: userData.lastSeen,
        }));
      }
    });

    // ✅ Typing indicator
    socketRef.current.on("userTyping", ({ userId: typingUserId, isTyping }) => {
      setTypingUsers((prev) => {
        const newSet = new Set(prev);
        if (isTyping) {
          newSet.add(typingUserId);
        } else {
          newSet.delete(typingUserId);
        }
        return newSet;
      });
    });

    // ✅ Receive messages
    // socketRef.current.on("receiveMessage", (msg) => {
    //   if (
    //     (msg.sender === activeChat && msg.receiver === userId) || // patient → doctor
    //     (msg.sender === userId && msg.receiver === activeChat) // doctor → patient
    //   ) {
    //     setMessages((prevMessages) => {
    //       const messageExists = prevMessages.some((m) => m._id === msg._id);
    //       return messageExists ? prevMessages : [...prevMessages, msg];
    //     });
    //   }
    // });

    socketRef.current.on("receiveMessage", (msg) => {
      const exists = patients.some((p) => p._id === msg.sender);

      if (!exists) {
        fetchPatients();
      }

      // Store messages by patient
      if (
        (msg.sender === activeChat && msg.receiver === userId) || // patient → doctor
        (msg.sender === userId && msg.receiver === activeChat) // doctor → patient
      ) {
        setMessages((prev) => {
          const messageExists = prev.some((m) => m._id === msg._id);
          return messageExists ? prev : [...prev, msg];
        });
      } else {
        // Unread counter if message is from another patient
        setUnreadCounts((prev) => ({
          ...prev,
          [msg.sender]: (prev[msg.sender] || 0) + 1,
        }));
      }
    });

    // 🔥 Listen for sessionToggle from patient side
    socketRef.current.on(
      "sessionToggle",
      ({ patientId, doctorId, sessionActive }) => {
        console.log("Doctor received sessionToggle:");
        if (doctorId === userId) {
          setPatients((prev) =>
            prev.map((p) => (p._id === patientId ? { ...p, sessionActive } : p))
          );
        }
      }
    );

    socketRef.current.on("connect", () => {
      console.log("Connected to socket server");
    });

    socketRef.current.on("disconnect", () => {
      console.log("Disconnected from socket server");
    });

    return () => {
      if (socketRef.current) {
        // ✅ cleanup all listeners
        socketRef.current.off("onlineUsers");
        socketRef.current.off("userOnline");
        socketRef.current.off("userOffline");
        socketRef.current.off("userTyping");
        socketRef.current.off("receiveMessage");
        socketRef.current.off("sessionToggle");
        socketRef.current.disconnect();
      }
    };
  }, [userId, activeChat]);

  useEffect(() => {
    if (patients.length > 0 && messages.length > 0) {
      setPatients((prev) => sortPatientsByLatestMessage(prev, messages));
    }
  }, [messages]);

  // Handle typing indicator
  const handleTyping = (isTyping) => {
    if (socketRef.current && activeChat) {
      socketRef.current.emit("typing", {
        userId,
        receiverId: activeChat,
        isTyping,
      });
    }
  };

  // Handle message input change with typing indicator
  const handleMessageChange = (e) => {
    setMessage(e.target.value);
    handleTyping(true);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      handleTyping(false);
    }, 1000);
  };

  const sortPatientsByLatestMessage = (patientsList, allMessages) => {
    return [...patientsList].sort((a, b) => {
      const lastMsgA = allMessages
        .filter((m) => m.sender === a._id || m.receiver === a._id)
        .sort((x, y) => new Date(y.timestamp) - new Date(x.timestamp))[0];

      const lastMsgB = allMessages
        .filter((m) => m.sender === b._id || m.receiver === b._id)
        .sort((x, y) => new Date(y.timestamp) - new Date(x.timestamp))[0];

      const timeA = lastMsgA ? new Date(lastMsgA.timestamp).getTime() : 0;
      const timeB = lastMsgB ? new Date(lastMsgB.timestamp).getTime() : 0;

      return timeB - timeA; // latest first
    });
  };

  const fetchPatients = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        // `${API_URL}/api/doctor/getAppointedPatients?id=${userId}`,

        `https://maars-2.onrender.com
/api/doctor/chatPatientWithDoctor`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const sorted = sortPatientsByLatestMessage(
        response.data.uniqueData,
        messages
      );
      setPatients(sorted);
      if (sorted.length > 0) setActiveChat(sorted[0]._id);
    } catch (error) {
      console.error("Failed to fetch patients:", error);
    }
  };

  // Fetch patients list on mount
  useEffect(() => {
    fetchPatients();
  }, [userId]);

  // Fetch chat history whenever activeChat changes
  useEffect(() => {
    if (!activeChat) return;

    const fetchChatHistory = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await axios.get(
          `${API_URL}/api/chat/${userId}/${activeChat}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setMessages(response.data);
        const counts = {};

        response.data.forEach((msg) => {
          if (msg.receiver === userId && msg.isRead === false) {
            counts[msg.sender] = (counts[msg.sender] || 0) + 1;
          }
        });

        setUnreadCounts(counts);
        
      } catch (error) {
        console.error("Failed to fetch chat history:", error);
        setMessages([]);
      }
    };

    fetchChatHistory();
  }, [activeChat, userId]);

  // ✅ Fetch prescriptionId for active patient
  useEffect(() => {
    const fetchPrescriptionId = async () => {
      if (!activeChat) return;
      try {
        const res = await axios.get(
          `${API_URL}/api/medicine-summary/${activeChat}/pending-shipments`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const id = res.data?.pendingShipments?.[0]?.prescriptionId || null;
        setPrescriptionId(id);
      } catch (err) {
        console.error("Failed to fetch prescriptionId:", err);
        setPrescriptionId(null);
      }
    };
    fetchPrescriptionId();
  }, [activeChat, token]);

  // Transform patient data with online status
  const transformedPatients = patients.map((patient) => ({
    id: patient._id,
    name: patient.name.toUpperCase(),
    reason: `${patient.newExisting} patient consultation - ${patient.follow}`,
    time: new Date(patient.createdAt).toLocaleDateString(),
    status: patient.newExisting === "New" ? "New" : "Existing",
    statusColor:
      patient.newExisting === "New"
        ? "bg-blue-100 text-blue-700"
        : "bg-green-100 text-green-700",
    queryType: "Medical Query",
    avatar: patient.name.charAt(0).toUpperCase(),
    phone: patient.phone,
    email: patient.email,
    age: patient.age,
    gender: patient.gender,
    location: patient.currentLocation,
    isOnline: onlineUsers.has(patient._id),
    lastSeen: lastSeen[patient._id],
    isBotActive: patient.isBotActive,
  }));

  const updateIsBotActive = async (isBotActive) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.patch(
        `https://maars-2.onrender.com/api/doctorAppointmentSettings/updateIsBotOptionForThePatient`,
        { isBotActive, patientId: activeChat },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      socket.current?.emit("botStatusChanged", {
        doctorId: userId,
        patientId: activeChat,
        status: isBotActive,
      });
      console.log(
        "➡️ Trying to emit botStatusChanged:by doctor",
        {
          doctorId: userId,
          patientId: activeChat,
          status: isBotActive,
        },
        socket.current?.connected
      );

      console.log("Updated isBotActive:", res.data);
      // fetchPatients();
    } catch (err) {
      console.error("Failed to update isBotActive:", err);
      return null;
    }
  };

  useEffect(() => {
    if (!socket.current) return;

    const handleBotStatus = ({ doctorId, patientId, status }) => {
      console.log("🔔 DoctorMessenger got botStatusChanged:", {
        doctorId,
        patientId,
        status,
      });

      // update patients list locally
      setPatients((prev) =>
        prev.map((p) =>
          p._id === patientId ? { ...p, isBotActive: status } : p
        )
      );
    };

    socket.current.on("botStatusChanged", handleBotStatus);

    return () => {
      socket.current.off("botStatusChanged", handleBotStatus);
    };
  }, [socket]);

  // Filter patients based on search query
  const filteredPatients = transformedPatients.filter((patient) => {
    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();
    return (
      patient.name.toLowerCase().includes(query) ||
      patient.phone?.toLowerCase().includes(query) ||
      patient.email?.toLowerCase().includes(query) ||
      patient.reason.toLowerCase().includes(query) ||
      patient.id.toLowerCase().includes(query)
    );
  });

  const activePatient = transformedPatients.find((p) => p.id === activeChat);

  // Get status text for patient
  const getPatientStatus = (patient) => {
    if (patient.isOnline) {
      return "Online";
    } else if (patient.lastSeen) {
      const lastSeenDate = new Date(patient.lastSeen);
      const now = new Date();
      const diffMinutes = Math.floor((now - lastSeenDate) / (1000 * 60));

      if (diffMinutes < 1) {
        return "Just now";
      } else if (diffMinutes < 60) {
        return `${diffMinutes}m ago`;
      } else if (diffMinutes < 1440) {
        return `${Math.floor(diffMinutes / 60)}h ago`;
      } else {
        return `${Math.floor(diffMinutes / 1440)}d ago`;
      }
    }
    return "Offline";
  };

  // FIXED: Enhanced handler for sending message - Only emit to server, no local state update
  const handleSendMessage = async () => {
    if ((!message.trim() && !selectedFile) || !activeChat) return;

    handleTyping(false);

    try {
      let fileData = null;

      // Upload file if selected
      if (selectedFile) {
        const uploadResult = await uploadToCloudinary(selectedFile);
        fileData = {
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id,
          fileName: selectedFile.name,
          fileType: selectedFile.type,
          fileSize: selectedFile.size,
        };
      }

      const messageData = {
        sender: userId,
        receiver: activeChat,
        message: message.trim() || "",
        senderName: localStorage.getItem("doctorName") || "Doctor",
        receiverName: activePatient?.name || "",
        timestamp: new Date(),
        messageId: `temp-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)}`,
        ...(fileData && {
          fileAttachment: fileData,
          messageType: "file",
        }),
      };

      // FIXED: ONLY emit to server - server will broadcast back and receiveMessage will handle it
      // This prevents the double message issue completely
      if (socketRef.current) {
        socketRef.current.emit("sendMessage", messageData);
      }

      // Clear inputs immediately after sending
      setMessage("");
      clearFileSelection();
    } catch (error) {
      console.error("Failed to send message:", error);
      alert("Failed to send message. Please try again.");
    }
  };

  // ✅ Instant scroll to bottom - no animation
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "auto", // instant jump, no smooth animation
        block: "end",
      });
    }
  }, [messages]);

  // ✅ Instant scroll when switching chats
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "auto", // instant jump
        block: "end",
      });
    }
  }, [activeChat]);

  // ✅ Shipment Tracking Modal
  const trackingModal = isTrackingModalOpen && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">Update Shipment Tracking</h2>

        <input
          placeholder="Tracking ID"
          value={trackingData.trackingId}
          onChange={(e) =>
            setTrackingData({ ...trackingData, trackingId: e.target.value })
          }
          className="w-full mb-2 p-2 border border-gray-300 rounded bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          placeholder="Delivery Partner"
          value={trackingData.deliveryPartner}
          onChange={(e) =>
            setTrackingData({
              ...trackingData,
              deliveryPartner: e.target.value,
            })
          }
          className="w-full mb-2 p-2 border border-gray-300 rounded bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="date"
          value={trackingData.shippedDate}
          onChange={(e) =>
            setTrackingData({ ...trackingData, shippedDate: e.target.value })
          }
          className="w-full mb-2 p-2 border border-gray-300 rounded bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="date"
          value={trackingData.arrivalDate}
          onChange={(e) =>
            setTrackingData({ ...trackingData, arrivalDate: e.target.value })
          }
          className="w-full mb-2 p-2 border border-gray-300 rounded bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) =>
            setTrackingData({
              ...trackingData,
              shipmentImage: e.target.files[0],
            })
          }
          className="w-full mb-2 p-2 border border-gray-300 rounded bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div className="flex justify-end gap-2">
          <button
            onClick={() => setIsTrackingModalOpen(false)}
            className="px-4 py-2 bg-gray-500 rounded"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              if (!prescriptionId) {
                alert("No prescription found for this patient.");
                return;
              }
              try {
                const formData = new FormData();
                formData.append("trackingId", trackingData.trackingId);
                formData.append(
                  "deliveryPartner",
                  trackingData.deliveryPartner
                );
                formData.append("shippedDate", trackingData.shippedDate);
                formData.append("arrivalDate", trackingData.arrivalDate);
                if (trackingData.shipmentImage) {
                  formData.append("file", trackingData.shipmentImage);
                }

                await axios.patch(
                  `${API_URL}/api/doctor/precriptions/${prescriptionId}/tracking`,
                  formData,
                  { headers: { Authorization: `Bearer ${token}` } }
                );

                // send as chat message
                const trackingMessage = {
                  sender: userId,
                  receiver: activeChat,
                  message: `📦 Shipment Update\nTracking ID: ${trackingData.trackingId}\nDelivery Partner: ${trackingData.deliveryPartner}\nShipped: ${trackingData.shippedDate}\nArrival: ${trackingData.arrivalDate}`,
                  timestamp: new Date(),
                };
                socketRef.current.emit("sendMessage", trackingMessage);

                setIsTrackingModalOpen(false);
                setTrackingData({
                  trackingId: "",
                  deliveryPartner: "",
                  shippedDate: "",
                  arrivalDate: "",
                  shipmentImage: null,
                });
              } catch (err) {
                console.error("Error updating tracking:", err);
                alert("Failed to update tracking");
              }
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );

  // ✅ Shipment Tracking Button
  const trackingButton = (
    <button
      onClick={() => setIsTrackingModalOpen(true)}
      className="p-2 hover:bg-gray-100 rounded-md flex-shrink-0"
      title="Update Shipment Tracking"
    >
      <Info className="w-4 h-4 text-blue-500" />
    </button>
  );

  return (
    <div className="min-h-screen max-h-screen bg-gray-100 overflow-hidden">
      {/* Main Layout */}
      <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-64 lg:w-80 bg-gray-100 border-r border-gray-200 flex flex-col flex-shrink-0">
          {/* Search */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                placeholder="Search patients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Chat Categories */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex gap-1">
              <button className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded">
                All Chats {filteredPatients.length}
              </button>
              {/* <button className="px-2 py-1 border border-gray-300 text-gray-600 bg-white text-xs rounded hover:bg-gray-50">
                Bot Chats 1
              </button>
              <button className="px-2 py-1 border border-gray-300 text-gray-600 bg-white text-xs rounded hover:bg-gray-50">
                Your Chats {filteredPatients.length - 1}
              </button> */}
            </div>
          </div>

          {/* Sort Dropdown */}
          {/* <div className="px-4 py-2 border-b border-gray-200">
            <select className="w-full text-sm text-gray-600 bg-transparent border-none outline-none">
              <option>Newest First</option>
              <option>Oldest First</option>
            </select>
          </div> */}

          {/* Patient List */}
          <div className="flex-1 overflow-y-auto">
            {filteredPatients.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {searchQuery.trim()
                  ? "No patients match your search"
                  : "No patients found"}
              </div>
            ) : (
              filteredPatients.map((patient) => (
                <div
                  key={patient.id}
                  className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-200 ${
                    activeChat === patient.id
                      ? "bg-blue-50 border-l-4 border-l-blue-500"
                      : ""
                  }`}
                  onClick={() => handleSelectPatient(patient.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-sm font-medium">
                        {patient.avatar}
                      </div>
                      <div
                        className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                          patient.isOnline ? "bg-green-500" : "bg-gray-400"
                        }`}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-sm text-gray-900 truncate">
                          {patient.name}
                        </h3>

                        {/* ✅ Unread badge */}
                        {unreadCounts[patient.id] > 0 && (
                          <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full ml-2">
                            {unreadCounts[patient.id]}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                        Need consultation for severe headache
                      </p>

                      <div className="flex items-center justify-between">
                        <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700">
                          Acute
                        </span>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-gray-500">📋</span>
                          <span className="text-xs text-gray-500">
                            Medical Query
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-white min-w-0">
          {activePatient ? (
            <>
              {/* Chat Header */}
              <div className="bg-white border-b border-gray-200 p-4 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative">
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-medium">
                        {activePatient.avatar}
                      </div>
                      <div
                        className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                          activePatient.isOnline
                            ? "bg-green-500"
                            : "bg-gray-400"
                        }`}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="font-semibold text-gray-900 truncate">
                        {activePatient.name}
                      </h2>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-gray-500 truncate">
                          Patient ID: #{activePatient.id.slice(-5)}
                        </p>
                        {typingUsers.has(activeChat) && (
                          <span className="text-sm text-blue-500">
                            typing...
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        activePatient.isOnline
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {activePatient.isOnline
                        ? "Patient Online"
                        : "Patient Offline"}
                    </span>

                    {/* New Session Toggle */}
                    <label className="flex items-center gap-2">
                      <span
                        className={`text-xs ${
                          activePatient?.sessionActive
                            ? "text-gray-500"
                            : "text-gray-400" // label dims if disabled
                        }`}
                      >
                        Bot
                      </span>

                      <div
                        className={`
      relative inline-flex items-center
      ${
        !activePatient?.sessionActive
          ? "cursor-not-allowed group"
          : "cursor-pointer"
      }
    `}
                      >
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={activePatient?.isBotActive}
                          onChange={async (e) => {
                            const newValue = e.target.checked;

                            // Update in backend
                            try {
                              await updateIsBotActive(newValue);

                              // Update in local state
                              setPatients((prev) =>
                                prev.map((p) =>
                                  p._id === activePatient.id
                                    ? { ...p, isBotActive: newValue }
                                    : p
                                )
                              );
                            } catch (err) {
                              console.error(
                                "Failed to update bot status:",
                                err
                              );
                            }
                          }}
                        />

                        {/* Track */}
                        <div
                          className="
        w-9 h-5 rounded-full transition-colors
        bg-gray-300
        peer-checked:bg-blue-500
      "
                        ></div>

                        {/* Knob */}
                        <div
                          className="
        absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform
        peer-checked:translate-x-4
        peer-disabled:bg-gray-100
      "
                        ></div>

                        {/* Tooltip (only when disabled) */}
                        {!activePatient?.sessionActive && (
                          <span
                            className="
          absolute -top-6 left-1/2 -translate-x-1/2 w-36
          px-2 py-1 text-xs text-white bg-gray-700 rounded-md shadow 
          opacity-0 group-hover:opacity-100 transition-opacity
        "
                          >
                            You can’t disable bot
                          </span>
                        )}
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Waiting Indicator */}
              {/* {activePatient.isOnline && (
                <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2 flex-shrink-0">
                  <p className="text-sm text-yellow-700">
                    Patient is online and waiting for reply
                  </p>
                </div>
              )} */}

              {/* Messages */}
              <div
                className="flex-1 overflow-y-auto p-4 space-y-4 bg-white"
                style={{
                  scrollBehavior: "auto", // Remove smooth scrolling globally
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {messages.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <p className="text-lg mb-2">👋</p>
                      <p>Start your conversation with {activePatient?.name}</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* ✅ Add a spacer to push content to bottom if needed */}
                    <div className="flex-grow" />

                    {/* {messages.map((msg, index) => (
                      <div
                        key={
                          msg._id ||
                          msg.messageId ||
                          `${msg.sender}-${msg.timestamp}-${index}`
                        }
                        className={`flex gap-3 ${
                          msg.sender === userId
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        {msg.sender !== userId && (
                          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-sm font-medium flex-shrink-0">
                            {transformedPatients.find(
                              (p) => p.id === msg.sender
                            )?.avatar || "P"}
                          </div>
                        )}
                        <div
                          className={`max-w-xs lg:max-w-md ${
                            msg.sender === userId ? "order-first" : ""
                          }`}
                        >
                          <div
                            className={`p-3 rounded-lg ${
                              msg.sender === userId
                                ? "bg-pink-50 border border-pink-200"
                                : "bg-white border border-gray-200 shadow-sm"
                            }`}
                          >
                            <p className="text-sm text-gray-900">
                              {msg.message}
                            </p>
                            {renderFileAttachment(msg.fileAttachment)}
                          </div>
                          <p
                            className={`text-xs text-gray-500 mt-1 ${
                              msg.sender === userId ? "text-right" : "text-left"
                            }`}
                          >
                            {msg.timestamp
                              ? new Date(msg.timestamp).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : ""}
                          </p>
                        </div>
                        {msg.sender === userId && (
                          <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                            D
                          </div>
                        )}
                      </div>
                    ))} */}

                    {(() => {
                      const sorted = [...messages].sort(
                        (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
                      );

                      let lastDate = null;

                      return sorted.map((msg, index) => {
                        const msgDate = new Date(msg.timestamp);
                        let dateLabel = "";

                        if (
                          !lastDate ||
                          msgDate.toDateString() !== lastDate.toDateString()
                        ) {
                          if (isToday(msgDate)) dateLabel = "Today";
                          else if (isYesterday(msgDate))
                            dateLabel = "Yesterday";
                          else dateLabel = format(msgDate, "MMMM d, yyyy");
                          lastDate = msgDate;
                        }

                        return (
                          <div
                            key={
                              msg._id ||
                              msg.messageId ||
                              `${msg.sender}-${msg.timestamp}-${index}`
                            }
                          >
                            {/* ✅ Date Divider */}
                            {dateLabel && (
                              <div className="flex justify-center my-2">
                                <span className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                                  {dateLabel}
                                </span>
                              </div>
                            )}

                            {/* ✅ Existing message bubble code */}
                            <div
                              className={`flex gap-3 ${
                                msg.sender === userId
                                  ? "justify-end"
                                  : "justify-start"
                              }`}
                            >
                              {msg.sender !== userId && (
                                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-sm font-medium flex-shrink-0">
                                  {transformedPatients.find(
                                    (p) => p.id === msg.sender
                                  )?.avatar || "P"}
                                </div>
                              )}
                              <div
                                className={`max-w-xs lg:max-w-md ${
                                  msg.sender === userId ? "order-first" : ""
                                }`}
                              >
                                <div
                                  className={`p-3 rounded-lg ${
                                    msg.sender === userId
                                      ? "bg-pink-50 border border-pink-200"
                                      : "bg-white border border-gray-200 shadow-sm"
                                  }`}
                                >
                                  <p className="text-sm text-gray-900">
                                    {msg.message}
                                  </p>
                                  {renderFileAttachment(msg.fileAttachment)}
                                </div>
                                <p
                                  className={`text-xs text-gray-500 mt-1 ${
                                    msg.sender === userId
                                      ? "text-right"
                                      : "text-left"
                                  }`}
                                >
                                  {msg.timestamp
                                    ? new Date(
                                        msg.timestamp
                                      ).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })
                                    : ""}
                                </p>
                              </div>
                              {msg.sender === userId && (
                                <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                                  D
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      });
                    })()}

                    {/* Typing Indicator */}
                    {typingUsers.has(activeChat) && (
                      <div className="flex gap-3 justify-start">
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-sm font-medium flex-shrink-0">
                          {activePatient?.avatar || "P"}
                        </div>
                        <div className="max-w-xs lg:max-w-md">
                          <div className="bg-white border border-gray-200 shadow-sm p-3 rounded-lg">
                            <div className="flex items-center gap-1">
                              <div className="flex gap-1">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                <div
                                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                  style={{ animationDelay: "0.1s" }}
                                ></div>
                                <div
                                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                  style={{ animationDelay: "0.2s" }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* ✅ Scroll anchor - always visible */}
                <div
                  ref={messagesEndRef}
                  style={{ height: "1px", minHeight: "1px" }}
                  aria-hidden="true"
                />
              </div>

              {/* Auto Reply Suggestions */}
              {/* <div className="px-4 py-2 border-t border-gray-200 bg-gray-50 flex-shrink-0">
                <div className="flex gap-2">
                  <button className="px-3 py-1 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 flex items-center gap-1">
                    👍 Auto
                  </button>
                  <button className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-md">
                    Opinion
                  </button>
                </div>
              </div> */}

              {/* ✅ WhatsApp-style file preview above input */}
              {uploadPreview && (
                <div className="bg-white border-t border-gray-200 px-4 py-3">
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0">
                      {uploadPreview.type === "image" ? (
                        <img
                          src={uploadPreview.url}
                          alt="Preview"
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                          <FileText className="w-8 h-8 text-gray-600" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {uploadPreview.name}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {formatFileSize(uploadPreview.size)}
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        Ready to send
                      </p>
                    </div>
                    <button
                      onClick={clearFileSelection}
                      className="flex-shrink-0 p-1 hover:bg-gray-200 rounded-full"
                    >
                      <X className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                </div>
              )}

              {/* ✅ Message Input with file support */}
              <div className="bg-white border-t border-gray-200 p-4 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    className="hidden"
                    accept="image/*,.pdf,.doc,.docx,.txt"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 hover:bg-gray-100 rounded-md flex-shrink-0"
                    disabled={isUploading}
                  >
                    <Paperclip
                      className={`w-4 h-4 ${
                        isUploading ? "text-gray-300" : "text-gray-400"
                      }`}
                    />
                  </button>
                  {/* Shipment Tracking */}
                  {trackingButton}
                  <input
                    placeholder={
                      isUploading ? "Uploading..." : "Type your message..."
                    }
                    value={message}
                    onChange={handleMessageChange}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    onBlur={() => handleTyping(false)}
                    className="flex-1 px-3 py-2 border text-black border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isUploading}
                  />
                  <button
                    onClick={handleSendMessage}
                    className={`p-2 rounded-md flex-shrink-0 ${
                      isUploading
                        ? "bg-gray-400"
                        : "bg-blue-500 hover:bg-blue-600"
                    } text-white`}
                    disabled={isUploading}
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500 bg-white">
              Select a patient to start messaging
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="w-64 lg:w-80 bg-white border-l border-gray-200 flex flex-col flex-shrink-0">
          {activePatient && (
            <div className="flex-1 overflow-y-auto">
              {/* Patient Profile Header */}
              <div className="p-4 text-center">
                <div className="relative inline-block">
                  <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-xl font-medium mx-auto mb-2">
                    {activePatient.avatar}
                  </div>
                  <div
                    className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                      activePatient.isOnline ? "bg-green-500" : "bg-gray-400"
                    }`}
                  />
                </div>
                <h3 className="font-semibold text-gray-900">
                  {activePatient.name}
                </h3>
                <p className="text-sm text-gray-500">
                  ID: #{activePatient.id.slice(-5)} • {activePatient.gender} •{" "}
                  {activePatient.age}
                </p>
              </div>

              {/* Status */}
              <div className="p-4">
                <div className="mb-3">
                  <span className="text-sm font-medium text-gray-700">
                    Current Status:
                  </span>
                  <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
                    Consultation Pending
                  </span>
                </div>
                <p className="text-xs text-gray-500">Started: 10:15 AM today</p>
              </div>

              {/* Action Buttons */}
              <div className="p-4">
                <div className="flex gap-2 mb-4">
                  <button className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded-md text-sm flex items-center justify-center gap-1">
                    <Phone className="w-4 h-4" />
                    Call
                  </button>
                  <button
                    onClick={() => setIsInfoModalOpen(true)}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded-md text-sm flex items-center justify-center gap-1"
                  >
                    <Info className="w-4 h-4" />
                    Info
                  </button>
                </div>
              </div>

              {/* ✅ Consultation Notes Section - No fetch functionality */}
              <div className="p-4">
                <h4 className="font-medium text-gray-900 mb-2">
                  Consultation Notes
                </h4>
                <div className="bg-gray-50 rounded-md p-3 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-600 italic">Draft Mode</p>
                    {noteSaveStatus === "success" && (
                      <span className="text-xs text-green-600 font-medium">
                        ✓ Saved
                      </span>
                    )}
                    {noteSaveStatus === "error" && (
                      <span className="text-xs text-red-600 font-medium">
                        ✗ Error
                      </span>
                    )}
                  </div>
                  <textarea
                    placeholder="Add your consultation notes here..."
                    value={consultationNote}
                    onChange={(e) => setConsultationNote(e.target.value)}
                    className="w-full mt-2 p-2 text-sm border border-gray-200 rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="4"
                  />
                  <div className="mt-2 text-xs text-gray-500">
                    Patient: {activePatient.name} | Date:{" "}
                    {new Date().toLocaleDateString()}
                  </div>
                </div>

                <button
                  onClick={saveConsultationNotes}
                  disabled={isSavingNote || !consultationNote.trim()}
                  className={`w-full py-2 px-4 rounded-md text-sm mb-3 font-medium transition-colors ${
                    isSavingNote || !consultationNote.trim()
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-blue-500 hover:bg-blue-600 text-white"
                  }`}
                >
                  {isSavingNote ? "Saving..." : "Save Notes"}
                </button>

                <div className="space-y-2">
                  <button className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-blue-200 text-blue-600 rounded-md text-sm hover:bg-blue-50">
                    <span>💊</span>
                    Medicine Inventory
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <PatientInfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        patient={activePatient}
      />
      {/* ✅ Shipment Tracking Modal */}
      {trackingModal}
    </div>
  );
}

export default DoctorMessenger;
