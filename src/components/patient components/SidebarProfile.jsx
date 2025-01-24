import React from "react";
import doctor from "/src/assets/images/patient images/doctor.jpeg";
const SidebarProfile = () => {
  return (
    <div className="flex flex-col items-center space-y-2 mb-6 p-3">
      {/* Profile Image */}
      <div className="relative">
        <img
          src={doctor} // Replace with the actual image path
          alt="Doctor Profile"
          className="rounded-full w-28 h-28 object-cover border-4 border-white shadow-lg"
        />
        {/* Verification Badge */}
        
      </div>
      {/* Name and Degree */}
      <div className="text-center">
        <h2 className="text-lg font-bold text-gray-800">Alice Smith</h2>
        <p className="text-sm text-gray-600">Patient ID : P001</p>
        <p className="text-sm text-gray-600">Female : 28 yrs</p>
      </div>
      {/* Specialization */}
    </div>
  );
};

export default SidebarProfile;
