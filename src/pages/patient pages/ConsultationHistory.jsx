import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import Layout from "/src/components/patient components/Layout.jsx";
import { FaDownload, FaCog } from "react-icons/fa";

const ConsultationHistory = () => {
  const [consultations, setConsultations] = useState([
    // Sample data
    {
      consultationNo: "C001",
      date: "2024-09-16",
      time: "10:00 AM",
      doctor: "Dr. Smith",
    },
    {
      consultationNo: "C002",
      date: "2024-09-15",
      time: "11:00 AM",
      doctor: "Dr. John",
    },
  ]);

  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  const navigate = useNavigate(); // Initialize useNavigate

  const handleEntriesPerPageChange = (e) => {
    setEntriesPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  // Pagination logic
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentConsultations = consultations.slice(
    indexOfFirstEntry,
    indexOfLastEntry
  );
  const totalPages = Math.ceil(consultations.length / entriesPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleAction = (consultationNo) => {
    // Navigate to the ConsultDetail page
    navigate(`/consultdetail/consultationNo`);
  };

  return (
    <Layout>
      <div className="p-7">
        <div className="flex justify-between mb-6">
          <h1 className="text-2xl font-bold">Consultation History</h1>
          <button className="flex items-center space-x-2 text-white bg-blue-500 hover:bg-blue-600 py-2 px-4 rounded">
            <FaDownload />
            <span>Export</span>
          </button>
        </div>

        {/* Entries Per Page */}
        <div className="flex justify-end mb-4">
          <select
            value={entriesPerPage}
            onChange={handleEntriesPerPageChange}
            className="p-2 border border-gray-300 rounded-md bg-white hover:bg-gray-100"
          >
            <option value={5}>5 Entries</option>
            <option value={10}>10 Entries</option>
            <option value={20}>20 Entries</option>
          </select>
        </div>

        {/* Consultations Table */}
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="px-4 py-2 text-gray-700 font-medium">
                Consultation No
              </th>
              <th className="px-4 py-2 text-gray-700 font-medium">Date</th>
              <th className="px-4 py-2 text-gray-700 font-medium">Time</th>
              <th className="px-4 py-2 text-gray-700 font-medium">
                Consulting Doctor
              </th>
              <th className="px-4 py-2 text-gray-700 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentConsultations.length > 0 ? (
              currentConsultations.map((consultation) => (
                <tr key={consultation.consultationNo} className="border-b">
                  <td className="px-4 py-4">{consultation.consultationNo}</td>
                  <td className="px-4 py-4">{consultation.date}</td>
                  <td className="px-4 py-4">{consultation.time}</td>
                  <td className="px-4 py-4">{consultation.doctor}</td>
                  <td className="px-4 py-4">
                    <button
                      onClick={() => handleAction(consultation.consultationNo)}
                      className="text-white bg-blue-500 hover:bg-blue-600 py-2 px-4 rounded flex items-center space-x-2"
                    >
                      <FaCog />
                      <span>Action</span>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center text-gray-500 py-4">
                  No Consultations Found
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex justify-between mt-4">
          <span>
            Showing {indexOfFirstEntry + 1} to{" "}
            {Math.min(indexOfLastEntry, consultations.length)} of{" "}
            {consultations.length} entries
          </span>
          <div className="space-x-2">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => paginate(i + 1)}
                className={`px-3 py-1 border ${
                  currentPage === i + 1
                    ? "bg-blue-500 text-white"
                    : "bg-white text-gray-700"
                } rounded`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ConsultationHistory;
