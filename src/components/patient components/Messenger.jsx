"use client";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Send, Search, Circle, Bot, User, Paperclip } from "lucide-react";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import Layout from "./Layout";
import config from "../../config";
import { format, isToday, isYesterday } from "date-fns";

const API_URL = config.API_URL;

const Messenger = () => {
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [appointedDoctors, setAppointedDoctors] = useState([]);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [lastSeen, setLastSeen] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadPreview, setUploadPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [botTyping, setBotTyping] = useState(false);
  const [currentBotFlow, setCurrentBotFlow] = useState("greeting");
  const [botInitialized, setBotInitialized] = useState(false);
  const [consultationData, setConsultationData] = useState({});
  const navigate = useNavigate();
  const socketRef = useRef(null);
  const fileInputRef = useRef(null);
  const userId = localStorage.getItem("userId");
  const [activeDoctor, setActiveDoctor] = useState(null);
  const [botEnabled, setBotEnabled] = useState(true);

  const BOT_FLOWS = {
    GREETING: "greeting",
    NEW_CONSULTATION: "new_consultation",
    EXISTING_CONSULTATION: "existing_consultation",
    GENERAL_QUERY: "general_query",
    OPINION_CONSULTATION: "opinion_consultation",
    SYMPTOM_COLLECTION: "symptom_collection",
    RESOLVED: "resolved",
  };

  const initializeBotGreeting = () => {
    if (botInitialized || !botEnabled) return;

    setBotInitialized(true);
    const botGreetingMessages = [
      {
        _id: `bot-greeting-${Date.now()}`,
        sender: "ai-bot",
        receiver: userId,
        message:
          "Hello! 👋 Welcome to Consult Homeopathy. Please let us know how we can help you today.",
        timestamp: new Date(),
        senderName: "AI Assistant",
        messageType: "bot",
        isOptions: true,
        options: [
          {
            id: 1,
            text: "🆕 New Consultation",
            value: "new_consultation",
            icon: "🆕",
          },
          {
            id: 2,
            text: "📋 Existing Consultation",
            value: "existing_consultation",
            icon: "📋",
          },
          {
            id: 3,
            text: "💭 General Query",
            value: "general_query",
            icon: "💭",
          },
          {
            id: 4,
            text: "⚖️ Opinion Consultation",
            value: "opinion_consultation",
            icon: "⚖️",
          },
        ],
      },
    ];
    setMessages((prev) => [...prev, ...botGreetingMessages]);
    setCurrentBotFlow(BOT_FLOWS.GREETING);
    // setBotInitialized(true);
  };

  const handleBotOptionSelect = (option) => {
    if (!botEnabled) return;
    const userMessage = {
      _id: `user-selection-${Date.now()}`,
      sender: userId,
      receiver: selectedDoctor,
      message: option.text,
      timestamp: new Date(),
      senderName: "You",
      messageType: "user",
    };
    setMessages((prev) => [...prev, userMessage]);
    setBotTyping(true);
    setTimeout(() => {
      setBotTyping(false);
      handleBotFlow(option.value);
    }, 1200);
  };

  const handleBotFlow = async (flowType) => {
    if (!botEnabled) return;
    let botResponse = {};
    switch (flowType) {
      case "new_consultation":
        setCurrentBotFlow(BOT_FLOWS.SYMPTOM_COLLECTION);
        botResponse = {
          _id: `bot-symptom-request-${Date.now()}`,
          sender: "ai-bot",
          receiver: userId,
          message: "Please describe your symptoms.",
          timestamp: new Date(),
          senderName: "AI Assistant",
          messageType: "bot",
        };
        break;
      case "existing_consultation":
        setCurrentBotFlow(BOT_FLOWS.EXISTING_CONSULTATION);
        try {
          const token = localStorage.getItem("token");
          const res = await axios.get(
            `${API_URL}/api/patient/patientAppointmentDates/${userId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          if (
            res.data?.message &&
            res.data.lastAppointmentDocument?.length > 0
          ) {
            const appointment = res.data.lastAppointmentDocument[0];

            const doctorName =
              appointedDoctors.find((doc) => doc._id === appointment.doctor)
                ?.name || "Unknown Doctor";

            const dateStr = new Date(
              appointment.appointmentDate
            ).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            });

            botResponse = {
              _id: `bot-active-consult-${Date.now()}`,
              sender: "ai-bot",
              receiver: userId,
              message: `👨‍⚕️ Your last consultation was with Dr. ${doctorName} on ${dateStr} at ${appointment.timeSlot}.  

Would you like to continue the conversation or schedule a fresh appointment?`,
              timestamp: new Date(),
              senderName: "AI Assistant",
              messageType: "bot",
              isActionButtons: true,
              actions: [
                {
                  id: "chat",
                  text: "💬 Chat with Dr. " + doctorName,
                  type: "chat",
                  payload: {
                    doctorId: appointment.doctor,
                    doctorName: doctorName,
                  }, // ✅ pass doc id here
                },
                {
                  id: "book",
                  text: "📅 Book New Consultation",
                  type: "appointment",
                },
              ],
            };
          } else {
            botResponse = {
              _id: `bot-no-active-${Date.now()}`,
              sender: "ai-bot",
              receiver: userId,
              message: "❌ There are no active consultations at the moment.",
              timestamp: new Date(),
              senderName: "AI Assistant",
              messageType: "bot",
              isActionButtons: true,
              actions: [
                {
                  id: "history",
                  text: "📜 View Consultation History",
                  type: "history",
                },
                {
                  id: "book",
                  text: "📅 Book New Consultation",
                  type: "appointment",
                },
              ],
            };
          }
        } catch (e) {
          console.error(e);
        }
        break;

      case "general_query":
        setCurrentBotFlow(BOT_FLOWS.GENERAL_QUERY);

        botResponse = {
          _id: `bot-general-${Date.now()}`,
          sender: "ai-bot",
          receiver: userId,
          message: "For general queries you can directly chat with the doctor",
          timestamp: new Date(),
          senderName: "AI Assistant",
          messageType: "bot",
          isActionButtons: true,
          actions: [
            {
              id: "chat",
              text: `💬 Chat with Dr.`,
              type: "chat",
              payload: {
                doctorId: "67bc3391654d85340a8ce713",
                doctorName: "Dr.Me",
              },
            },
          ],
        };

        break;
      case "opinion_consultation":
        setCurrentBotFlow(BOT_FLOWS.OPINION_CONSULTATION);
        botResponse = {
          _id: `bot-opinion-${Date.now()}`,
          sender: "ai-bot",
          receiver: userId,
          message:
            "⚠️ Opinion consultations are non-prescriptive unless converted to a full consultation.",
          timestamp: new Date(),
          senderName: "AI Assistant",
          messageType: "bot",
          isActionButtons: true,
          actions: [
            { id: "book", text: "📅 Book Appointment", type: "appointment" },
          ],
        };
        break;
      default:
        botResponse = {
          _id: `bot-default-${Date.now()}`,
          sender: "ai-bot",
          receiver: userId,
          message: "I’m here to help you with your healthcare needs.",
          timestamp: new Date(),
          senderName: "AI Assistant",
          messageType: "bot",
        };
    }
    setMessages((prev) => [...prev, botResponse]);
  };

  const analyzeMessageWithGroq = async (userMessage) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_URL}/api/groq/analyze`,
        {
          message: userMessage,
          patientId: userId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const analysis = response.data.data;
      console.log("Groq analysis result:", analysis);
      console.log("Data:", analysis.data);
      // logInteraction("groq_analysis", analysis);
      return analysis;
    } catch (error) {
      console.error("Groq analysis failed:", error);
      return null;
    }
  };

  const handleSymptomSubmission = async (text) => {
    const analysis = await analyzeMessageWithGroq(text);

    if (!analysis) {
      console.error("No analysis result");
      return;
    }

    setConsultationData({
      symptoms: text,
      consultationType: analysis.classification,
    });

    const botResponse = {
      _id: `bot-classification-${Date.now()}`,
      sender: "ai-bot",
      receiver: userId,
      message: `Your case looks like ${analysis.classification.toUpperCase()}. You can now book an appointment.`,
      timestamp: new Date(),
      senderName: "AI Assistant",
      messageType: "bot",
      isActionButtons: true,
      actions: [
        { id: "book", text: "📅 Book Appointment", type: "appointment" },
      ],
    };

    setMessages((prev) => [...prev, botResponse]);
    setCurrentBotFlow(BOT_FLOWS.RESOLVED);
  };

  // ✅ Clear file selection
  const clearFileSelection = () => {
    setSelectedFile(null);
    setUploadPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Instead of uploading immediately:
  const handleFileSelect = (file) => {
    if (!file) return;
    setSelectedFile(file);
    setUploadPreview(URL.createObjectURL(file));
  };

  // ✅ Upload file to Cloudinary via backend
  const uploadToCloudinary = async (file) => {
    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_URL}/api/upload/cloudinary`, // 👈 uses config.API_URL
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

  // ✅ Main doctor chat file upload
  // const handleFileUpload = async (file) => {
  //   if (!file || !activeDoctor) return;

  //   try {
  //     setSelectedFile(file);
  //     setUploadPreview(URL.createObjectURL(file));

  //     const uploadResult = await uploadToCloudinary(file);

  //     if (!uploadResult.success) {
  //       console.error("Upload failed:", uploadResult.message);
  //       return;
  //     }

  //     const fileAttachment = {
  //       url: uploadResult.secure_url,
  //       publicId: uploadResult.public_id,
  //       fileName: file.name,
  //       fileType: file.type,
  //       fileSize: file.size,
  //       uploadedAt: new Date(),
  //     };

  //     const fileMessage = {
  //       _id: `file-msg-${Date.now()}`,
  //       sender: userId,
  //       receiver: activeDoctor._id,
  //       senderName: "You",
  //       receiverName: activeDoctor.name,
  //       timestamp: new Date(),
  //       messageType: "file",
  //       fileAttachment,
  //     };

  //     // Add to local chat
  //     setMessages((prev) => [...prev, fileMessage]);

  //     // Send to doctor via socket
  //     socketRef.current?.emit("sendMessage", fileMessage);

  //     clearFileSelection();
  //   } catch (error) {
  //     console.error("File upload failed:", error);
  //     alert("Failed to upload file. Please try again.");
  //   }
  // };

  const handleActionClick = (action) => {
    switch (action.type) {
      case "appointment":
        navigate("/appointments/newappointment");
        break;
      case "history":
        navigate("/consulthistory");
        break;
      case "chat":
        if (action.payload) {
          setActiveDoctor({
            _id: action.payload.doctorId,
            name: action.payload.doctorName,
          });
          setBotEnabled(false); // stop bot flow

          socketRef.current?.emit("sessionToggle", {
            patientId: userId,
            doctorId: action.payload.doctorId,
            sessionActive: true,
          });

          const botMessage = {
            _id: `bot-chat-confirm-${Date.now()}`,
            sender: "ai-bot",
            receiver: userId,
            message: `Your conversation with the doctor has been enabled now. You can start chatting directly.`,
            timestamp: new Date(),
            senderName: "AI Assistant",
            messageType: "bot",
          };

          setMessages((prev) => [...prev, botMessage]);
        }
        break;

      default:
        break;
    }
  };

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // ✅ Correctly pick notifications array
      const notifications = response.data.notifications || [];

      // Filter only unread bot notifications
      const unreadBotNotes = notifications.filter((n) => n.isbotread === false);

      if (unreadBotNotes.length > 0) {
        unreadBotNotes.forEach(async (note) => {
          const botMessage = {
            _id: `bot-note-${note._id}`,
            sender: "ai-bot",
            receiver: userId,
            message: note.message,
            timestamp: note.createdAt,
            senderName: "AI Assistant",
            messageType: "bot",
            isNotification: true,
            notificationType: note.type,
            link: note.link,
          };

          // Push into chat messages
          setMessages((prev) => [...prev, botMessage]);

          // ✅ Mark as bot-read so it won’t repeat next fetch
          await axios.patch(
            `${API_URL}/api/notifications/${note._id}/bot-status`,
            { isbotread: true },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        });
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!userId) return;
    socketRef.current = io(API_URL, {
      transports: ["websocket", "polling"],
      auth: { token: localStorage.getItem("token") },
    });
    socketRef.current.emit("join", {
      userId,
      role: "patient",
      name: localStorage.getItem("patientName") || "Patient",
    });
    socketRef.current.on("onlineUsers", (users) =>
      setOnlineUsers(new Set(users))
    );
    return () => {
      socketRef.current?.disconnect();
    };
  }, [userId]);

  const messagesEndRef = useRef(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!userId) return;
    const fetchDoctors = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${API_URL}/api/patient/getAppointedDocs?id=${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setAppointedDoctors(res.data || []);
        if (res.data?.length > 0) setSelectedDoctor(res.data[0]._id);
      } catch (e) {
        console.error(e);
      }
    };
    fetchDoctors();
  }, [userId]);

  useEffect(() => {
    const fetchChatHistory = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found");
        return;
      }

      // if (!selectedDoctor || !userId) return;
      if (!userId) return;

      try {
        // ✅ use doctorId + patientId in the right order for your backend
        const response = await axios.get(
          `${API_URL}/api/chat/${selectedDoctor}/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Add type for UI rendering
        const messagesWithType = (response.data || []).map((msg) => ({
          ...msg,
          messageType:
            msg.sender === userId
              ? "user" // patient sent it
              : msg.sender === "ai-bot"
              ? "bot"
              : "doctor", // doctor sent it
        }));

        console.log("Loaded chat history:", messages);
        // setMessages(messagesWithType);
        if (messagesWithType.length > 0) {
          setMessages((prev) => {
            const all = [...prev, ...messagesWithType];
            const unique = all.filter(
              (msg, index, self) =>
                index === self.findIndex((m) => m._id === msg._id)
            );
            return unique;
          });
        } else if (!botInitialized && messages.length === 0) {
          initializeBotGreeting();
          console.log("Bot1 greeting initialized");
        }

        // Reset bot state if you want AI greeting flow
        // setBotInitialized(false);
        // setCurrentBotFlow(BOT_FLOWS.GREETING);

        // // Initialize bot greeting after a short delay
        // setTimeout(() => {
        //   initializeBotGreeting();
        // }, 1000);
      } catch (error) {
        console.error("Failed to fetch chat history:", error);
        // setMessages([]);
        // setBotInitialized(false);
        // if (!botInitialized && messages.length === 0) {
        //   initializeBotGreeting();
        // }
        // setTimeout(() => {
        //   initializeBotGreeting();
        // }, 1000);
      }
    };

    fetchChatHistory();
  }, [selectedDoctor, userId]);

  useEffect(() => {
    if (!socketRef.current) return;

    const handleReceiveMessage = (msg) => {
      console.log("📩 Incoming message:", msg);

      // classify message type
      const messageType =
        msg.sender === userId
          ? "user" // from patient (echoed back by server)
          : msg.sender === "ai-bot"
          ? "bot"
          : "doctor"; // from doctor

      // only push if it belongs to this chat
      if (
        (msg.sender === selectedDoctor && msg.receiver === userId) || // doctor → patient
        (msg.sender === userId && msg.receiver === selectedDoctor) || // patient echo
        msg.sender === "ai-bot"
      ) {
        setMessages((prev) => [...prev, { ...msg, messageType }]);
      }
    };

    const handleSessionToggle = ({ sessionActive, doctorId }) => {
      console.log("📡 Patient received sessionToggle:", sessionActive);

      if (doctorId === selectedDoctor) {
        setBotEnabled(!sessionActive);

        if (!sessionActive) {
          setActiveDoctor(null);
          // show bot greeting again
          setTimeout(() => initializeBotGreeting(), 50);
          console.log("Bot2 greeting initialized");
        }
      }
    };

    socketRef.current.on("receiveMessage", handleReceiveMessage);
    socketRef.current.on("sessionToggle", handleSessionToggle);

    return () => {
      socketRef.current.off("receiveMessage", handleReceiveMessage);
      socketRef.current.off("sessionToggle", handleSessionToggle);
    };
  }, [selectedDoctor, userId]);

  // const handleSendMessage = () => {
  //   if (!message.trim()) return;

  //   if (activeDoctor) {
  //     // Live Doctor–Patient Chat
  //     const userMessage = {
  //       _id: `user-msg-${Date.now()}`,
  //       sender: userId,
  //       receiver: activeDoctor._id,
  //       message: message.trim(),
  //       timestamp: new Date(),
  //       senderName: "You",
  //       messageType: "user",
  //       receiverName: "Dr. Me",
  //     };

  //     // setMessages((prev) => [...prev, userMessage]);

  //     // ✅ send via socket to doctor
  //     socketRef.current?.emit("sendMessage", userMessage);
  //   } else {
  //     // Bot chat (unchanged)
  //     const userMessage = {
  //       _id: `user-msg-${Date.now()}`,
  //       sender: userId,
  //       receiver: "ai-bot",
  //       message: message.trim(),
  //       timestamp: new Date(),
  //       senderName: "You",
  //       messageType: "user",
  //     };

  //     setMessages((prev) => [...prev, userMessage]);

  //     if (currentBotFlow === BOT_FLOWS.SYMPTOM_COLLECTION) {
  //       handleSymptomSubmission(message.trim());
  //     } else {
  //       handleBotFlow(message.trim());
  //     }
  //   }

  //   setMessage("");
  // };

  const handleSendMessage = async () => {
    if (!message.trim() && !selectedFile) return;

    // Case 1: File message
    if (selectedFile) {
      try {
        setIsUploading(true);
        const uploadResult = await uploadToCloudinary(selectedFile);

        if (!uploadResult.success) {
          console.error("Upload failed:", uploadResult.message);
          return;
        }

        const fileAttachment = {
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id,
          fileName: selectedFile.name,
          fileType: selectedFile.type,
          fileSize: selectedFile.size,
          uploadedAt: new Date(),
        };

        const fileMessage = {
          _id: `file-msg-${Date.now()}`,
          sender: userId,
          receiver: activeDoctor._id,
          senderName: "You",
          receiverName: activeDoctor.name,
          timestamp: new Date(),
          messageType: "file",
          fileAttachment, // 👈 add only if not empty
        };

        setMessages((prev) => [...prev, fileMessage]);
        socketRef.current?.emit("sendMessage", fileMessage);

        clearFileSelection();
      } catch (error) {
        console.error("File upload failed:", error);
      } finally {
        setIsUploading(false);
      }
      return;
    }

    // Case 2: Normal text message
    if (activeDoctor) {
      const userMessage = {
        _id: `user-msg-${Date.now()}`,
        sender: userId,
        receiver: activeDoctor._id,
        message: message.trim(),
        timestamp: new Date(),
        senderName: "You",
        messageType: "user",
        receiverName: "Dr. Me",
      };
      socketRef.current?.emit("sendMessage", userMessage);
    } else {
      // Bot flow (unchanged)
      const userMessage = {
        _id: `user-msg-${Date.now()}`,
        sender: userId,
        receiver: "ai-bot",
        message: message.trim(),
        timestamp: new Date(),
        senderName: "You",
        messageType: "user",
      };
      setMessages((prev) => [...prev, userMessage]);
      if (currentBotFlow === BOT_FLOWS.SYMPTOM_COLLECTION) {
        handleSymptomSubmission(message.trim());
      } else {
        handleBotFlow(message.trim());
      }
    }

    setMessage("");
  };

  return (
    <Layout>
      {/* Use the Layout's content area properly - full height minus header, no fixed positioning */}
      <div className="h-[calc(100vh-10rem)] flex flex-col bg-white -m-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200 px-4 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-gray-700">Consult Homeopathy</span>
          </div>
        </div>

        {/* Messages - takes remaining height */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 min-h-0">
          {(() => {
            // ✅ Sort messages by timestamp
            const sorted = [...messages].sort(
              (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
            );

            let lastDate = null;

            return sorted.map((msg, index) => {
              const msgDate = new Date(msg.timestamp);
              let dateLabel = "";

              // ✅ Show date header only when date changes
              if (
                !lastDate ||
                msgDate.toDateString() !== lastDate.toDateString()
              ) {
                if (isToday(msgDate)) dateLabel = "Today";
                else if (isYesterday(msgDate)) dateLabel = "Yesterday";
                else dateLabel = format(msgDate, "MMMM d, yyyy");
                lastDate = msgDate;
              }

              const isBot = msg.sender === "ai-bot";
              const isUser = msg.sender === userId;
              const isDoctor = !isBot && !isUser;

              return (
                <div key={msg._id || `${msg.sender}-${msg.timestamp}-${index}`}>
                  {/* ✅ Date Divider */}
                  {dateLabel && (
                    <div className="flex justify-center my-2">
                      <span className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                        {dateLabel}
                      </span>
                    </div>
                  )}

                  {/* Existing Message UI */}
                  <div
                    className={`flex gap-3 ${
                      isUser ? "justify-end" : "justify-start"
                    }`}
                  >
                    {/* Avatar (Bot/Doctor left side) */}
                    {!isUser && (
                      <div className="flex-shrink-0">
                        {isBot ? (
                          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600">
                            <Bot className="w-5 h-5 text-white" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 bg-green-400 rounded-full flex items-center justify-center text-white text-sm font-medium">
                            🩺
                          </div>
                        )}
                      </div>
                    )}

                    {/* Message Bubble */}
                    <div className={`max-w-lg ${isUser ? "order-first" : ""}`}>
                      <div
                        className={`p-3 rounded-2xl shadow-sm ${
                          isUser
                            ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-br-none"
                            : isBot
                            ? "bg-white border-blue-100 shadow-md"
                            : "bg-white border-gray-200"
                        }`}
                      >
                        {/* Sender Label */}
                        {!isUser && (
                          <p className="text-xs font-medium text-gray-500 mb-1">
                            {isBot ? "🤖 AI Assistant" : "👨‍⚕️ Doctor"}
                          </p>
                        )}

                        {/* Notification or Normal/File Message */}
                        {msg.isNotification ? (
                          <>
                            <div className="text-xs text-blue-500 mb-1">
                              🔔 Notification
                            </div>
                            <p
                              className={`text-sm whitespace-pre-wrap leading-relaxed ${
                                isUser ? "text-white" : "text-gray-800"
                              }`}
                            >
                              {msg.message}
                            </p>

                            {/* Action button depending on type */}
                            {[
                              "APPOINTMENT_REMINDER",
                              "APPOINTMENT_RESERVED",
                            ].includes(msg.notificationType) && (
                              <button
                                onClick={() =>
                                  navigate("/appointments/upcoming")
                                }
                                className="text-xs text-indigo-600 underline mt-1 inline-block"
                              >
                                View Appointment
                              </button>
                            )}

                            {msg.notificationType ===
                              "PRESCRIPTION_PAYMENT_DUE" && (
                              <button
                                onClick={() => navigate("/payments")}
                                className="text-xs text-indigo-600 underline mt-1 inline-block"
                              >
                                Make Payment
                              </button>
                            )}
                          </>
                        ) : msg.messageType === "file" ? (
                          <div className="flex flex-col gap-2">
                            {/* File preview/download */}
                            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-2">
                              {msg.fileAttachment?.fileType?.startsWith(
                                "image/"
                              ) ? (
                                <img
                                  src={msg.fileAttachment?.url}
                                  alt={msg.fileAttachment?.fileName}
                                  className="w-32 h-32 object-cover rounded-md"
                                />
                              ) : (
                                <div className="flex items-center gap-2">
                                  <div className="w-10 h-10 bg-blue-100 flex items-center justify-center rounded">
                                    📄
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-blue-600">
                                      {msg.fileAttachment?.fileName}
                                    </p>
                                    <a
                                      href={msg.fileAttachment?.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs text-indigo-500 underline"
                                    >
                                      Download
                                    </a>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Show caption only if exists */}
                            {msg.message && (
                              <p className="text-sm text-gray-800">
                                {msg.message}
                              </p>
                            )}
                          </div>
                        ) : (
                          msg.message && (
                            <p
                              className={`text-sm whitespace-pre-wrap leading-relaxed ${
                                isUser ? "text-white" : "text-gray-800"
                              }`}
                            >
                              {msg.message}
                            </p>
                          )
                        )}

                        {/* Bot Options */}
                        {msg.isOptions &&
                          msg.options?.map((opt) => (
                            <button
                              key={opt.id}
                              onClick={() => handleBotOptionSelect(opt)}
                              className="block w-full mt-3 px-5 py-3 rounded-xl text-left font-medium 
             bg-gradient-to-r from-indigo-50 via-cyan-50 to-blue-50 
             text-gray-700 border border-cyan-200 shadow-sm 
             hover:shadow-md hover:scale-[1.02] 
             hover:from-cyan-100 hover:to-blue-100
             transition-all duration-300 ease-in-out"
                            >
                              {opt.text}
                            </button>
                          ))}

                        {/* Action Buttons */}
                        {msg.isActionButtons &&
                          msg.actions?.map((act) => (
                            <button
                              key={act.id}
                              onClick={() => handleActionClick(act)}
                              className="block mt-2 w-full px-4 py-2 rounded-lg text-left font-medium 
             bg-white/70 border border-gray-200 text-gray-700 
             hover:bg-gray-100 hover:shadow-sm transition-all"
                            >
                              {act.text}
                            </button>
                          ))}
                      </div>

                      {/* Timestamp */}
                      <p
                        className={`text-xs text-gray-400 mt-1 ${
                          isUser ? "text-right" : "text-left"
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

                    {/* Avatar (User right side) */}
                    {isUser && (
                      <div className="w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                        👤
                      </div>
                    )}
                  </div>
                </div>
              );
            });
          })()}

          <div ref={messagesEndRef} />
        </div>
        {/* Message Input - fixed at bottom */}
        <div className="flex items-center gap-2 w-full">
          {/* Input wrapper */}
          <div className="flex-1 flex items-center border border-gray-200 rounded-md px-2 py-1 bg-white">
            {/* File Preview (if selected) */}
            {uploadPreview && (
              <div className="flex items-center gap-2 bg-gray-100 rounded px-2 py-1 mr-2">
                {selectedFile?.type.startsWith("image/") ? (
                  <img
                    src={uploadPreview}
                    alt="preview"
                    className="w-8 h-8 rounded object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gray-300 flex items-center justify-center rounded">
                    📄
                  </div>
                )}
                <span className="text-xs text-gray-700 truncate max-w-[100px]">
                  {selectedFile?.name}
                </span>
                <button
                  onClick={clearFileSelection}
                  className="text-gray-500 hover:text-red-500 text-xs"
                >
                  ❌
                </button>
              </div>
            )}

            {/* Text input */}
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              className="flex-1 outline-none px-2 text-gray-800"
              placeholder={
                uploadPreview ? "Add a caption..." : "Type your message..."
              }
            />
          </div>

          {/* File Button */}
          {activeDoctor && (
            <>
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => handleFileSelect(e.target.files[0])}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current.click()}
                className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 
             hover:from-blue-600 hover:to-purple-700 transition shadow-md"
              >
                <Paperclip className="w-5 h-5 text-white" />
              </button>
            </>
          )}

          {/* Send Button */}
          <button
            onClick={handleSendMessage}
            className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-md"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default Messenger;
