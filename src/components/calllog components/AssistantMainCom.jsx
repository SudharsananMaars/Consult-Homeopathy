import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import PatientsTable from './PatientsTable';
import WorkTable from './WorkTable';
import StatusCompleteTable from './StatusCompleted';
import InProgressTable from './InProgressTable';
import LostTable from './LostTable';
import AttemptBucket from './AttemptBucket';
import { FaCalendarAlt, FaChevronDown } from 'react-icons/fa';
import config from '../../config';

const AssistantMainCom = () => {
  const [dashboardData, setDashboardData] = useState({
    totalPatients: 0,
    chronicPatients: 0,
    acutePatients: 0,
    newPatientsToday: 0,
    pendingCallsFromApp: 0,
    pendingMedicalRecords: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const API_URL = config.API_URL;

  const { tabType } = useParams();
  const navigate = useNavigate();

  const defaultTab = 'all';
  const activeTab = tabType || defaultTab;

  const handleTabClick = (tab) => {
    navigate(`/doctor-dashboard/${tab}`);
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${API_URL}/api/log/dashboard`);
        setDashboardData(response.data);
        setIsLoading(false);
      } catch (error) {
        setError('Failed to fetch dashboard data. Please try again later.');
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const renderPatientsTable = () => {
    switch (activeTab) {
      case 'all':
        return <PatientsTable />;
      case 'myAllocation':
        return <WorkTable />;
      case 'lost':
        return <LostTable />;
      case 'attemptBucket':
        return <AttemptBucket />;
      default:
        return <div className="p-4 text-center text-gray-500">No data available</div>;
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-300"></div>
    </div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="main-content bg-gray-50 p-8 rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Status</h2>
      
      {/* Status Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
  {[
    { title: 'Total Patients', value: dashboardData.totalPatients, color: 'border-l-4 border-blue-500 text-blue-600' },
    { title: 'Patients Registered Today', value: dashboardData.newPatientsToday, color: 'border-l-4 border-orange-500 text-orange-600' },
    { title: 'Call Not Made Yet', value: dashboardData.pendingCallsFromApp, color: 'border-l-4 border-green-500 text-green-600' },
    { title: 'Pending Medical Records', value: dashboardData.pendingMedicalRecords, color: 'border-l-4 border-red-500 text-red-600' },
  ].map(({ title, value, color }) => (
    <div
      key={title}
      className={`bg-white rounded-lg shadow p-4 flex flex-col h-28 justify-center ${color}`}
    >
      <span className="text-base font-semibold text-gray-500 mb-2">{title}</span>
      <span className={`text-xl font-bold`}>{value}</span>
    </div>
  ))}
</div>


      {/* Tabs */}
      <div className="mb-6">
        {/* Mobile View - Dropdown */}
        <div className="relative md:hidden">
          <button
            onClick={toggleDropdown}
            className="w-full bg-white border border-gray-300 rounded-md py-2 px-4 flex items-center justify-between text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-300"
          >
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            <FaChevronDown className={`ml-2 transition-transform duration-200 ${isDropdownOpen ? 'transform rotate-180' : ''}`} />
          </button>
          {isDropdownOpen && (
            <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-1">
              {['all', 'myAllocation', 'lost', 'attemptBucket'].map((tab) => (
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
                  {tab === 'all' ? 'All'
                    : tab === 'myAllocation' ? 'My Allocation'
                    : tab === 'lost' ? 'Lost'
                    : 'Attempt Bucket'}
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Desktop View - Tabs */}
        <div className="hidden md:flex space-x-2 bg-white p-2 rounded-lg">
          {['all', 'myAllocation', 'lost', 'attemptBucket'].map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabClick(tab)}
              className={`flex-1 py-3 px-6 text-sm font-medium rounded-md border border-gray-300 text-center transition-colors duration-300 ${
                activeTab === tab
                  ? 'bg-indigo-400 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100 hover:shadow'
              }`}
            >
              {tab === 'all' ? 'All'
                : tab === 'myAllocation' ? 'My Allocation'
                : tab === 'lost' ? 'Lost'
                : 'Attempt Bucket'}
            </button>
          ))}
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
