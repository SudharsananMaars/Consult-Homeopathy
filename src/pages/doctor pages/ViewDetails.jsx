import React, { useEffect, useState } from "react";
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import DoctorLayout from "/src/components/doctor components/DoctorLayout.jsx";
import { useParams, useNavigate } from "react-router-dom";
import config from '/src/config.js';
import axios from 'axios';
import { User } from 'lucide-react';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);
const API_URL = config.API_URL;

const ViewDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patientDetails, setPatientDetails] = useState({});
  const [pastHistory, setPastHistory] = useState([]);
  const [futureHistory, setFutureHistory] = useState([]);
  const [activeTab, setActiveTab] = useState("Medicine");

  // Fetch patient details
  useEffect(() => {
    const fetchDetails = async () => {
      if (!id) return;
      
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get(`${API_URL}/api/patient/patientById/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setPatientDetails(response.data);
      } catch (error) {
        console.error('Error fetching patient details:', error);
      }
    };
    fetchDetails();
  }, [id]);

  // Fetch past appointments
  useEffect(() => {
    const fetchPastHistory = async () => {
      if (!id) return;
      
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get(`${API_URL}/api/doctor/getAppointmentWithTimedata`, {
          headers: {
            Authorization: `Bearer ${token}`
          },
          params: {
            id,
            type: 'past'
          }
        });
        setPastHistory(response.data);
      } catch (error) {
        console.error('Error fetching past history:', error);
      }
    };
    fetchPastHistory();
  }, [id]);

  // Fetch future appointments
  useEffect(() => {
    const fetchFutureHistory = async () => {
      if (!id) return;
      
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get(`${API_URL}/api/doctor/getAppointmentWithTimedata`, {
          headers: {
            Authorization: `Bearer ${token}`
          },
          params: {
            id,
            type: 'future'
          }
        });
        setFutureHistory(response.data);
      } catch (error) {
        console.error('Error fetching future history:', error);
      }
    };
    fetchFutureHistory();
  }, [id]);

  const pieData = {
    labels: ['Successful Intake', 'Missed'],
    datasets: [
      {
        label: 'Medicine Intake',
        data: [80, 20],
        backgroundColor: ['#7ccf7f', '#ff7369'],
        borderColor: ['#FFFFFF', '#FFFFFF'],
        borderWidth: 1,
      },
    ],
  };

 const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString();
};


  const formatCurrency = (amount) => {
    return `Rs. ${amount || 0}`;
  };

  return (
    <DoctorLayout>
      <div className="p-10 rounded-md">
        <div className="flex flex-wrap -mx-4">
          <div className="w-full md:w-1/2 px-4 mb-4">
            <div className="p-5 bg-white shadow-md rounded-lg flex items-center border-1 border-blue-100 h-full">
              <div className="w-24 h-24 rounded-full mr-4 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0">
                <User className="w-12 h-12 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold mt-5">{patientDetails.name || 'Loading...'}</h2>
                <p className="text-gray-600 mt-3">Patient ID: {patientDetails._id || 'N/A'}</p>
                <p className="text-gray-600">Created On: {formatDate(patientDetails.createdAt)}</p>
              </div>
            </div>
          </div>

          <div className="w-full md:w-1/2 px-4 mb-4">
            <div className="p-5 bg-white shadow-md rounded-lg border-1 border-blue-100 h-full">
              <p className="text-gray-700">
                <span className="font-semibold">Age:</span> {patientDetails.age || 'N/A'}
              </p>
              <p className="text-gray-700 mt-2">
                <span className="font-semibold">Gender:</span> {patientDetails.gender || 'N/A'}
              </p>
              <p className="text-gray-700 mt-2">
                <span className="font-semibold">Email:</span> {patientDetails.email || 'N/A'}
              </p>
              <p className="text-gray-700 mt-2">
                <span className="font-semibold">Phone:</span> {patientDetails.phone || 'N/A'}
              </p>
              <p className="text-gray-700 mt-2">
                <span className="font-semibold">Address:</span> {patientDetails.currentLocation || 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Disease History and Medicine/Workshop Tabs */}
        <div className="flex flex-wrap mb-4">
          {/* Disease History Container */}
          <div className="w-full lg:w-1/2 mb-4 pr-4">
            <div className="bg-white shadow-md rounded-md border-1 border-blue-100 h-96 flex flex-col">
              <h2 className="text-xl font-semibold p-5 pb-3 flex-shrink-0">Disease History</h2>
              <div className="flex-1 overflow-y-auto px-5 pb-5">
                <div className="space-y-4">
                  {pastHistory.length > 0 ? (
                    pastHistory.map((item) => (
                      <div key={item._id} className="p-2 border-b border-gray-200">
                        <div className="flex items-start">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-teal-400 rounded-full flex items-center justify-center">
                              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                              </svg>
                            </div>
                          </div>
                          <div className="ml-4 flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-semibold text-gray-800">
                                  {item.diseaseName || 'Unknown Disease'}
                                </h3>
                                <p className="text-gray-600 text-sm">
                                  {formatDate(item.appointmentDate)}
                                </p>
                                <p className="text-gray-600 text-sm">
                                  {item.timeSlot}
                                </p>
                              </div>
                              <div className="text-right">
                                {item.prescriptionID ? (
                                  <button 
                                    onClick={() => navigate(`/view-prescription/${item.prescriptionID}`)}
                                    className="text-blue-400 hover:text-blue-500 text-sm font-bold"
                                  >
                                    Prescription
                                  </button>
                                ) : (
                                  <span className="text-gray-400 text-sm font-bold">
                                    No Prescription
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">No past appointments found</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Medicine and Workshop Tabs Container */}
         <div className="w-full lg:w-1/2 mb-4">
  <div className="ml-1 bg-white shadow-md rounded-lg border-1 border-blue-100 h-96 flex flex-col">
    
    {/* Header */}
    <div className="p-3 border-b flex-shrink-0">
      <h2 className="text-lg font-semibold text-gray-700">Payment History</h2>
    </div>

    {/* Medicine Content - Scrollable */}
    <div className="flex-1 overflow-y-auto p-3 pt-4">
  <div className="space-y-4">
    {patientDetails?.payments?.length > 0 ? (
      patientDetails.payments.map((payment) => (
        <div key={payment._id} className="p-4 border border-gray-200 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold text-gray-700">{payment.razorpayOrderId}</p>
              <p className="text-gray-600 text-sm">
                {new Date(payment.createdAt).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </p>
              <p className="text-gray-600 text-sm">
                Time: {new Date(payment.createdAt).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-gray-700">Rs. {payment.amount}</p>
              <p className="text-xs text-green-600 capitalize">{payment.status}</p>
            </div>
          </div>
        </div>
      ))
    ) : (
      <p className="text-gray-500 text-center">No payment history available</p>
    )}
  </div>
</div>
    
  </div>
</div>
        </div>
      </div>
    </DoctorLayout>
  );
};

export default ViewDetails;