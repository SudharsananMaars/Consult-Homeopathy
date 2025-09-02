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
        const response = await axios.get(`${API_URL}/api/doctor/appointments`);
        setAppointments(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching appointments:', err);
        setError('Failed to fetch appointments');
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  // Calculate the range of appointments to display
  const indexOfLastAppointment = currentPage * appointmentsPerPage;
  const indexOfFirstAppointment = indexOfLastAppointment - appointmentsPerPage;
  const currentAppointments = appointments.slice(indexOfFirstAppointment, indexOfLastAppointment);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  const totalPages = Math.ceil(appointments.length / appointmentsPerPage);

  return (
    <DoctorLayout>
    <div className="container mx-auto p-3">
      <h1 className="text-2xl font-bold mb-6">Appointments</h1>
      <table className="table-auto w-full border-collapse ">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="px-4 py-2">Patient Name</th>
            <th className="px-4 py-2">Email</th>
            <th className="px-4 py-2">Consulting For</th>
            <th className="px-4 py-2">Person</th>
            <th className="px-4 py-2">Reason</th>
            <th className="px-4 py-2">Symptom</th>
            <th className="px-4 py-2">Doctor</th>
            <th className="px-4 py-2">Date</th>
            <th className="px-4 py-2">Time Slot</th>
            <th className="px-4 py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {currentAppointments.map((appointment, index) => (
            <tr key={index} className="text-center">
              <td className="px-1 py-4">{appointment.patientName}</td>
              <td className="px-1 py-4">{appointment.patientEmail}</td>
              <td className="px-1 py-4">{appointment.consultingFor?.label || appointment.consultingFor}</td>
              <td className="px-1 py-4">{appointment.consultingPersonName}</td>
              <td className="px-1 py-4">{appointment.reason?.label || appointment.reason}</td>
              <td className="px-1 py-4">{appointment.symptom || 'N/A'}</td>
              <td className="px-1 py-4">{appointment.doctorName}</td>
              <td className="px-1 py-4">{new Date(appointment.appointmentDate).toLocaleDateString()}</td>
              <td className="px-1 py-4">{appointment.timeSlot}</td>
              <td className="px-1 py-4">{appointment.status}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div className="flex justify-center mt-4">
        <button
          className="px-4 py-2 mx-1 border rounded-lg"
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index}
            onClick={() => paginate(index + 1)}
            className={`px-4 py-2 mx-1 border rounded-lg ${
              currentPage === index + 1 ? 'bg-blue-500 text-white' : ''
            }`}
          >
            {index + 1}
          </button>
        ))}
        <button
          className="px-4 py-2 mx-1 border rounded-lg"
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
    </DoctorLayout>
  );
};

export default AppointmentList;
