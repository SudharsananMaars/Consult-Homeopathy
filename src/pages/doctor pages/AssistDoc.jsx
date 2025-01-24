import React, { useState, useEffect, useRef} from "react";
import { FaEllipsisV, FaPlus, FaFileExport, FaEye, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import AddDoctorModal from "/src/pages/doctor pages/AddDoctorModal";

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
    
    // Fetch doctors from API
    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const response = await fetch("http://localhost:5000/api/employees/all");
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
            const response = await fetch(`http://localhost:5000/api/employees/getEmployeeById/${employeeID}`);
            if (!response.ok) {
                throw new Error("Failed to fetch doctor details");
            }
            const doctorData = await response.json();

            if (!doctorData || !doctorData.employeeID) {
                throw new Error("Invalid doctor data");
            }

            setSelectedDoctor(doctorData); // Pre-fill modal with fetched data
            setIsModalOpen(true); // Open the modal
        } catch (error) {
            console.error("Error fetching doctor by ID:", error);
            alert("Failed to fetch doctor details.");   
        }
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

    // View doctor details
    const handleViewDetails = (employeeID) => {
        navigate(`/assistdoc/doctorprofile/${employeeID}`);
    };

    // Open Add Doctor Modal
    const handleAddDoctor = () => {
        setSelectedDoctor(null); // Reset for add mode
        setIsModalOpen(true);
    };
    
    // Open Edit Doctor Modal
    const handleEditDoctor = (employeeID) => {
        setSelectedDoctor(null);  // Clear the previous selected doctor in case of modal reuse
        fetchDoctorById(employeeID);
    };

    const handleDoctorSave = (updatedDoctor) => {
        if (selectedDoctor) {
            // Edit mode: update existing doctor
            setDoctors((prevDoctors) =>
                prevDoctors.map((doc) =>
                    doc.employeeID === updatedDoctor.employeeID ? updatedDoctor : doc
                )
            );
        } else {
            // Add mode: add a new doctor
            setDoctors((prevDoctors) => [...prevDoctors, updatedDoctor]);
        }
    
        closeModal(); // Close modal after saving
    };
    
    // Delete a doctor
    const handleDeleteDoctor = async (employeeID) => {
        if (window.confirm("Are you sure you want to delete this doctor?")) {
            try {
                await fetch(`http://localhost:5000/api/employees/delete/${employeeID}`, { method: "DELETE" });
                setDoctors((prevDoctors) => prevDoctors.filter((doctor) => doctor.employeeID !== employeeID));
                if (currentDoctors.length === 1 && currentPage > 1) {
                    setCurrentPage(currentPage - 1); // Adjust pagination if the last entry is deleted
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
        setDropdownVisible(null); // Close the dropdown when any option is clicked
    };
    const closeModal = () => {
        setSelectedDoctor(null); // Reset selected doctor
        setIsModalOpen(false); // Close modal
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
                    {/* <button
                        onClick={() => alert("Exporting doctors' data...")}
                        className="bg-blue-500 text-white p-2 rounded-md shadow-md hover:bg-blue-600 transition-all flex items-center"
                    >
                        <FaFileExport className="mr-2" />
                        Export
                    </button> */}
                </div>

                {/* Doctors Table */}
                <table className="w-full table-auto border-collapse">
                    <thead>
                        <tr className="bg-gray-100 text-left">
                            <th className="px-4 py-2">Doctor ID</th>
                            <th className="px-4 py-2">Name</th>
                            <th className="px-4 py-2">Created At</th>
                            <th className="px-4 py-2">Phone No</th>
                            <th className="px-4 py-2">Email</th>
                            <th className="px-4 py-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentDoctors.length > 0 ? (
                            currentDoctors.map((doctor) => (
                                <tr key={doctor.employeeID} className="border-b">
                                    <td className="px-4 py-4">{doctor.employeeID}</td>
                                    <td className="px-4 py-4">{doctor.name}</td>
                                    <td className="px-4 py-4">{doctor.createdAt}</td>
                                    <td className="px-4 py-4">{doctor.phone}</td>
                                    <td className="px-4 py-4">{doctor.personalEmail}</td>
                                    <td className="px-4 py-4 relative">
                                <button
                                    ref={buttonRef} // Ref to button for detecting click outside
                                    onClick={() => toggleDropdown(doctor.employeeID)}
                                    className="text-gray-600 hover:text-gray-900"
                                >
                                    <FaEllipsisV />
                                </button>
                                {dropdownVisible === doctor.employeeID && (
                                    <div
                                    ref={dropdownRef} // Ref to dropdown for detecting click outside
                                    className="absolute bg-white shadow-md rounded-lg p-2 mt-2 right-0 z-10"
                                    >
                                    <button
                                        onClick={() => {
                                        handleEditDoctor(doctor.employeeID);
                                        handleOptionClick(); // Close dropdown after Edit is clicked
                                        }}
                                        className="w-full text-blue-400 text-left p-2 hover:bg-gray-100 flex items-center"
                                    >
                                        <FaEye className="mr-2" />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => {
                                        handleDeleteDoctor(doctor.employeeID);
                                        handleOptionClick(); // Close dropdown after Delete is clicked
                                        }}
                                        className="w-full text-red-400 text-left p-2 hover:bg-gray-100 flex items-center"
                                    >
                                        <FaTrash className="mr-2" />
                                        Delete
                                    </button>
                                    </div>
                                )}
                                </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="text-center p-4">
                                    No matching doctors found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

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

            {/* Add/Edit Doctor Modal */}
            {isModalOpen && (
                <AddDoctorModal
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    onSave={handleDoctorSave}
                    doctor={selectedDoctor} // Pass selected doctor for editing
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
