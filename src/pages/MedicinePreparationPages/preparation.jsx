import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import config from "../../config";

const API_URL = config.API_URL;
const userId = localStorage.getItem("userId");

const MedicinePreparation = () => {
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isDropdownOpen, setIsDropdownOpen] = useState({ sort: false, status: false });
  const [prescriptions, setPrescriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data from API (with token auth like your other example)
  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await axios.get(
          `${API_URL}/api/medicine-summary/follow-up-mp`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Filter to show only items with both appointmentId and prescriptionId
        const filteredData = response.data.filter(
          (item) => item.appointmentId && item.prescriptionId
        );

        setPrescriptions(filteredData);
        setError(null);
      } catch (error) {
        console.error("Failed to fetch prescriptions:", error);
        setError("Failed to load prescriptions");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrescriptions();
  }, []);

  // Calculate stats from actual data
  const getStats = () => {
    const total = prescriptions.length;
    const completed = prescriptions.filter(p => p.medicinePrepared === true).length;
    const pending = prescriptions.filter(p => p.medicinePrepared === false).length;
    
    return { total, completed, pending };
  };

  const stats = getStats();

  const sortOptions = ['All', 'ID', 'Status', 'Date'];
  const statusOptions = ['All', 'Completed', 'Pending'];

  const toggleDropdown = (type) => {
    setIsDropdownOpen(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const handleSortSelect = (option) => {
    setSortBy(option);
    setIsDropdownOpen(prev => ({ ...prev, sort: false }));
  };

  const handleStatusSelect = (option) => {
    setStatusFilter(option);
    setIsDropdownOpen(prev => ({ ...prev, status: false }));
  };

  const getStatusBadgeClass = (status, isClickable = true) => {
    const baseClass = 'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200';
    const clickableClass = isClickable ? 'cursor-pointer hover:shadow-md hover:scale-105' : 'cursor-default';
    
    return status === 'Completed' 
      ? `bg-green-500 text-white ${baseClass} cursor-default opacity-75`
      : `bg-orange-400 text-white ${baseClass} ${clickableClass}`;
  };

  // Convert boolean values to status text
  const getStatusText = (booleanValue) => {
    return booleanValue === true ? 'Completed' : 'Pending';
  };

  // Filter prescriptions based on status filter
  const getFilteredPrescriptions = () => {
    if (statusFilter === 'All') return prescriptions;
    if (statusFilter === 'Completed') return prescriptions.filter(p => p.medicinePrepared === true);
    if (statusFilter === 'Pending') return prescriptions.filter(p => p.medicinePrepared === false);
    return prescriptions;
  };

  const filteredPrescriptions = getFilteredPrescriptions();

  // Handle medicine preparation status button click
  const handleMedicineStatusClick = (e, appointmentId, prescriptionId, isCompleted) => {
    e.stopPropagation(); // Prevent any parent click events
    if (!isCompleted) {
      navigate(`/prepare-medicine/${appointmentId}`);
    }
  };

  // Handle shipping status button click - UPDATED to pass prescription ID via state
  const handleShippingStatusClick = (e, appointmentId, prescriptionId, isCompleted) => {
    e.stopPropagation(); // Prevent any parent click events
    if (!isCompleted) {
      // Pass prescription ID via navigation state
      navigate(`/shipping/${appointmentId}`, { 
        state: { prescriptionId: prescriptionId } 
      });
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setIsDropdownOpen({ sort: false, status: false });
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-gray-100 p-8">
        <div className="w-full">
          <div className="bg-white rounded-3xl p-12 shadow-sm">
            <div className="flex justify-center items-center h-64">
              <div className="text-gray-500 text-lg">Loading prescriptions...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-screen bg-gray-100 p-8">
        <div className="w-full">
          <div className="bg-white rounded-3xl p-12 shadow-sm">
            <div className="flex justify-center items-center h-64">
              <div className="text-red-500 text-lg">{error}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-100 p-8">
      <div className="w-full">
        <div className="bg-white rounded-3xl p-8 shadow-sm">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-medium text-gray-900">Medicine Preparation</h1>
            
            <div className="flex items-center gap-3">
              {/* Sort Dropdown */}
              <div className="relative dropdown-container">
                <button
                  onClick={() => toggleDropdown('sort')}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl bg-white hover:bg-gray-50 focus:outline-none transition-colors text-sm font-medium text-gray-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                  </svg>
                  <span>Sort</span>
                  <span className={`text-gray-400 transition-transform text-xs ${isDropdownOpen.sort ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </button>
                
                {isDropdownOpen.sort && (
                  <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-10 min-w-[120px]">
                    {sortOptions.map((option) => (
                      <button
                        key={option}
                        onClick={() => handleSortSelect(option)}
                        className={`w-full text-left px-4 py-2 hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl transition-colors text-sm ${
                          sortBy === option ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Status Filter Dropdown */}
              <div className="relative dropdown-container">
                <button
                  onClick={() => toggleDropdown('status')}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl bg-white hover:bg-gray-50 focus:outline-none transition-colors text-sm font-medium text-gray-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  <span>Status</span>
                  <span className={`text-gray-400 transition-transform text-xs ${isDropdownOpen.status ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </button>
                
                {isDropdownOpen.status && (
                  <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-10 min-w-[120px]">
                    {statusOptions.map((option) => (
                      <button
                        key={option}
                        onClick={() => handleStatusSelect(option)}
                        className={`w-full text-left px-4 py-2 hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl transition-colors text-sm ${
                          statusFilter === option ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-50 rounded-2xl p-6 text-center">
              <h3 className="text-blue-600 font-medium mb-2 text-base">Total Prescriptions</h3>
              <div className="text-3xl font-bold text-blue-700">
                {stats.total}
              </div>
            </div>
            
            <div className="bg-green-50 rounded-2xl p-6 text-center">
              <h3 className="text-green-600 font-medium mb-2 text-base">Completed</h3>
              <div className="text-3xl font-bold text-green-700">
                {stats.completed}
              </div>
            </div>
            
            <div className="bg-orange-50 rounded-2xl p-6 text-center">
              <h3 className="text-orange-600 font-medium mb-2 text-base">Pending</h3>
              <div className="text-3xl font-bold text-orange-700">
                {stats.pending}
              </div>
            </div>
          </div>

          {/* Table Card Container */}
          <div className="bg-gray-100 rounded-2xl p-6">
            {/* Table Header */}
            <div className="grid grid-cols-3 gap-8 mb-4">
              <div className="font-bold text-gray-900 text-base px-4">Prescription ID</div>
              <div className="text-center font-bold text-gray-900 text-base">Status</div>
              <div className="text-center font-bold text-gray-900 text-base">Shipping Status</div>
            </div>

            {/* Table Body - Card Style with clickable status buttons */}
            <div className="space-y-3">
              {filteredPrescriptions.map((prescription, index) => (
                <div 
                  key={index} 
                  className="bg-white rounded-2xl p-6 transition-all duration-200 border border-transparent"
                >
                  <div className="grid grid-cols-3 gap-8 items-center">
                    <div className="font-medium text-gray-900 text-base px-4">
                      {prescription.prescriptionId}
                    </div>
                    
                    <div className="text-center">
                      <button
                        onClick={(e) => handleMedicineStatusClick(e, prescription.appointmentId, prescription.prescriptionId, prescription.medicinePrepared)}
                        className={getStatusBadgeClass(getStatusText(prescription.medicinePrepared))}
                        title={prescription.medicinePrepared ? "Medicine preparation completed" : "Click to manage medicine preparation"}
                        disabled={prescription.medicinePrepared}
                      >
                        {getStatusText(prescription.medicinePrepared)}
                      </button>
                    </div>
                    
                    <div className="text-center">
                      <button
                        onClick={(e) => handleShippingStatusClick(e, prescription.appointmentId, prescription.prescriptionId, prescription.shipmentStatus)}
                        className={getStatusBadgeClass(getStatusText(prescription.shipmentStatus))}
                        title={prescription.shipmentStatus ? "Shipping completed" : "Click to manage shipping status"}
                        disabled={prescription.shipmentStatus}
                      >
                        {getStatusText(prescription.shipmentStatus)}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty state when no data */}
            {filteredPrescriptions.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-lg">No prescriptions found</div>
                <div className="text-gray-500 text-sm mt-2">
                  {statusFilter !== 'All' 
                    ? `No ${statusFilter.toLowerCase()} prescriptions available`
                    : 'Prescriptions will appear here when available'
                  }
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicinePreparation;