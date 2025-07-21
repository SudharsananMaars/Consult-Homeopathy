import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from "/src/components/patient components/Layout.jsx";
import PrescriptionPopup from "/src/pages/patient pages/PrescriptionPopup.jsx";
import Nocontent from '/src/assets/images/doctor images/Nocontent.jpg';
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import {
  Clock4,
  Sun,
  Sunrise,
  Moon,
  XCircle,
  Activity,
  CalendarDays
} from 'lucide-react';

const Prescription = () => {
  const [activeTab, setActiveTab] = useState('Prescription');
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [calendarMap, setCalendarMap] = useState({});
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // New state for daily intake calendar
  const [dailyMedications, setDailyMedications] = useState([]);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [calendarError, setCalendarError] = useState(null);

  // Mock medicines data (keeping the existing structure)
  const getMockMedicines = () => [
    [
      {
        label: '1',
        medicineName: 'Dolo',
        form: 'Pills',
        duration: '5 days, 2025-07-17 to 2025-07-21',
        morning: 'Day 1 - 5\nE/S, 8-9 AM',
        noon: '',
        evening: 'Day 1 - 5\nL/S, 4-5 PM',
        night: 'Day 1 - 5\nL/S, 8-9 PM',
        instructions: '3 pills',
      }
    ],
    [
      {
        label: '2A',
        medicineName: 'Paracetamol',
        form: 'Tablets',
        duration: '5 days, 2025-07-11 to 2025-07-15',
        morning: 'Day 6 - 7\nE/S, 8-9 AM\nDay 8 - 10\nE/S, 8-9 AM',
        noon: '',
        evening: 'Day 6 - 7\nL/S, 4-5 PM\nDay 8 - 10\nL/S, 4-5 PM',
        night: 'Day 6\nL/S, 8-9 PM',
        instructions: 'Chew + Drink 1 sip hot water',
      }
    ],
    [
      {
        label: '3A',
        medicineName: 'Amoxicillin',
        form: 'Tablets',
        duration: '6 days, 2025-07-01 to 2025-07-06',
        morning: 'Day 11, 12, 16\nE/S, 8-9 AM\nDay 13\nE/S, 9-10 AM',
        noon: 'Day 14\nL/S, 1-2 PM',
        evening: 'Day 11 - 16\nL/S, 4-5 PM',
        night: 'Day 11, 15\nL/S, 8-9 PM',
        instructions: 'Chew + Drink 1 sip hot water',
      }
    ]
  ];

  // Fallback mock prescriptions (complete prescriptions for when API fails)
  const getMockPrescriptions = () => [
    {
      id: "rx-001",
      date: "2025-07-16",
      doctorName: "Dr. A",
      diagnosis: "Viral Fever",
      medicines: [
        {
          label: '1',
          medicineName: 'Dolo',
          form: 'Pills',
          duration: '5 days, 2025-07-17 to 2025-07-21',
          morning: 'Day 1 - 5\nE/S, 8-9 AM',
          noon: '',
          evening: 'Day 1 - 5\nL/S, 4-5 PM',
          night: 'Day 1 - 5\nL/S, 8-9 PM',
          instructions: '3 pills',
        }
      ]
    },
    {
      id: "rx-002",
      date: "2025-07-10",
      doctorName: "Dr. B",
      diagnosis: "Common Cold",
      medicines: [
        {
          label: '2A',
          medicineName: 'Paracetamol',
          form: 'Tablets',
          duration: '5 days, 2025-07-11 to 2025-07-15',
          morning: 'Day 6 - 7\nE/S, 8-9 AM\nDay 8 - 10\nE/S, 8-9 AM',
          noon: '',
          evening: 'Day 6 - 7\nL/S, 4-5 PM\nDay 8 - 10\nL/S, 4-5 PM',
          night: 'Day 6\nL/S, 8-9 PM',
          instructions: 'Chew + Drink 1 sip hot water',
        }
      ]
    },
    {
      id: "rx-003",
      date: "2025-06-30",
      doctorName: "Dr. C",
      diagnosis: "Stomach Infection",
      medicines: [
        {
          label: '3A',
          medicineName: 'Amoxicillin',
          form: 'Tablets',
          duration: '6 days, 2025-07-01 to 2025-07-06',
          morning: 'Day 11, 12, 16\nE/S, 8-9 AM\nDay 13\nE/S, 9-10 AM',
          noon: 'Day 14\nL/S, 1-2 PM',
          evening: 'Day 11 - 16\nL/S, 4-5 PM',
          night: 'Day 11, 15\nL/S, 8-9 PM',
          instructions: 'Chew + Drink 1 sip hot water',
        }
      ]
    }
  ];

  // New function to fetch daily medication schedule
  const fetchDailyMedicationSchedule = async (patientId, date) => {
    try {
      setCalendarLoading(true);
      setCalendarError(null);
      
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }
      
      const response = await axios.get(
        `https://clinic-backend-jdob.onrender.com/api/medication/schedule/daily/${patientId}`,
        {
          params: {
            date: date // Pass the selected date as query parameter
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Daily medication API Response:", response.data);

      // Transform the API response to match our table structure
      const medications = response.data.medications || [];
      const transformedMedications = medications.map(med => ({
        id: med.id || Math.random().toString(36).substr(2, 9),
        medicineName: med.medicineName || 'Unknown Medicine',
        date: med.date || date,
        doseTime: med.doseTime || '00:00',
        status: med.status || 'Pending',
        // Remove count field as requested
        day: med.day || 1
      }));

      setDailyMedications(transformedMedications);
      
    } catch (err) {
      console.error('Error fetching daily medication schedule:', err);
      
      if (err.response) {
        if (err.response.status === 401) {
          setCalendarError('Authentication failed. Please login again.');
        } else {
          setCalendarError(`Server error: ${err.response.status} - ${err.response.data?.message || 'Unknown error'}`);
        }
      } else if (err.request) {
        setCalendarError('Network error. Please check your connection and try again.');
      } else {
        setCalendarError(err.message || 'An unexpected error occurred.');
      }
      
      // Use mock data as fallback for daily calendar
      console.log("Using mock data for daily calendar");
      setDailyMedications([
        {
          id: '1',
          medicineName: 'Paracetamol',
          date: date,
          doseTime: '13:00',
          status: 'Pending',
          day: 1
        },
        {
          id: '2',
          medicineName: 'Paracetamol',
          date: date,
          doseTime: '18:00',
          status: 'Pending',
          day: 1
        }
      ]);
    } finally {
      setCalendarLoading(false);
    }
  };

  // Function to format time from 24-hour to 12-hour format
  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    try {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch (error) {
      return timeString;
    }
  };

  // Function to get status badge styling
  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'taken':
      case 'completed':
        return "bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-semibold";
      case 'missed':
        return "bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs font-semibold";
      case 'pending':
      default:
        return "bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full text-xs font-semibold";
    }
  };

  // Transform API data to match the expected component format
  const transformApiData = (apiData) => {
    console.log("Raw API data:", apiData);
    
    // Handle null/undefined data
    if (!apiData) {
      console.log("API data is null or undefined");
      return [];
    }

    // Get mock medicines data
    const mockMedicinesArray = getMockMedicines();

    // Handle single object response (convert to array)
    let dataArray;
    if (Array.isArray(apiData)) {
      dataArray = apiData;
    } else if (typeof apiData === 'object') {
      // Single object response - convert to array
      dataArray = [apiData];
      console.log("Converted single object to array:", dataArray);
    } else {
      console.log("API data is neither array nor object");
      return [];
    }

    return dataArray.map((item, index) => {
      // Create the prescription object with API data + mock medicines
      const prescription = {
        id: item._id || `api-rx-${index + 1}`,
        // These 3 fields from API
        date: item.startDate ? new Date(item.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        doctorName: item.doctorName || 'Unknown Doctor',
        diagnosis: item.consultingFor || 'Not specified',
        // Mock medicines - cycle through the available mock medicines
        medicines: mockMedicinesArray[index % mockMedicinesArray.length]
      };
      
      console.log("Created prescription:", prescription);
      return prescription;
    });
  };

  // Fetch prescriptions from API using axios
  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }
      
      // Replace with your actual patient ID
      const patientId = "6879eec76716cae54357165b"; 
      
      const response = await axios.get(
        `https://clinic-backend-jdob.onrender.com/api/prescriptionControl/summary/${patientId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("API Response:", response.data);

      // Transform API data to match the expected format
      const transformedPrescriptions = transformApiData(response.data);
      console.log("Transformed prescriptions:", transformedPrescriptions);
      setPrescriptions(transformedPrescriptions);
      
    } catch (err) {
      console.error('Error fetching prescriptions:', err);
      
      // Handle specific axios error responses
      if (err.response) {
        // Server responded with error status
        if (err.response.status === 401) {
          setError('Authentication failed. Please login again.');
        } else {
          setError(`Server error: ${err.response.status} - ${err.response.data?.message || 'Unknown error'}`);
        }
      } else if (err.request) {
        // Network error
        setError('Network error. Please check your connection and try again.');
      } else {
        // Other errors
        setError(err.message || 'An unexpected error occurred.');
      }
      
      // Use mock data as fallback
      console.log("Using mock data as fallback");
      setPrescriptions(getMockPrescriptions());
    } finally {
      setLoading(false);
    }
  };

  // Optional: Function to update prescription status
  const prescriptionId = '6879eec76716cae54357165b';

  const updatePrescriptionStatus = async (id = prescriptionId, isProductReceived = true) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found. User might not be authenticated.");
        return;
      }

      const response = await axios.patch(
        `https://clinic-backend-jdob.onrender.com/api/patient/prescriptions/${id}/receive`,
        { isProductReceived },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('Prescription status updated:', response.data);

    } catch (error) {
      console.error('Error updating prescription status:', error);
      if (error.response?.status === 401) {
        setError?.('Authentication failed. Please login again.');
      } else {
        setError?.('An error occurred while updating the status.');
      }
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  // Fetch daily medication schedule when selectedDate changes
  useEffect(() => {
    if (activeTab === 'Daily Intake Calendar') {
      const patientId = "6839356b329e1d17ee74f5ee"; // Replace with actual patient ID
      fetchDailyMedicationSchedule(patientId, selectedDate);
    }
  }, [selectedDate, activeTab]);

  useEffect(() => {
    const map = {};
    prescriptions.forEach(pres => {
      if (pres.medicines && Array.isArray(pres.medicines)) {
        pres.medicines.forEach(med => {
          const [durationText, range] = med.duration.split(',');
          if (range) {
            const [start, end] = range.trim().split(' to ');
            let current = new Date(start);
            const endDate = new Date(end);

            while (current <= endDate) {
              const dateKey = current.toISOString().split('T')[0];
              if (!map[dateKey]) map[dateKey] = [];
              map[dateKey].push(med.medicineName);
              current.setDate(current.getDate() + 1);
            }
          }
        });
      }
    });
    setCalendarMap(map);
  }, [prescriptions]);

  const handleView = (prescription) => {
    setSelectedPrescription(prescription);
  };

  const handleRetry = () => {
    fetchPrescriptions();
  };

  const handleCalendarRetry = () => {
    const patientId = "6839356b329e1d17ee74f5ee"; // Replace with actual patient ID
    fetchDailyMedicationSchedule(patientId, selectedDate);
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex flex-col p-7">
          <h2 className="text-2xl font-bold mb-4">Prescription</h2>
          <div className="flex-grow flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading prescriptions...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen flex flex-col p-7">
        <h2 className="text-2xl font-bold mb-4">Prescription</h2>

        <div className="flex mb-4 border-b border-gray-300">
          <button
            className={`py-2 px-4 ${activeTab === 'Prescription' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
            onClick={() => setActiveTab('Prescription')}
          >
            Prescriptions
          </button>
          <button
            className={`py-2 px-4 ${activeTab === 'Daily Intake Calendar' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
            onClick={() => setActiveTab('Daily Intake Calendar')}
          >
            Daily Intake Calendar
          </button>
        </div>

        {activeTab === 'Prescription' ? (
          <div className="flex flex-col gap-4">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-red-800 font-semibold">Error loading prescriptions</h4>
                    <p className="text-red-600 text-sm">{error}</p>
                    <p className="text-red-500 text-xs mt-1">Using mock data as fallback</p>
                  </div>
                  <button
                    onClick={handleRetry}
                    className="bg-red-100 text-red-700 px-3 py-1 rounded text-sm hover:bg-red-200"
                  >
                    Retry
                  </button>
                </div>
              </div>
            )}
            
            {prescriptions && prescriptions.length > 0 ? (
              prescriptions.map((prescription) => (
                <div
                  key={prescription.id}
                  className="bg-white shadow-md rounded-xl p-5 border hover:shadow-lg transition"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        {prescription.doctorName}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Date: {new Date(prescription.date).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        Diagnosis: {prescription.diagnosis}
                      </p>
                    </div>
                    <button
                      className="bg-blue-500 text-white font-semibold px-4 py-2 rounded hover:bg-blue-600"
                      onClick={() => handleView(prescription)}
                    >
                      View Prescription
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex-grow flex flex-col items-center justify-center mb-8">
                <img src={Nocontent} alt="No content" className="w-24 h-24 mb-4" />
                <p className="text-gray-500">No prescriptions available yet.</p>
                {error && (
                  <button
                    onClick={handleRetry}
                    className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    Try Again
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="flex gap-6">
            <div className="w-3/5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-blue-600" />
                  Daily Intake 
                </h3>
                <input
                  type="date"
                  className="border px-3 py-1 rounded text-sm"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>

              {/* Error handling for calendar */}
              {calendarError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-red-800 font-semibold">Error loading daily schedule</h4>
                      <p className="text-red-600 text-sm">{calendarError}</p>
                      <p className="text-red-500 text-xs mt-1">Using mock data as fallback</p>
                    </div>
                    <button
                      onClick={handleCalendarRetry}
                      className="bg-red-100 text-red-700 px-3 py-1 rounded text-sm hover:bg-red-200"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              )}

              {calendarLoading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <p className="ml-2 text-gray-500">Loading daily schedule...</p>
                </div>
              ) : (
                <table className="min-w-full bg-white border rounded-lg shadow-md text-sm">
                  <thead className="bg-gray-100 text-gray-700 font-semibold">
                    <tr>
                      <th className="px-4 py-2 border">Medicine</th>
                      <th className="px-4 py-2 border">Time</th>
                      <th className="px-4 py-2 border">Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-700">
                    {dailyMedications && dailyMedications.length > 0 ? (
                      dailyMedications.map((medication) => (
                        <tr key={medication.id}>
                          <td className="px-4 py-2 border text-center">
                            {medication.medicineName}
                          </td>
                          <td className="px-4 py-2 border text-center">
                            {formatTime(medication.doseTime)}
                          </td>
                          <td className="px-4 py-2 border text-center">
                            <span className={getStatusBadge(medication.status)}>
                              {medication.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="px-4 py-8 border text-center text-gray-500">
                          No medications scheduled for {new Date(selectedDate).toLocaleDateString()}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>

            <div className="w-2/5 bg-gray-50 rounded-xl p-5 shadow-md border flex flex-col gap-5">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-blue-600" />
                  Daily Intake Metrics
                </h3>
                <input
                  type="date"
                  className="px-3 py-1 border rounded-md text-sm text-gray-700"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-4">
                <div className="w-28 h-28">
                  <CircularProgressbar 
                    value={78} 
                    text={`78%`} 
                    styles={buildStyles({
                      pathColor: "#10B981",
                      textColor: "#374151",
                      trailColor: "#D1D5DB",
                    })}
                  />
                </div>
                <div className="text-left">
                  <h4 className="text-md font-semibold text-gray-700">Adherence Score</h4>
                  <p className="text-sm text-gray-500 max-w-[130px]">
                    Overall medicine intake adherence for this week.
                  </p>
                </div>
              </div>

              <div className="w-full space-y-4 text-sm text-gray-700">
                <div className="bg-white rounded-lg p-4 shadow-sm border">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Clock4 className="w-4 h-4 text-gray-600" />
                    Dose Consistency
                  </h4>
                  <div className="flex gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Sunrise className="w-4 h-4 text-yellow-500" />
                      <span>Morning:</span>
                      <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold text-xs">82%</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Sun className="w-4 h-4 text-orange-400" />
                      <span>Afternoon:</span>
                      <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full font-semibold text-xs">-</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Moon className="w-4 h-4 text-indigo-500" />
                      <span>Night:</span>
                      <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-semibold text-xs">64%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 shadow-sm border">
                  <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-500" />
                    Missed Doses
                  </h4>
                  <p className="text-sm text-gray-700">
                    <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold text-xs">5</span>
                    <span className="ml-2">doses missed this week</span>
                  </p>
                </div>

                <div className="bg-white rounded-lg p-4 shadow-sm border">
                  <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-600" />
                    Time Pattern
                  </h4>
                  <p className="italic text-sm text-gray-600">
                    Often misses
                    <span className="ml-1 bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-semibold text-xs">night doses</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedPrescription && (
          <PrescriptionPopup
            isOpen={!!selectedPrescription}
            onClose={() => setSelectedPrescription(null)}
            prescriptionData={selectedPrescription.medicines}
            doctorName={selectedPrescription.doctorName}
            diagnosis={selectedPrescription.diagnosis}
            date={selectedPrescription.date}
          />
        )}
      </div>
    </Layout>
  );
};

export default Prescription;