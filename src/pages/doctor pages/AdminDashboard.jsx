import React, { useState, useEffect } from 'react';
import {
  FaHome, FaChartLine, FaFileAlt, FaCog, FaUserMd, FaQuestionCircle,
  FaSignOutAlt, FaCalendarAlt, FaBell, FaUserCircle, FaBoxOpen, FaVideo,
  FaChevronLeft, FaChevronRight, FaBars, FaTruckLoading, FaCoins
} from 'react-icons/fa';
import MainContentComponent from '/src/components/calllog components/MainContentComponent.jsx';
import AddDoctor from './AddDoctor';
import Appointments from './Appointments';
import DashboardStatus from '../../components/calllog components/DashboardStatus';
import '/src/css/AdminDashboard.css';
import config from '../../config';

const AdminDashboard = () => {
  const [activeNav, setActiveNav] = useState('home');
  const [activeTab, setActiveTab] = useState('all');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [dashboardData, setDashboardData] = useState({
    totalCallsScheduled: 0,
    totalCallsCompleted: 0,
    callCompletionPercentage: 0,
    totalFollowUpCallsScheduled: 0,
    totalFollowUpCallsCompleted: 0,
    followUpCallCompletionPercentage: 0,
    totalQuieresCallsScheduled: 0,
    totalQuieresCallsCompleted: 0,
    quieresCallCompletionPercentage: 0,
    totalPaymentFollowUpsScheduled: 0,
    totalPaymentFollowUpsCompleted: 0,
    paymentFollowUpCompletionPercentage: 0,
    paymentFollowUpFCR: 0,
    paymentFollowUpConversion: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const API_URL = config.API_URL;

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setIsSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    fetchDashboardData();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  const handleNavClick = (navItem) => {
    setActiveNav(navItem);
    setActiveTab('all');
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const renderMainContent = () => {
    switch (activeNav) {
      case 'home':
        return <MainContentComponent activeTab={activeTab} handleTabClick={handleTabClick} />;
      case 'add-doctor':
        return <AddDoctor />;
      case 'appointments':
        return <Appointments />;
      default:
        return <div className="default-content">Select an option from the sidebar</div>;
    }
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar (commented in your code, still here if needed) */}

      <div className="main-content">
        {/* Removed header bar with date + notifications */}

        {/* <DashboardStatus dashboardData={dashboardData} /> */}

        {renderMainContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;
