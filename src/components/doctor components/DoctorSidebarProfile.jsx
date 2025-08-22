import React, { useEffect, useState } from "react";
import axios from "axios";
import defaultDoctorImage from "/src/assets/images/doctor images/doc.jpg";
import config from "../../config";

const API_URL = config.API_URL;

const SidebarProfile = () => {
  const [doctorDetails, setDoctorDetails] = useState({
    name: "",
    profilePhoto: "",
    specialization: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDoctorDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API_URL}/api/doctor/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setDoctorDetails(response.data);
        setLoading(false);
      } catch (err) {
        setError("Unable to fetch doctor details");
        setLoading(false);
      }
    };

    fetchDoctorDetails();
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

  return (
    <div className="flex flex-col items-center space-y-3">
      {/* Profile Image - Larger and centered */}
      <div className="relative">
        <img
          src={doctorDetails.profilePhoto || defaultDoctorImage}
          alt="Doctor Profile"
          className="w-16 h-16 rounded-full object-cover border-3 border-white shadow-lg"
        />
      </div>
      
      {/* Doctor Name - Centered */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-800">
           {doctorDetails.name || "Me"}
        </h3>
      </div>
    </div>
  );
};

export default SidebarProfile;