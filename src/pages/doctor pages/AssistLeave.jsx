import React, { useState } from 'react';
import DoctorLayout from "/src/components/doctor components/DoctorLayout.jsx";
import DatePicker from 'react-datepicker'; // Ensure to install react-datepicker
import 'react-datepicker/dist/react-datepicker.css'; // Import styles for DatePicker

const LeavePage = () => {
  const [selectedTab, setSelectedTab] = useState('remaining');
  const [leaveType, setLeaveType] = useState('');
  const [singleDate, setSingleDate] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // Sample leave data
  const remainingLeave = {
    sickLeave: 3,
    casualLeave: 5,
    vacation: 10,
  };

  const handleRequestLeave = () => {
    // Error handling
    if (!leaveType) {
      alert('Please select a leave type.');
      return;
    }
    
    if ((leaveType === 'sick' || leaveType === 'casual') && !singleDate) {
      alert('Please select a date for the leave.');
      return;
    }

    if (leaveType === 'vacation' && (!startDate || !endDate)) {
      alert('Please select both start and end dates for vacation.');
      return;
    }

    // Proceed with the request (this is where you would integrate with your API)
    alert('Leave request submitted successfully!');
    
    // Reset the state after submission
    setLeaveType('');
    setSingleDate(null);
    setStartDate(null);
    setEndDate(null);
  };

  return (
    <DoctorLayout>
      <div className="min-h-screen flex flex-col items-center bg-gray-100 py-10">
        <div className="bg-white shadow-md rounded-lg p-8 w-96">
          <div className="flex justify-between mb-6">
            <button
              onClick={() => setSelectedTab('remaining')}
              className={`px-6 py-3 rounded-lg ${selectedTab === 'remaining' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
            >
              Remaining Leave
            </button>
            <button
              onClick={() => setSelectedTab('avail')}
              className={`px-6 py-3 rounded-lg ${selectedTab === 'avail' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
            >
              Avail Leave
            </button>
          </div>

          {selectedTab === 'remaining' ? (
            <div className="text-center">
              <h2 className="text-lg font-semibold mb-4">Remaining Leave</h2>
              <p className="text-gray-700 mb-2">Sick Leave: <span className="font-bold">{remainingLeave.sickLeave}</span> days</p>
              <p className="text-gray-700 mb-2">Casual Leave: <span className="font-bold">{remainingLeave.casualLeave}</span> days</p>
              <p className="text-gray-700 mb-2">Vacation: <span className="font-bold">{remainingLeave.vacation}</span> days</p>
            </div>
          ) : (
            <div className="text-center">
              <h2 className="text-lg font-semibold mb-4">Avail Leave</h2>
              <label className="block mt-6 mb-2">
                Leave Type:
                <select
                  className="border rounded p-3 mt-2 w-full"
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                >
                  <option value="">Select Leave Type</option>
                  <option value="sick">Sick Leave</option>
                  <option value="casual">Casual Leave</option>
                  <option value="vacation">Vacation</option>
                </select>
              </label>

              {leaveType === 'sick' || leaveType === 'casual' ? (
                <div className="mt-6">
                  <label className="mb-2 mr-2">Select Date:</label>
                  <DatePicker
                    selected={singleDate}
                    onChange={(date) => setSingleDate(date)}
                    className="border-gray-200 rounded p-3 mt-2 w-full"
                    dateFormat="MMMM d, yyyy" // Adjust format as necessary
                  />
                </div>
              ) : leaveType === 'vacation' ? (
                <div className="mt-6">
                  <div className="mb-4">
                    <label className="mb-2 mr-2">Start Date:  </label>
                    <DatePicker
                      selected={startDate}
                      onChange={(date) => setStartDate(date)}
                      className="border rounded p-3 mt-2 w-full"
                      dateFormat="MMMM d, yyyy" // Adjust format as necessary
                    />
                  </div>
                  <div className="mb-4">
                    <label className="mb-2 mr-2">End Date:  </label>
                    <DatePicker
                      selected={endDate}
                      onChange={(date) => setEndDate(date)}
                      className="border rounded p-3 mt-2 w-full"
                      dateFormat="MMMM d, yyyy" // Adjust format as necessary
                    />
                  </div>
                </div>
              )
               : null}

              <button
                onClick={handleRequestLeave}
                className="mt-8 w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
              >
                Request Leave
              </button>
            </div>
          )}
        </div>
      </div>
    </DoctorLayout>
  );
};

export default LeavePage;
