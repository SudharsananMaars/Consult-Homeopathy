import React, { useState , useEffect} from 'react';
import profile from '/src/assets/images/doctor images/profile.jpg';
import doc from '/src/assets/images/doctor images/doc.jpg';
import Online_Doctor from '/src/assets/images/doctor images/Online_Doctor.jpg';
import Consultation from '/src/assets/images/doctor images/Consultation.jpg';
import cal1 from '/src/assets/images/doctor images/cal1.jpg';
import config from "../../config";
import { FaPhone,FaStar, FaEllipsisV, FaClock, FaArrowLeft, FaArrowRight,FaVideo,FaTimes,FaCheck } from 'react-icons/fa'; // Import new icons
import DoctorLayout from "/src/components/doctor components/DoctorLayout.jsx";
import { Pie ,Bar} from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, BarElement } from 'chart.js';
import Select from "react-select";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { StaticDatePicker } from '@mui/x-date-pickers/StaticDatePicker';
import dayjs from 'dayjs';
import { Box } from '@mui/material';

ChartJS.register(ArcElement, Tooltip, Legend);

function Dashboard() {
  const API_URL = config.API_URL;
  
  // State for total patients
  const [totalPatients, setTotalPatients] = useState('0');
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [totalConsultations, setTotalConsultations] = useState('0');
  const [loadingConsultations, setLoadingConsultations] = useState(true);
  const [appointments, setAppointments] = useState('0');
  const [loadingAppointments,setLoadingAppointments] = useState(true);

  // Fetch total patients
  useEffect(() => {
    const fetchTotalPatients = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/patient/total-no-patients`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        const data = await response.json();
        
        if (data.success) {
          setTotalPatients(data.totalPatients.toString());
        }
      } catch (error) {
        console.error('Error fetching total patients:', error);
        setTotalPatients('0'); // fallback value
      } finally {
        setLoadingPatients(false);
      }
    };

    fetchTotalPatients();
  }, [API_URL]);

  // Fetch total consultations
  useEffect(() => {
    const fetchTotalConsultations = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/doctor/appointments/total-count`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        const data = await response.json();
        
        if (data.success) {
          setTotalConsultations(data.totalAppointments.toString());
        }
      } catch (error) {
        console.error('Error fetching total consultations:', error);
        setTotalConsultations('0'); // fallback value
      } finally {
        setLoadingConsultations(false);
      }
    };

    fetchTotalConsultations();
  }, [API_URL]);

  useEffect(() => {
    const fetchTotalConsultations = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/doctor/appointments/today/count`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        const data = await response.json();
        
        if (data.success) {
          setAppointments(data.count.toString());
        }
      } catch (error) {
        console.error('Error fetching total appointments:', error);
        setAppointments('0'); // fallback value
      } finally {
        setLoadingAppointments(false);
      }
    };

    fetchTotalConsultations();
  }, [API_URL]);

  const overviewCards = [
    { title: 'Appointments Today', count: appointments , color: 'bg-blue-50 border-l-4 border-blue-500', image: cal1 },
    { title: 'Total Patients', count: totalPatients, color: 'bg-yellow-50 border-l-4 border-yellow-500', image: Online_Doctor },
    { title: 'Consultations', count:  totalConsultations, color: 'bg-pink-50 border-l-4 border-pink-500', image: Consultation },
    { title: 'Inventory', count: '75%', color: 'bg-red-50 border-l-4 border-red-500', image: cal1 },
  ];

  const [patientsToday, setPatientsToday] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(dayjs());

useEffect(() => {
  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/doctor/todays-appointments?date=${selectedDate.format('YYYY-MM-DD')}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Transform API data to match your component structure
        const transformedData = data.appointments.map(appointment => ({
          appointmentId: appointment.appointmentId,
          name: appointment.patientName,
          patientId: appointment.patientId,
          diagnosis: 'Consultation', // API doesn't provide diagnosis, using default
          time: appointment.timeSlot,
          meetLink: appointment.meetLink,
          img: profile // keeping your existing image logic
        }));
        setPatientsToday(transformedData);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  fetchAppointments();
}, [selectedDate, API_URL]);

const handleVideoCall = (meetLink) => {
  window.open(meetLink, '_blank');
};

  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  
  // Handler for adding a new note
  const addNote = () => {
    if (newNote.trim() !== '') {
      setNotes([...notes, newNote]);
      setNewNote(''); // Clear the input field after adding
    }
  };

  const doctorOptions = [
    { value: "dr_admin", label: "Self" },
    { value: "dr_smith", label: "Dr. Smith" },
    { value: "dr_johnson", label: "Dr. Johnson" },
    { value: "dr_brown", label: "Dr. Brown" },
  ];
  
    // State to store selected doctor for each patient
    const [selectedDoctors, setSelectedDoctors] = useState({});
  
    // Handle doctor selection for a specific patient
    const handleDoctorSelect = (patientId, selectedOption) => {
      setSelectedDoctors((prevSelected) => ({
        ...prevSelected,
        [patientId]: selectedOption,
      }));
    };
  
    // Function to display appropriate patients based on the active tab
    const renderTable = (patients) => (
      <table className="min-w-full table-auto">
        <thead>
          <tr className="bg-gray-200 text-left">
            <th className="px-4 py-2">Patient ID</th>
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">Date</th>
            <th className="px-4 py-2">Time</th>
            <th className="px-4 py-2">Disease</th>
            <th className="px-4 py-2">Disease Type</th>
            <th className="px-4 py-2">Doctor</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((patient, index) => (
            <tr key={index} className="border-t">
              <td className="px-4 py-2">{patient.id}</td>
              <td className="px-4 py-2">{patient.name}</td>
              <td className="px-4 py-2">{patient.date}</td>
              <td className="px-4 py-2">{patient.time}</td>
              <td className="px-4 py-2">{patient.disease}</td>
              <td className="px-4 py-2">{patient.diseaseType}</td>
              <td className="px-4 py-2">
                <Select
                  options={doctorOptions}
                  value={selectedDoctors[patient.id] || null} // Show selected value or null if not selected
                  onChange={(selectedOption) => handleDoctorSelect(patient.id, selectedOption)}
                  className="w-48"
                  placeholder="Select Doctor"
                  isClearable
                  isSearchable
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );

  return (
    <div>
        <DoctorLayout>
    <div className="p-6 space-y-6">
      {/* Overview Cards - First Line Only */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
        {overviewCards.map((card, index) => (
          <div
            key={index}
            className={`p-6 ${card.color} rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 bg-white`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 font-medium">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{card.count}</p>
              </div>
              <div className="ml-4">
                <img
                  src={card.image}
                  alt={card.title}
                  className="h-12 w-12 rounded-lg object-cover"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Patients Table and Calendar - Side by Side */}
      <div className="flex space-x-6">
        {/* Your Patients Today Container */}
        <div className="flex-1 bg-white rounded-lg shadow-lg">
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <h2 className="text-lg text-gray-700 font-semibold">Your Patients</h2>
            <button className="text-sm text-blue-600 hover:underline">See All</button>
          </div>
          
          <div className="p-6">
            {loading ? (
              <div className="text-center py-8">Loading appointments...</div>
            ) : patientsToday.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No appointments today</div>
            ) : (
              <div className="max-h-96 overflow-y-auto">
                <ul className="space-y-4">
                  {patientsToday.map((patient, index) => (
                    <li
                      key={patient.appointmentId || index}
                      className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <img
                          src={doc}
                          alt="Patient"
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div>
                          <div className="font-medium text-gray-800">{patient.name}</div>
                          <div className="text-sm text-gray-600">{patient.diagnosis}</div>
                          <div className="flex items-center mt-1 space-x-1">
                            <FaClock className="text-gray-400 text-xs" />
                            <span className="text-sm text-gray-500">{patient.time}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button 
                          className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600 transition-colors"
                          onClick={() => handleVideoCall(patient.meetLink)}
                        >
                          <FaVideo className="text-sm" />
                        </button>
                        <button className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors">
                          <FaTimes className="text-sm" />
                        </button>
                        <button className="text-gray-400 hover:text-gray-600 p-2">
                          <FaEllipsisV className="text-sm" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Updated Calendar Section */}
        <div className="w-80 bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg text-gray-700 font-semibold">Upcoming Appointments</h2>
          </div>
          
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box sx={{ width: '100%', paddingLeft: '4px', paddingRight: '16px', paddingTop: '8px', paddingBottom: '8px' }}>
              <StaticDatePicker
                displayStaticWrapperAs="desktop"
                value={selectedDate}
                onChange={(newValue) => setSelectedDate(newValue)}
                slotProps={{
                  toolbar: { hidden: true },
                  actionBar: { hidden: true }
                }}
              />
            </Box>
          </LocalizationProvider>
        </div>
      </div>
    </div>
</DoctorLayout>
</div>
  );
};

export default Dashboard;