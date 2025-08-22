import React, { useEffect, useState } from "react";
import { FaBell, FaPills } from "react-icons/fa";
import config from "../../config";
import axios from "axios";


const API_URL = config.API_URL;
const patientId = localStorage.getItem("userId");


const Notification = ({ togglePopup }) => {
  const [notifications, setNotifications] = useState([]);
  const [medicineSchedule, setMedicineSchedule] = useState([]);

useEffect(() => {
  console.log("👀 useEffect triggered");

  const getTodaySchedule = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/medication/schedule/today/${patientId}`);
      console.log("✅ Today's meds:", res.data.medications);
      setMedicineSchedule(res.data.medications);
    } catch (err) {
      console.error("❌ Failed to fetch meds:", err);
    }
  };

  getTodaySchedule();
}, []);

  // ⏱️ Check for notification triggers every minute
useEffect(() => {
  if (!medicineSchedule.length) return;

  const interval = setInterval(() => {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;

    medicineSchedule.forEach((med) => {
      const [hour, minute] = med.doseTime.split(":").map(Number);
      const preTimerMinutes = med.reminderSetting || 5;

      const preAlertTime = new Date();
      preAlertTime.setHours(hour);
      preAlertTime.setMinutes(minute - preTimerMinutes);

      const preAlertString = `${preAlertTime
        .getHours()
        .toString()
        .padStart(2, "0")}:${preAlertTime
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;

      if (currentTime === preAlertString) {
        addNotification(
          `Time to prepare: You have to take ${med.medicineName} in ${preTimerMinutes} minutes.`,
          "pre",
          med
        );
      }

      if (currentTime === med.doseTime) {
        addNotification(
          `Have you taken your medicine (${med.medicineName}) today?`,
          "exact",
          med
        );
      }
    });
  }, 60000); // every minute

  return () => clearInterval(interval);
}, [medicineSchedule]);


  const addNotification = (message, type, med = null) => {
    const id = Date.now();
    const newNotification = {
      id,
      medicineName: med?.medicineName,
      doseTime: med?.doseTime,
      message,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      icon: type === "pre" ? FaBell : FaPills,
      type,
      status: type === "exact" ? "pending" : null,
    };

    setNotifications((prev) => [newNotification, ...prev.slice(0, 20)]);

    if (type === "exact") {
      setTimeout(() => {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === id && n.status === "pending" ? { ...n, status: "no" } : n
          )
        );

        // Auto send "no" if no response
        sendStatusToBackend(med.medicineName, med.doseTime, false);
      }, 15 * 60 * 1000);
    }
  };

  const handleResponse = (id, response) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, status: response } : n))
    );

    const target = notifications.find((n) => n.id === id);
    if (!target) return;

    sendStatusToBackend(target.medicineName, target.doseTime, response === "yes");
  };

const sendStatusToBackend = async (medicineName, doseTime, status) => {
  try {
    // Get current date in YYYY-MM-DD format
    const currentDate = new Date().toISOString().split('T')[0];
    
    await fetch(`${API_URL}/api/medication/schedule/status/${patientId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ 
        medicineName, 
        doseTime, 
        status,
        date: currentDate  // Added current date
      }),
    });
  } catch (err) {
    console.error("Failed to update medication status:", err);
  }
};

  return (
    <div className="fixed top-12 right-5 w-80 bg-white shadow-lg rounded-lg overflow-hidden z-50">
      <div className="p-4 bg-blue-500 text-white">
        <h3 className="text-lg font-bold">Notifications</h3>
      </div>
      <div className="max-h-96 overflow-y-auto p-4 space-y-2">
        {notifications.length === 0 ? (
          <p className="text-sm text-gray-500">No notifications yet.</p>
        ) : (
          notifications.map((n) => (
            <div key={n.id} className="flex flex-col border-b pb-2 gap-1">
              <div className="flex gap-3">
                <span className="text-blue-500 text-xl mt-1">
                  {React.createElement(n.icon)}
                </span>
                <div>
                  <p className="text-sm font-medium">{n.message}</p>
                  <p className="text-xs text-gray-500">{n.time}</p>

                  {n.type === "exact" && n.status === "pending" && (
                    <div className="flex gap-2 mt-1">
                      <button
                        onClick={() => handleResponse(n.id, "yes")}
                        className="text-green-600 text-xs border px-2 py-1 rounded hover:bg-green-100"
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => handleResponse(n.id, "no")}
                        className="text-red-600 text-xs border px-2 py-1 rounded hover:bg-red-100"
                      >
                        No
                      </button>
                    </div>
                  )}

                  {n.type === "exact" && n.status !== "pending" && (
                    <p
                      className={`text-xs mt-1 font-semibold ${
                        n.status === "yes"
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      Marked as: {n.status.toUpperCase()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      <button
        className="w-full p-2 bg-blue-100 text-blue-600 hover:bg-blue-200"
        onClick={togglePopup}
      >
        Close
      </button>
    </div>
  );
};

export default Notification;
