import React, { useState } from "react";
import Layout from "../../components/patient components/Layout";
import config from "../../config";

const API_URL = config.API_URL;

const Settings = () => {
  const [activeTab, setActiveTab] = useState("password");

  // Change password
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // General notification settings
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [postNotifications, setpostNotifications] = useState(false);

  // Pills reminder notification settings
  const [notificationTab, setNotificationTab] = useState("general");
  const [preAlertTime, setPreAlertTime] = useState("5");
  const [ringtone, setRingtone] = useState("");
  const [voiceAlerts, setVoiceAlerts] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    // Validation
    if (newPassword !== confirmPassword) {
      alert("New passwords do not match!");
      return;
    }

    if (newPassword.length < 6) {
      alert("New password must be at least 6 characters long!");
      return;
    }

    setIsLoading(true);

    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API_URL}/api/otp/changePassword`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
           Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          oldPassword: oldPassword,
          newPassword: newPassword,
          retypedNewPassword: confirmPassword,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert(data.message || "Password changed successfully!");
        // Clear the form
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        alert(data.message || "Failed to change password. Please try again.");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      alert("An error occurred while changing password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Layout>
        <div className="p-8">
          <h1 className="text-2xl font-semibold mb-6">Settings</h1>

          {/* Tab Navigation */}
          <div className="flex border-b border-gray-300 mb-6">
            <button
              onClick={() => setActiveTab("password")}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === "password"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600"
              }`}
            >
              Change Password
            </button>
            <button
              onClick={() => setActiveTab("notifications")}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === "notifications"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600"
              }`}
            >
              Notification Settings
            </button>
          </div>

          {/* Change Password Tab */}
          {activeTab === "password" && (
            <div className="mb-8 max-w-md">
              <h2 className="text-xl font-semibold mb-4">Change Password</h2>
              <form onSubmit={handlePasswordChange}>
                <div className="mb-4">
                  <label htmlFor="oldPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Old Password
                  </label>
                  <input
                    type="password"
                    id="oldPassword"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    required
                    disabled={isLoading}
                    minLength={6}
                  />
                </div>

                <div className="mb-6">
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    required
                    disabled={isLoading}
                    minLength={6}
                  />
                </div>

                <div className="flex justify-start">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`py-2 px-6 rounded-md text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                      isLoading
                        ? "bg-gray-400 text-white cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    {isLoading ? "Changing Password..." : "Change Password"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <div className="mt-8 max-w-lg">
              {/* Sub-tabs */}
              <div className="flex space-x-4 border-b pb-2 mb-6">
                <button
                  className={`pb-1 border-b-2 text-sm ${
                    notificationTab === "general"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-600"
                  }`}
                  onClick={() => setNotificationTab("general")}
                >
                  General Notifications
                </button>
                <button
                  className={`pb-1 border-b-2 text-sm ${
                    notificationTab === "pills"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-600"
                  }`}
                  onClick={() => setNotificationTab("pills")}
                >
                  Pills Reminder Notifications
                </button>
              </div>

              {/* General Notifications */}
              {notificationTab === "general" && (
                <>
                  <div className="mb-3 flex items-center">
                    <input
                      type="checkbox"
                      checked={emailNotifications}
                      onChange={(e) => setEmailNotifications(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm font-medium text-gray-700">
                      Email Notifications
                    </label>
                  </div>

                  <div className="mb-3 flex items-center">
                    <input
                      type="checkbox"
                      checked={smsNotifications}
                      onChange={(e) => setSmsNotifications(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm font-medium text-gray-700">
                      SMS Notifications
                    </label>
                  </div>

                  <div className="mb-6 flex items-center">
                    <input
                      type="checkbox"
                      checked={postNotifications}
                      onChange={(e) => setpostNotifications(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm font-medium text-gray-700">
                      Posts/Videos
                    </label>
                  </div>
                </>
              )}

              {/* Pills Reminder Notifications */}
              {notificationTab === "pills" && (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pre-alert Time</label>
                    <select
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      value={preAlertTime}
                      onChange={(e) => setPreAlertTime(e.target.value)}
                    >
                      <option value="5">5 mins</option>
                      <option value="10">10 mins</option>
                      <option value="15">15 mins</option>
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ringtone</label>
                    <select
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      value={ringtone}
                      onChange={(e) => setRingtone(e.target.value)}
                    >
                      <option value="">-- Select --</option>
                    </select>
                  </div>

                  {/* iOS-style Toggle */}
                  <div className="mb-6 flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Enable Voice Alerts</label>
                    <div
                      onClick={() => setVoiceAlerts(!voiceAlerts)}
                      className={`relative inline-block w-12 h-6 transition duration-200 ease-in-out ${
                        voiceAlerts ? "bg-green-500" : "bg-gray-300"
                      } rounded-full cursor-pointer`}
                    >
                      <span
                        className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                          voiceAlerts ? "translate-x-6" : ""
                        }`}
                      ></span>
                    </div>
                  </div>
                </>
              )}

              <button
                className="bg-green-600 text-white py-2 px-6 rounded-md text-sm font-medium shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                onClick={() => alert("Notification settings saved!")}
              >
                Save 
              </button>
            </div>
          )}
        </div>
      </Layout>
    </div>
  );
};

export default Settings;