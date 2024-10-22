import React, { useState, useEffect } from 'react';
import {
  FaHome, FaChartLine, FaFileAlt, FaCog, FaUserMd, FaQuestionCircle,
  FaSignOutAlt, FaCalendarAlt, FaBell, FaUserCircle, FaBoxOpen, FaVideo,
  FaChevronLeft, FaChevronRight, FaChevronDown, FaBars, FaSearch, FaCalendar
} from 'react-icons/fa';
import WorkTable from '/src/components/calllog components/WorkTable.jsx';
import AddDoctor from './AddDoctor';
import Appointments from './Appointments';
import StatusCompleteTable from '/src/components/calllog components/StatusCompleted.jsx';

const AssistantDoctorDashboard = () => {
  const [activeNav, setActiveNav] = useState('home');
  const [activeTab, setActiveTab] = useState('all');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    totalPatients: 9,
    chronicPatients: 0,
    acutePatients: 0,
    newPatientsToday: 0,
    pendingCallsFromApp: 9,
    pendingMedicalRecords: 9
  });

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

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const today = new Date();
  const options = { day: 'numeric', month: 'long', year: 'numeric' };
  const date = today.toLocaleDateString('en-US', options);

  const renderMainContent = () => {
    switch (activeNav) {
      case 'home':
        return <WorkTable />;
      case 'add-doctor':
        return <AddDoctor />;
      case 'appointments':
        return <Appointments />;
      default:
        return <div className="default-content">Select an option from the sidebar</div>;
    }
  };

  const renderPatientsTable = () => {
    switch (activeTab) {
      case 'all':
        return <WorkTable />;
      case 'notCalledYet':
        return <WorkTable />;
      case 'notDoneFirstAppointment':
        return <StatusCompleteTable />;
      case 'medicalCallLog':
        return <div className="p-4 text-center text-gray-500">No data available</div>;
      default:
        return <div className="p-4 text-center text-gray-500">No data available</div>;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div className={`bg-blue-900 text-white w-30   min-h-screen ${isSidebarOpen ? '' : 'hidden'} md:block transition-all duration-300`}>
        <div className="p-4">
          <div className="flex items-center space-x-2 mb-8">
            <div className="w-8 h-8 bg-white rounded-md"></div>
            <span className="text-xl font-bold">Maars</span>
          </div>
          <nav className="space-y-2">
            {[
              { icon: FaUserMd, label: 'Add Doctor', link: 'add-doctor' },
              { icon: FaHome, label: 'Home', link: 'home' },
              { icon: FaVideo, label: 'Appointments', link: 'appointments' },
              { icon: FaFileAlt, label: 'Reports', link: 'reports' },
              { icon: FaBoxOpen, label: 'Inventory', link: 'inventory' },
              { icon: FaCog, label: 'Settings', link: 'settings' },
              { icon: FaCalendar, label: 'Allocations', link: '/allocation' },
            ].map(({ icon: Icon, label, link }) => (
              <a
                key={link}
                href={`${link}`}
                className={`flex items-center space-x-2 p-2 rounded-lg hover:bg-blue-800 transition-colors duration-200 ${activeNav === link ? 'bg-pink-500' : ''}`}
                onClick={() => handleNavClick(link)}
              >
                <Icon size={18} />
                <span>{label}</span>
              </a>
            ))}
          </nav>
        </div>
        <div className="absolute bottom-0 w-64 p-4">
          {[
            { icon: FaQuestionCircle, label: 'Help', link: 'help' },
            { icon: FaSignOutAlt, label: 'Logout', link: 'logout' },
          ].map(({ icon: Icon, label, link }) => (
            <a
              key={link}
              href={`#${link}`}
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-blue-800 transition-colors duration-200"
              onClick={() => handleNavClick(link)}
            >
              <Icon size={18} />
              <span>{label}</span>
            </a>
          ))}
        </div>
      </div>

      <div className="main-content">
        <header className="bg-white shadow-md">
          <div className="header">
            <button className="hamburger-menu" onClick={toggleSidebar}>
              <FaBars size={20} />
            </button>
            <div className="progress-container">
              <p className="date-container">
                <span className="calendar-icon">
                  <FaCalendarAlt size={15} color="#000" />
                </span>
                {date}
              </p>
            </div>
            <div className="header-right">
              <span className="notification-icon">
                <FaBell size={18} />
              </span>
              <span className="user-icon">
                <FaUserCircle size={20}/>
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Status</h1>

          <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
            <div className="grid grid-cols-1 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-gray-200">
              <div className="bg-blue-500 text-white p-4 flex items-center justify-center">
                <FaCalendarAlt size={18} className="mr-2" />
                <span className="font-semibold">Today</span>
              </div>
              {Object.entries({
                'Total Patients': dashboardData.totalPatients,
                'Patients Registered Today': dashboardData.newPatientsToday,
                'Call Not Made Yet': dashboardData.pendingCallsFromApp,
                'Pending Medical Records': dashboardData.pendingMedicalRecords
              }).map(([title, value]) => (
                <div key={title} className="p-4">
                  <p className="text-sm text-gray-500 mb-1">{title}</p>
                  <p className="text-2xl font-bold text-gray-800">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
            <div className="flex space-x-1 bg-gray-200 p-1 rounded-t-lg">
              {['all', 'notCalledYet', 'notDoneFirstAppointment', 'medicalCallLog'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => handleTabClick(tab)}
                  className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors duration-200 ${
                    activeTab === tab
                      ? 'bg-white text-blue-600 shadow'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab === 'all' ? 'All' : 
                   tab === 'notCalledYet' ? 'Not Called Yet' : 
                   tab === 'notDoneFirstAppointment' ? 'Not Done First Appointment' : 
                   'Medical Call Log'}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4">
              <h2 className="text-xl font-bold text-blue-900 mb-4">Patients List</h2>
              {/* <div className="flex justify-between items-center mb-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search patients..."
                    className="pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
                <button className="bg-blue-900 text-white p-2 rounded-md">
                  <FaChevronDown />
                </button>
              </div> */}
              {renderPatientsTable()}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AssistantDoctorDashboard;