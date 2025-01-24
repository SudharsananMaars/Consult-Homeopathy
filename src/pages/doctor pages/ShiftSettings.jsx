import React, { useState, useEffect } from 'react';

const ShiftSettings = () => {
  const [doctors, setDoctors] = useState([]); // List of doctors (to populate Name dropdown)
  const [formData, setFormData] = useState({
    name: '',
    employeeID: '',
    shift: '',
  });
  const [loading, setLoading] = useState(true); // Loading state for fetching doctors
  const [error, setError] = useState(null); // Error state

  // Fetch doctors list when the component mounts
  useEffect(() => {
    async function fetchDoctors() {
      try {
        const response = await fetch('http://localhost:5000/api/shift/getdoctors'); // Endpoint to get doctor list
        const data = await response.json();

        if (data.success) {
          setDoctors(data.doctors); // Assuming the response contains an array of doctors
        } else {
          throw new Error(data.message || 'Failed to fetch doctors.');
        }
      } catch (error) {
        console.error('Error fetching doctors:', error);
        setError('Failed to fetch doctors.');
      } finally {
        setLoading(false); // End loading
      }
    }

    fetchDoctors();
  }, []);

  // Handle change in form data
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'name') {
      // Update the formData with selected name and corresponding employeeID
      const selectedDoctor = doctors.find((doctor) => doctor.name === value);
      setFormData((prev) => ({
        ...prev,
        name: value,
        employeeID: selectedDoctor ? selectedDoctor.employeeID : '',
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/api/shift/addshift', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        alert('Shift setting saved successfully!');
        console.log(data);

        // Reset form
        setFormData({
          name: '',
          employeeID: '',
          shift: '',
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save shift settings.');
      }
    } catch (error) {
      console.error('Error in form submission:', error);
      alert(error.message);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6">
     
      {loading && <p>Loading doctors...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && (
        <form onSubmit={handleSubmit}>
          {/* Name Dropdown */}
          <div className="mb-4">
            <label className="block text-sm font-medium">Name *</label>
            <select
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            >
              <option value="">Select Doctor</option>
              {doctors.map((doctor) => (
                <option key={doctor.employeeID} value={doctor.name}>
                  {doctor.name}
                </option>
              ))}
            </select>
          </div>

          {/* EmployeeID (auto-populated based on name selection) */}
          <div className="mb-4">
            <label className="block text-sm font-medium">Employee ID *</label>
            <input
              type="text"
              name="employeeID"
              value={formData.employeeID}
              readOnly
              className="w-full p-2 border border-gray-300 rounded-md bg-gray-100"
            />
          </div>

          {/* Shift Dropdown */}
          <div className="mb-4">
            <label className="block text-sm font-medium">Shift *</label>
            <select
              name="shift"
              value={formData.shift}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            >
              <option value="">Select Shift</option>
              <option value="Morning Shift">Morning Shift</option>
              <option value="Evening Shift">Evening Shift</option>
              <option value="Night Shift">Night Shift</option>
            </select>
          </div>

          <button
            type="submit"
            className={`w-full py-2 rounded-md ${
              !formData.name || !formData.shift
                ? 'bg-blue-400 text-white cursor-not-allowed'
                : 'bg-blue-500 text-white'
            }`}
            disabled={!formData.name || !formData.shift}
          >
            Save Shift Settings
          </button>
        </form>
      )}
    </div>
  );
};

export default ShiftSettings;
