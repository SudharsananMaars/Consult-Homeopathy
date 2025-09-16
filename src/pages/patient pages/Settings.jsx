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
<<<<<<< HEAD
       
          <div className="max-w-4xl mx-auto py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>
            
            {/* White Container */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Tab Navigation */}
              <div className="px-8 pt-6 border-b border-gray-200">
                <div className="flex space-x-8">
                  <button
                    onClick={() => setActiveTab("password")}
                    className={`pb-4 px-1 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === "password" 
                        ? "border-blue-600 text-blue-600" 
                        : "border-transparent text-gray-500 hover:text-gray-700"
=======
        <div className="p-8">
          <h1 className="text-2xl font-semibold mb-4">Settings</h1>

          {/* Tab Navigation */}
          <div className="flex border-b border-gray-300 mb-4">
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
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-2">Change Password</h2>
              <form onSubmit={handlePasswordChange}>
                <div className="mb-4">
                  <label htmlFor="oldPassword" className="block text-sm font-medium text-gray-700">
                    Old Password
                  </label>
                  <input
                    type="password"
                    id="oldPassword"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                    New Password
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                    disabled={isLoading}
                    minLength={6}
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                    disabled={isLoading}
                    minLength={6}
                  />
                </div>

                <div className="mb-4 mt-10 flex justify-center">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`py-2 px-4 rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                      isLoading
                        ? "bg-gray-400 text-white cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700"
>>>>>>> 208128331bfde71fff962d9ca6a3d56c6d7e4023
                    }`}
                  >
                    {isLoading ? "Changing Password..." : "Change Password"}
                  </button>
                  <button
                    onClick={() => setActiveTab("notifications")}
                    className={`pb-4 px-1 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === "notifications"
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Notification Settings
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-8">
                {activeTab === "password" && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Change Password</h2>
                    <form onSubmit={handlePasswordChange} className="max-w-md">
                      <div className="space-y-6">
                        <div>
                          <label htmlFor="oldPassword" className="block text-sm font-medium text-gray-700 mb-2">
                            Current Password
                          </label>
                          <input
                            type="password"
                            id="oldPassword"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder="Enter current password"
                            required
                          />
                        </div>

                        <div>
                          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                            New Password
                          </label>
                          <input
                            type="password"
                            id="newPassword"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder="Enter new password"
                            required
                          />
                        </div>

                        <div>
                          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                            Confirm New Password
                          </label>
                          <input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder="Confirm new password"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="mt-8">
                        <button
                          type="submit"
                          className="bg-blue-600 text-white py-3 px-6 rounded-lg font-medium shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                        >
                          Change Password
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Notifications Tab */}
                {activeTab === "notifications" && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Notification Settings</h2>
                    
                    {/* Sub-tabs */}
                    <div className="border-b border-gray-200 mb-8">
                      <div className="flex space-x-8">
                        <button
                          className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                            notificationTab === "general"
                              ? "border-blue-600 text-blue-600"
                              : "border-transparent text-gray-500 hover:text-gray-700"
                          }`}
                          onClick={() => setNotificationTab("general")}
                        >
                          General Notifications
                        </button>
                        <button
                          className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                            notificationTab === "pills"
                              ? "border-blue-600 text-blue-600"
                              : "border-transparent text-gray-500 hover:text-gray-700"
                          }`}
                          onClick={() => setNotificationTab("pills")}
                        >
                          Pills Reminder Notifications
                        </button>
                      </div>
                    </div>

                    {/* General Notifications */}
                    {notificationTab === "general" && (
                      <div className="max-w-md">
                        <div className="space-y-4">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="emailNotifications"
                              checked={emailNotifications}
                              onChange={(e) => setEmailNotifications(e.target.checked)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="emailNotifications" className="ml-3 text-sm font-medium text-gray-700">
                              Email Notifications
                            </label>
                          </div>

                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="smsNotifications"
                              checked={smsNotifications}
                              onChange={(e) => setSmsNotifications(e.target.checked)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="smsNotifications" className="ml-3 text-sm font-medium text-gray-700">
                              SMS Notifications
                            </label>
                          </div>

                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="postNotifications"
                              checked={postNotifications}
                              onChange={(e) => setpostNotifications(e.target.checked)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="postNotifications" className="ml-3 text-sm font-medium text-gray-700">
                              Posts/Videos Notifications
                            </label>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Pills Reminder Notifications */}
                    {notificationTab === "pills" && (
                      <div className="max-w-md">
                        <div className="space-y-6">
                          <div>
                            <label htmlFor="preAlertTime" className="block text-sm font-medium text-gray-700 mb-2">
                              Pre-alert Time
                            </label>
                            <select
                              id="preAlertTime"
                              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                              value={preAlertTime}
                              onChange={(e) => setPreAlertTime(e.target.value)}
                            >
                              <option value="5">5 minutes before</option>
                              <option value="10">10 minutes before</option>
                              <option value="15">15 minutes before</option>
                              <option value="30">30 minutes before</option>
                            </select>
                          </div>

                          <div>
                            <label htmlFor="ringtone" className="block text-sm font-medium text-gray-700 mb-2">
                              Ringtone
                            </label>
                            <select
                              id="ringtone"
                              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                              value={ringtone}
                              onChange={(e) => setRingtone(e.target.value)}
                            >
                              <option value="">Select a ringtone</option>
                              <option value="default">Default</option>
                              <option value="gentle">Gentle Bell</option>
                              <option value="chime">Soft Chime</option>
                              <option value="alert">Alert Tone</option>
                            </select>
                          </div>

                          <div className="flex items-center justify-between py-2">
                            <label className="text-sm font-medium text-gray-700">Enable Voice Alerts</label>
                            <div
                              onClick={() => setVoiceAlerts(!voiceAlerts)}
                              className={`relative inline-block w-12 h-6 transition duration-200 ease-in-out ${
                                voiceAlerts ? "bg-blue-500" : "bg-gray-300"
                              } rounded-full cursor-pointer`}
                            >
                              <span
                                className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                                  voiceAlerts ? "translate-x-6" : ""
                                }`}
                              ></span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="mt-8 pt-6 border-t border-gray-100">
                      <button
                        className="bg-blue-600 text-white py-3 px-6 rounded-lg font-medium shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                        onClick={() => alert("Notification settings saved!")}
                      >
                        Save Settings
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
       
      </Layout>
    </div>
  );
};

export default Settings;