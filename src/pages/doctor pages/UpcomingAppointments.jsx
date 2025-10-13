import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Video, AlertCircle } from 'lucide-react';
import DoctorLayout from "/src/components/doctor components/DoctorLayout.jsx"
import config from "../../config";

const API_URL = config.API_URL;

const UpcomingAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('No authentication token found');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/api/analytics/upcoming-appointments`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch appointments');
      }

      const result = await response.json();
      
      if (result.success) {
        setAppointments(result.data);
      } else {
        setError('Failed to load appointments');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const formatTime = (timeSlot) => {
    const [hours, minutes] = timeSlot.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const handleJoinMeet = (meetLink) => {
    window.open(meetLink, '_blank');
  };

  if (loading) {
    return (
      <DoctorLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DoctorLayout>
    );
  }

  if (error) {
    return (
      <DoctorLayout>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <div>
            <h3 className="text-red-800 font-medium">Error Loading Appointments</h3>
            <p className="text-red-600 text-sm mt-1">{error}</p>
          </div>
        </div>
      </DoctorLayout>
    );
  }

  return (
    <DoctorLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Upcoming Appointments</h1>
        <p className="text-gray-600 mt-2">
          {appointments.length} {appointments.length === 1 ? 'appointment' : 'appointments'} scheduled
        </p>
      </div>

      {appointments.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Upcoming Appointments</h3>
          <p className="text-gray-500">You don't have any appointments scheduled at the moment.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {appointments.map((appointment) => (
            <div
              key={appointment._id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(appointment.appointmentDate)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <Clock className="w-4 h-4" />
                    <span>{formatTime(appointment.timeSlot)}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleJoinMeet(appointment.meetLink)}
                  className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors"
                  title="Join Meeting"
                >
                  <Video className="w-5 h-5" />
                </button>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="font-medium text-gray-900">{appointment.patientName}</span>
                </div>

                {appointment.diseaseName && (
                  <div className="bg-gray-50 rounded-md px-3 py-2">
                    <p className="text-xs text-gray-500 mb-1">Reason for visit</p>
                    <p className="text-sm text-gray-900">
                      {appointment.diseaseName === 'None' || appointment.diseaseName === '' 
                        ? 'General consultation' 
                        : appointment.diseaseName}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </DoctorLayout>
  );
};

export default UpcomingAppointments;