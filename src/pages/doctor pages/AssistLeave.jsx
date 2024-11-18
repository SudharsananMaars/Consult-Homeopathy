import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DoctorLayout from "/src/components/doctor components/DoctorLayout.jsx";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

function AssistLeave() {
  const [leaveType, setLeaveType] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [reason, setReason] = useState('');
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fetching, setFetching] = useState(true);

  // Fetch leave requests for this assistant doctor
  useEffect(() => {
    axios
      .get('https://5000/api/leaves/my-requests')
      .then((response) => {
        if (Array.isArray(response.data)) {
          setLeaveRequests(response.data);
        } else {
          console.error('Expected an array for leave requests, got:', response.data);
          setLeaveRequests([]);
        }
        setFetching(false);
      })
      .catch((error) => {
        setError('Failed to fetch leave requests');
        console.error('Error fetching leave requests:', error);
        setFetching(false);
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (startDate > endDate) {
      setError('Start date cannot be after end date.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('https://5000/api/leaves/request', {
        leaveType,
        startDate,
        endDate,
        reason,
      });
      alert('Leave request submitted successfully');
      setLeaveRequests([...leaveRequests, response.data]);
      setLeaveType('');
      setStartDate(new Date());
      setEndDate(new Date());
      setReason('');
    } catch (error) {
      setError('Failed to submit leave request. Please try again.');
      console.error('Error submitting leave request:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DoctorLayout>
    <div className="max-w-4xl mt-4 mx-auto p-6 bg-gray-50 space-y-6">
      <h2 className="text-2xl font-bold text-gray-700">Request Leave</h2>
      {error && <p className="text-red-500">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Leave Type
          </label>
          <select
            value={leaveType}
            onChange={(e) => setLeaveType(e.target.value)}
            required
            className="block w-full border rounded-lg p-2 bg-white focus:outline-none focus:ring focus:ring-blue-200"
          >
            <option value="">Select Leave Type</option>
            <option value="Sick Leave">Sick Leave</option>
            <option value="Casual Leave">Casual Leave</option>
            <option value="Paid Leave">Paid Leave</option>
            <option value="Casual Leave">Casual Leave</option>
            
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Start Date
          </label>
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            className="block w-full border rounded-lg p-2 bg-white focus:outline-none focus:ring focus:ring-blue-200"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            End Date
          </label>
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            className="block w-full border rounded-lg p-2 bg-white focus:outline-none focus:ring focus:ring-blue-200"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Reason
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
            className="block w-full border rounded-lg p-2 bg-white focus:outline-none focus:ring focus:ring-blue-200"
          />
        </div>
        <button
          type="submit"
          className={`block w-1/3 p-3 text-white font-semibold rounded-lg mx-auto ${
            loading
              ? 'bg-blue-300 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600'
          }`}
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Submit Leave Request'}
        </button>
      </form>

      <h2 className="text-2xl font-bold text-gray-700 mt-8">My Leave Requests</h2>
      {fetching ? (
        <p className="text-gray-600">Loading leave requests...</p>
      ) : leaveRequests.length === 0 ? (
        <p className="text-gray-600">No leave requests found.</p>
      ) : (
        <ul className="space-y-4">
          {leaveRequests.map((request) => (
            <li
              key={request._id}
              className="p-4 bg-white border rounded-lg shadow-sm flex justify-between items-center"
            >
              <div>
                <p className="font-semibold text-gray-700">
                  {request.leaveType}
                </p>
                <p className="text-sm text-gray-500">
                  From{' '}
                  {new Date(request.startDate).toLocaleDateString()} to{' '}
                  {new Date(request.endDate).toLocaleDateString()}
                </p>
              </div>
              <span
                className={`px-3 py-1 text-sm font-medium rounded-lg ${
                  request.status === 'Approved'
                    ? 'bg-green-100 text-green-700'
                    : request.status === 'Rejected'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}
              >
                {request.status}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
    </DoctorLayout>
  );
}

export default AssistLeave;
