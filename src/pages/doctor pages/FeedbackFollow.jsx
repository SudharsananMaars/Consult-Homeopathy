import React, { useState, useEffect } from "react";
import { Search, Calendar, PlayCircle, Check } from "lucide-react";
import { PieChart, Pie, Cell, Legend, Tooltip } from "recharts";
import DoctorLayout from "/src/components/doctor components/DoctorLayout.jsx";
import config from "../../config";
import { MenuBook, Note } from "@mui/icons-material";
const API_URL = config.API_URL;

// Tab Navigation Component
const TabNavigation = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex gap-2 mb-6">
      <button
        onClick={() => onTabChange('new-patient')}
        className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
          activeTab === 'new-patient'
            ? 'bg-blue-500 text-white'
            : 'bg-white text-gray-700 border border-gray-300'
        }`}
      >
        New Patient
      </button>
      <button
        onClick={() => onTabChange('follow-up')}
        className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
          activeTab === 'follow-up'
            ? 'bg-blue-500 text-white'
            : 'bg-white text-gray-700 border border-gray-300'
        }`}
      >
        Patient Follow-Up
      </button>
    </div>
  );
};

const FeedbackFollowUp = () => {
  const [data, setData] = useState([]);
  const [newPatientData, setNewPatientData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [kpis, setKpis] = useState(null);
  const [tempStatuses, setTempStatuses] = useState({});
  const [pieChartData, setPieChartData] = useState([]);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [patientDetails, setPatientDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [followUpKpis, setFollowUpKpis] = useState(null);
  const [activeTab, setActiveTab] = useState('new-patient');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch follow-up data
        const followUpResponse = await fetch(`${API_URL}/api/doctor/reports/prescription-follow-ups`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });
        
        if (!followUpResponse.ok) {
          throw new Error("Failed to fetch follow-up data");
        }
        
        const followUpResult = await followUpResponse.json();
        setData(followUpResult.data || []);
        const stats = followUpResult.stats || {};
        setFollowUpKpis(stats);
        // Fetch new patient data
        const newPatientResponse = await fetch(`${API_URL}/api/doctor/dashboard/new-patients`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });
        
        if (!newPatientResponse.ok) {
          throw new Error("Failed to fetch new patient data");
        }
        
        const newPatientResult = await newPatientResponse.json();
setNewPatientData(newPatientResult.tableData || []);
setKpis(newPatientResult.kpis || null);
setPieChartData(newPatientResult.pieChart || []);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);


  const fetchPatientDetails = async (patientId) => {
  try {
    setLoadingDetails(true);
    const response = await fetch(`${API_URL}/api/doctor/${patientId}/logs`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    });
    
    if (!response.ok) throw new Error("Failed to fetch patient details");
    
    const result = await response.json();
    setPatientDetails(result);
    setLoadingDetails(false);
  } catch (err) {
    console.error("Error fetching patient details:", err);
    setLoadingDetails(false);
  }
};

