import React, { useState } from "react";
import Layout from "../../components/patient components/Layout";
import referfrnd from "/src/assets/images/patient images/referfrnd.png";
import axios from "axios"; // Make sure to install axios
import config from '../../config';
const API_URL = config.API_URL;

const ReferFriend = () => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [activeTab, setActiveTab] = useState("friends");

  const friendsData = [
    { name: "John Doe", date: "1 Sep,2024", status: "Accepted", validity: "30 Sep,2024", referralCode: "FRIEND123" },
    { name: "Jane Smith", date: "2 Sep,2024", status: "Pending", validity: "1 Oct,2024", referralCode: "FRIEND456" },
  ];

  const postsData = [
    { name: "Post A", date: "25 Aug,2024", referralCode: "POST123" },
    { name: "Post B", date: "26 Aug,2024", referralCode: "POST456" },
  ];

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
  };

  const validateForm = () => {
    const errors = {};
    if (!name) {
      errors.name = "Name is required";
    } else if (!/^[a-zA-Z\s]+$/.test(name)) {
      errors.name = "Name should only contain letters and spaces";
    }
    if (!phone) {
      errors.phone = "Phone number is required";
    }
    //  else if (!/^\d{10}$/.test(phone)) {
    //   errors.phone = "Phone number should be 10 digits";
    // }
    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await axios.post(
          `${API_URL}/api/patient/referFriend`,
          {
            friendName: name, // Use "name" state variable here
            friendPhone: phone, // Use "phone" state variable here
          },
          {
            headers: {
              Authorization: `Bearer ${token}`, // Ensure JWT token is added for authentication
              'Content-Type': 'application/json',
            },
          }
        );
        setSuccessMessage("Referral sent successfully!");
        setErrorMessage("");
        console.log(response.data); // Handle success response
      } catch (error) {
        console.error("Error response:", error.response.data); // Log full error response
        setErrorMessage("Failed to send referral. Try again.");
        setSuccessMessage("");
      }
    }
  };
  
  return (
    <Layout>
      <div className="space-y-0 p-6">
        <div className="flex flex-col lg:flex-row justify-center max-h-screen p-4 space-y-6 lg:space-y-0 lg:space-x-12 mt-6">
          <div className="lg:w-1/3">
            <img src={referfrnd} alt="Refer a Friend" className="w-full h-auto mx-auto lg:mx-0" />
          </div>
          <div className="lg:w-1/3">
            <h1 className="text-2xl font-bold mb-4">Refer a Friend</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full p-2 border rounded ${errors.name ? "border-red-500" : "border-gray-300"}`}
                  placeholder="Enter your friend's name"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={`w-full p-2 border rounded ${errors.phone ? "border-red-500" : "border-gray-300"}`}
                  placeholder="Enter your friend's phone number"
                />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>
              {successMessage && <p className="text-green-500 text-sm">{successMessage}</p>}
              {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}
              <button
                type="submit"
                className="w-full py-2 px-4 bg-blue-500 text-white font-medium rounded-md hover:bg-blue-600"
              >
                Refer
              </button>
            </form>
          </div>
        </div>

        <div className="mx-auto max-w-4xl pl-3">
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => handleTabSwitch("friends")}
              className={`px-4 py-2 rounded-md ${activeTab === "friends" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"} hover:bg-blue-400 hover:text-white`}
            >
              Referred Friends
            </button>
            <button
              onClick={() => handleTabSwitch("posts")}
              className={`px-4 py-2 rounded-md ${activeTab === "posts" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"} hover:bg-blue-400 hover:text-white`}
            >
              Referred Posts
            </button>
          </div>

          {activeTab === "friends" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Referred Friends</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead>
                    <tr>
                      <th className="py-2 px-4 border">Name</th>
                      <th className="py-2 px-4 border">Date</th>
                      <th className="py-2 px-4 border">Status</th>
                      <th className="py-2 px-4 border">Validity</th>
                      <th className="py-2 px-4 border">Referral Code</th>
                      <th className="py-2 px-4 border">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {friendsData.map((friend, index) => (
                      <tr key={index}>
                        <td className="py-2 px-4 border">{friend.name}</td>
                        <td className="py-2 px-4 border">{friend.date}</td>
                        <td className={`py-2 px-4 border ${friend.status === "Accepted" ? "text-green-500" : "text-red-500"}`}>{friend.status}</td>
                        <td className="py-2 px-4 border">{friend.validity}</td>
                        <td className="py-2 px-4 border">{friend.referralCode}</td>
                        <td className="py-2 px-4 border">
                          <button className="bg-blue-500 text-white px-4 py-2 rounded-md">Redeem</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "posts" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Refer Posts</h2>
              <table className="min-w-full bg-white">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border">Name</th>
                    <th className="py-2 px-4 border">Date</th>
                    <th className="py-2 px-4 border">Referral Code</th>
                    <th className="py-2 px-4 border">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {postsData.map((post, index) => (
                    <tr key={index}>
                      <td className="py-2 px-4 border">{post.name}</td>
                      <td className="py-2 px-4 border">{post.date}</td>
                      <td className="py-2 px-4 border">{post.referralCode}</td>
                      <td className="py-2 px-4 border">
                        <button className="bg-blue-500 text-white px-4 py-2 rounded">Redeem</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ReferFriend;
