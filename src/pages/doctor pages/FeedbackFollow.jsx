import React, { useState, useEffect } from "react";
import { Search, Calendar, Notebook } from "lucide-react";
import DoctorLayout from "/src/components/doctor components/DoctorLayout.jsx";
import config from "../../config";
import { MenuBook, Note } from "@mui/icons-material";
const API_URL = config.API_URL;

const FeedbackFollowUp = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/api/doctor/reports/prescription-follow-ups`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });
        
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        
        const result = await response.json();
        setData(result.data || []);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

  // Pagination logic
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentData = filteredData.slice(indexOfFirstEntry, indexOfLastEntry);
  const totalPages = Math.ceil(filteredData.length / entriesPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
        <DoctorLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-7">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-3 text-gray-600">Loading data...</p>
            </div>
          </div>
        </div>
      </div>
      </DoctorLayout>
    );
  }

  if (error) {
    return (
        <DoctorLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-7">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            <strong className="font-bold">Error! </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        </div>
      </div>
      </DoctorLayout>
    );
  }

  return (
    <DoctorLayout>
      <div className="p-7">
        <div className="bg-white rounded-xl shadow-lg p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Feedback Follow-Up</h1>
            
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
                  <th className="bg-gray-100 text-center p-4 font-bold text-gray-700 text-sm">Patient ID</th>
                  <th className="bg-white text-center p-4 font-bold text-gray-700 text-sm">Patient Name</th>
                  <th className="bg-gray-100 text-center p-4 font-bold text-gray-700 text-sm">Phone Number</th>
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
                      <td className="bg-gray-100 p-4 text-gray-900 text-center">
                        {item.patientUniqueId !== "N/A" ? item.patientUniqueId : "--"}
                      </td>
                      <td className="bg-white p-4 text-gray-600 text-center">
                        {item.patientName || "--"}
                      </td>
                      <td className="bg-gray-100 p-4 text-gray-600 text-center">
                        --
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
        </div>
      </div>
    </DoctorLayout>
  );
};

export default FeedbackFollowUp;