const handleStatusSelect = (patientId, newStatus) => {
  setTempStatuses(prev => ({
    ...prev,
    [patientId]: newStatus
  }));
};
const handleStatusSave = async (patientId) => {
  const newStatus = tempStatuses[patientId];
  
  try {
    const response = await fetch(`${API_URL}/api/doctor/update-status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify({ patientId, status: newStatus })
    });
    
    if (!response.ok) throw new Error("Failed to update status");
    
    // Update local state
    setNewPatientData(prev => prev.map(patient => 
      patient._id === patientId ? { ...patient, status: newStatus } : patient
    ));
    
    // Clear temp status
    setTempStatuses(prev => {
      const updated = { ...prev };
      delete updated[patientId];
      return updated;
    });
    console.log("Status updated successfully");
  } catch (err) {
    console.error("Error updating status:", err);
  }
};

const handlePatientClick = (patientId) => {
  setSelectedPatientId(patientId);
  setShowPopup(true);
  fetchPatientDetails(patientId);
};

  const formatDate = (dateString) => {
    if (!dateString) return "--";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const formatAppointmentDate = (dateString, timeSlot) => {
    if (!dateString) return "--";
    const date = new Date(dateString);
    const dateStr = date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short"
    });
    return timeSlot ? `${dateStr}, ${timeSlot}` : dateStr;
  };

  // Filter data based on search term
  const filteredData = data.filter((item) =>
    item.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.patientUniqueId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter new patient data based on search term
  const filteredNewPatientData = newPatientData.filter((item) =>
    item.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.phoneNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic for follow-up
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentData = filteredData.slice(indexOfFirstEntry, indexOfLastEntry);
  const totalPages = Math.ceil(filteredData.length / entriesPerPage);

  // Pagination logic for new patients
  const currentNewPatientData = filteredNewPatientData.slice(indexOfFirstEntry, indexOfLastEntry);
  const totalNewPatientPages = Math.ceil(filteredNewPatientData.length / entriesPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const calculateTimeLeft = (scheduledTime) => {
    if (!scheduledTime || scheduledTime === "-") return "--";
    const scheduled = new Date(scheduledTime);
    const now = new Date();
    const diffMs = scheduled - now;
    
    if (diffMs < 0) return "Overdue";
    
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) return `${diffDays}d ${diffHours % 24}h`;
    if (diffHours > 0) return `${diffHours}h ${diffMins % 60}m`;
    return `${diffMins}m`;
  };

  if (loading) {
    return (
        <DoctorLayout>
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-3 text-gray-600">Loading data...</p>
            </div>
          </div>
        </div>
      </DoctorLayout>
    );
  }

  if (error) {
    return (
        <DoctorLayout>
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            <strong className="font-bold">Error! </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        </div>
      </DoctorLayout>
    );
  }

  return (
    <DoctorLayout>
      <div className="p-7">
        <div className="bg-white rounded-xl shadow-lg p-6">
          {/* Tab Navigation */}
          <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

          {/* New Patient Tab Content */}
          {activeTab === 'new-patient' && (
            <>
              {/* Header */}
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">New Patients</h1>
                {/* KPI Cards and Pie Chart */}
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
  {/* KPI Cards */}
  <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
    <div className="flex items-center gap-2 mb-8">
      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
        <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
        </svg>
      </div>
      <h3 className="text-lg font-bold text-gray-800">New Patient KPI</h3>
    </div>
    <div className="h-4"></div>

    {kpis && (
      <div className="grid grid-cols-3 gap-4">
        <div className="border-l-4 border-blue-500 shadow-lg rounded-lg p-3 pl-3">
          <p className="text-sm text-gray-600">Registered</p>
          <p className="text-2xl font-bold text-gray-800">{kpis.totalRegistered}</p>
        </div>
        <div className="border-l-4 border-yellow-500 shadow-lg rounded-lg p-3 pl-3">
          <p className="text-sm text-gray-600">Rescheduled</p>
          <p className="text-2xl font-bold text-gray-800">{kpis.rescheduled}</p>
        </div>
        <div className="border-l-4 border-red-500 shadow-lg rounded-lg p-3 pl-3">
          <p className="text-sm text-gray-600">Lost</p>
          <p className="text-2xl font-bold text-gray-800">{kpis.lost}</p>
        </div>
        <div className="border-l-4 border-green-500 shadow-lg rounded-lg p-3 pl-3">
          <p className="text-sm text-gray-600">Completed</p>
          <p className="text-2xl font-bold text-gray-800">{kpis.completed}</p>
        </div>
        <div className="border-l-4 border-orange-500 shadow-lg rounded-lg p-3 pl-3">
          <p className="text-sm text-gray-600">Overdue</p>
          <p className="text-2xl font-bold text-gray-800">{kpis.overdue}</p>
        </div>
        <div className="border-l-4 border-cyan-500 shadow-lg rounded-lg p-3 pl-3">
          <p className="text-sm text-gray-600">SLA Completion</p>
          <p className="text-2xl font-bold text-cyan-600">{kpis.slaCompletionPercentage}%</p>
        </div>
      </div>
    )}
  </div>

  {/* Pie Chart */}
<div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
  <div className="flex items-center gap-2 mb-4">
    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
      <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
        <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
      </svg>
    </div>
    <h3 className="text-lg font-bold text-gray-800">Call Attempts Breakdown</h3>
  </div>
  
  <div className="flex items-center justify-center">
    <PieChart width={400} height={250}>
      <Pie
        data={pieChartData.map(item => ({
          name: item._id === null ? 'No attempts' : 
                item._id === 0 ? 'First attempt' :
                item._id === 1 ? 'Second attempt' : 
                'Third attempt',
          value: item.count
        }))}
        cx="50%"
        cy="50%"
        outerRadius={90}
        fill="#8884d8"
        dataKey="value"
      >
        {pieChartData.map((entry, index) => {
          const colors = {
            null: '#FBBF24',  // gray for no attempts
            0: '#60A5FA',     // blue for 1st
            1: '#34D399',     // green for 2nd
            2: '#FBBF24'      // orange for 3rd
          };
          return <Cell key={`cell-${index}`} fill={colors[entry._id] || '#9CA3AF'} />;
        })}
      </Pie>
      <Tooltip />
      <Legend 
        verticalAlign="bottom" 
        height={36}
        iconType="square"
      />
    </PieChart>
  </div>
</div>
</div>
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full overflow-hidden rounded-lg">
                  <thead>
                    <tr className="border-b border-blue-200">
                      <th className="bg-white text-center p-4 font-bold text-gray-700 text-sm">Patient Name</th>
                      <th className="bg-gray-100 text-center p-4 font-bold text-gray-700 text-sm">Registration Time</th>
                      <th className="bg-white text-center p-4 font-bold text-gray-700 text-sm">SLA Time</th>
                      <th className="bg-gray-100 text-center p-4 font-bold text-gray-700 text-sm">Time Left</th>
                      <th className="bg-white text-center p-4 font-bold text-gray-700 text-sm">Last Call Attempt</th>
                      <th className="bg-gray-100 text-center p-4 font-bold text-gray-700 text-sm">Call Attempts</th>
                      <th className="bg-white text-center p-4 font-bold text-gray-700 text-sm">Rescheduled Time</th>
                      <th className="bg-gray-100 text-center p-4 font-bold text-gray-700 text-sm">Status</th>
                      <th className="bg-white text-center p-4 font-bold text-gray-700 text-sm">Message</th>
                      <th className="bg-gray-100 text-center p-4 font-bold text-gray-700 text-sm">Call</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentNewPatientData.length > 0 ? (
                      currentNewPatientData.map((item, idx) => (
                        <tr key={idx} className="border-b border-blue-200">
                          <td className="bg-white p-4 text-gray-600 text-center">
  <div className="flex items-center justify-center gap-2">
    <div className={`w-4 h-4 border-2 rounded flex items-center justify-center ${
      item.appDownload === 1 ? 'bg-green-500 border-green-500' : 'border-gray-300'
    }`}>
      {item.appDownload === 1 && <Check className="w-3 h-3 text-white" />}
    </div>
    <button 
      onClick={() => handlePatientClick(item._id)}
      className="text-blue-600 hover:underline cursor-pointer"
    >
      {item.patientName || "--"}
    </button>
  </div>
</td>
                          <td className="bg-gray-100 p-4 text-gray-600 text-center">
                            {formatDate(item.registrationTime)}
                          </td>
                          <td className="bg-white p-4 text-gray-600 text-center">
                            {formatDate(item.scheduledTime)}
                          </td>
                          <td className="bg-gray-100 p-4 text-gray-600 text-center">
                            <span className={`px-2 py-1 rounded text-xs ${
                              calculateTimeLeft(item.scheduledTime) === "Overdue" 
                                ? "bg-red-100 text-red-600" 
                                : "bg-green-100 text-green-600"
                            }`}>
                              {calculateTimeLeft(item.scheduledTime)}
                            </span>
                          </td>
                          <td className="bg-white p-4 text-gray-600 text-center">
                            {item.lastCallAttempt !== "-" ? formatDate(item.lastCallAttempt) : "--"}
                          </td>
                          <td className="bg-gray-100 p-4 text-gray-600 text-center">
                            {item.callsMade !== "-" ? `${item.callsMade}/3` : "0/3"}
                          </td>
                          <td className="bg-white p-4 text-gray-600 text-center">
                            {item.rescheduledTime !== "-" ? formatDate(item.rescheduledTime) : "--"}
                          </td>
                          <td className="bg-gray-100 p-4 text-center">
  <div className="flex items-center justify-center gap-2">
    <select 
      value={tempStatuses[item._id] || item.status || "Pending"}
      onChange={(e) => handleStatusSelect(item._id, e.target.value)}
      className="px-3 py-1.5 text-xs rounded-md border border-gray-300 bg-white hover:bg-gray-50"
    >
      <option value="Pending">Pending</option>
      <option value="Completed">Completed</option>
      <option value="Rescheduled">Rescheduled</option>
      <option value="Overdue">Overdue</option>
      <option value="Lost">Lost</option>
    </select>
    {tempStatuses[item._id] && tempStatuses[item._id] !== item.status && (
      <button 
        onClick={() => handleStatusSave(item._id)}
        className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        <Check className="w-4 h-4" />
      </button>
    )}
  </div>
</td>
                          <td className="bg-white p-4 text-center">
                            <button className="px-4 py-1.5 text-xs font-medium rounded-md text-white bg-blue-500 hover:bg-blue-600">
                              Message
                            </button>
                          </td>
                          <td className="bg-gray-100 p-4 text-center">
                            <button className="px-4 py-1.5 text-xs font-medium rounded-md text-white bg-green-500 hover:bg-green-600">
                              Call
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={14} className="bg-white text-center text-gray-500 py-6">
                          No data found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex flex-wrap justify-between items-center mt-6">
                <div className="flex items-center gap-4">
                  <label className="text-sm text-gray-600">
                    Show{" "}
                    <select 
                      value={entriesPerPage} 
                      onChange={(e) => {
                        setEntriesPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="border border-gray-300 rounded-md p-2 mx-1"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={15}>15</option>
                      <option value={20}>20</option>
                    </select>{" "}
                    entries per page
                  </label>
                  <span className="text-sm text-gray-600">
                    Showing {indexOfFirstEntry + 1} to {Math.min(indexOfLastEntry, filteredNewPatientData.length)} of {filteredNewPatientData.length} entries
                  </span>
                </div>
                
                <div className="flex gap-2 mt-4 sm:mt-0">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 border rounded-md ${
                      currentPage === 1 ? "bg-gray-100 cursor-not-allowed" : "hover:bg-blue-200"
                    }`}
                  >
                    Previous
                  </button>
                  
                  {[...Array(Math.min(5, totalNewPatientPages))].map((_, index) => {
                    let pageNum;
                    if (totalNewPatientPages <= 5) {
                      pageNum = index + 1;
                    } else if (currentPage <= 3) {
                      pageNum = index + 1;
                    } else if (currentPage >= totalNewPatientPages - 2) {
                      pageNum = totalNewPatientPages - 4 + index;
                    } else {
                      pageNum = currentPage - 2 + index;
                    }
                    
                    if (pageNum > 0 && pageNum <= totalNewPatientPages) {
                      return (
                        <button
                          key={index}
                          onClick={() => paginate(pageNum)}
                          className={`px-3 py-1 border rounded-md ${
                            currentPage === pageNum ? "bg-blue-300" : "hover:bg-blue-200"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    }
                    return null;
                  })}
                  
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalNewPatientPages}
                    className={`px-3 py-1 border rounded-md ${
                      currentPage === totalNewPatientPages ? "bg-gray-100 cursor-not-allowed" : "hover:bg-blue-200"
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Patient Follow-Up Tab Content */}
          {activeTab === 'follow-up' && (
            <>
              {/* Header */}
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Patient Follow-Up</h1>
                {/* KPI Cards - Add this after the search section and before the table */}
<div className="max-w-3xl mb-6">
  <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
    <div className="flex items-center gap-2 mb-8">
      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
        <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
          <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
        </svg>
      </div>
      <h3 className="text-lg font-bold text-gray-800">Follow-Up Status</h3>
    </div>
    <div className="h-4"></div>

    {followUpKpis && (
      <div className="grid grid-cols-2 gap-4">
        <div className="border-l-4 border-blue-500 shadow-lg rounded-lg p-3 pl-3">
          <p className="text-sm text-gray-600">Pending</p>
          <p className="text-2xl font-bold text-gray-800">{followUpKpis.pending}</p>
        </div>
        <div className="border-l-4 border-orange-500 shadow-lg rounded-lg p-3 pl-3">
          <p className="text-sm text-gray-600">Rescheduled</p>
          <p className="text-2xl font-bold text-gray-800">{followUpKpis.rescheduled}</p>
        </div>
        <div className="border-l-4 border-green-500 shadow-lg rounded-lg p-3 pl-3">
          <p className="text-sm text-gray-600">Completed</p>
          <p className="text-2xl font-bold text-gray-800">{followUpKpis.completed}</p>
        </div>
        <div className="border-l-4 border-cyan-400 shadow-lg rounded-lg p-3 pl-3">
          <p className="text-sm text-gray-600">Completion Rate</p>
          <p className="text-2xl font-bold text-cyan-600">{followUpKpis.completionRate}%</p>
        </div>
      </div>
    )}
  </div>
</div>
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full overflow-hidden rounded-lg">
                  <thead>
                    <tr className="border-b border-blue-200">
                      <th className="bg-white text-center p-4 font-bold text-gray-700 text-sm">Patient Name</th>
                      <th className="bg-white text-center p-4 font-bold text-gray-700 text-sm">Prescription</th>
                      <th className="bg-gray-100 text-center p-4 font-bold text-gray-700 text-sm">Appointment Date</th>
                      <th className="bg-white text-center p-4 font-bold text-gray-700 text-sm">Total Follow-ups</th>
                      <th className="bg-gray-100 text-center p-4 font-bold text-gray-700 text-sm">Completed</th>
                      <th className="bg-white text-center p-4 font-bold text-gray-700 text-sm">Left</th>
                      <th className="bg-gray-100 text-center p-4 font-bold text-gray-700 text-sm">Last Follow-up</th>
                      <th className="bg-white text-center p-4 font-bold text-gray-700 text-sm">Next Follow-up</th>
                      <th className="bg-gray-100 text-center p-4 font-bold text-gray-700 text-sm">Remarks</th>
                      <th className="bg-white text-center p-4 font-bold text-gray-700 text-sm">Status</th>
                      <th className="bg-gray-100 text-center p-4 font-bold text-gray-700 text-sm">Message</th>
                      <th className="bg-white text-center p-4 font-bold text-gray-700 text-sm">Call</th>
                      <th className="bg-gray-100 text-center p-4 font-bold text-gray-700 text-sm">Schedule Follow-Up</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentData.length > 0 ? (
                      currentData.map((item, idx) => (
                        <tr key={idx} className="border-b border-blue-200">
                          <td className="bg-white p-4 text-gray-600 text-center">
  <div className="flex items-center justify-center gap-2">
    <button 
      onClick={() => handlePatientClick(item.patientId)}
      className="text-blue-600 hover:underline cursor-pointer"
    >
      {item.patientName || "--"}
    </button>
  </div>
</td>
                          <td className="bg-white p-4 text-center">
                            <button className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200">
                              View
                            </button>
                          </td>
                          <td className="bg-gray-100 p-4 text-gray-600 text-center">
                            {formatAppointmentDate(item.appointmentDate, item.timeSlot)}
                          </td>
                          <td className="bg-white p-4 text-gray-600 text-center">
                            {item.totalFollowUpsScheduled || 0}
                          </td>
                          <td className="bg-gray-100 p-4 text-gray-600 text-center">
                            {item.completedFollowUps || 0}
                          </td>
                          <td className="bg-white p-4 text-gray-600 text-center">
                            {item.missedFollowUps || 0}
                          </td>
                          <td className="bg-gray-100 p-4 text-gray-600 text-center">
                            {formatDate(item.lastFollowUpDate)}
                          </td>
                          <td className="bg-white p-4 text-gray-600 text-center">
                            {formatDate(item.nextFollowUpDate)}
                          </td>
                          <td className="bg-gray-100 p-4 text-gray-600 text-center">
                            {item.lastFollowUpRemarks || "--"}
                          </td>
                          <td className="bg-white p-4 text-center">
                            <select className="px-3 py-1.5 text-xs rounded-md border border-gray-300 bg-white hover:bg-gray-50">
                              <option>{item.lastFollowUpStatus || "Pending"}</option>
                              <option>Completed</option>
                              <option>Rescheduled</option>
                            </select>
                          </td>
                          <td className="bg-gray-100 p-4 text-center">
                            <button className="px-4 py-1.5 text-xs font-medium rounded-md text-white bg-blue-500 hover:bg-blue-600">
                              Message
                            </button>
                          </td>
                          <td className="bg-white p-4 text-center">
                            <button className="px-4 py-1.5 text-xs font-medium rounded-md text-white bg-green-500 hover:bg-green-600">
                              Call
                            </button>
                          </td>
                          <td className="bg-gray-100 p-4 text-center">
                            <button className="p-2 text-gray-600 hover:bg-gray-200 rounded-md">
                              <Calendar/>
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={15} className="bg-white text-center text-gray-500 py-6">
                          No data found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex flex-wrap justify-between items-center mt-6">
                <div className="flex items-center gap-4">
                  <label className="text-sm text-gray-600">
                    Show{" "}
                    <select 
                      value={entriesPerPage} 
                      onChange={(e) => {
                        setEntriesPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="border border-gray-300 rounded-md p-2 mx-1"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={15}>15</option>
                      <option value={20}>20</option>
                    </select>{" "}
                    entries per page
                  </label>
                  <span className="text-sm text-gray-600">
                    Showing {indexOfFirstEntry + 1} to {Math.min(indexOfLastEntry, filteredData.length)} of {filteredData.length} entries
                  </span>
                </div>
                
                <div className="flex gap-2 mt-4 sm:mt-0">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 border rounded-md ${
                      currentPage === 1 ? "bg-gray-100 cursor-not-allowed" : "hover:bg-blue-200"
                    }`}
                  >
                    Previous
                  </button>
                  
                  {[...Array(Math.min(5, totalPages))].map((_, index) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = index + 1;
                    } else if (currentPage <= 3) {
                      pageNum = index + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + index;
                    } else {
                      pageNum = currentPage - 2 + index;
                    }
                    
                    if (pageNum > 0 && pageNum <= totalPages) {
                      return (
                        <button
                          key={index}
                          onClick={() => paginate(pageNum)}
                          className={`px-3 py-1 border rounded-md ${
                            currentPage === pageNum ? "bg-blue-300" : "hover:bg-blue-200"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    }
                    return null;
                  })}
                  
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 border rounded-md ${
                      currentPage === totalPages ? "bg-gray-100 cursor-not-allowed" : "hover:bg-blue-200"
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      {/* Patient Details Popup */}
{showPopup && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="flex justify-between items-center p-6 border-b">
        <h2 className="text-xl font-bold text-gray-800">Patient Details</h2>
        <button 
          onClick={() => setShowPopup(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {loadingDetails ? (
        <div className="flex justify-center items-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : patientDetails ? (
        <div className="p-6">
          {/* Profile Section */}
          <div className="border border-blue-200 rounded-lg p-6 mb-6">
            <div className="flex gap-4 mb-4">
              <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">{patientDetails.profile.patientName}</h3>
                <p className="text-gray-600">{patientDetails.profile.phoneNumber}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600"><span className="font-semibold">Age:</span> {patientDetails?.profile?.age || "-"} </p>
                <p className="text-gray-600"><span className="font-semibold">Gender:</span> {patientDetails.profile.gender}</p>
                <p className="text-gray-600"><span className="font-semibold">Email:</span> {patientDetails.profile.email}</p>
              </div>
              <div>
                <p className="text-gray-600"><span className="font-semibold">Address:</span> {patientDetails.profile.address}</p>
                <p className="text-gray-600"><span className="font-semibold">Symptoms:</span> {patientDetails.profile.diseaseName}</p>
                <p className="text-gray-600"><span className="font-semibold">Source:</span> {patientDetails.profile.source}</p>
              </div>
            </div>
          </div>

          {/* Patient History Table */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4">Patient History</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-blue-200">
                    <th className="bg-white text-left p-3 font-bold text-gray-700 text-sm">S.No</th>
                    <th className="bg-gray-100 text-left p-3 font-bold text-gray-700 text-sm">Date & Time</th>
                    <th className="bg-white text-left p-3 font-bold text-gray-700 text-sm">Mode</th>
                    <th className="bg-gray-100 text-left p-3 font-bold text-gray-700 text-sm">Call Recording</th>
                    <th className="bg-white text-left p-3 font-bold text-gray-700 text-sm">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {patientDetails.logs && patientDetails.logs.length > 0 ? (
                    patientDetails.logs.map((log, idx) => (
                      <tr key={idx} className="border-b border-blue-200">
                        <td className="bg-white p-3 text-gray-600 text-sm">{idx + 1}</td>
                        <td className="bg-gray-100 p-3 text-gray-600 text-sm">
                          {formatDate(log.timestamp)}
                        </td>
                        <td className="bg-white p-3 text-gray-600 text-sm">{log.action}</td>
                        <td className="bg-gray-100 p-3 text-gray-600 text-sm"><PlayCircle /></td>
                        <td className="bg-white p-3 text-gray-600 text-sm">{log.note}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="bg-white text-center text-gray-500 py-6">
                        No history found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 text-center text-gray-500">
          Failed to load patient details
        </div>
      )}
    </div>
  </div>
)}
    </DoctorLayout>
    
  );
  
};

export default FeedbackFollowUp;