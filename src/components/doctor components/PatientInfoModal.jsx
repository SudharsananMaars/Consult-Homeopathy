import React, { useState, useEffect } from 'react';
import { X, Phone, Mail, MapPin, Calendar, User, Clock, FileText, Heart, Activity, AlertCircle, Pill, DollarSign, ClipboardCheck, UserPlus } from 'lucide-react';
import axios from 'axios';
import config from "../../config";

const API_URL = config.API_URL;

const PatientInfoModal = ({ isOpen, onClose, patient }) => {
  if (!isOpen || !patient) return null;

  const [secondFormData, setSecondFormData] = useState(null);
  const [pastHistory, setPastHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState(null);

  useEffect(() => {
    const fetchSecondFormData = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get(`${API_URL}/api/doctor/secondFormDetails?id=${patient.id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setSecondFormData(response.data[0]); 
        setLoading(false);
      } catch (error) {
        console.log(error);
        setLoading(false);
      }
    };
    
    if (isOpen && patient) {
      fetchSecondFormData();
    }
  }, [isOpen, patient]);

  useEffect(() => {
    const fetchPastHistory = async () => {
      if (!patient?.id) return;
      
      const token = localStorage.getItem('token');
      try {
        setHistoryLoading(true);
        setHistoryError(null);
        
        const response = await axios.get(`${API_URL}/api/doctor/getAppointmentWithTimedata`, {
          headers: {
            Authorization: `Bearer ${token}`
          },
          params: {
            id: patient.id,
            type: 'past'
          }
        });
        
        // Check if response is successful and has data
        if (response.data && Array.isArray(response.data)) {
          setPastHistory(response.data);
        } else {
          setPastHistory([]);
        }
        
        setHistoryLoading(false);
      } catch (error) {
        console.error('Error fetching past history:', error);
        
        // Handle specific error messages
        if (error.response?.data?.message === "The appointments are not found") {
          setHistoryError("no_appointments");
          setPastHistory([]);
        } else if (error.response?.status === 404) {
          setHistoryError("no_appointments");
          setPastHistory([]);
        } else {
          setHistoryError("fetch_error");
          setPastHistory([]);
        }
        
        setHistoryLoading(false);
      }
    };
    
    if (isOpen && patient) {
      fetchPastHistory();
    }
  }, [isOpen, patient]);

  // Helper function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Helper function to get status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'reserved':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'ongoing':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Calculate stats from past history
  const calculateStats = () => {
    const totalConsultations = pastHistory.length;
    const thisMonth = pastHistory.filter(appointment => {
      const appointmentDate = new Date(appointment.appointmentDate);
      const currentDate = new Date();
      return appointmentDate.getMonth() === currentDate.getMonth() && 
             appointmentDate.getFullYear() === currentDate.getFullYear();
    }).length;
    
    const totalPayment = pastHistory.reduce((sum, appointment) => sum + (appointment.payment || 0), 0);
    const avgPayment = totalConsultations > 0 ? Math.round(totalPayment / totalConsultations) : 0;

    return { totalConsultations, thisMonth, avgPayment };
  };

  const stats = calculateStats();

  // Render appointment history content based on state
  const renderAppointmentHistory = () => {
    if (historyLoading) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading appointment history...</span>
        </div>
      );
    }

    if (historyError === "no_appointments" || pastHistory.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
            <UserPlus className="w-8 h-8 text-blue-500" />
          </div>
          <h5 className="text-lg font-medium text-gray-900 mb-2">New Patient</h5>
          <p className="text-sm text-gray-600 mb-4">
            This patient doesn't have any appointment history yet. This appears to be their first consultation.
          </p>
          <div className="bg-blue-50 rounded-lg p-4 text-left max-w-md mx-auto">
            <h6 className="text-sm font-medium text-blue-900 mb-2">Next Steps:</h6>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Complete initial consultation</li>
              <li>• Create patient medical record</li>
              <li>• Schedule follow-up if needed</li>
            </ul>
          </div>
        </div>
      );
    }

    if (historyError === "fetch_error") {
      return (
        <div className="text-center py-8">
          <div className="mx-auto w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-6 h-6 text-red-500" />
          </div>
          <h5 className="text-sm font-medium text-gray-900 mb-2">Unable to load appointment history</h5>
          <p className="text-xs text-gray-600">
            There was an error loading the patient's appointment history. Please try again later.
          </p>
        </div>
      );
    }

    // Render appointment list
    return (
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {pastHistory.slice(0, 5).map((appointment) => (
          <div key={appointment._id} className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h5 className="text-sm font-medium text-gray-900">{appointment.diseaseName}</h5>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                    {appointment.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-600">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(appointment.appointmentDate)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {appointment.timeSlot}
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    ₹{appointment.payment}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  appointment.diseaseType?.name === 'Chronic' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                }`}>
                  {appointment.diseaseType?.name || 'N/A'}
                </span>
              </div>
            </div>
            
            {appointment.follow && (
              <div className="flex items-center gap-1 text-xs text-blue-600 mb-1">
                <ClipboardCheck className="w-3 h-3" />
                {appointment.follow}
              </div>
            )}
            
            {appointment.notes && (
              <p className="text-xs text-gray-600 mt-2">{appointment.notes}</p>
            )}
            
            <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
              <span>Prescription: {appointment.prescriptionCreated ? 'Created' : 'Not Created'}</span>
              <span>Calls: {appointment.callCount}</span>
            </div>
          </div>
        ))}
        {pastHistory.length > 5 && (
          <div className="text-center">
            <span className="text-sm text-gray-500">Showing 5 of {pastHistory.length} appointments</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-gray-900">Patient Information</h2>
            {(historyError === "no_appointments" || pastHistory.length === 0) && !historyLoading && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                New Patient
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {/* Patient Header */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-xl font-medium">
                {patient.avatar}
              </div>
              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                patient.isOnline ? 'bg-green-500' : 'bg-gray-400'
              }`} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">{patient.name}</h3>
              <p className="text-sm text-gray-500">Patient ID: #{patient.id.slice(-5)}</p>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                patient.isOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {patient.isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading medical information...</span>
            </div>
          ) : (
            <>
              {/* Rest of your existing content remains the same until Quick Stats */}
              
              {/* Patient Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wide">Personal Information</h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <User className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Age & Gender</p>
                        <p className="text-sm text-gray-600">{patient.age} years • {patient.gender}</p>
                      </div>
                    </div>

                    {secondFormData && (
                      <>
                        <div className="flex items-center gap-3">
                          <Activity className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Physical Details</p>
                            <p className="text-sm text-gray-600">
                              {secondFormData.height?.feet}'{secondFormData.height?.inches}" • {secondFormData.weight}kg • {secondFormData.bodyType}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Location</p>
                            <p className="text-sm text-gray-600">
                              {secondFormData.city}, {secondFormData.state}, {secondFormData.country}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <FileText className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Occupation</p>
                            <p className="text-sm text-gray-600">{secondFormData.occupation}</p>
                          </div>
                        </div>
                      </>
                    )}

                    {patient.phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Phone</p>
                          <p className="text-sm text-gray-600">{patient.phone}</p>
                        </div>
                      </div>
                    )}

                    {patient.email && (
                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Email</p>
                          <p className="text-sm text-gray-600">{patient.email}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Medical Information */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wide">Medical Information</h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Patient Type</p>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${patient.statusColor}`}>
                          {patient.status}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Registration Date</p>
                        <p className="text-sm text-gray-600">{patient.time}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Query Type</p>
                        <p className="text-sm text-gray-600">{patient.queryType}</p>
                      </div>
                    </div>

                    {secondFormData?.clinicReferral && (
                      <div className="flex items-center gap-3">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">How they found us</p>
                          <p className="text-sm text-gray-600">{secondFormData.clinicReferral.join(', ')}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Current Complaints & Symptoms */}
              {secondFormData && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wide mb-3">Current Health Issues</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-red-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="w-4 h-4 text-red-600" />
                        <h5 className="text-sm font-medium text-red-900">Main Complaint</h5>
                      </div>
                      <p className="text-sm text-red-700">{secondFormData.complaint}</p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Activity className="w-4 h-4 text-orange-600" />
                        <h5 className="text-sm font-medium text-orange-900">Symptoms</h5>
                      </div>
                      <p className="text-sm text-orange-700">{secondFormData.symptoms}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Medical History */}
              {secondFormData && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wide mb-3">Medical History</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Heart className="w-4 h-4 text-blue-600" />
                          <h5 className="text-sm font-medium text-blue-900">Associated Disease</h5>
                        </div>
                        <p className="text-sm text-blue-700">{secondFormData.associatedDisease}</p>
                      </div>
                      
                      <div className="bg-purple-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Pill className="w-4 h-4 text-purple-600" />
                          <h5 className="text-sm font-medium text-purple-900">Current Medication</h5>
                        </div>
                        <p className="text-sm text-purple-700">{secondFormData.allopathy}</p>
                      </div>

                      {secondFormData.allergies && (
                        <div className="bg-yellow-50 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertCircle className="w-4 h-4 text-yellow-600" />
                            <h5 className="text-sm font-medium text-yellow-900">Allergies</h5>
                          </div>
                          <p className="text-sm text-yellow-700">{secondFormData.allergies}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h5 className="text-sm font-medium text-gray-900 mb-2">Disease History</h5>
                        <p className="text-sm text-gray-700">{secondFormData.diseaseHistory}</p>
                      </div>
                      
                      {secondFormData.surgeryHistory && (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h5 className="text-sm font-medium text-gray-900 mb-2">Surgery History</h5>
                          <p className="text-sm text-gray-700">{secondFormData.surgeryHistory}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Consultation Reason */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wide mb-3">Consultation Reason</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700">{patient.reason}</p>
                </div>
              </div>

              {/* Quick Stats - Updated to handle no appointment case */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-3 text-center">
                  <p className="text-lg font-semibold text-blue-600">{stats.totalConsultations}</p>
                  <p className="text-xs text-blue-600">Total Consultations</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <p className="text-lg font-semibold text-green-600">{stats.thisMonth}</p>
                  <p className="text-xs text-green-600">This Month</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-3 text-center">
                  <p className="text-lg font-semibold text-orange-600">
                    {stats.avgPayment > 0 ? `₹${stats.avgPayment}` : '--'}
                  </p>
                  <p className="text-xs text-orange-600">Avg Payment</p>
                </div>
              </div>

              {/* Appointment History - Updated with error handling */}
              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wide mb-3">Appointment History</h4>
                {renderAppointmentHistory()}
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors">
            View Full Medical Record
          </button>
        </div>
      </div>
    </div>
  );
};

export default PatientInfoModal;