import React, { useState } from "react";
import DoctorLayout from "/src/components/doctor components/DoctorLayout.jsx";
import { FaEllipsisV, FaDownload, FaVideo, FaTimes } from "react-icons/fa";

const AppointmentList = () => {
  const [appointments, setAppointments] = useState([
    // Sample data
    { id: "A001", patientId: "P001", patientName: "John Doe", doctor: "Dr. Smith", date: "2024-09-16", time: "10:00 AM", disease: "Flu", diseasetype: "acute",assistant: "Dr. Adams" },
    { id: "A002", patientId: "P002", patientName: "Jane Roe", doctor: "Dr. John", date: "2024-09-15", time: "11:00 AM", disease: "Cold", diseasetype: "chronic",assistant: "Dr. Brown" },
    { id: "A003", patientId: "P003", patientName: "John Doe", doctor: "Dr. Smith", date: "2024-09-16", time: "10:00 AM", disease: "Flu", diseasetype: "acute",assistant: "Dr. Adams" },
    { id: "A004", patientId: "P004", patientName: "Jane Roe", doctor: "Dr. John", date: "2024-09-15", time: "11:00 AM", disease: "Cold", diseasetype: "chronic",assistant: "Dr. Brown" },
    { id: "A005", patientId: "P005", patientName: "John Doe", doctor: "Dr. Smith", date: "2024-09-16", time: "10:00 AM", disease: "Flu", diseasetype: "acute",assistant: "Dr. Adams" },
    { id: "A006", patientId: "P006", patientName: "Jane Roe", doctor: "Dr. Adam", date: "2024-09-15", time: "11:00 AM", disease: "Cold", diseasetype: "chronic",assistant: "Dr. Brown" },
    { id: "A007", patientId: "P007", patientName: "John Doe", doctor: "Dr. Smith", date: "2024-09-16", time: "10:00 AM", disease: "Flu", diseasetype: "acute",assistant: "Dr. Adams" },
    { id: "A008", patientId: "P008", patientName: "Jane Roe", doctor: "Dr. John", date: "2024-09-15", time: "11:00 AM", disease: "Cold", diseasetype: "chronic",assistant: "Dr. Brown" },
    { id: "A009", patientId: "P009", patientName: "John Doe", doctor: "Dr. Smith", date: "2024-09-16", time: "10:00 AM", disease: "Flu", diseasetype: "acute",assistant: "Dr. Adams" },
    { id: "A010", patientId: "P010", patientName: "Jane Roe", doctor: "Dr. John", date: "2024-09-15", time: "11:00 AM", disease: "Cold", diseasetype: "chronic",assistant: "Dr. Brown" },
    { id: "A011", patientId: "P011", patientName: "John Doe", doctor: "Dr. Adam", date: "2024-09-16", time: "10:00 AM", disease: "Flu", diseasetype: "acute",assistant: "Dr. Adams" },
    { id: "A012", patientId: "P012", patientName: "Jane Roe", doctor: "Dr. Adam", date: "2024-09-15", time: "11:00 AM", disease: "Cold", diseasetype: "chronic",assistant: "Dr. Brown" },
    // Add more appointments as needed
  ]);
  
  const [currentPage, setCurrentPage] = useState(1); // Tracks the current page
  const [entriesPerPage, setEntriesPerPage] = useState(10); // Tracks number of entries per page
  const [filters, setFilters] = useState({
    dateRange: "",
    diseasetype: "",
  });
  const [assistantDoctors, setAssistantDoctors] = useState([
    "Dr. Adams",
    "Dr. Brown",
    "Dr. Clark",
  ]);
  const [visibleDropdown, setVisibleDropdown] = useState(null);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
    setCurrentPage(1); // Reset to first page on filter change
  };

  const handleEntriesPerPageChange = (e) => {
    setEntriesPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page on entries change
  };

  // Filtering appointments
  const filteredAppointments = appointments.filter((appointment) => {
    // Add date filtering logic based on filters.dateRange
    return(
    (filters.diseasetype === "" || appointment.diseasetype.toLowerCase().includes(filters.diseasetype.toLowerCase()))
    );
  });

  // Pagination logic
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentAppointments = filteredAppointments.slice(indexOfFirstEntry, indexOfLastEntry);
  const totalPages = Math.ceil(filteredAppointments.length / entriesPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleExport = () => {
    // Convert the data to CSV format and trigger download
    const csvContent = "data:text/csv;charset=utf-8,"
      + filteredAppointments.map(appt => 
        `${appt.id},${appt.patientId},${appt.patientName},${appt.doctor},${appt.date},${appt.time},${appt.disease},${appt.assistant}`
      ).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "appointments.csv");
  };

  const handleChangeAssistant = (id, assistant) => {
    setAppointments(appointments.map(appt =>
      appt.id === id ? { ...appt, assistant } : appt
    ));
    setVisibleDropdown(null); // Hide the dropdown after action is taken
  };

  const toggleDropdown = (id) => {
    setVisibleDropdown(visibleDropdown === id ? null : id);
  };

  return (
    <DoctorLayout>
      <div className="p-7">
        <div className="flex justify-between mb-6">
          <h1 className="text-2xl font-bold">Appointment List</h1>
          <button onClick={handleExport} className="flex items-center space-x-2 text-white bg-blue-500 hover:bg-blue-600 py-2 px-4 rounded">
            <FaDownload />
            <span>Export</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex space-x-4 mb-6">
          <select
            name="dateRange"
            value={filters.dateRange}
            onChange={handleFilterChange}
            className="p-2 border border-gray-300 rounded-md bg-white hover:bg-gray-100"
          >
            <option value="">Select Date Range</option>
            <option value="today">Today</option>
            <option value="lastWeek">Last Week</option>
            <option value="lastMonth">Last Month</option>
            <option value="last3Months">Last 3 Months</option>
            <option value="last6Months">Last 6 Months</option>
            <option value="lastYear">Last Year</option>
          </select>
          <select
                        name="diseasetype"
                        value={filters.diseasetype}
                        onChange={handleFilterChange}
                        className="p-2 w-1/6 border border-gray-300 rounded-md bg-white hover:bg-gray-100"
                    >
                        <option value="">All types</option>
                        <option value="acute">Acute</option>
                        <option value="chronic">Chronic</option>
                    </select>
          
        </div>

        {/* Appointments Table */}
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="px-4 py-2 text-gray-700 font-medium">Patient ID</th>
              <th className="px-4 py-2 text-gray-700 font-medium">Patient Name</th>
              <th className="px-4 py-2 text-gray-700 font-medium">Consulting Doctor</th>
              <th className="px-4 py-2 text-gray-700 font-medium">Date</th>
              <th className="px-4 py-2 text-gray-700 font-medium">Time</th>
              <th className="px-4 py-2 text-gray-700 font-medium">Disease</th>
              <th className="px-4 py-2 text-gray-700 font-medium">Disease Type</th>
              <th className="px-4 py-2 text-gray-700 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentAppointments.length > 0 ? (
              currentAppointments.map((appointment) => (
                <tr key={appointment.id} className="border-b">
                  <td className="px-4 py-4">{appointment.patientId}</td>
                  <td className="px-4 py-4">{appointment.patientName}</td>
                  <td className="px-4 py-4">{appointment.doctor}</td>
                  <td className="px-4 py-4">{appointment.date}</td>
                  <td className="px-4 py-4">{appointment.time}</td>
                  <td className="px-4 py-4">{appointment.disease}</td>
                  <td className="px-4 py-4">{appointment.diseasetype}</td>
                  <td className="px-4 py-4 relative">
                    <button className="text-green-400 hover:text-green-500">
                      <FaVideo />
                    </button>
                    <button className="text-red-400 hover:text-red-500 px-5">
                      <FaTimes />
                    </button>
                    <button className="text-gray-600 hover:text-gray-900" onClick={() => toggleDropdown(appointment.id)}>
                      <FaEllipsisV />
                    </button>
                    {/* Dropdown menu */}
                    {visibleDropdown === appointment.id && (
                      <div className="absolute bg-white shadow-md rounded-lg p-2 mt-2 right-0 z-10 flex space-x-2 items-center">
                        <select
                          onChange={(e) => handleChangeAssistant(appointment.id, e.target.value)}
                          className="p-2 border rounded-md bg-white flex-shrink-0"
                        >
                          <option value="">Choose Assistant Doctor</option>
                          {assistantDoctors.map((doctor, index) => (
                            <option key={index} value={doctor}>
                              {doctor}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center p-4">
                  No matching appointments found.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4">
          <div>
            <label>
              Show{" "}
              <select value={entriesPerPage} onChange={handleEntriesPerPageChange} className="border p-2 rounded-md">
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={20}>20</option>
              </select>{" "}
              entries per page
            </label>
          </div>
          <div>
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded-md mx-1 hover:bg-blue-200"
            >
              Previous
            </button>
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index}
                onClick={() => paginate(index + 1)}
                className={`px-3 py-1 border rounded-md mx-1 ${
                  currentPage === index + 1 ? "bg-blue-300" : "hover:bg-blue-200"
                }`}
              >
                {index + 1}
              </button>
            ))}
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded-md mx-1 hover:bg-blue-200"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </DoctorLayout>
  );
};

export default AppointmentList;
