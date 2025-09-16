import React, { useState, useEffect } from 'react';
import {
  FaHome, FaChartLine, FaFileAlt, FaCog, FaUserMd, FaQuestionCircle,
  FaSignOutAlt, FaCalendarAlt, FaBell, FaUserCircle, FaBoxOpen, FaVideo,
  FaChevronLeft, FaChevronRight, FaBars
} from 'react-icons/fa';
import AssistantMainCom from '/src/components/calllog components/AssistantMainCom.jsx';
import AddDoctor from './AddDoctor';
import Appointments from './Appointments';
import '/src/css/AdminDashboard.css';
import { useParams } from 'react-router-dom';

const AssistantDoctorDashboard = () => {
  const [activeNav, setActiveNav] = useState('home');
  const [activeTab, setActiveTab] = useState('all');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const { tabType } = useParams();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setIsSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  const today = new Date();
  const options = { day: 'numeric', month: 'long', year: 'numeric' };
  const date = today.toLocaleDateString('en-US', options);
 
  const renderMainContent = () => {
    switch (activeNav) {
      case 'home':
        return <AssistantMainCom activeTab={tabType || 'all'} handleTabClick={handleTabClick} />;
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
      <div className="main-content">
        {renderMainContent()}
      </div>
    </div>
   
  );
};

export default AssistantDoctorDashboard;