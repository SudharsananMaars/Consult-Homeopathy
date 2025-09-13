// DoctorSettings.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import config from '../../config';
const API_URL = config.API_URL;

const DoctorSettings = () => {
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // useEffect(() => {
  //   // Fetch the current settings when component mounts
  //   axios
  //     .get(`${API_URL}/api/doctor/getsettings`, {
  //       headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
  //     })
  //     .then((response) => {
  //       setSelectedPlatform(response.data.videoPlatform);
  //     })
  //     .catch((error) => {
  //       console.error("Error fetching settings:", error);
  //       setError("Unable to fetch settings. Please try again.");
  //     });
  // }, []);

  const handlePlatformChange = (platform) => {
    setSelectedPlatform(platform);
    setError(null);
    setSuccessMessage(null);
  };

  const updateSettings = () => {
    axios
      .put(
        `${API_URL}/api/doctor/updatesettings`, // Use PUT method for updating settings
        { videoPlatform: selectedPlatform },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
        }
      )
      .then((response) => {
        setSuccessMessage("Settings saved successfully!");
      })
      .catch((error) => {
        console.error("Error updating settings:", error.response ? error.response.data : error);
        // If error.response exists, it means the backend provided an error response
        if (error.response && error.response.data) {
          setError(error.response.data.error || "Failed to save settings. Please try again.");
        } else {
          setError("Failed to save settings. Please check your network or try again later.");
        }
      });
  };
  

  const handleSaveSettings = () => {
    if (!selectedPlatform) {
      setError("Please select a video platform.");
      return;
    }

    updateSettings(); // Save the selected platform to the backend

    // Redirect to the OAuth authorization endpoint for the selected platform
    if (selectedPlatform === "GoogleMeet") {
      window.location.href = `${API_URL}/google/authorize`;
    } else if (selectedPlatform === "Zoom") {
      window.location.href = `${API_URL}/zoom/authorize`;
    }
  };

  return (
    <div className="p-8 bg-gray-50">
      <div className="bg-white rounded-lg shadow-sm p-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-semibold mb-6 text-gray-800">Choose Your Video Platform</h1>
        
        <div className="space-y-6">
          {/* Platform Selection */}
          <div>
            <h2 className="text-lg font-medium text-gray-700 mb-4">Select Platform</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => handlePlatformChange("GoogleMeet")}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedPlatform === "GoogleMeet"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 bg-gray-50 text-gray-700 hover:border-blue-300 hover:bg-blue-50"
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  <span className="font-medium">Google Meet</span>
                </div>
              </button>
              
              <button
                onClick={() => handlePlatformChange("Zoom")}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedPlatform === "Zoom"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 bg-gray-50 text-gray-700 hover:border-blue-300 hover:bg-blue-50"
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  <span className="font-medium">Zoom</span>
                </div>
              </button>
            </div>
          </div>

          {/* Selected Platform Display */}
          {selectedPlatform && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="text-lg font-medium text-blue-800 mb-2">
                Selected Platform: {selectedPlatform}
              </h3>
              <p className="text-sm text-blue-600 mb-4">
                You will be redirected to authorize your {selectedPlatform} account after saving.
              </p>
            </div>
          )}

          {/* Error and Success Messages */}
          {error && (
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          )}
          
          {successMessage && (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-green-700 font-medium">{successMessage}</p>
            </div>
          )}

          {/* Save Button */}
          {selectedPlatform && (
            <div className="flex justify-center pt-4">
              <button
                onClick={handleSaveSettings}
                className="bg-indigo-600 text-white py-3 px-8 rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                Save Settings & Authorize
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
  
};

export default DoctorSettings;