import React, { useState } from 'react';
import profile from '/src/assets/images/doctor images/profile.jpg';
import doc from '/src/assets/images/doctor images/doc.jpg';
import Online_Doctor from '/src/assets/images/doctor images/Online_Doctor.jpg';
import AssisstentDoctors from '/src/assets/images/doctor images/AssisstentDoctors.jpg';
import Consultation from '/src/assets/images/doctor images/Consultation.jpg';
import cal1 from '/src/assets/images/doctor images/cal1.jpg';
import { FaPhone,FaStar, FaEllipsisV, FaClock, FaArrowLeft, FaArrowRight,FaVideo,FaTimes,FaCheck } from 'react-icons/fa'; // Import new icons
import DoctorLayout from "/src/components/doctor components/DoctorLayout.jsx";
import { Pie ,Bar} from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, BarElement } from 'chart.js';
import Select from "react-select";
ChartJS.register(ArcElement, Tooltip, Legend);

function Dashboard() {
  
  const overviewCards = [
    { title: 'Today Appointment', count: '5', color: 'bg-blue-100', image: cal1 },
    { title: 'Total Patients', count: '57', color: 'bg-indigo-100', image: Online_Doctor },
    { title: 'Consultations', count: '62', color: 'bg-pink-100', image: Consultation },
    { title: 'Assistent Doctors', count: '3', color: 'bg-yellow-100', image: AssisstentDoctors },
    { title: 'Inventry', count: '75%', color: 'bg-red-100', image: AssisstentDoctors },
  ];

  const appointments = [
    { name: 'Polly Paul', description: 'Follow Up', time: '10:30', img: cal1 },
    { name: 'Johen Doe', description: 'New Appointment', time: '11:45', img: doc },
    { name: 'Harmani Doe', description: 'Follow Up', time: '2:30', img: profile },
    { name: 'Polly Paul', description: 'Follow Up', time: '10:30', img: cal1 },
    { name: 'Johen Doe', description: 'New Appointment', time: '11:45', img: doc },
    { name: 'Harmani Doe', description: 'Follow Up', time: '2:30', img: profile },
  ];

 
  const patientsToday = [
    { name: 'Sarah Hostemn', diagnosis: 'Bronchi', time: '10:30am', img: profile },
    { name: 'Dakota Smith', diagnosis: 'Stroke', time: '11:00am', img: doc },
    { name: 'John Lane', diagnosis: 'Liver', time: '11:30am', img: profile },
    { name: 'Sarah Hostemn', diagnosis: 'Bronchi', time: '10:30am', img: profile },
    { name: 'Dakota Smith', diagnosis: 'Stroke', time: '11:00am', img: doc },
    { name: 'John Lane', diagnosis: 'Liver', time: '11:30am', img: profile },
  ];
  
  const doctors = [
    { name: 'Dr. Alex Brown', assignedWork: 'Medicine', completed: true, profilePic: doc },
    { name: 'Dr. Emma Green', assignedWork: 'Consultation', completed: false, profilePic: profile },
    { name: 'Dr. John Smith', assignedWork: 'Call log', completed: true, profilePic: cal1 },
    { name: 'Dr. Alex Brown', assignedWork: 'Medicine', completed: true, profilePic: doc },
    { name: 'Dr. Emma Green', assignedWork: 'Call log', completed: false, profilePic: profile },
    { name: 'Dr. John Smith', assignedWork: 'Consultation', completed: true, profilePic: cal1 },
    // Add more doctor data as needed
  ];

  const patientReviews = [
    { name: 'Theron Trump', date: '2 days ago', rating: 4, review: 'Great service and care. Highly recommended!' },
    { name: 'John Doe', date: '5 days ago', rating: 5, review: 'Excellent attention to detail and patient care.' },
    // Add more review data if needed
  ];
  const payments = [
    { name: 'Theron Trump', description: 'Kidney function test', date: 'Sunday, 16 May', amount: '$25.15', img: profile },
    { name: 'John Doe', description: 'Emergency appointment', date: 'Sunday, 16 May', amount: '$99.15', img: doc },
    { name: 'Sarah Johnson', description: 'Complementation test', date: 'Sunday, 16 May', amount: '$40.45', img: profile },
    { name: 'Theron Trump', description: 'Kidney function test', date: 'Sunday, 16 May', amount: '$25.15', img: profile },
    { name: 'John Doe', description: 'Emergency appointment', date: 'Sunday, 16 May', amount: '$99.15', img: doc },
  ];
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');

  // Handler for adding a new note
  const addNote = () => {
    if (newNote.trim() !== '') {
      setNotes([...notes, newNote]);
      setNewNote(''); // Clear the input field after adding
    }
  };

  // Handler for deleting a note
  const deleteNote = (index) => {
    const updatedNotes = notes.filter((_, i) => i !== index);
    setNotes(updatedNotes);
  };
  const markAsDone = (index) => {
    setNotes(
      notes.map((note, i) => (i === index ? `✅ ${note}` : note)) // Adds a checkmark to the note
    );
  };
  ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement // Register ArcElement for Pie chart
  );

  const barData = {
    labels: [ 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
    datasets: [
      {
        label: 'Percentage (%)',
        data:  [79, 75, 84,82 , 93,], // Example data
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Month vs Percentage',
      },
    },
  };
  
  

  const pieData = {
    labels: ['Acute', 'Chronic'],
    datasets: [
      {
        data: [27, 15],
        backgroundColor: ['#FFB6C1', '#B0E0E6'], // Light pastel colors for Acute and Chronic
        hoverBackgroundColor: ['#FF9AA2', '#A2D2FF'], // Hover colors
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        enabled: true,
      },
    },
  };

  
 
  
  
  const [currentDateIndex, setCurrentDateIndex] = useState(2);
  const [dates, setDates] = useState(['Sat 7th', 'Sun 8th', 'Mon 9th', 'Tue 10th', 'Wed 11th', 'Thu 12th', 'Fri 13th']); // Initialize with dates

  // Function to handle previous date navigation
  const handlePrevDate = () => {
    if (currentDateIndex > 0) {
      setCurrentDateIndex(currentDateIndex - 1);
    }
  };

  // Function to handle next date navigation
  const handleNextDate = () => {
    if (currentDateIndex < dates.length - 1) {
      setCurrentDateIndex(currentDateIndex + 1);
    }
  };
  const doctorOptions = [
    { value: "dr_admin", label: "Self" },
    { value: "dr_smith", label: "Dr. Smith" },
    { value: "dr_johnson", label: "Dr. Johnson" },
    { value: "dr_brown", label: "Dr. Brown" },
  ];
  
  // Sample patient data for Consultation, Medicine, and Prescription tables
  const consultationPatients = [
    { id: "C045", name: "John Doe", date: "2024-09-26", time: "10:00 AM", disease: "Fever", diseaseType: "Acute" },
    { id: "C048", name: "Jane Doe", date: "2024-09-26", time: "11:00 AM", disease: "Heartattack", diseaseType: "Chronic" },
    { id: "C049", name: "Jack Black", date: "2024-09-27", time: "01:00 PM", disease: "Diabetes", diseaseType: "Chronic" },
    { id: "C050", name: "Jake White", date: "2024-09-27", time: "02:00 PM", disease: "flu", diseaseType: "acute" },
  ];
  
  const medicinePatients = [
    { id: "C049", name: "Jack Black", date: "2024-09-27", time: "01:00 PM", disease: "Diabetes", diseaseType: "Chronic" },
    { id: "C050", name: "Jake White", date: "2024-09-27", time: "02:00 PM", disease: "flu", diseaseType: "acute" },
    { id: "C051", name: "Emily Davis", date: "2024-09-28", time: "03:00 PM", disease: "Asthma", diseaseType: "Chronic" },
    { id: "C0052", name: "Michael Brown", date: "2024-09-28", time: "04:00 PM", disease: "Arthritis", diseaseType: "Chronic" },
  ];
  
  const prescriptionPatients = [
    { id: "C051", name: "Emily Davis", date: "2024-09-28", time: "03:00 PM", disease: "Asthma", diseaseType: "Chronic" },
    { id: "C052", name: "Michael Brown", date: "2024-09-28", time: "04:00 PM", disease: "Arthritis", diseaseType: "Chronic" },
    { id: "C042", name: "Jack Black", date: "2024-09-27", time: "01:00 PM", disease: "Diabetes", diseaseType: "Chronic" },
    { id: "C043", name: "Jake White", date: "2024-09-27", time: "02:00 PM", disease: "flu", diseaseType: "acute" },
  ];
  
  
    const [activeTab, setActiveTab] = useState("Consultation");
  
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
    <div className="flex p-6  space-x-6">
      {/* Main content area */}
      <div className="flex-1 space-y-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-6 ">
          {overviewCards.map((card, index) => (
            <div
              key={index}
              className={`p-4 md:p-6 ${card.color} rounded-lg shadow-lg flex flex-col items-center justify-between h-48 w-full`}
            >
              {card.image && (
                <img
                  src={card.image}
                  alt={card.title}
                  className="h-20 w-30 rounded-full object-cover mb-2"
                />
              )}
              <div className="text-center">
                <div className="text-sm md:text-base text-gray-600">{card.title}</div>
                <div className="text-lg font-semibold text-gray-700">{card.count}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex space-x-4 p-4">
  {/* Your Patients Today Container */}
  <div className="w-full p-4  bg-white rounded-lg shadow-lg">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-lg text-gray-700 font-semibold">Your Patients Today</h2>
      <button className="text-sm text-blue-600 hover:underline">See All</button>
    </div>
    <hr className="border-gray-200 mb-4" />
    <ul className="max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-white">
      {patientsToday.map((patient, index) => (
        <li
          key={index}
          className="py-2 border-b border-gray-200 flex justify-between items-center"
        >
          <div className="flex items-center space-x-4">
            <img
              src={doc}
              alt="Patient"
              className="w-10 h-10 rounded-full"
            />
            <div>
              <div className="font-medium text-gray-800">{patient.name}</div>
              <div className="text-sm text-gray-800">{patient.diagnosis}</div>
              <div className="flex items-center mt-1 space-x-1">
                <FaClock className="text-gray-400" />
                <span className="text-sm text-gray-500">{patient.time}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button className="bg-green-500 text-white p-2 rounded-full">
              <FaVideo className="text-sm" />
            </button>
            <button className="bg-red-500 text-white p-2 rounded-full">
            <FaTimes className="text-sm" />
          </button>
            <button className="text-gray-500">
              <FaEllipsisV />
            </button>
          </div>
        </li>
      ))}
    </ul>
  </div>
</div>
</div>

    

      {/* Upcoming Appointments */}
      <div className="w-1/4 p-4 bg-white rounded-lg shadow-lg space-y-4">
  <h2 className="text-lg mb-4 text-gray-700">Upcoming Appointments</h2>
  <hr className="border-gray-200 mb-4" /> 

  {/* Calendar Navigation */}
  <div className="flex items-center justify-between mb-4 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-100 scrollbar-track-white ">
    <button onClick={handlePrevDate} disabled={currentDateIndex === 0} className="text-gray-500 p-2">
      <FaArrowLeft />
    </button>
    <div className="flex items-center space-x-2">
      {dates.slice(currentDateIndex, currentDateIndex + 5).map((date, index) => (
        <button
          key={index}
          className={`px-4 py-2 rounded-lg ${index === 2 ? 'bg-blue-400 text-white' : 'bg-gray-100 text-gray-700'}`}
          onClick={() => setCurrentDateIndex(index)}
        >
          {date}
        </button>
      ))}
    </div>
    <button onClick={handleNextDate} disabled={currentDateIndex === dates.length - 1} className="text-gray-500 p-2">
      <FaArrowRight />
    </button>
  </div>



        {/* Scrollable Appointment List */}
        <ul className="space-y-3 overflow-y-auto max-h-96 scrollbar-thin scrollbar-thumb-gray-100 scrollbar-track-white">
          {appointments.map((appt, index) => (
            <li key={index} className="py-2 border-b border-gray-200 flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <img src={appt.img} alt="Doctor" className="w-10 h-10 rounded-full" />
                <div>
                  <div className="font-medium text-black">{appt.name}</div>
                  <div className="text-sm text-gray-800">{appt.description}</div>
                  <div className="flex items-center mt-2 space-x-1">
                    <FaClock className="text-gray-400" />
                    <span className="text-sm text-gray-500">{appt.time}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center">
                <button className="text-gray-500 mt-2">
                  <FaEllipsisV />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>

    
    <div className="flex space-x-4 p-4">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 w-full">
 

  {/* Acute vs Chronic Patients */}
  <div className="p-4 bg-white rounded-lg shadow-lg">
  <h3 className="text-lg text-gray-700 mb-4">Acute vs Chronic Patients</h3>
  <div className="w-48 h-48 mx-auto"> {/* Set width and height of the chart */}
    <Pie data={pieData} options={pieOptions} />
  </div>
</div>

  {/* Month vs Percentage */}
  <div className="p-4 bg-white rounded-lg shadow-lg">
    <h3 className="text-lg text-gray-700 mb-4">Inventry</h3>
    <Bar data={barData} options={barOptions} />
  </div>
</div>
</div>

</DoctorLayout>
</div>

    
  );
};

export default Dashboard;
