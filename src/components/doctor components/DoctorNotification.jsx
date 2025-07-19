import React, { useState, useEffect } from "react";
import { FaPills } from "react-icons/fa";
import axios from "axios";
import config from "../../config";

const API_URL = config.API_URL;
const doctorId = localStorage.getItem("userId"); // Change this if passed via props

const Notification = ({ togglePopup }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/medication/schedule/notify-doctor/${doctorId}`);
        if (res.data && Array.isArray(res.data.notifications)) {
          setNotifications(res.data.notifications);
        } else {
          setNotifications([]);
        }
      } catch (err) {
        setError("Failed to load notifications.");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  return (
    <div className="fixed top-12 right-5 w-96 bg-white shadow-lg rounded-lg overflow-hidden z-50 border border-gray-200">
      <div className="p-4 bg-blue-500 text-white">
        <h3 className="text-lg font-bold">Notifications</h3>
      </div>
      <div className="max-h-96 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-blue-100">
        {loading && <p className="text-gray-500 text-sm">Loading...</p>}
        {error && <p className="text-red-500 text-sm">{error}</p>}
        {!loading && notifications.length === 0 && (
          <p className="text-gray-500 text-sm">No notifications found.</p>
        )}
        {notifications.map((message, index) => (
          <div key={index} className="flex items-start border-b pb-3">
            <span className="text-2xl mt-1 mr-3 text-red-500">
              <FaPills />
            </span>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                  Missed Dose
                </span>
                <span className="text-xs text-gray-400">Just now</span>
              </div>
              <p className="text-sm text-gray-800">{message}</p>
            </div>
          </div>
        ))}
      </div>
      <button
        className="w-full p-2 bg-blue-100 text-blue-600 font-medium hover:bg-blue-200 transition"
        onClick={togglePopup}
      >
        Close
      </button>
    </div>
  );
};

export default Notification;
