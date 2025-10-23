import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../../components/patient components/Layout";
import config from "../../config";

const API_URL = config.API_URL;


const PaymentsHistory = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    paymentId: "",
    status: "",
    dateRange: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");
      const res = await axios.get(
        `${API_URL}/api/patient/show-all-payments/${userId}`,
        {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
      );
      
      if (res.data.success && res.data.data) {
        setPayments(res.data.data);
      } else {
        setError('No payment data available');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch payments');
      console.error("Failed to fetch payments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

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

  // Function to assign background color based on status
  const getStatusBgColor = (status) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return "bg-green-100 text-green-700";
      case "failed":
        return "bg-red-100 text-red-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "refunded":
        return "bg-blue-100 text-blue-700";
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
    const matchesPaymentId = payment.razorpayPaymentId?.includes(filters.paymentId) || false;
    const matchesStatus = filters.status === "" || payment.status === filters.status;
    
    // Date range filtering
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
    
    return matchesPaymentId && matchesStatus && matchesDateRange;
  });

  // Pagination logic
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentPayments = filteredPayments.slice(indexOfFirstEntry, indexOfLastEntry);
  const totalPages = Math.ceil(filteredPayments.length / entriesPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto mt-10 px-4">
          <div className="flex justify-center items-center h-64">
            <div className="text-lg">Loading payments...</div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto mt-10 px-4">
          <div className="flex justify-center items-center h-64">
            <div className="text-red-600">Error: {error}</div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto mt-10 px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Payment History</h1>

        {/* Filters */}
        <div className="flex space-x-4 mb-6">
          <input
            type="text"
            name="paymentId"
            placeholder="Search by Payment ID"
            value={filters.paymentId}
            onChange={handleFilterChange}
            className="p-3 border border-gray-300 rounded-md hover:bg-gray-100 w-80"
          />
          <select
            name="dateRange"
            value={filters.dateRange}
            onChange={handleFilterChange}
            className="p-3 border border-gray-300 rounded-md bg-white hover:bg-gray-100"
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
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="p-3 border border-gray-300 rounded-md bg-white hover:bg-gray-100"
          >
            <option value="">All Status</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
            <option value="pending">Pending</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>

        {/* Payment Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full overflow-hidden rounded-lg">
            <thead>
              <tr className="border-b border-blue-200">
                <th className="bg-gray-100 text-center p-4 font-bold text-gray-700 text-sm">
                  Payment ID
                </th>
                <th className="bg-white text-center p-4 font-bold text-gray-700 text-sm">
                  Amount
                </th>
                <th className="bg-gray-100 text-center p-4 font-bold text-gray-700 text-sm">
                  Paid For
                </th>
                <th className="bg-white text-center p-4 font-bold text-gray-700 text-sm">
                  Status
                </th>
                <th className="bg-gray-100 text-center p-4 font-bold text-gray-700 text-sm">
                  Date & Time
                </th>
              </tr>
            </thead>
            <tbody>
              {currentPayments.length > 0 ? (
                currentPayments.map((payment) => (
                  <tr key={payment._id} className="border-b border-blue-200">
                    <td className="bg-gray-100 p-4 font-medium text-gray-900 text-center">
                      <span className="font-mono text-sm">
                        {payment.razorpayPaymentId || 'N/A'}
                      </span>
                    </td>
                    <td className="bg-white p-4 text-gray-600 text-center">
                      <span className="font-semibold">
                        ₹{payment.amount} {payment.currency}
                      </span>
                    </td>
                    <td className="bg-gray-100 p-4 text-gray-600 text-center">
                      {payment.paidFor || 'N/A'}
                    </td>
                    <td className="bg-white p-4 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusBgColor(
                          payment.status
                        )}`}
                      >
                        {payment.status?.charAt(0).toUpperCase() + payment.status?.slice(1)}
                      </span>
                    </td>
                    <td className="bg-gray-100 p-4 text-gray-600 text-center">
                      {formatDateTime(payment.createdAt)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="bg-white text-center text-gray-500 py-6">
                    No payments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        <div className="flex justify-between items-center mt-6">
          <div>
            <label className="text-gray-600">
              Show{" "}
              <select 
                value={entriesPerPage} 
                onChange={handleEntriesPerPageChange} 
                className="border p-2 rounded-md mx-2"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={20}>20</option>
              </select>{" "}
              entries per page
            </label>
          </div>
          <div className="flex space-x-1">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 border rounded-md hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index}
                onClick={() => paginate(index + 1)}
                className={`px-3 py-2 border rounded-md ${
                  currentPage === index + 1 
                    ? "bg-blue-500 text-white" 
                    : "hover:bg-blue-50"
                }`}
              >
                {index + 1}
              </button>
            ))}
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border rounded-md hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
    </Layout>
  );
};

export default PaymentsHistory;