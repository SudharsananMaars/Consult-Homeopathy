import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import config from '/src/config.js';

const API_URL = config.API_URL;

export default function AttendanceReport() {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [formData, setFormData] = useState({
    status: 'Present',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    fetchAttendanceData();
  }, []);

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/doctor/attendance-report`);
      const result = await response.json();
      
      if (result.success) {
        setAttendanceData(result.data);
      } else {
        setError('Failed to fetch attendance data');
      }
    } catch (err) {
      setError('Error fetching attendance data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateClick = (employee) => {
    setSelectedEmployee(employee);
    setFormData({
      status: 'Present',
      date: new Date().toISOString().split('T')[0],
      notes: ''
    });
    setSubmitError(null);
    setSubmitSuccess(false);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedEmployee(null);
    setFormData({
      status: 'Present',
      date: new Date().toISOString().split('T')[0],
      notes: ''
    });
    setSubmitError(null);
    setSubmitSuccess(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedEmployee) return;

    setSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      const payload = {
        status: formData.status,
        date: formData.date,
        ...(formData.notes && { notes: formData.notes })
      };

      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/doctor/${selectedEmployee.doctorId}/attendance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSubmitSuccess(true);
        setTimeout(() => {
          handleCloseModal();
          fetchAttendanceData(); // Refresh the data
        }, 1500);
      } else {
        setSubmitError(result.message || 'Failed to update attendance');
      }
    } catch (err) {
      setSubmitError('Error updating attendance: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredData = attendanceData.filter((item) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      item.employeeID?.toLowerCase().includes(searchLower) ||
      item.doctorName?.toLowerCase().includes(searchLower) ||
      item.department?.toLowerCase().includes(searchLower) ||
      item.role?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-gray-600">Loading attendance data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Attendance Report</h1>
          <p className="text-gray-600">View and manage employee attendance records</p>
        </div>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by Employee ID, Name, Department, or Role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-blue-200">
                  <th className="bg-gray-100 text-center p-4 font-bold text-gray-700 text-sm">Employee ID</th>
                  <th className="bg-white text-center p-4 font-bold text-gray-700 text-sm">Name</th>
                  <th className="bg-gray-100 text-center p-4 font-bold text-gray-700 text-sm">Department</th>
                  <th className="bg-white text-center p-4 font-bold text-gray-700 text-sm">Role</th>
                  <th className="bg-gray-100 text-center p-4 font-bold text-gray-700 text-sm">Present</th>
                  <th className="bg-white text-center p-4 font-bold text-gray-700 text-sm">Absent</th>
                  <th className="bg-gray-100 text-center p-4 font-bold text-gray-700 text-sm">Late</th>
                  <th className="bg-white text-center p-4 font-bold text-gray-700 text-sm">Total Days</th>
                  <th className="bg-gray-100 text-center p-4 font-bold text-gray-700 text-sm">Attendance %</th>
                  <th className="bg-white text-center p-4 font-bold text-gray-700 text-sm">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length > 0 ? (
                  [...filteredData]
                    .sort((a, b) => a.employeeID.localeCompare(b.employeeID))
                    .map((item) => {
                      const totalDays = item.presentCount + item.absentCount;
                      const attendancePercentage = totalDays > 0 
                        ? ((item.presentCount / totalDays) * 100).toFixed(1)
                        : 0;

                      return (
                        <tr key={item.employeeID} className="border-b border-blue-200 hover:bg-gray-50">
                          <td className="bg-gray-100 p-4 text-gray-900 text-center font-medium">
                            {item.employeeID}
                          </td>
                          <td className="bg-white p-4 text-gray-700 text-center">{item.doctorName}</td>
                          <td className="bg-gray-100 p-4 text-gray-700 text-center">{item.department}</td>
                          <td className="bg-white p-4 text-gray-700 text-center">
                            {item.role.replace('-', ' ').split(' ').map(word => 
                              word.charAt(0).toUpperCase() + word.slice(1)
                            ).join(' ')}
                          </td>
                          <td className="bg-gray-100 p-4 text-center">
                            <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full font-semibold">
                              {item.presentCount}
                            </span>
                          </td>
                          <td className="bg-white p-4 text-center">
                            <span className="inline-block px-3 py-1 bg-red-100 text-red-700 rounded-full font-semibold">
                              {item.absentCount}
                            </span>
                          </td>
                          <td className="bg-gray-100 p-4 text-center">
                            <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full font-semibold">
                              {item.lateCount}
                            </span>
                          </td>
                          <td className="bg-white p-4 text-gray-700 text-center font-medium">
                            {totalDays}
                          </td>
                          <td className="bg-gray-100 p-4 text-center">
                            <span className={`inline-block px-3 py-1 rounded-full font-semibold ${
                              attendancePercentage >= 90 ? 'bg-green-100 text-green-700' :
                              attendancePercentage >= 75 ? 'bg-blue-100 text-blue-700' :
                              attendancePercentage >= 50 ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {attendancePercentage}%
                            </span>
                          </td>
                          <td className="bg-white p-4 text-center">
                            <button
                              onClick={() => handleUpdateClick(item)}
                              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                            >
                              Update
                            </button>
                          </td>
                        </tr>
                      );
                    })
                ) : (
                  <tr>
                    <td colSpan={10} className="bg-white text-center text-gray-500 py-6">
                      No attendance records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {filteredData.length > 0 && (
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredData.length} of {attendanceData.length} records
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">Update Attendance</h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaTimes size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Employee
                </label>
                <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-700">
                  {selectedEmployee.doctorName} ({selectedEmployee.employeeID})
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="status" className="block text-sm font-semibold text-gray-700 mb-2">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Present">Present</option>
                  <option value="Absent">Absent</option>
                  <option value="Late">Late</option>
                </select>
              </div>

              <div className="mb-4">
                <label htmlFor="date" className="block text-sm font-semibold text-gray-700 mb-2">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="mb-6">
                <label htmlFor="notes" className="block text-sm font-semibold text-gray-700 mb-2">
                  Notes <span className="text-gray-400 text-xs">(Optional)</span>
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Add any additional notes..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              {submitError && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                  {submitError}
                </div>
              )}

              {submitSuccess && (
                <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm">
                  Attendance updated successfully!
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Updating...' : 'Update Attendance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}