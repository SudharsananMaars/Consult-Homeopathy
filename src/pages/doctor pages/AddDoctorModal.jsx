import React, { useState } from 'react';

const AddDoctorModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    age: '',
    gender: '',
    email: '',
    mobile: '',
    maritalStatus: '',
    qualification: '',
    designation: '',
    bloodGroup: '',
    country: '',
    state: '',
    city: '',
    address: '',
    postalCode: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/api/addDoctor', { // Update with your backend URL
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${yourAuthToken}` // Add token if authentication is required
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (response.ok) {
        console.log('Doctor added successfully:', result);
        onClose(); // Close the modal on success
      } else {
        setError(result.message || 'Error adding doctor');
        console.error('Error:', result);
      }
    } catch (error) {
      setError('Failed to add doctor');
      console.error('Error:', error);
    }

  if (!isOpen) return null; // Do not render the modal if it's not open

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50 p-4">
      <div className="container max-h-[80vh] overflow-y-auto mx-auto p-6 bg-white rounded-lg shadow-lg relative">
        <h2 className="text-2xl font-bold mb-6">Add Doctor</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Form Fields */}
            <div>
              <label className="block text-sm font-medium">First Name *</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                placeholder="Enter First Name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Last Name *</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                placeholder="Enter Last Name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Age *</label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                placeholder="Enter Age"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Gender *</label>
              <div className="mt-2 space-x-4">
                <label>
                  <input
                    type="radio"
                    name="gender"
                    value="Male"
                    onChange={handleChange}
                  /> Male
                </label>
                <label>
                  <input
                    type="radio"
                    name="gender"
                    value="Female"
                    onChange={handleChange}
                  /> Female
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium">Email ID *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                placeholder="Enter Email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Mobile Number *</label>
              <input
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                placeholder="Enter Mobile Number"
                required
              />
            </div>

          <div>
            <label className="block text-sm font-medium">Email ID *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md"
              placeholder="Enter Email"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Mobile Number *</label>
            <input
              type="tel"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md"
              placeholder="Enter Mobile Number"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Marital Status</label>
            <select
              name="maritalStatus"
              value={formData.maritalStatus}
              onChange={handleChange}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md"
            >
              <option>Select</option>
              <option>Single</option>
              <option>Married</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">Qualification</label>
            <select
              name="qualification"
              value={formData.qualification}
              onChange={handleChange}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md"
            >
              <option>Select</option>
              <option>MBBS</option>
              <option>MD</option>
              <option>Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">Designation</label>
            <select
              name="designation"
              value={formData.designation}
              onChange={handleChange}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md"
            >
              <option>Select</option>
              <option>Junior Doctor</option>
              <option>Senior Doctor</option>
              <option>Consultant</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">Blood Group *</label>
            <select
              name="bloodGroup"
              value={formData.bloodGroup}
              onChange={handleChange}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md"
              required
            >
              <option>Select</option>
              <option>A+</option>
              <option>B+</option>
              <option>O+</option>
              <option>AB+</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">Country</label>
            <select
              name="country"
              value={formData.country}
              onChange={handleChange}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md"
            >
              <option>Select</option>
              <option>India</option>
              <option>USA</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">State</label>
            <select
              name="state"
              value={formData.state}
              onChange={handleChange}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md"
            >
              <option>Select</option>
              <option>New York</option>
              <option>Maharashtra</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">City</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md"
              placeholder="Enter City"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md"
              placeholder="Enter Address"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Postal Code</label>
            <input
              type="text"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleChange}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md"
              placeholder="Enter Postal Code"
            />
          </div>
          </div>
        

        <div className="flex justify-end mt-6">
            <button
              type="button"
              onClick={onClose} // Close modal on cancel
              className="px-4 py-2 mr-4 bg-gray-500 text-white rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md"
            >
              Create Doctor Profile
            </button>
          </div>
        </form>
        </div>
        </div>
        
  );
};
};
export default AddDoctorModal;
