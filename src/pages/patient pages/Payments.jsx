import React, { useState, useEffect } from "react";
import Layout from "../../components/patient components/Layout";
import { FiDownload } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import config from "../../config";
const API_URL = config.API_URL;

const Payments = () => {
  const navigate = useNavigate();
  const [dropdownVisible, setDropdownVisible] = useState(null);
  const [payments, setPayments] = useState([]);
  const [filters, setFilters] = useState({
    status: "",
    service: "",
    method: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("Token not found. Please login.");
          return;
        }

        const res = await axios.get(`${API_URL}/api/patient/payments`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = res.data.map((payment) => ({
          id: payment._id,
          patientname: payment.userId?.name || "Unknown",
          date: new Date(payment.createdAt).toLocaleString(),
          service: payment.service || "Consultation",
          amount: `Rs.${payment.amount}`,
          method: payment.paymentMethod,
          status:
            payment.status === "captured"
              ? "Success"
              : payment.status.charAt(0).toUpperCase() +
                payment.status.slice(1),
        }));

        setPayments(data);
      } catch (error) {
        console.error("Error fetching payments:", error);
      }
    };

    fetchPayments();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
    setCurrentPage(1);
  };

  const handleEntriesPerPageChange = (e) => {
    setEntriesPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const confirm = () => {
    navigate("/paymentpage");
  };

  const filteredPayments = payments.filter(
    (payment) =>
      (filters.status === "" ||
        payment.status.toLowerCase().includes(filters.status.toLowerCase())) &&
      (filters.service === "" ||
        payment.service
          .toLowerCase()
          .includes(filters.service.toLowerCase())) &&
      (filters.method === "" ||
        payment.method.toLowerCase().includes(filters.method.toLowerCase()))
  );

  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentPayments = filteredPayments.slice(
    indexOfFirstEntry,
    indexOfLastEntry
  );
  const totalPages = Math.ceil(filteredPayments.length / entriesPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

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
            <option value="razorpay">Razorpay</option>
          </select>
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="p-2 w-1/6 border border-gray-300 rounded-md bg-white hover:bg-gray-100"
          >
            <option value="">All Statuses</option>
            <option value="Unpaid">Unpaid</option>
            <option value="Success">Success</option>
            <option value="Failed">Failed</option>
          </select>
        </div>

        {/* Table */}
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="px-4 py-2">Patient Name</th>
              <th className="px-4 py-2">Date & Time</th>
              <th className="px-4 py-2">Service</th>
              <th className="px-4 py-2">Amount</th>
              <th className="px-4 py-2">Methods</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentPayments.length > 0 ? (
              currentPayments.map((payment) => (
                <tr key={payment.id} className="border-b">
                  <td className="px-4 py-4">{payment.patientname}</td>
                  <td className="px-4 py-4">{payment.date}</td>
                  <td className="px-4 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-sm font-semibold ${getStatusBgColor(
                        payment.service
                      )}`}
                    >
                      {payment.service}
                    </span>
                  </td>
                  <td className="px-4 py-4">{payment.amount}</td>
                  <td className="px-4 py-4">{payment.method}</td>
                  <td className="px-4 py-4">{payment.status}</td>
                  <td className="px-4 py-4">
                    {payment.status === "Unpaid" ? (
                      <button
                        onClick={confirm}
                        className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-5 ml-4 rounded-md"
                      >
                        Pay
                      </button>
                    ) : (
                      <a
                        href="#"
                        className="flex items-center space-x-1 text-blue-400 hover:text-blue-500"
                      >
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
                  No matching payments found.
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
              <select
                value={entriesPerPage}
                onChange={handleEntriesPerPageChange}
                className="border p-2 rounded-md"
              >
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
                  currentPage === index + 1
                    ? "bg-blue-300"
                    : "hover:bg-blue-200"
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
