import React, { useState } from 'react'; 

const RecentAppointments = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const appointments = [
    { id: 1, patientName: 'Rita', dateTime: '14 Aug 10:00 AM', duration: '1 hr', purpose: 'Diabetes', doctorName: 'Dr.Shilfa', type: 'Follow Up' },
    { id: 2, patientName: 'Rita', dateTime: '1 Aug 11:00 AM', duration: '1 hr', purpose: 'Diabetes', doctorName: 'Dr.Shilfa', type: 'New' },
    { id: 3, patientName: 'Riya', dateTime: '15 July 4:00 PM', duration: '30 mins', purpose: 'Fever', doctorName: 'Dr.Shilfa', type: 'New' },
  ];

  const filteredAppointments = appointments.filter(appointment => 
    appointment.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    appointment.dateTime.toLowerCase().includes(searchQuery.toLowerCase()) ||
    appointment.purpose.toLowerCase().includes(searchQuery.toLowerCase()) ||
    appointment.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    appointment.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div>
        <p className="font-bold mt-7 mb-7 text-xl px-7">Previous Appointments</p>
      </div>
      <div className="flex justify-between items-center px-7 mb-4">
        <input
          type="text"
          placeholder="Search..."
          className="sm:w-3/4 md:w-1/2 lg:w-1/4 p-2 border-2 border-gray-400 rounded-md"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        
      </div>
      <div className="relative overflow-x-auto pt-4 shadow-lg">
        <table className="w-full text-md text-left rtl:text-right text-white-500 dark:text-gray-100">
          <thead className="text-md text-gray-600 bg-blue-100 dark:bg-blue-200 dark:text-gray-700">
            <tr>
              <th scope="col" className="px-3 py-3">S.No</th>
              <th scope="col" className="px-3 py-3">Patient Name</th>
              <th scope="col" className="px-3 py-3">Date & Time</th>
              <th scope="col" className="px-3 py-3">Duration</th>
              <th scope="col" className="px-3 py-3">Purpose</th>
              <th scope="col" className="px-3 py-3">Doctor Name</th>
              <th scope="col" className="px-3 py-3">Follow Up / New</th>
            </tr>
          </thead>
          <tbody>
            {filteredAppointments.length > 0 ? (
              filteredAppointments.map((appointment, index) => (
                <tr key={appointment.id} className="bg-white border-b dark:bg-white-200 dark:border-gray-100">
                  <th scope="row" className="px-6 py-4 font-medium text-gray-600 whitespace-nowrap dark:text-gray-600">
                    {index + 1}
                  </th>
                  <td className="px-4 py-4 text-gray-600 whitespace-nowrap dark:text-gray-600">{appointment.patientName}</td>
                  <td className="px-4 py-4 text-gray-600 whitespace-nowrap dark:text-gray-600">{appointment.dateTime}</td>
                  <td className="px-4 py-4 text-gray-600 whitespace-nowrap dark:text-gray-600">{appointment.duration}</td>
                  <td className="px-4 py-4 text-gray-600 whitespace-nowrap dark:text-gray-600">{appointment.purpose}</td>
                  <td className="px-4 py-4 text-gray-600 whitespace-nowrap dark:text-gray-600">{appointment.doctorName}</td>
                  <td className="px-4 py-4 text-gray-600 whitespace-nowrap dark:text-gray-600">{appointment.type}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-gray-600">No matching Appointments found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentAppointments;
