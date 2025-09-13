import React, { useState, useEffect } from "react";
import DoctorLayout from "/src/components/doctor components/DoctorLayout.jsx";
import { FaEllipsisV } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import config from "../../config";
// Configure your API URL (you can also use environment variables)
const API_URL = config.API_URL || "http://localhost:5000";

const Patients = () => {
    const navigate = useNavigate();
    const [dropdownVisible, setDropdownVisible] = useState(null);
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [filters, setFilters] = useState({
        patientId: "",
        doctor: "",
        status: "",
        diseaseType: "",
    });

    const [currentPage, setCurrentPage] = useState(1);
    const [entriesPerPage, setEntriesPerPage] = useState(10);
    const [doctors, setDoctors] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [diseaseTypes, setDiseaseTypes] = useState([]);

    // Fetch patient data from API
    useEffect(() => {
        const fetchPatients = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${API_URL}/api/log/list`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                });
                
                // Transform the API response to match our component's expected structure
                const transformedData = response.data.map(patient => ({
                    id: patient._id,
                    name: patient.name || "Unknown",
                    recentVisit: new Date(patient.updatedAt).toLocaleString(),
                    doctor: patient.medicalDetails?.doctor || "Unassigned",
                    disease: patient.medicalDetails?.diseaseType?.name || "Not specified",
                    diseaseType: patient.medicalDetails?.diseaseType?.category || "Not specified",
                    status: getPatientStatus(patient),
                    phone: patient.phone,
                    email: patient.email,
                    age: patient.age,
                    newExisting: patient.newExisting,
                    followUp: patient.follow,
                    rawData: patient // Store the original data for reference
                }));
                
                setPatients(transformedData);
                
                // Extract unique values for filters
                const uniqueDoctors = [...new Set(transformedData.map(p => p.doctor).filter(Boolean))];
                const uniqueStatuses = [...new Set(transformedData.map(p => p.status).filter(Boolean))];
                const uniqueDiseaseTypes = [...new Set(transformedData.map(p => p.diseaseType).filter(Boolean))];
                
                setDoctors(uniqueDoctors);
                setStatuses(uniqueStatuses);
                setDiseaseTypes(uniqueDiseaseTypes);
                
                setLoading(false);
            } catch (err) {
                console.error("Error fetching patient data:", err);
                setError("Failed to load patient data. Please try again later.");
                setLoading(false);
            }
        };

        fetchPatients();
    }, []);

    // Helper function to determine patient status based on various fields
    const getPatientStatus = (patient) => {
        if (patient.medicalDetails?.enquiryStatus === "Recovered") return "Recovered";
        if (patient.newExisting === "New") return "New Patient";
        if (patient.medicalDetails?.enquiryStatus === "Enquired") return "In Treatment";
        return patient.medicalDetails?.enquiryStatus || "Unknown";
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters({ ...filters, [name]: value });
        setCurrentPage(1); // Reset to first page on filter change
    };

    const handleEntriesPerPageChange = (e) => {
        setEntriesPerPage(Number(e.target.value));
        setCurrentPage(1); // Reset to first page on entries change
    };

    // Filter patients based on search criteria
    const filteredPatients = patients.filter((patient) =>
        (patient.id.toLowerCase().includes(filters.patientId.toLowerCase()) ||
         patient.name.toLowerCase().includes(filters.patientId.toLowerCase())) &&
        (filters.doctor === "" || patient.doctor.toLowerCase().includes(filters.doctor.toLowerCase())) &&
        (filters.status === "" || patient.status.toLowerCase().includes(filters.status.toLowerCase())) &&
        (filters.diseaseType === "" || patient.diseaseType.toLowerCase().includes(filters.diseaseType.toLowerCase()))
    );

    // Pagination logic
    const indexOfLastEntry = currentPage * entriesPerPage;
    const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
    const currentPatients = filteredPatients.slice(indexOfFirstEntry, indexOfLastEntry);
    const totalPages = Math.ceil(filteredPatients.length / entriesPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Function to assign background color based on status
    const getStatusBgColor = (status) => {
        switch (status) {
            case "Recovered":
                return "bg-green-100 text-green-700";
            case "New Patient":
                return "bg-blue-100 text-blue-700";
            case "In Treatment":
                return "bg-yellow-100 text-yellow-700";
            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    const handleViewDetails = (id) => {
        navigate(`/patients/viewdetails/${id}`);
    };
    
    const toggleDropdown = (id) => {
        setDropdownVisible(dropdownVisible === id ? null : id);
    };

    if (loading) {
        return (
            <DoctorLayout>
                <div className="p-7 flex justify-center items-center h-screen">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                        <p className="mt-3">Loading patient data...</p>
                    </div>
                </div>
            </DoctorLayout>
        );
    }

    if (error) {
        return (
            <DoctorLayout>
                <div className="p-7">
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
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
                <div className="bg-white rounded-xl shadow-md p-6">
                <h1 className="text-2xl font-bold mb-4">Patients</h1>

                {/* Filters */}
                <div className="flex flex-wrap gap-4 mb-6">
                    <input
                        type="text"
                        name="patientId"
                        placeholder="Search by ID or Name"
                        value={filters.patientId}
                        onChange={handleFilterChange}
                        className="p-2 border border-gray-300 rounded-md hover:bg-gray-100"
                    />
                    <select
                        name="doctor"
                        value={filters.doctor}
                        onChange={handleFilterChange}
                        className="p-2 w-40 border border-gray-300 rounded-md bg-white hover:bg-gray-100"
                    >
                        <option value="">All Doctors</option>
                        {doctors.map((doctor, index) => (
                            <option key={index} value={doctor}>{doctor}</option>
                        ))}
                    </select>
                    <select
                        name="status"
                        value={filters.status}
                        onChange={handleFilterChange}
                        className="p-2 w-40 border border-gray-300 rounded-md bg-white hover:bg-gray-100"
                    >
                        <option value="">All Statuses</option>
                        {statuses.map((status, index) => (
                            <option key={index} value={status}>{status}</option>
                        ))}
                    </select>
                    <select
                        name="diseaseType"
                        value={filters.diseaseType}
                        onChange={handleFilterChange}
                        className="p-2 w-40 border border-gray-300 rounded-md bg-white hover:bg-gray-100"
                    >
                        <option value="">All Disease Types</option>
                        {diseaseTypes.map((type, index) => (
                            <option key={index} value={type}>{type}</option>
                        ))}
                    </select>
                </div>

             
  <table className="w-full overflow-hidden rounded-lg">
    <thead>
      <tr className="border-b border-blue-200">
        <th className="bg-gray-100 text-center p-4 font-bold text-gray-700 text-sm">
          Patient ID
        </th>
        <th className="bg-white text-center p-4 font-bold text-gray-700 text-sm">
          Name
        </th>
        <th className="bg-gray-100 text-center p-4 font-bold text-gray-700 text-sm">
          Recent Visit
        </th>
        <th className="bg-white text-center p-4 font-bold text-gray-700 text-sm">
          Doctor Assigned
        </th>
        <th className="bg-gray-100 text-center p-4 font-bold text-gray-700 text-sm">
          Disease
        </th>
        <th className="bg-white text-center p-4 font-bold text-gray-700 text-sm">
          Disease Type
        </th>
        <th className="bg-gray-100 text-center p-4 font-bold text-gray-700 text-sm">
          Status
        </th>
        <th className="bg-white text-center p-4 font-bold text-gray-700 text-sm">
          Follow Up
        </th>
        <th className="bg-gray-100 text-center p-4 font-bold text-gray-700 text-sm">
          Actions
        </th>
      </tr>
    </thead>
    <tbody>
      {currentPatients.length > 0 ? (
        currentPatients.map((patient, idx) => (
          <tr key={patient.id || idx} className="border-b border-blue-200">
            {/* Patient ID */}
            <td className="bg-gray-100 p-4 text-gray-900 text-center">
              {patient.id.slice(-6)}
            </td>
            {/* Name */}
            <td className="bg-white p-4 text-gray-600 text-center">
              {patient.name}
            </td>
            {/* Recent Visit */}
            <td className="bg-gray-100 p-4 text-gray-600 text-center">
              {patient.recentVisit}
            </td>
            {/* Doctor */}
            <td className="bg-white p-4 text-gray-600 text-center">
              {patient.doctor}
            </td>
            {/* Disease */}
            <td className="bg-gray-100 p-4 text-gray-600 text-center">
              {patient.disease}
            </td>
            {/* Disease Type */}
            <td className="bg-white p-4 text-gray-600 text-center">
              {patient.diseaseType}
            </td>
            {/* Status */}
            <td className="bg-gray-100 p-4 text-center">
              <span
                className={`px-2 py-1 rounded-full text-sm font-semibold ${getStatusBgColor(
                  patient.status
                )}`}
              >
                {patient.status}
              </span>
            </td>
            {/* Follow Up */}
            <td className="bg-white p-4 text-gray-600 text-center">
              {patient.followUp}
            </td>
            {/* Actions */}
            <td className="bg-gray-100 p-4 text-center">
              <button
                onClick={() => handleViewDetails(patient.id)}
                className="inline-flex items-center px-2.5 py-1.5 border text-xs font-medium rounded-[5px] text-white bg-blue-500 hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                View
              </button>
            </td>
          </tr>
        ))
      ) : (
        <tr>
          <td
            colSpan={9}
            className="bg-white text-center text-gray-500 py-6"
          >
            No matching patients found.
          </td>
        </tr>
      )}
    </tbody>
  </table>
                {/* Pagination controls */}
                <div className="flex flex-wrap justify-between items-center mt-4">
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
                        <span className="ml-4">
                            Showing {indexOfFirstEntry + 1} to {Math.min(indexOfLastEntry, filteredPatients.length)} of {filteredPatients.length} entries
                        </span>
                    </div>
                    <div className="mt-4 sm:mt-0">
                        <button
                            onClick={() => paginate(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`px-3 py-1 border rounded-md mx-1 ${currentPage === 1 ? 'bg-gray-100 cursor-not-allowed' : 'hover:bg-blue-200'}`}
                        >
                            Previous
                        </button>
                        {[...Array(Math.min(5, totalPages))].map((_, index) => {
                            // Show a window of pages centered on the current page
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
                                        className={`px-3 py-1 border rounded-md mx-1 ${
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
                            className={`px-3 py-1 border rounded-md mx-1 ${currentPage === totalPages ? 'bg-gray-100 cursor-not-allowed' : 'hover:bg-blue-200'}`}
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

export default Patients;