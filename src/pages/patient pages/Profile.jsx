import React, { useState } from "react";
import Layout from "../../components/patient components/Layout";

const Profile = () => {
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [dob, setDob] = useState("");
  const [address, setAddress] = useState("");
  const [locality, setLocality] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [pincode, setPincode] = useState("");
  const [gender, setGender] = useState("");
  const [bgrp, setBgrp] = useState("");
  const [isEditing, setIsEditing] = useState(true);

  const states = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
    "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands",
    "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Lakshadweep", "Delhi", "Puducherry", "Ladakh", "Jammu and Kashmir"
  ];

  const countries = ["India", "United States", "United Kingdom", "Canada", "Australia"];

  const handlePhotoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  const handleSubmit = () =>{
    window.alert("Profile has been Updated!");

    // (Optional) You can also log the saved values to verify
    setIsEditing(false);
  };

  const handleEditClick = () => {
    setIsEditing(true); // Enable edit mode
  };

  return (
    <Layout>
      <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      <div className="max-w-2/3 mx-auto w-full p-6 shadow bg-white"> 
        <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6 mb-6">
          {/* Profile Photo */} 
          <div className="flex-shrink-0 w-24 h-24 rounded-full border-3 border-gray-100 overflow-hidden bg-gray-200">
            {profilePhoto ? (
              <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover rounded-full" />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">No Photo</div>
            )}
          </div>

          {/* Upload Photo Section */}
          <div className="flex flex-col space-y-2 space-x-7">
            <label className="text-sm font-medium text-gray-700">Pick a photo from your files</label>
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
                id="file-upload"
                disabled={!isEditing}
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer inline-block py-2 px-4 bg-blue-500 text-white text-sm font-medium rounded-md hover:bg-blue-600"
              >
                Add Photo   
              </label>
            </div>
          </div>

          <div className="w-1/2 flex justify-end items-end">
          <button 
          className="bg-blue-500 hover:bg-blue-600 border-2 p-2 px-4 relative rounded-md text-white font-medium"
          onClick={handleEditClick}
          disabled={isEditing}
          >
            Edit
          </button>
          </div>
        </div>                  

        {/* Responsive Row with 3 inputs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 mb-6">
        <div className="flex flex-col space-y-2 w-full md:w-auto">
            <label className="text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
              disabled={!isEditing}
            />
          </div>
          <div className="flex flex-col space-y-2 w-full md:w-auto">
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
              disabled={!isEditing}
            />
          </div>
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700">Mobile Number</label>
            <input
              type="text"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
              disabled={!isEditing}
            />
          </div>
          
        </div>

        {/* Responsive Row with 3 inputs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 mb-6">
        <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700">Date of Birth</label>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
              disabled={!isEditing}
           />
          </div>
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700">Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
              disabled={!isEditing}
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="flex flex-col space-y-2 w-full md:w-auto">
          <label className="text-sm font-medium text-gray-700">Blood Group</label>
          <select
            value={bgrp}
            onChange={(e) => setBgrp(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
            disabled={!isEditing}
          >
            <option value="">Select Blood Group</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
          </select>
        </div>
         
          
        </div>

        {/* Responsive Row with 3 inputs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 mb-6">
        <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700">Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
              disabled={!isEditing}
            />
          </div>
        <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700">Locality</label>
            <input
              type="text"
              value={locality}
              onChange={(e) => setLocality(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
              disabled={!isEditing}
            />
          </div>
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700">City</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
              disabled={!isEditing}
            />
         </div>
         </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 mb-6">
          
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700">State</label>
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
              disabled={!isEditing}
            >
              <option value="">Select State</option>
              {states.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700">Country</label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
              disabled={!isEditing}
            >
              <option value="">Select Country</option>
              {countries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700">Pincode</label>
            <input
              type="text"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
              disabled={!isEditing}
            />
          </div>
          </div>
          <div className="flex justify-center items-center h-full mt-9">
            <button 
                onClick={handleSubmit}
                className="bg-blue-500 hover:bg-blue-600 border-2 p-2 px-4 rounded-md text-white font-medium"
                disabled={!isEditing}
            >
                Save Changes
            </button>
          </div>
        

        {/* Blood Group Section */}
        
      </div>
    </div>
    </Layout>
  );
};

export default Profile;
