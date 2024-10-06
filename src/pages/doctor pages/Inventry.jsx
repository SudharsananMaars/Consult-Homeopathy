import React, { useState } from "react";
import DoctorLayout from "/src/components/doctor components/DoctorLayout.jsx";
import { FaEllipsisV } from "react-icons/fa";

const Inventry = () => {
  const [dropdownVisible, setDropdownVisible] = useState(null);
  const [medicines, setMedicines] = useState([
    { id: "M001", name: "Paracetamol", price: "Rs.100", status: "Available", inStock: "Yes", measure: "500mg" },
    { id: "M002", name: "Aspirin", price: "Rs.200", status: "Out of Stock", inStock: "No", measure: "100mg" },
    { id: "M003", name: "Ibuprofen", price: "Rs.150", status: "Available", inStock: "Yes", measure: "200mg" },
    { id: "M004", name: "Paracetamol", price: "Rs.100", status: "Available", inStock: "Yes", measure: "500mg" },
    { id: "M005", name: "Aspirin", price: "Rs.200", status: "Out of Stock", inStock: "No", measure: "100mg" },
    { id: "M006", name: "Ibuprofen", price: "Rs.150", status: "Available", inStock: "Yes", measure: "200mg" },
    { id: "M007", name: "Paracetamol", price: "Rs.100", status: "Available", inStock: "Yes", measure: "500mg" },
    { id: "M008", name: "Aspirin", price: "Rs.200", status: "Out of Stock", inStock: "No", measure: "100mg" },
    { id: "M009", name: "Ibuprofen", price: "Rs.150", status: "Available", inStock: "Yes", measure: "200mg" },
    { id: "M010", name: "Paracetamol", price: "Rs.100", status: "Available", inStock: "Yes", measure: "500mg" },
    { id: "M011", name: "Aspirin", price: "Rs.200", status: "Out of Stock", inStock: "No", measure: "100mg" },
    { id: "M012", name: "Ibuprofen", price: "Rs.150", status: "Available", inStock: "Yes", measure: "200mg" },
    // Add more medicines as needed
  ]);

  const [filters, setFilters] = useState({
    medicineName: "",
    status: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
    setCurrentPage(1); // Reset to first page on filter change
  };

  const handleEntriesPerPageChange = (e) => {
    setEntriesPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page on entries change
  };

  const filteredMedicines = medicines.filter((medicine) =>
    medicine.name.toLowerCase().includes(filters.medicineName.toLowerCase()) &&
    (filters.status === "" || medicine.status.toLowerCase() === filters.status.toLowerCase())
  );

  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentMedicines = filteredMedicines.slice(indexOfFirstEntry, indexOfLastEntry);
  const totalPages = Math.ceil(filteredMedicines.length / entriesPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const getStatusBgColor = (status) => {
    return status === "Available" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700";
  };

  const handleViewDetails = (id) => {
    console.log(`Viewing details for medicine ${id}`);
  };

  const toggleDropdown = (id) => {
    setDropdownVisible(dropdownVisible === id ? null : id);
  };

  return (
    <DoctorLayout>
      <div className="p-7">
        <h1 className="text-2xl font-bold mb-4">Inventry</h1>

        {/* Filters */}
        <div className="flex space-x-4 mb-6">
          <input
            type="text"
            name="medicineName"
            placeholder="Search by Medicine Name"
            value={filters.medicineName}
            onChange={handleFilterChange}
            className="p-2 border border-gray-300 rounded-md hover:bg-gray-100"
          />
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="p-2 w-1/6 border border-gray-300 rounded-md bg-white hover:bg-gray-100"
          >
            <option value="">All Status</option>
            <option value="Available">Available</option>
            <option value="Out of Stock">Out of Stock</option>
          </select>
        </div>

        {/* Medicine Table */}
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="px-4 py-2 text-gray-700 font-medium">Medicine Name</th>
              <th className="px-4 py-2 text-gray-700 font-medium">Price</th>
              <th className="px-4 py-2 text-gray-700 font-medium">Status</th>
              <th className="px-4 py-2 text-gray-700 font-medium">In Stock</th>
              <th className="px-4 py-2 text-gray-700 font-medium">Measure</th>
              <th className="px-4 py-2 text-gray-700 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentMedicines.length > 0 ? (
              currentMedicines.map((medicine) => (
                <tr key={medicine.id} className="border-b">
                  <td className="px-4 py-4">{medicine.name}</td>
                  <td className="px-4 py-4">{medicine.price}</td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-1 rounded-full text-sm font-semibold ${getStatusBgColor(medicine.status)}`}>
                      {medicine.status}
                    </span>
                  </td>
                  <td className="px-4 py-4">{medicine.inStock}</td>
                  <td className="px-4 py-4">{medicine.measure}</td>
                  <td className="px-4 py-4 relative">
                    <button className="text-gray-600 hover:text-gray-900" onClick={() => toggleDropdown(medicine.id)}>
                      <FaEllipsisV />
                    </button>
                    {/* Dropdown menu */}
                    {dropdownVisible === medicine.id && (
                      <div className="absolute bg-white shadow-md rounded-lg p-2 mt-2 right-0 z-10">
                        <button onClick={() => handleViewDetails(medicine.id)} className="block w-full text-left p-2 hover:bg-gray-100">
                          View Details
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center p-4">
                  No matching medicines found.
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

export default Inventry;
