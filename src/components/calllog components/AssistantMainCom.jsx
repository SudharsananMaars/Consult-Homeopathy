import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import PatientsTable from "./PatientsTable";
import WorkTable from "./WorkTable";
import ExistingTable from "./ExistingTable";
import StatusCompleteTable from "./StatusCompleted";
import InProgressTable from "./InProgressTable";
import LostTable from "./LostTable";
import AttemptBucket from "./AttemptBucket";
import { FaCalendarAlt, FaChevronDown } from "react-icons/fa";
import config from "../../config";

const AssistantMainCom = () => {
  const [dashboardData, setDashboardData] = useState({
    totalPatients: 0,
    chronicPatients: 0,
    acutePatients: 0,
    newPatientsToday: 0,
    pendingCallsFromApp: 0,
    pendingMedicalRecords: 0,
    // API data
    activePatients: 0,
    newPatients: 0,
    existingPatients: 0,
    callsMade: 28, // Static data for second card
    newCalls: 8, // Static data
    existingCalls: 20, // Static data
    totalLost: 0,
    newLost: 0,
    existingLost: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const API_URL = config.API_URL;

  const { tabType } = useParams();
  const navigate = useNavigate();

  const defaultTab = "all";
  const activeTab = tabType || defaultTab;

  const handleTabClick = (tab) => {
    navigate(`/doctor-dashboard/${tab}`);
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);

        // Fetch data from the classified-total-count API
        const response = await axios.get(
          `${API_URL}/api/patient/classified-total-count`
        );

        // Update dashboard data with API response
        setDashboardData((prevData) => ({
          ...prevData,
          activePatients: response.data.totalPatients || 0,
          newPatients: response.data.newPatients || 0,
          existingPatients: response.data.existingPatients || 0,
        }));

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError("Failed to fetch dashboard data. Please try again later.");
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [API_URL]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);

        // Fetch data from the classified-total-count API
        const response = await axios.get(
          `${API_URL}/api/patient/sort-total-lost`
        );

        // Update dashboard data with API response
        setDashboardData((prevData) => ({
          ...prevData,
          totalLost: response.data.totalNotInterested || 0,
          newLost: response.data.newPatientCount || 0,
          existingLost: response.data.existingPatientCount || 0,
        }));

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError("Failed to fetch dashboard data. Please try again later.");
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [API_URL]);

  // Function to calculate bar graph representation
  const calculateBars = (value, total) => {
    if (total === 0) return 0;
    return Math.round((value / total) * 10); // Scale to 10 bars max
  };

  const renderPatientsTable = () => {
    switch (activeTab) {
      case "all":
        return <PatientsTable />;
      case "myAllocation":
        return <WorkTable />;
      case "existing":
        return <ExistingTable />;
      case "lost":
        return <LostTable />;
      case "attemptBucket":
        return <AttemptBucket />;
      default:
        return (
          <div className="p-4 text-center text-gray-500">No data available</div>
        );
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-300"></div>
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="main-content bg-gray-50 p-8 rounded-lg shadow-lg">
      <div className="flex items-center relative mb-6">
  {/* Centered Heading */}
  <h2 className="text-3xl font-bold text-gray-800 mx-auto">
    Consult Homeopathy - Patient Status Board
  </h2>

  {/* Right-Aligned Button */}
  <button
    onClick={() => navigate("/dashboard")}
    className="absolute right-0 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
  >
    Back to Dashboard
  </button>
</div>


      {/* Status Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 px-14">
        {/* Active Patients Card */}
        <div className="bg-white rounded-lg shadow flex border-l-8 border-blue-500">
          {/* Left Section */}
          <div className="flex flex-col justify-center items-start w-1/3 p-6 border-r border-gray-200">
            <span className="text-lg text-gray-700 font-semibold">
              Active Patients
            </span>
            <span className="text-3xl font-bold text-blue-600">
              {dashboardData.activePatients}
            </span>
          </div>

          {/* Right Section */}
          <div className="flex flex-col justify-center w-2/3 p-4 space-y-4">
            {/* New */}
            <div className="flex items-center justify-start text-sm gap-20">
              <span className="flex items-center gap-2">
                <span className="text-green-500 font-semibold text-lg">↑</span>
                <span className="text-lg text-black-500 font-semibold">
                  New
                </span>
              </span>
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  {[...Array(10)].map((_, i) => (
                    <div
                      key={i}
                      className={`h-5 w-3 rounded-sm ${
                        i <
                        calculateBars(
                          dashboardData.newPatients,
                          dashboardData.activePatients
                        )
                          ? "bg-cyan-400"
                          : "bg-cyan-100"
                      }`}
                    ></div>
                  ))}
                </div>
                <span className="text-gray-700 font-semibold">
                  {dashboardData.newPatients}
                </span>
              </div>
            </div>

            {/* Existing */}
            <div className="flex items-center justify-start text-sm gap-12">
              <span className="flex items-center gap-2">
                <span className="text-red-500 font-semibold text-lg">↓</span>
                <span className="text-lg text-black-500 font-semibold">
                  Existing
                </span>
              </span>
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  {[...Array(10)].map((_, i) => (
                    <div
                      key={i}
                      className={`h-5 w-3 rounded-sm ${
                        i <
                        calculateBars(
                          dashboardData.existingPatients,
                          dashboardData.activePatients
                        )
                          ? "bg-orange-400"
                          : "bg-orange-100"
                      }`}
                    ></div>
                  ))}
                </div>
                <span className="text-gray-700 font-semibold">
                  {dashboardData.existingPatients}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Calls Made Card */}
        <div className="bg-white rounded-lg shadow flex border-l-8 border-green-500">
          {/* Left Section */}
          <div className="flex flex-col justify-center items-start w-1/3 p-6 border-r border-gray-200">
            <span className="text-lg text-black-500 font-semibold">
              Calls Made
            </span>
            <span className="text-3xl font-bold text-green-600">
              {dashboardData.callsMade}
            </span>
          </div>

          {/* Right Section */}
          <div className="flex flex-col justify-center w-2/3 p-4 space-y-4">
            {/* New */}
            <div className="flex items-center justify-start text-sm gap-20">
              <span className="flex items-center gap-2">
                <span className="text-green-500 font-semibold text-lg">↑</span>
                <span className="text-lg text-black-500 font-semibold">
                  New
                </span>
              </span>
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  {[...Array(10)].map((_, i) => (
                    <div
                      key={i}
                      className={`h-4 w-3 rounded-sm ${
                        i <
                        calculateBars(
                          dashboardData.newCalls,
                          dashboardData.callsMade
                        )
                          ? "bg-cyan-400"
                          : "bg-cyan-100"
                      }`}
                    ></div>
                  ))}
                </div>
                <span className="text-gray-700 font-semibold">
                  {dashboardData.newCalls}
                </span>
              </div>
            </div>

            {/* Existing */}
            <div className="flex items-center justify-start text-sm gap-12">
              <span className="flex items-center gap-2">
                <span className="text-red-500 font-semibold text-lg">↓</span>
                <span className="text-lg text-black-500 font-semibold">
                  Existing
                </span>
              </span>
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  {[...Array(10)].map((_, i) => (
                    <div
                      key={i}
                      className={`h-4 w-3 rounded-sm ${
                        i <
                        calculateBars(
                          dashboardData.existingCalls,
                          dashboardData.callsMade
                        )
                          ? "bg-orange-400"
                          : "bg-orange-100"
                      }`}
                    ></div>
                  ))}
                </div>
                <span className="text-gray-700 font-semibold">
                  {dashboardData.existingCalls}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Third Card Placeholder */}
        <div className="bg-white rounded-lg shadow flex border-l-8 border-purple-500">
          {/* Left Section */}
          <div className="flex flex-col justify-center items-start w-1/3 p-6 border-r border-gray-200">
            <span className="text-lg text-gray-700 font-semibold">
              Total Lost
            </span>
            <span className="text-3xl font-bold text-purple-600">
              {dashboardData.totalLost}
            </span>
          </div>

          {/* Right Section (Copied Graph Style) */}
          <div className="flex flex-col justify-center w-2/3 p-4 space-y-4">
            {/* New */}
            <div className="flex items-center justify-start text-sm gap-20">
              <span className="flex items-center gap-2">
                <span className="text-green-500 font-semibold text-lg">↑</span>
                <span className="text-lg text-black-500 font-semibold">
                  New
                </span>
              </span>
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  {[...Array(10)].map((_, i) => (
                    <div
                      key={i}
                      className={`h-4 w-3 rounded-sm ${
                        i <
                        calculateBars(
                          dashboardData.newLost,
                          dashboardData.totalLost
                        )
                          ? "bg-cyan-400"
                          : "bg-cyan-100"
                      }`}
                    ></div>
                  ))}
                </div>
                <span className="text-gray-700 font-semibold">
                  {dashboardData.newLost}
                </span>
              </div>
            </div>

            {/* Existing */}
            <div className="flex items-center justify-start text-sm gap-14">
              <span className="flex items-center gap-2">
                <span className="text-red-500 font-semibold text-lg">↓</span>
                <span className="text-lg text-black-500 font-semibold">
                  Existing
                </span>
              </span>
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  {[...Array(10)].map((_, i) => (
                    <div
                      key={i}
                      className={`h-4 w-3 rounded-sm ${
                        i <
                        calculateBars(
                          dashboardData.existingLost,
                          dashboardData.totalLost
                        )
                          ? "bg-orange-400"
                          : "bg-orange-100"
                      }`}
                    ></div>
                  ))}
                </div>
                <span className="text-gray-700 font-semibold">
                  {dashboardData.existingLost}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        {/* Mobile View - Dropdown */}
        <div className="relative md:hidden">
          <button
            onClick={toggleDropdown}
            className="w-full bg-white border border-gray-300 rounded-md py-2 px-4 flex items-center justify-between text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-300"
          >
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            <FaChevronDown
              className={`ml-2 transition-transform duration-200 ${
                isDropdownOpen ? "transform rotate-180" : ""
              }`}
            />
          </button>
          {isDropdownOpen && (
            <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-1">
              {["all", "myAllocation", "lost", "attemptBucket"].map((tab) => (
                <a
                  key={tab}
                  href="#"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={(e) => {
                    e.preventDefault();
                    handleTabClick(tab);
                    toggleDropdown();
                  }}
                >
                  {tab === "all"
                    ? "All"
                    : tab === "myAllocation"
                    ? "My Allocation"
                    : tab === "lost"
                    ? "Lost"
                    : "Attempt Bucket"}
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Desktop View - Tabs */}
        <div className="hidden md:flex space-x-2 bg-white p-2 rounded-lg">
          {["all", "myAllocation", "existing", "lost", "attemptBucket"].map(
            (tab) => (
              <button
                key={tab}
                onClick={() => handleTabClick(tab)}
                className={`flex-1 py-3 px-6 text-sm font-medium rounded-md border border-gray-300 text-center transition-colors duration-300 ${
                  activeTab === tab
                    ? "bg-blue-400 text-white shadow-lg"
                    : "bg-white text-gray-700 hover:bg-gray-100 hover:shadow"
                }`}
              >
                {tab === "all"
                  ? "All"
                  : tab === "myAllocation"
                  ? "New"
                  : tab === "existing"
                  ? "Existing"
                  : tab === "lost"
                  ? "Lost"
                  : "Attempt Bucket"}
              </button>
            )
          )}
        </div>
      </div>

      {/* Table Content */}
      <div className="bg-white rounded-lg shadow p-6">
        {renderPatientsTable()}
      </div>
    </div>
  );
};

export default AssistantMainCom;
