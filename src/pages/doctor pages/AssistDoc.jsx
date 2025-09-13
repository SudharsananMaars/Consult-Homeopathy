import React, { useState, useEffect, useRef} from "react";
import { FaEllipsisV, FaPlus, FaFileExport, FaEye, FaTrash, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import AddDoctorModal from "/src/pages/doctor pages/AddDoctorModal";
import config from '../../config';
const API_URL = config.API_URL;

const AssistDoc = () => {
    const navigate = useNavigate();
    const [dropdownVisible, setDropdownVisible] = useState(null);
    const dropdownRef = useRef(null);
    const buttonRef = useRef(null);

    const [doctors, setDoctors] = useState([]);
    const [filter, setFilter] = useState({ query: "" });
    const [currentPage, setCurrentPage] = useState(1);
    const [entriesPerPage, setEntriesPerPage] = useState(10);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [viewDetailsModal, setViewDetailsModal] = useState(false);
    const [doctorDetails, setDoctorDetails] = useState(null);
    
    // Fetch doctors from API
    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const response = await fetch(`${API_URL}/api/employees/all`);
                const data = await response.json();
                setDoctors(data);
            } catch (error) {
                console.error("Error fetching doctors:", error);
            }
        };
        fetchDoctors();
    }, []);

    // Fetch specific doctor details
    const fetchDoctorById = async (employeeID) => {
        try {
            const response = await fetch(`${API_URL}/api/employees/getEmployeeById/${employeeID}`);
            if (!response.ok) {
                throw new Error("Failed to fetch doctor details");
            }
            const doctorData = await response.json();

            if (!doctorData || !doctorData.employeeID) {
                throw new Error("Invalid doctor data");
            }

            setSelectedDoctor(doctorData);
            setIsModalOpen(true);
        } catch (error) {
            console.error("Error fetching doctor by ID:", error);
            alert("Failed to fetch doctor details.");   
        }
    };

    // Handle view details
    const handleViewDetails = (doctor) => {
        setDoctorDetails(doctor);
        setViewDetailsModal(true);
    };

    // Handle filter changes
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilter((prevFilter) => ({
            ...prevFilter,          
            [name]: value,
        }));
        setCurrentPage(1);
    };

    // Handle entries per page change
    const handleEntriesPerPageChange = (e) => {
        setEntriesPerPage(Number(e.target.value));
        setCurrentPage(1);
    };

    // Filtered and paginated doctors
    const filteredDoctors = doctors.filter((doctor) =>
        ["employeeID", "name", "phone", "personalEmail"].some((field) =>
            doctor[field]?.toLowerCase().includes(filter.query.toLowerCase())
        )
    );
    const indexOfLastEntry = currentPage * entriesPerPage;
    const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
    const currentDoctors = filteredDoctors.slice(indexOfFirstEntry, indexOfLastEntry);
    const totalPages = Math.ceil(filteredDoctors.length / entriesPerPage);

    // Handle pagination
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Open Add Doctor Modal
    const handleAddDoctor = () => {
        setSelectedDoctor(null);
        setIsModalOpen(true);
    };
    
    // Open Edit Doctor Modal
    const handleEditDoctor = (employeeID) => {
        setSelectedDoctor(null);
        fetchDoctorById(employeeID);
    };

    const handleDoctorSave = (updatedDoctor) => {
        if (selectedDoctor) {
            setDoctors((prevDoctors) =>
                prevDoctors.map((doc) =>
                    doc.employeeID === updatedDoctor.employeeID ? updatedDoctor : doc
                )
            );
        } else {
            setDoctors((prevDoctors) => [...prevDoctors, updatedDoctor]);
        }
        closeModal();
    };
    
    // Delete a doctor
    const handleDeleteDoctor = async (employeeID) => {
        if (window.confirm("Are you sure you want to delete this doctor?")) {
            try {
                await fetch(`${API_URL}/api/employees/delete/${employeeID}`, { method: "DELETE" });
                setDoctors((prevDoctors) => prevDoctors.filter((doctor) => doctor.employeeID !== employeeID));
                if (currentDoctors.length === 1 && currentPage > 1) {
                    setCurrentPage(currentPage - 1);
                }
                alert("Doctor deleted successfully!");
            } catch (error) {
                console.error("Error deleting doctor:", error);
                alert("Failed to delete the doctor.");
            }
        }
    };

    // Toggle dropdown visibility
    const toggleDropdown = (employeeID) => {
        setDropdownVisible(dropdownVisible === employeeID ? null : employeeID);
    };

    // Close dropdown if clicked outside
    useEffect(() => {
        const handleClickOutside = (event) => {
        if (
            dropdownRef.current &&
            !dropdownRef.current.contains(event.target) &&
            !buttonRef.current.contains(event.target)
        ) {
            setDropdownVisible(null);
        }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Close dropdown when an option is clicked
    const handleOptionClick = () => {
        setDropdownVisible(null);
    };
    
    const closeModal = () => {
        setSelectedDoctor(null);
        setIsModalOpen(false);
    };

    const closeViewModal = () => {
        setViewDetailsModal(false);
        setDoctorDetails(null);
    };
    
    return (
        <div>
            <div className="p-2">
                {/* Search and Export Controls */}
                <div className="flex justify-between mb-6">
                    <input
                        type="text"
                        name="query"
                        placeholder="Search by any field"
                        value={filter.query}
                        onChange={handleFilterChange}
                        className="p-2 border border-gray-300 rounded-md hover:bg-gray-100"
                    />
                </div>

                {/* Doctors Table */}
                <div style={{ maxHeight: "500px" }}>
  <table className="w-full overflow-hidden rounded-lg min-w-max">
    <thead className="sticky top-0 z-20">
      <tr className="border-b border-blue-200">
        <th className="bg-gray-100 text-center p-4 font-bold text-gray-700 text-sm" style={{ minWidth: "120px" }}>Doctor ID</th>
        <th className="bg-white text-center p-4 font-bold text-gray-700 text-sm" style={{ minWidth: "150px" }}>Name</th>
        <th className="bg-gray-100 text-center p-4 font-bold text-gray-700 text-sm" style={{ minWidth: "150px" }}>Designation</th>
        <th className="bg-white text-center p-4 font-bold text-gray-700 text-sm" style={{ minWidth: "120px" }}>Phone No</th>
        <th className="bg-gray-100 text-center p-4 font-bold text-gray-700 text-sm" style={{ minWidth: "200px" }}>Email</th>
        <th className="bg-white text-center p-4 font-bold text-gray-700 text-sm" style={{ minWidth: "120px" }}>Date of Birth</th>
        <th className="bg-gray-100 text-center p-4 font-bold text-gray-700 text-sm" style={{ minWidth: "100px" }}>Gender</th>
        <th className="bg-white text-center p-4 font-bold text-gray-700 text-sm" style={{ minWidth: "100px" }}>Actions</th>
      </tr>
    </thead>
    <tbody>
      {currentDoctors.length > 0 ? (
        currentDoctors.map((doctor, idx) => (
          <tr key={doctor.employeeID || idx} className="border-b border-blue-200 hover:bg-gray-50">
            <td 
              className="bg-gray-100 p-4 text-blue-500 hover:underline cursor-pointer text-center"
              onClick={() => handleEditDoctor(doctor.employeeID)}
              style={{ minWidth: "120px" }}
            >
              {doctor.employeeID}
            </td>
            <td className="bg-white p-4 text-gray-700 text-center" style={{ minWidth: "150px" }}>
              {doctor.name}
            </td>
            <td className="bg-gray-100 p-4 text-gray-700 text-center" style={{ minWidth: "150px" }}>
              {doctor.role}
            </td>
            <td className="bg-white p-4 text-gray-700 text-center" style={{ minWidth: "120px" }}>
              {doctor.phone}
            </td>
            <td className="bg-gray-100 p-4 text-gray-700 text-center" style={{ minWidth: "200px" }}>
              {doctor.personalEmail}
            </td>
            <td className="bg-white p-4 text-gray-700 text-center" style={{ minWidth: "120px" }}>
              {doctor.dateOfBirth}
            </td>
            <td className="bg-gray-100 p-4 text-gray-700 text-center" style={{ minWidth: "100px" }}>
              {doctor.gender}
            </td>
            <td className="bg-white p-4 text-center" style={{ minWidth: "100px" }}>
              <button
                onClick={() => handleViewDetails(doctor)}
                className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-xs font-medium transition-colors"
              >
                View
              </button>
            </td>
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan={8} className="bg-white text-center text-gray-500 py-6">
            No matching doctors found.
          </td>
        </tr>
      )}
    </tbody>
  </table>
</div>


                {/* Pagination Controls */}
                <div className="flex justify-between items-center mt-4">
                    <div>
                        <label>
                            Show{" "}
                            <select
                                value={entriesPerPage}
                                onChange={handleEntriesPerPageChange}
                                className="border p-2 rounded-md"
                            >
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={15}>15</option>
                                <option value={20}>20</option>
                                <option value={25}>25</option>
                                <option value={30}>30</option>
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

            {/* View Details Modal */}
            {viewDetailsModal && doctorDetails && (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">
                        Dr. {doctorDetails.name}
                    </h2>
                    <p className="text-sm text-gray-600">Employee ID: {doctorDetails.employeeID}</p>
                </div>
                <button
                    onClick={closeViewModal}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                >
                    <FaTimes size={20} className="text-gray-500" />
                </button>
            </div>
            
            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
                <div className="p-6 space-y-8">
                    {/* Personal Information */}
                    <section>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">
                            Personal Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                            <div className="space-y-3">
                                <div className="flex flex-col">
                                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Full Name</span>
                                    <span className="text-sm text-gray-900 mt-1">{doctorDetails.name}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Date of Birth</span>
                                    <span className="text-sm text-gray-900 mt-1">{doctorDetails.dateOfBirth}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Gender</span>
                                    <span className="text-sm text-gray-900 mt-1">{doctorDetails.gender}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Marital Status</span>
                                    <span className="text-sm text-gray-900 mt-1">{doctorDetails.maritalStatus}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Nationality</span>
                                    <span className="text-sm text-gray-900 mt-1">{doctorDetails.nationality}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Personal Email</span>
                                    <span className="text-sm text-gray-900 mt-1 break-all">{doctorDetails.personalEmail}</span>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="flex flex-col">
                                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Secondary Contact</span>
                                    <span className="text-sm text-gray-900 mt-1">{doctorDetails.secondaryContact}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Current Address</span>
                                    <span className="text-sm text-gray-900 mt-1">{doctorDetails.currentAddress}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Permanent Address</span>
                                    <span className="text-sm text-gray-900 mt-1">{doctorDetails.permanentAddress}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Emergency Contact</span>
                                    <span className="text-sm text-gray-900 mt-1">{doctorDetails.emergencyContactName}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Relationship</span>
                                    <span className="text-sm text-gray-900 mt-1">{doctorDetails.emergencyContactRelationship}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Emergency Number</span>
                                    <span className="text-sm text-gray-900 mt-1">{doctorDetails.emergencyContactNumber}</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Job Details */}
                    <section>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">
                            Job Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                            <div className="space-y-3">
                                <div className="flex flex-col">
                                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Employee ID</span>
                                    <span className="text-sm text-gray-900 mt-1">{doctorDetails.employeeID}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Job Title</span>
                                    <span className="text-sm text-gray-900 mt-1">{doctorDetails.role}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Department</span>
                                    <span className="text-sm text-gray-900 mt-1">{doctorDetails.department}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Date of Joining</span>
                                    <span className="text-sm text-gray-900 mt-1">{doctorDetails.dateOfJoining}</span>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="flex flex-col">
                                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Employment Type</span>
                                    <span className="text-sm text-gray-900 mt-1">{doctorDetails.employmentType}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Work Location</span>
                                    <span className="text-sm text-gray-900 mt-1">{doctorDetails.workLocation}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Reporting Manager</span>
                                    <span className="text-sm text-gray-900 mt-1">{doctorDetails.reportingManager}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Work Shift</span>
                                    <span className="text-sm text-gray-900 mt-1">{doctorDetails.workShift}</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Compensation Details */}
                    <section>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">
                            Compensation Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                            <div className="space-y-3">
                                <div className="flex flex-col">
                                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Basic Salary</span>
                                    <span className="text-sm text-gray-900 mt-1">{doctorDetails.basicSalary}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Allowances</span>
                                    <span className="text-sm text-gray-900 mt-1">{doctorDetails.allowances}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Deductions</span>
                                    <span className="text-sm text-gray-900 mt-1">{doctorDetails.deductions}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Bank Account</span>
                                    <span className="text-sm text-gray-900 mt-1">{doctorDetails.bankAccountNumber}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Bank & Branch</span>
                                    <span className="text-sm text-gray-900 mt-1">{doctorDetails.bankName}</span>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="flex flex-col">
                                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">IFSC Code</span>
                                    <span className="text-sm text-gray-900 mt-1">{doctorDetails.ifscCode}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Payment Frequency</span>
                                    <span className="text-sm text-gray-900 mt-1">{doctorDetails.paymentFrequency}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">PF Number</span>
                                    <span className="text-sm text-gray-900 mt-1">{doctorDetails.pfNumber}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">ESI Number</span>
                                    <span className="text-sm text-gray-900 mt-1">{doctorDetails.esiNumber}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Tax Preferences</span>
                                    <span className="text-sm text-gray-900 mt-1">{doctorDetails.taxDeductionPreferences}</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Education & Professional */}
                    <section>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">
                            Educational & Professional Background
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                            <div className="space-y-3">
                                <div className="flex flex-col">
                                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Highest Qualification</span>
                                    <span className="text-sm text-gray-900 mt-1">{doctorDetails.highestQualification}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Specialization</span>
                                    <span className="text-sm text-gray-900 mt-1">{doctorDetails.specialization}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Year of Graduation</span>
                                    <span className="text-sm text-gray-900 mt-1">{doctorDetails.yearOfGraduation}</span>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="flex flex-col">
                                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Medical Registration</span>
                                    <span className="text-sm text-gray-900 mt-1">{doctorDetails.medicalRegistrationNumber}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Experience</span>
                                    <span className="text-sm text-gray-900 mt-1">{doctorDetails.totalExperience}</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Previous Employment */}
                    <section>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">
                            Previous Employment
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                            <div className="space-y-3">
                                <div className="flex flex-col">
                                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Company Name</span>
                                    <span className="text-sm text-gray-900 mt-1">{doctorDetails.previousEmployer}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Duration</span>
                                    <span className="text-sm text-gray-900 mt-1">{doctorDetails.previousDuration}</span>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="flex flex-col">
                                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Job Role</span>
                                    <span className="text-sm text-gray-900 mt-1">{doctorDetails.previousJobRole}</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* System Access */}
                    <section>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">
                            System Access & Credentials
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                            <div className="space-y-3">
                                <div className="flex flex-col">
                                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Username</span>
                                    <span className="text-sm text-gray-900 mt-1 font-mono bg-gray-50 px-2 py-1 rounded">
                                        {doctorDetails.usernameSystemAccess}
                                    </span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Temporary Password</span>
                                    <span className="text-sm text-gray-900 mt-1 font-mono bg-gray-50 px-2 py-1 rounded">
                                        {doctorDetails.temporaryPassword}
                                    </span>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="flex flex-col">
                                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Access Level</span>
                                    <span className="text-sm text-gray-900 mt-1">
                                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                                            {doctorDetails.accessLevel}
                                        </span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    </div>
)}

            {/* Add/Edit Doctor Modal */}
            {isModalOpen && (
                <AddDoctorModal
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    onSave={handleDoctorSave}
                    doctor={selectedDoctor}
                />
            )}
            
            {/* Add New Doctor Button */}
            <div className="fixed bottom-5 right-5">
                <button
                    onClick={handleAddDoctor}
                    className="rounded-full shadow-md p-4 bg-blue-500 text-white text-xl hover:bg-blue-600"
                >
                    <FaPlus />
                </button>
            </div>
        </div>
    );
};

export default AssistDoc;