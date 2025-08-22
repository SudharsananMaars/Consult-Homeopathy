import React, { useEffect, useState } from "react";
import axios from "axios";
import defaultProfile from "/src/assets/images/patient images/doctor.jpeg";
import config from '../../config';
const API_URL = config.API_URL;

const SidebarProfile = () => {
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("No token found. Please log in again.");
          setLoading(false);
          return;
        }

        const response = await axios.get(`${API_URL}/api/patient/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setPatient(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch patient profile:", err);
        setError("Unable to fetch patient details");
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center space-y-3 animate-pulse">
        <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
        <div className="w-24 h-4 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center space-y-2">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
          <span className="text-gray-400 text-xs">Error</span>
        </div>
        <p className="text-center text-red-500 text-sm">{error}</p>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex flex-col items-center space-y-2">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
          <span className="text-gray-400 text-xs">Loading</span>
        </div>
      </div>
    );
  }

  const { name, age, gender, profilePhoto } = patient;

  return (
    <div className="flex flex-col items-center space-y-3">
      {/* Profile Image - Matching doctor sidebar size */}
      <div className="relative">
        <img
          src={profilePhoto || defaultProfile}
          alt="Patient Profile"
          className="w-16 h-16 rounded-full object-cover border-3 border-white shadow-lg"
        />
      </div>
      
      {/* Patient Name - Centered */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-800">
          {name || "Patient"}
        </h3>
        {/* Age and gender info below name */}
        {(age || gender) && (
          <p className="text-sm text-gray-600 mt-1">
            {gender || "N/A"} {age ? `• ${age} yrs` : ""}
          </p>
        )}
      </div>
    </div>
  );
};

export default SidebarProfile;