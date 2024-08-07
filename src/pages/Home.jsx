import React from 'react';
import { FaBell, FaUserCircle } from 'react-icons/fa'; // Import icons from react-icons

const Home = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 p-4">
        <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>
        <ul className="space-y-4">
          <li><a href="#dashboard" className="text-gray-700 hover:text-blue-600">Dashboard</a></li>
          <li><a href="#appointments" className="text-gray-700 hover:text-blue-600">Appointments</a></li>
          <li><a href="#payments" className="text-gray-700 hover:text-blue-600">Payments</a></li>
          <li><a href="#invoices" className="text-gray-700 hover:text-blue-600">Invoices</a></li>
          <li><a href="#medicine" className="text-gray-700 hover:text-blue-600">Medicine</a></li>
          <li><a href="#workshops" className="text-gray-700 hover:text-blue-600">Workshops</a></li>
          <li><a href="#settings" className="text-gray-700 hover:text-blue-600">Settings</a></li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
          <div className="text-xl font-semibold">Welcome to the Dashboard</div>
          <div className="flex items-center space-x-4">
            <button className="relative">
              <FaBell className="text-gray-600 text-2xl" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">3</span>
            </button>
            <button>
              <FaUserCircle className="text-gray-600 text-2xl" />
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-6">
          {/* Add your main content here */}
        </div>
      </div>
    </div>
  );
};

export default Home;
