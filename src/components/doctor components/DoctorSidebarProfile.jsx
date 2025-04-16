import React, { useEffect, useState } from "react";
import axios from "axios";
import doctorImage from "/src/assets/images/doctor images/doc.jpg"; // Replace with the actual path

const SidebarProfile = () => {
  const [doctorDetails, setDoctorDetails] = useState({
    name: "",
    employeeID: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDoctorDetails = async () => {
      try {
        const token = localStorage.getItem("token"); // Fetch the token from storage
        console.log(token);
        const response = await axios.get("http://localhost:5000/api/employees/profile", {
          headers: {
            Authorization: `Bearer ${token}`, // Send the token in headers
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
    return <p className="text-center text-gray-500">Loading...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  return (
    <div className="flex flex-col items-center space-y-2">
      {/* Profile Image */}
      <div className="relative">
        <img
          src={doctorImage} // Replace with dynamic doctor image if available
          alt="Doctor Profile"
          className="rounded-full w-24 h-24 mt-5 object-cover border-4 border-white shadow-lg"
        />
      </div>
      {/* Name and Degree */}
      <div className="text-center">
        <h2 className="text-lg font-bold text-gray-800">{doctorDetails.name}</h2>
        <p className="text-sm font-bold text-gray-600">Doctor ID: {doctorDetails.employeeID}</p>

      </div>
    </div>
  );
};

export default SidebarProfile;
