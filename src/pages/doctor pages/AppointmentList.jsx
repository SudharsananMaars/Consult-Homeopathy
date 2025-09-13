import React, { useEffect, useState } from 'react';
import DoctorLayout from "/src/components/doctor components/DoctorLayout.jsx";
import axios from 'axios';
import config from '/src/config.js';

const AppointmentList = () => {
  const API_URL = config.API_URL;
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [appointmentsPerPage] = useState(10); // Number of appointments per page

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const token = localStorage.getItem('token'); 
        const response = await axios.get(
          `${API_URL}/api/doctor/appointments`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        // Handle the API response structure
        if (response.data.success && response.data.appointments) {
          setAppointments(response.data.appointments);
        } else {
          setAppointments(response.data || []);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching appointments:', err);
        setError('Failed to fetch appointments');
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [API_URL]);

  // Calculate the range of appointments to display
  const indexOfLastAppointment = currentPage * appointmentsPerPage;
  const indexOfFirstAppointment = indexOfLastAppointment - appointmentsPerPage;
  const currentAppointments = appointments.slice(indexOfFirstAppointment, indexOfLastAppointment);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Format date helper
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    const getStatusColor = (status) => {
      switch (status?.toLowerCase()) {
        case 'confirmed':
          return 'bg-green-100 text-green-800';
        case 'pending':
          return 'bg-yellow-100 text-yellow-800';
        case 'cancelled':
          return 'bg-red-100 text-red-800';
        case 'completed':
          return 'bg-blue-100 text-blue-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
        {status || 'N/A'}
      </span>
    );
  };

  if (loading) {
    return (
      <DoctorLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </DoctorLayout>
    );
  }

  if (error) {
    return (
      <DoctorLayout>
        <div className="text-center text-red-600 p-8">
          <p className="text-lg">{error}</p>
        </div>
      </DoctorLayout>
    );
  }

  const totalPages = Math.ceil(appointments.length / appointmentsPerPage);

  return (
    <DoctorLayout>
      <div className="container mx-auto p-6">
        <div className="bg-white rounded-xl shadow-md p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-600 mt-2">Total appointments: {appointments.length}</p>
        </div>

        {appointments.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No appointments found</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            

  <table className="w-full overflow-hidden rounded-lg">
  <thead>
    <tr className="border-b border-blue-200">
      <th className="bg-gray-100 text-center p-4 font-bold text-gray-700 text-sm">Patient</th>
      <th className="bg-white text-center p-4 font-bold text-gray-700 text-sm">Contact</th>
      <th className="bg-gray-100 text-center p-4 font-bold text-gray-700 text-sm">Date &amp; Time</th>
      <th className="bg-white text-center p-4 font-bold text-gray-700 text-sm">Disease Type</th>
      <th className="bg-gray-100 text-center p-4 font-bold text-gray-700 text-sm">Payment</th>
      <th className="bg-white text-center p-4 font-bold text-gray-700 text-sm">Status</th>
    </tr>
  </thead>
  <tbody>
    {currentAppointments.map((appointment, index) => (
      <tr
        key={appointment._id || index}
        className="border-b border-blue-200 hover:bg-gray-50"
      >
        {/* Patient */}
        <td className="bg-gray-100 p-4 text-center">
  <div className="flex flex-col items-center gap-1">
    <div className="text-sm font-medium text-gray-900">
      {appointment.patient?.name || "N/A"}
    </div>
    <div className="text-xs text-gray-500">
      {appointment.patient?.age || "N/A"} yrs, {appointment.patient?.gender || "N/A"}
    </div>
  </div>
</td>



        {/* Contact */}
        <td className="bg-white p-4 text-gray-700 text-center">
          {appointment.patient?.phone || "N/A"}
        </td>

        {/* Date & Time */}
        <td className="bg-gray-100 p-4 text-gray-700 text-center">
          <div>{formatDate(appointment.appointmentDate)}</div>
          <div className="text-xs text-gray-500">
            {appointment.timeSlot || "N/A"}
          </div>
        </td>

        {/* Disease Type */}
        <td className="bg-white p-4 text-center">
          <span className="px-2 py-1 inline-flex text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
            {appointment.diseaseType?.name || "N/A"}
          </span>
        </td>

        {/* Payment */}
        <td className="bg-gray-100 p-4 text-gray-700 text-center">
          <div>₹{appointment.payment || 0}</div>
          <div className="text-xs text-gray-500">
            {appointment.isPaid ? "Paid" : "Unpaid"}
          </div>
        </td>

        {/* Status */}
        <td className="bg-white p-4 text-center">
          <StatusBadge status={appointment.status} />
        </td>
      </tr>
    ))}
  </tbody>
</table>
            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4">
              {currentAppointments.map((appointment, index) => (
                <div key={appointment._id || index} className="bg-white shadow-md rounded-lg p-4 border">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                        <span className="text-sm font-medium text-white">
                          {appointment.patient?.name?.charAt(0) || 'N'}
                        </span>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-gray-900">
                          {appointment.patient?.name || 'N/A'}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {appointment.patient?.age || 'N/A'} years, {appointment.patient?.gender || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={appointment.status} />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Date:</span>
                      <p className="text-gray-900">{formatDate(appointment.appointmentDate)}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Time:</span>
                      <p className="text-gray-900">{appointment.timeSlot || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Phone:</span>
                      <p className="text-gray-900">{appointment.patient?.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Payment:</span>
                      <p className="text-gray-900">₹{appointment.payment || 0}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="font-medium text-gray-600">Consulting For:</span>
                      <p className="text-gray-900">{appointment.consultingFor || appointment.diseaseName || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center mt-8 space-x-2">
                <button
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                
                {Array.from({ length: totalPages }, (_, index) => (
                  <button
                    key={index}
                    onClick={() => paginate(index + 1)}
                    className={`px-4 py-2 border rounded-lg ${
                      currentPage === index + 1
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
                
                <button
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
      </div>
    </DoctorLayout>
  );
};

export default AppointmentList;