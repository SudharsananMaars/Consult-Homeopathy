import React, { useState, useEffect } from "react";
import DoctorLayout from "/src/components/doctor components/DoctorLayout.jsx";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import config from "../../config";

const API_URL = config.API_URL;
const userId = localStorage.getItem("userId");

const Payments = () => {
    const navigate = useNavigate();
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [filters, setFilters] = useState({
        patientId: "",
        service: "",
        dateRange: "",
    });

    const [currentPage, setCurrentPage] = useState(1);
    const [entriesPerPage, setEntriesPerPage] = useState(10);

    // Get userId from localStorage or context (adjust based on your app structure)
    const userId = localStorage.getItem("userId"); // Replace with actual user ID logic

    // Fetch payments data from API
    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");

            const response = await axios.get(
                `${API_URL}/api/doctor/show-all-payments-doctor/${userId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            
            if (response.data.success && response.data.data) {
                setPayments(response.data.data);
            } else {
                setError('No payment data available');
            }
        } catch (err) {
            setError(err.message || 'Failed to fetch payments');
            console.error('Error fetching payments:', err);
        } finally {
            setLoading(false);
        }
    };

    // Format date and time
    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    // Get service type (placeholder for now)
    const getServiceType = () => {
        const services = ["Consultation", "Workshop", "Medicine"];
        return services[Math.floor(Math.random() * services.length)];
    };

    // Function to assign background color based on service
    const getStatusBgColor = (service) => {
        switch (service) {
            case "Consultation":
                return "bg-green-100 text-green-700";
            case "Workshop":
                return "bg-blue-100 text-blue-700";
            case "Medicine":
                return "bg-yellow-100 text-yellow-700";
            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters({ ...filters, [name]: value });
        setCurrentPage(1);
    };

    const handleEntriesPerPageChange = (e) => {
        setEntriesPerPage(Number(e.target.value));
        setCurrentPage(1);
    };

    // Filter payments based on search criteria
    const filteredPayments = payments.filter((payment) => {
        const matchesPatientId = payment._id?.toLowerCase().includes(filters.patientId.toLowerCase()) || '';
        const matchesService = filters.service === "" || getServiceType().toLowerCase().includes(filters.service.toLowerCase());
        
        // Date range filtering (you can implement this based on your requirements)
        let matchesDateRange = true;
        if (filters.dateRange) {
            const paymentDate = new Date(payment.createdAt);
            const now = new Date();
            
            switch (filters.dateRange) {
                case "today":
                    matchesDateRange = paymentDate.toDateString() === now.toDateString();
                    break;
                case "lastWeek":
                    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    matchesDateRange = paymentDate >= lastWeek;
                    break;
                case "lastMonth":
                    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
                    matchesDateRange = paymentDate >= lastMonth;
                    break;
                case "last3Months":
                    const last3Months = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
                    matchesDateRange = paymentDate >= last3Months;
                    break;
                case "last6Months":
                    const last6Months = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
                    matchesDateRange = paymentDate >= last6Months;
                    break;
                case "lastYear":
                    const lastYear = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
                    matchesDateRange = paymentDate >= lastYear;
                    break;
                default:
                    matchesDateRange = true;
            }
        }
        
        return matchesPatientId && matchesService && matchesDateRange;
    });

    // Pagination logic
    const indexOfLastEntry = currentPage * entriesPerPage;
    const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
    const currentPayments = filteredPayments.slice(indexOfFirstEntry, indexOfLastEntry);
    const totalPages = Math.ceil(filteredPayments.length / entriesPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    if (loading) {
        return (
            <DoctorLayout>
                <div className="p-7">
                    <div className="flex justify-center items-center h-64">
                        <div className="text-lg">Loading payments...</div>
                    </div>
                </div>
            </DoctorLayout>
        );
    }

    if (error) {
        return (
            <DoctorLayout>
                <div className="p-7">
                    <div className="flex justify-center items-center h-64">
                        <div className="text-red-600">Error: {error}</div>
                    </div>
                </div>
            </DoctorLayout>
        );
    }

    return (
        <DoctorLayout>
            <div className="p-7">
                <div className="bg-white rounded-xl shadow-md p-6">
                <h1 className="text-2xl font-bold mb-4">Payments</h1>

                {/* Filters */}
                <div className="flex space-x-4 mb-6">
                    <input
                        type="text"
                        name="patientId"
                        placeholder="Search by Payment ID"
                        value={filters.patientId}
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
                </div>

                {/* Payment Table */}
  <table className="w-full overflow-hidden rounded-lg">
    <thead>
      <tr className="border-b border-blue-200">
        <th className="bg-gray-100 text-center p-4 font-bold text-gray-700 text-sm">
          Payment ID
        </th>
        <th className="bg-white text-center p-4 font-bold text-gray-700 text-sm">
          Patient Name
        </th>
        <th className="bg-gray-100 text-center p-4 font-bold text-gray-700 text-sm">
          Date &amp; Time
        </th>
        <th className="bg-white text-center p-4 font-bold text-gray-700 text-sm">
          Service
        </th>
        <th className="bg-gray-100 text-center p-4 font-bold text-gray-700 text-sm">
          Amount
        </th>
      </tr>
    </thead>
    <tbody>
      {currentPayments.length > 0 ? (
        currentPayments.map((payment, idx) => (
          <tr key={payment._id || idx} className="border-b border-blue-200">
            {/* Payment ID */}
            <td className="bg-gray-100 p-4 text-gray-900 text-center">
              {payment._id}
            </td>
            {/* Patient Name */}
            <td className="bg-white p-4 text-gray-600 text-center">
              {payment.appointmentId?.patient?.name || "N/A"}
            </td>
            {/* Date & Time */}
            <td className="bg-gray-100 p-4 text-gray-600 text-center">
              {formatDateTime(payment.createdAt)}
            </td>
            {/* Service */}
            <td className="bg-white p-4 text-gray-600 text-center">
              {payment.paidFor}
            </td>
            {/* Amount */}
            <td className="bg-gray-100 p-4 text-gray-900 font-medium text-center">
              ₹{payment.amount}
            </td>
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan={5} className="bg-white text-center text-gray-500 py-6">
            No payments found.
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
                            className="px-3 py-1 border rounded-md mx-1 hover:bg-blue-200 disabled:opacity-50"
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
                            className="px-3 py-1 border rounded-md mx-1 hover:bg-blue-200 disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>

                {/* Summary */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                        Showing {currentPayments.length} of {filteredPayments.length} payments
                        {filteredPayments.length !== payments.length && ` (filtered from ${payments.length} total)`}
                    </p>
                </div>
            </div>
        </div>
        </DoctorLayout>
    );
};

export default Payments;