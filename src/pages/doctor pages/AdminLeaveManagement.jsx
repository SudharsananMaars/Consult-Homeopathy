import React, { useState, useEffect } from 'react';
import DoctorLayout from "/src/components/doctor components/DoctorLayout.jsx";
import axios from 'axios';

function AdminLeaveManagement() {
  const [leaveRequests, setLeaveRequests] = useState([
    // Sample data
    {
      _id: '1',
      name: 'Leena',
      leaveType: 'Sick Leave',
      startDate: '2024-11-01',
      endDate: '2024-11-05',
      status: 'Pending',
    },
    {
      _id: '2',
      name: 'Rosy',
      leaveType: 'Paid Leave',
      startDate: '2024-11-10',
      endDate: '2024-11-15',
      status: 'Pending',
    },
  ]);

  // Fetch all pending leave requests
  // useEffect(() => {
  //   axios
  //     .get('/leaves/pending')
  //     .then((response) => setLeaveRequests(response.data))
  //     .catch((error) => console.error('Error fetching leave requests:', error));
  // }, []);

  // const handleApprove = async (requestId) => {
  //   try {
  //     await axios.put(`/leaves/approve/${requestId}`);
  //     alert('Leave approved');
  //     setLeaveRequests(leaveRequests.filter((request) => request._id !== requestId));
  //   } catch (error) {
  //     console.error('Error approving leave:', error);
  //   }
  // };

  // const handleReject = async (requestId) => {
  //   try {
  //     await axios.put(`/leaves/reject/${requestId}`);
  //     alert('Leave rejected');
  //     setLeaveRequests(leaveRequests.filter((request) => request._id !== requestId));
  //   } catch (error) {
  //     console.error('Error rejecting leave:', error);
  //   }
  // };

  return (
    <DoctorLayout>
    <div className="max-w-4xl mx-auto p-6 mt-6">
      <h2 className="text-2xl font-bold text-gray-700 mb-6">Manage Leave Requests</h2>
      <ul className="space-y-4">
        {leaveRequests.length === 0 ? (
          <p className="text-gray-500">No pending leave requests</p>
        ) : (
          leaveRequests.map((request) => (
            <li
              key={request._id}
              className="p-4 bg-white rounded-lg shadow flex items-center justify-between"
            >
              <div>
                <p className="font-semibold text-gray-700">
                  {request.name} requested <span className="text-blue-600">{request.leaveType}</span>
                </p>
                <p className="text-sm text-gray-500">
                  From {new Date(request.startDate).toLocaleDateString()} to{' '}
                  {new Date(request.endDate).toLocaleDateString()}
                </p>
                <p className="text-sm font-medium">
                  Status:{' '}
                  <span
                    className={`${
                      request.status === 'Pending'
                        ? 'text-yellow-500'
                        : request.status === 'Approved'
                        ? 'text-green-500'
                        : 'text-red-500'
                    }`}
                  >
                    {request.status}
                  </span>
                </p>
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => handleApprove(request._id)}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleReject(request._id)}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  Reject
                </button>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
    </DoctorLayout>
  );
}

export default AdminLeaveManagement;
