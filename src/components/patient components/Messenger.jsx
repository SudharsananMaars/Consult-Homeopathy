"use client";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Send, Search, Circle, Bot, User } from "lucide-react";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import Layout from "./Layout";
import config from "../../config";

const API_URL = config.API_URL;

const SOCKET_URL = "http://localhost:5000";

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
    setBotInitialized(true);
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
                  payload: { doctorId: appointment.doctor }, // ✅ pass doc id here
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

        // find doctor in appointedDoctors by selectedDoctor id
        const doctorObj = appointedDoctors.find(
          (doc) => doc._id === selectedDoctor
        );
        const doctorName = doctorObj ? doctorObj.name : "Unknown Doctor";

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
              text: `💬 Chat with Dr. ${doctorName}`,
              type: "chat",
              payload: { doctorId: selectedDoctor },
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
  const handleFileUpload = async (file) => {
    if (!file || !activeDoctor) return;

    try {
      setSelectedFile(file);
      setUploadPreview(URL.createObjectURL(file));

      const uploadResult = await uploadToCloudinary(file);

      if (!uploadResult.success) {
        console.error("Upload failed:", uploadResult.message);
        return;
      }

      const fileAttachment = {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
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
        fileAttachment,
      };

      // Add to local chat
      setMessages((prev) => [...prev, fileMessage]);

      // Send to doctor via socket
      socketRef.current?.emit("sendMessage", fileMessage);

      clearFileSelection();
    } catch (error) {
      console.error("File upload failed:", error);
      alert("Failed to upload file. Please try again.");
    }
  };

  const handleActionClick = (action) => {
    switch (action.type) {
      case "appointment":
        navigate("/appointments/newappointment");
        break;
      case "history":
        navigate("/consulthistory");
        break;
      case "chat":
        if (action.payload?.doctorId) {
          const doctorObj = appointedDoctors.find(
            (doc) => doc._id === action.payload.doctorId
          );
          if (doctorObj) {
            setActiveDoctor(doctorObj);
            setBotEnabled(false); // stop bot flow

            socketRef.current?.emit("sessionToggle", {
              patientId: userId,
              doctorId: selectedDoctor,
              sessionActive: true,
            });
          }
        }
        break;

      default:
        break;
    }
  };

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_URL}/api/notifications`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

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

  // useEffect(() => {
  //   if (selectedDoctor && userId) {
  //     setMessages([]);
  //     setBotInitialized(false);
  //     setTimeout(() => initializeBotGreeting(), 1000);
  //   }
  // }, [selectedDoctor, userId]);

  useEffect(() => {
    const fetchChatHistory = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found");
        return;
      }

      if (!selectedDoctor || !userId) return;

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

        setMessages(messagesWithType);

        // Reset bot state if you want AI greeting flow
        setBotInitialized(false);
        setCurrentBotFlow(BOT_FLOWS.GREETING);

        // Initialize bot greeting after a short delay
        setTimeout(() => {
          initializeBotGreeting();
        }, 1000);
      } catch (error) {
        console.error("Failed to fetch chat history:", error);
        setMessages([]);
        setBotInitialized(false);
        setTimeout(() => {
          initializeBotGreeting();
        }, 1000);
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

  const handleSendMessage = () => {
    if (!message.trim()) return;

    if (activeDoctor) {
      // Live Doctor–Patient Chat
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

      // setMessages((prev) => [...prev, userMessage]);

      // ✅ send via socket to doctor
      socketRef.current?.emit("sendMessage", userMessage);
    } else {
      // Bot chat (unchanged)
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
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-white -m-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200 px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-blue-600" />
          <span className="text-sm text-gray-700">Consult Homeopathy</span>
        </div>
      </div>

      {/* Messages - takes remaining height */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 min-h-0">
        {messages.map((msg, index) => {
          const isBot = msg.sender === "ai-bot";
          const isUser = msg.sender === userId;
          const isDoctor = !isBot && !isUser;

          return (
            <div
              key={msg._id || `${msg.sender}-${msg.timestamp}-${index}`}
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

                  {/* Notification or Normal Message */}
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
                          onClick={() => navigate("/appointments/upcoming")}
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
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input - fixed at bottom */}
      <div className="bg-white border-t border-gray-200 p-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          {/* Text Input */}
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            className="flex-1 px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Type your message..."
          />

          {/* Show file upload only if doctor chat is active */}
          {activeDoctor && (
            <>
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => handleFileUpload(e.target.files[0])}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current.click()}
                className="p-2 bg-gray-200 rounded-md"
              >
                📎
              </button>
            </>
          )}

          {/* Send Button */}
          <button
            onClick={handleSendMessage}
            className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-md"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </Layout>
);
};

export default Messenger;