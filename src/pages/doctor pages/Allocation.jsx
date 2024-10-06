import React, { useState, useEffect } from "react";
import axios from "axios"; // Import Axios for API calls
import {
  AiOutlinePlus,
  AiOutlineEdit,
  AiOutlineSave,
  AiOutlineClose,
  AiOutlineDelete,
} from "react-icons/ai"; // Import icons

const Allocation = () => {
  // List of role names
  const roles = [
    "1.Consultation-Chronic",
    "2.Consultation-Acute",
    "3.Medicine Preparation",
    "4.Prescription Writing",
    "5.Medicine and Shipment Payment Followup",
    "5.1 Medicine and Shipment Queries",
    "6.Inventory Tracking & Coordination",
    "7.Follow up- Patient Calling",
    "8.Follow up Queries",
    "9.Follow ups-PatientCare",
    "10.Information & Knowledge",
    "11.Vendor Listing",
    "12.Marketplace Queries",
  ];

  // List of doctor names
  const doctors = [
    "Self",
    "Dr. Smith",
    "Dr. Jane",
    "Dr. Roberts",
    "Dr. Emily",
    "Dr. Williams",
  ];

  // State to store allocations
  const [allocations, setAllocations] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [originalAllocations, setOriginalAllocations] = useState([]);

  useEffect(() => {
    // Initialize allocations from roles
    const initialRoles = roles.map((roleName, index) => ({
      id: index + 1,
      roleName: roleName,
      assignedDoctor: "Self",
    }));
    setAllocations(initialRoles);
  }, []);

  const handleDoctorChange = (id, doctor) => {
    const updatedAllocations = allocations.map((allocation) =>
      allocation.id === id ? { ...allocation, assignedDoctor: doctor } : allocation
    );
    setAllocations(updatedAllocations);
  };

  const handleRoleNameChange = (id, roleName) => {
    const updatedAllocations = allocations.map((allocation) =>
      allocation.id === id ? { ...allocation, roleName } : allocation
    );
    setAllocations(updatedAllocations);
  };

  const addNewRow = () => {
    const newId = allocations.length > 0 ? allocations[allocations.length - 1].id + 1 : 1;
    const newAllocation = { id: newId, roleName: "", assignedDoctor: "Self", isNew: true };
    setAllocations([...allocations, newAllocation]);
  };

  const toggleEditMode = () => {
    if (!editMode) {
      setOriginalAllocations(allocations);
    } else {
      setAllocations(originalAllocations);
    }
    setEditMode(!editMode);
  };

  // Save edits and sync with backend
  const saveEdits = async () => {
    try {
      // Loop over each allocation and make an API request to assign doctor to role
      await Promise.all(
        allocations.map(async (allocation) => {
          if (allocation.roleName && allocation.assignedDoctor) {
            // API call to save the allocation
            await axios.post('http://localhost:8000/api/assigndoctor', {
              roleName: allocation.roleName,
              doctorName: allocation.assignedDoctor,  // Corrected variable name
            });
          }
        })
      );
      alert("All changes saved successfully!");
    } catch (error) {
      console.error("Error saving allocations:", error);
      alert("Failed to save allocations. Please try again.");
    }
    setEditMode(false);
    setOriginalAllocations([]);
  };

  const handleDeleteRow = (id) => {
    if (window.confirm("Are you sure you want to delete this role?")) {
      setAllocations(allocations.filter((allocation) => allocation.id !== id));
    }
  };

  return (
    <div className="container mx-auto mt-10 p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Allocation Table</h1>
        
        {/* Conditionally render Save and Cancel buttons */}
        {editMode ? (
          <div className="flex space-x-4">
            <button
              onClick={saveEdits}
              className="flex items-center px-4 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors"
              title="Save Changes"
              aria-label="Save Changes"
            >
              <AiOutlineSave size={20} />
              <span className="ml-2">Save</span>
            </button>

            <button
              onClick={toggleEditMode}
              className="flex items-center px-4 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors"
              title="Cancel Editing"
              aria-label="Cancel Editing"
            >
              <AiOutlineClose size={20} />
              <span className="ml-2">Cancel</span>
            </button>
          </div>
        ) : (
          <button
            onClick={toggleEditMode}
            className={`flex items-center px-4 py-2 bg-teal-500 text-white font-semibold rounded-lg hover:bg-opacity-80 transition-colors`}
            aria-label="Edit Roles"
          >
            <AiOutlineEdit className="mr-2" /> Edit Roles
          </button>
        )}
      </div>

      <div className="overflow-y-auto max-h-96">
        <table className="min-w-full bg-white shadow-md rounded-lg">
          <thead>
            <tr className="border-b bg-gray-100">
              <th className="py-3 px-6 text-left">Roles</th>
              <th className="py-3 px-6 text-left">Employee Name</th>
              {editMode && <th className="py-3 px-6 text-left">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {allocations.map((allocation) => (
              <tr key={allocation.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-6">
                  {editMode ? (
                    <input
                      type="text"
                      placeholder="Enter Role"
                      value={allocation.roleName}
                      onChange={(e) => handleRoleNameChange(allocation.id, e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded"
                    />
                  ) : (
                    allocation.roleName
                  )}
                </td>

                <td className="py-3 px-6">
                  <select
                    className="bg-gray-100 border border-gray-100 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-2/3 p-2"
                    value={allocation.assignedDoctor}
                    onChange={(e) => handleDoctorChange(allocation.id, e.target.value)}
                    disabled={!editMode} // Disable if not in edit mode
                  >
                    {doctors.map((doctor, idx) => (
                      <option key={idx} value={doctor}>
                        {doctor}
                      </option>
                    ))}
                  </select>
                </td>
                {editMode && (
                  <td className="py-3 px-6">
                    <button
                      onClick={() => handleDeleteRow(allocation.id)}
                      className="text-red-500 hover:text-red-700"
                      title="Delete Row"
                      aria-label="Delete Row"
                    >
                      <AiOutlineDelete size={20} />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editMode && (
        <button
          onClick={addNewRow}
          className="flex items-center mt-4 px-4 py-2 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 transition-colors"
          title="Add New Role"
          aria-label="Add New Role"
        >
          <AiOutlinePlus size={20} />
        </button>
      )}
    </div>
  );
};

export default Allocation;
