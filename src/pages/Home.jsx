import React, { useState } from 'react';
import { FaBell, FaUserCircle, FaCalendar, FaCreditCard, FaFileInvoice, FaPills, FaCog, FaHome, FaHandPaper} from 'react-icons/fa';

const Home = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="flex flex-col space-y-6">
            {/* Small Containers */}
            <div className="flex space-x-6 mb-6">
              <div className="bg-red-100 shadow-md rounded-lg p-4 flex-1">
                
                <h2 className="text-xl font-bold mb-2 mt-2 text-center">Appointments</h2>
                
                {/* Add content for Appointments here */}
              </div>
              <div className="bg-green-100 shadow-md rounded-lg p-4 flex-1">
                <h2 className="text-xl font-bold mb-2 mt-2 text-center">Prescriptions</h2>
                {/* Add content for Prescriptions here */}
              </div>
              <div className="bg-blue-100 shadow-md rounded-lg p-4 flex-1">
                <h2 className="text-xl font-bold mb-2 mt-2 text-center">Coupons</h2>
                {/* Add content for Coupons here */}
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-pink-50 shadow-md rounded-lg p-4">
              <h2 className="text-xl font-bold mb-4">Recent Transactions</h2>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 px-4 text-left">Date</th>
                    <th className="py-2 px-4 text-left">Status</th>
                    <th className="py-2 px-4 text-left">Amount</th>
                    <th className="py-2 px-4 text-left">Method</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Replace these rows with actual transaction data */}
                  <tr className="border-b">
                    <td className="py-2 px-4">07/08/2024</td>
                    <td className="py-2 px-4">Pending</td>
                    <td className="py-2 px-4">Rs.500.00</td>
                    <td className="py-2 px-4">Gpay</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4">30/06/2024</td>
                    <td className="py-2 px-4">Completed</td>
                    <td className="py-2 px-4">Rs.750.00</td>
                    <td className="py-2 px-4">GPay</td>
                  </tr>
                </tbody>
              </table>
            </div>
          {/* Video Clips */}
          <div className="bg-gray-200 shadow-md rounded-lg p-4">
              <h2 className="text-xl font-bold mb-4">Video Clips</h2>
              <div className="flex flex-wrap gap-7">
                {/* Example video clips */}
                <div className="w-1/4 bg-gray-100 rounded-lg overflow-hidden">
                  <video className="w-full" controls>
                    <source src="path/to/video1.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  <p className="p-2 text-center">Video 1</p>
                </div>
                <div className="w-1/4 bg-gray-100 rounded-lg overflow-hidden">
                  <video className="w-full" controls>
                    <source src="path/to/video2.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  <p className="p-2 text-center">Video 2</p>
                </div>
                <div className="w-1/4 bg-gray-100 rounded-lg overflow-hidden">
                  <video className="w-full" controls>
                    <source src="path/to/video3.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  <p className="p-2 text-center">Video 3</p>
                </div>
              </div>
            </div>
          </div>
        );
      // Add cases for other tabs here if needed
      default:
        return <div>Select a tab</div>;
    }
  };

  return (
    <div className="flex h-screen bg-white-100">
      {/* Sidebar */}
      <div className="w-62 bg-violet-100 border-r border-gray-300 p-4">
        <h1 className="text-xl font-bold mb-6">Homeopathy</h1>
        <ul className="flex flex-col space-y-10">
          <li className="flex items-center space-x-4">
            <FaHome className="text-gray-700 hover:text-blue-600" />
            <a
              href="#dashboard"
              className="text-gray-700 hover:text-blue-600"
              onClick={() => setActiveTab('dashboard')}
            >
              Dashboard
            </a>
          </li>
          <li className="flex items-center space-x-4">
            <FaCalendar className="text-gray-700 hover:text-blue-600" />
            <a href="#appointments" className="text-gray-700 hover:text-blue-600">
              Appointments
            </a>
          </li>
          <li className="flex items-center space-x-4">
            <FaCreditCard className="text-gray-700 hover:text-blue-600" />
            <a href="#payments" className="text-gray-700 hover:text-blue-600">
              Payments
            </a>
          </li>
          <li className="flex items-center space-x-4">
            <FaFileInvoice className="text-gray-700 hover:text-blue-600" />
            <a href="#invoices" className="text-gray-700 hover:text-blue-600">
              Invoices
            </a>
          </li>
          <li className="flex items-center space-x-4">
            <FaPills className="text-gray-700 hover:text-blue-600" />
            <a href="#medicine" className="text-gray-700 hover:text-blue-600">
              Medicine
            </a>
          </li>
          <li className="flex items-center space-x-4">
            <FaCog className="text-gray-700 hover:text-blue-600" />
            <a href="#settings" className="text-gray-700 hover:text-blue-600">
              Settings
            </a>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-white-100 border-b border-gray-300">
          <div FaHandPaper className="text-xl font-bold" >Hi User! </div>
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
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

