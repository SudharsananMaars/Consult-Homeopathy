import React, { useState } from "react";
import Layout from "../../components/patient components/Layout";
import { FiDownload } from "react-icons/fi";
import { useNavigate } from "react-router-dom";


const Payments =() => {
    const navigate = useNavigate();
    const [dropdownVisible, setDropdownVisible]=useState(null);

    const [patients, setPatients] = useState([
        { patientname: "John Doe",receivername: "Dr.Shilfa", date: "2024-09-12 10:30 AM",paymentid:"id1", service: "Consultation", amount: "Rs.500", method: "G Pay", status: "Unpaid" },
        { patientname: "Jane Smith",receivername: "Dr.Shilfa", date: "2024-09-11 2:00 PM", paymentid:"id1",service: "Workshop", amount: "Rs.300", method: "PhonePe",status: "Unpaid" },
        { patientname: "Emily Johnson",receivername: "Dr.Shilfa", date: "2024-09-10 3:45 PM", paymentid:"id1",service: "Medicine", amount: "Rs.600", method: "Amazon Pay",status: "Success" },
        { patientname: "John Doe",receivername: "Dr.Shilfa", date: "2024-09-12 10:30 AM",paymentid:"id1", service: "Consultation", amount: "Rs.500", method: "G Pay",status: "Success" },
        { patientname: "Jane Smith",receivername: "Dr.Shilfa", date: "2024-09-11 2:00 PM", paymentid:"id1",service: "Workshop", amount: "Rs.300", method: "PhonePe",status: "Success"},
        
        // Add more patients as needed
           ]);


    const [filters, setFilters] = useState({
        status: "",
        service: "",
        method: "",
    });

    const [currentPage, setCurrentPage] = useState(1); // Tracks the current page
    const [entriesPerPage, setEntriesPerPage] = useState(10); // Tracks number of entries per page

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters({ ...filters, [name]: value });
        setCurrentPage(1); // Reset to first page on filter change
    };

    const handleEntriesPerPageChange = (e) => {
        setEntriesPerPage(Number(e.target.value));
        setCurrentPage(1); // Reset to first page on entries change
    };

    const confirm = () => {
        navigate('/paymentpage');
    };

    // Search by Patient ID and apply other filters
    const filteredPatients = patients.filter((patient) =>
        (filters.status === "" || patient.status.toLowerCase().includes(filters.status.toLowerCase())) &&
        (filters.service === "" || patient.service.toLowerCase().includes(filters.service.toLowerCase())) &&
        (filters.method === "" || patient.method.toLowerCase().includes(filters.method.toLowerCase()))
    );

    // Pagination logic
    const indexOfLastEntry = currentPage * entriesPerPage;
    const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
    const currentPatients = filteredPatients.slice(indexOfFirstEntry, indexOfLastEntry);
    const totalPages = Math.ceil(filteredPatients.length / entriesPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Function to assign background color based on status
    const getStatusBgColor = (service) => {
        switch (service) {
            case "Consultation":
                return "bg-green-100 text-green-700";
            case "Workshop":
                return "bg-blue-100 text-blue-700";
            case "Medicine":
                return "bg-yellow-100 text-yellow-700";
            default:
                return "";
        }
    };

    const handleViewDetails = (id) => {
        navigate(`/payments/viewdetails/${id}`);
    };
    const toggleDropdown = (id) => {
        setDropdownVisible(dropdownVisible === id ? null : id);
    };


    return (
        <Layout>
            <div className="p-6 mt-5">
                <h1 className="text-2xl font-bold mb-4">Payments</h1>

                {/* Filters */}
                <div className="flex space-x-4 mb-6">
                    <input
                        type="text"
                        name="patientId"
                        placeholder="Search by Patient ID"
                        onChange={handleFilterChange}
                        className="p-2 border border-gray-300 rounded-md hover:bg-gray-100"
                    />
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
                        name="service"
                        value={filters.service}
                        onChange={handleFilterChange}
                        className="p-2 w-1/6 border border-gray-300 rounded-md bg-white hover:bg-gray-100"
                    >
                        <option value="">All Services</option>
                        <option value="Consultation">Consultation</option>
                        <option value="Workshop">Workshop</option>
                        <option value="Medicine">Medicine</option>
                    </select>
                    <select
                        name="method"
                        value={filters.method}
                        onChange={handleFilterChange}
                        className="p-2 w-1/6 border border-gray-300 rounded-md bg-white hover:bg-gray-100"
                    >
                        <option value="">All Methods</option>
                        <option value="G Pay">G Pay</option>
                        <option value="PhonePe">PhonePe</option>
                        <option value="Amazon Pay">Amazon Pay</option>
                    </select>
                    <select
                        name="method"
                        value={filters.status}
                        onChange={handleFilterChange}
                        className="p-2 w-1/6 border border-gray-300 rounded-md bg-white hover:bg-gray-100"
                    >
                        <option value="">All Statuses</option>
                        <option value="Unpaid">Unpaid</option>
                        <option value="Success">Success</option>
                       
                    </select>
                </div>

                {/* Patient Table */}
                <table className="w-full table-auto border-collapse">
                    <thead>
                        <tr className="bg-gray-100 text-left">
                            <th className="px-4 py-2">Patient Name</th>
                            <th className="px-4 py-2">Receiver Name</th>
                            <th className="px-4 py-2">Date & Time</th>
                            <th className="px-4 py-2">Payment ID</th>
                            <th className="px-4 py-2">Service</th>
                            <th className="px-4 py-2">Amount</th>
                            <th className="px-4 py-2">Methods</th>
                            <th className="px-4 py-2">Status</th>
                            <th className="px-4 py-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentPatients.length > 0 ? (
                            currentPatients.map((patient) => (
                                <tr key={patient.id} className="border-b">
                                    <td className="px-4 py-4">{patient.patientname}</td>
                                    <td className="px-4 py-4">{patient.receivername}</td>
                                    <td className="px-4 py-4">{patient.date}</td>
                                    <td className="px-4 py-4">{patient.paymentid}</td>
                                    <td className="px-4 py-4">
                                        <span
                                            className={`px-2 py-1 rounded-full text-sm font-semibold ${getStatusBgColor(
                                                patient.service
                                            )}`}
                                        >
                                            {patient.service}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4">{patient.amount}</td>
                                    <td className="px-4 py-4">{patient.method}</td>
                                    <td className="px-4 py-4">{patient.status}</td>
                                    <td className="px-4 py-4 relative">
                                    {patient.status === "Unpaid" ? (
                                                <button
                                                    onClick={confirm}
                                                    className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-5 ml-4 rounded-md"
                                                >
                                                    Pay
                                                </button>
                                            ) : (
                                                <a href="#" className="flex items-center space-x-1 text-blue-400 hover:text-blue-500">
                                                    <FiDownload className="mr-2" />
                                                    <span>Download</span>
                                                </a>
                                            )}

                
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="text-center p-4">
                                    No matching patients found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* Pagination controls */}
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
        </Layout>
    );
};

export default Payments;
