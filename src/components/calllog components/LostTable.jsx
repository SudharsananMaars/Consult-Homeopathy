import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { FaCheckCircle, FaTimesCircle, FaSearch, FaFilter, FaPhoneAlt, FaRecordVinyl, FaEye, FaDownload, FaPencilAlt, FaChevronRight, FaChevronLeft } from 'react-icons/fa';
import CallInterface from './CallInterface';
import RecordingsInterface from './RecordingsButton';
// import '../css/AssistantDashboard.css';
import config from '../../config';
import CommentCell from './CommentCell';
import DoctorAllocationCell from './DoctorAllocationComponent';
import RecordingsButton from './RecordingsButton';

const LostTable = () => {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOption, setFilterOption] = useState('all');
  const [showCallInterface, setShowCallInterface] = useState(false);
  const [currentCall, setCurrentCall] = useState(null);
  const [currentRecordings, setCurrentRecordings] = useState(null);
  const [showRecordingsInterface, setShowRecordingsInterface] = useState(false);
  const [followUpStatuses, setFollowUpStatuses] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [patientFormsStatus, setPatientFormsStatus] = useState({});
  const [visibleSections, setVisibleSections] = useState([1]);
  const [searchQuery, setSearchQuery] = useState(''); 
  const [statistics, setStatistics] = useState(null);
  const [allocations, setAllocations] = useState([]);
  const [individualAllocations, setIndividualAllocations] = useState({});
  const [tab, setTab] = useState('acute');
const [appointmentCounts, setAppointmentCounts] = useState({
  "Consultation": 0,
  "Prescription": 0,
  "Payment": 0,
  "Medicine Preparation": 0,
  "Shipment": 0,
  "Patient Care": 0
});
const [countsLoading, setCountsLoading] = useState(true);
  

  const API_URL = config.API_URL;

  useEffect(() => {
    const fetchPatientsAndFormStatus = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/log/list`);
        const patientsData = response.data
          .filter(patient => patient.medicalDetails.enquiryStatus == 'Not Interested') 
          .map(patient => ({
            ...patient,
            diseaseType: typeof patient.medicalDetails.diseaseType === 'string' 
              ? { name: patient.medicalDetails.diseaseType, isEdited: false }
              : patient.medicalDetails.diseaseType || { name: '', isEdited: false }
          }));
        
        const allocationsResponse = await axios.get(`${API_URL}/api/assign/allocations-with-doctors`);
        
        const followUpPromises = patientsData.map(patient => 
          axios.get(`${API_URL}/api/log/follow-up/${patient._id}`)
        );
        const followUpResponses = await Promise.all(followUpPromises);
        const followUpStatusObj = {};
        followUpResponses.forEach((res, index) => {
          followUpStatusObj[patientsData[index]._id] = res.data.followUpStatus;
        });
        
        const formStatusPromises = patientsData.map(patient => 
          axios.get(`${API_URL}/api/log/patientProfile/${patient.phone}`)
        );
        
        const formStatusResponses = await Promise.all(formStatusPromises);
        const formStatusObj = {};
        formStatusResponses.forEach((res, index) => {
          formStatusObj[patientsData[index]._id] = res.data.message;
        });
        
        setPatients(patientsData);
        setAllocations(allocationsResponse.data);
        setFollowUpStatuses(followUpStatusObj);
        setPatientFormsStatus(formStatusObj);

      } catch (error) {
        console.error('Error fetching data:', error.response ? error.response.data : error.message);
      }
    };
    
    fetchPatientsAndFormStatus();
  }, []);

  useEffect(() => {
  const fetchDashboardStats = async () => {
    try {
      const res = await fetch(`${API_URL}/api/patient/dashboard-statistics`);
      const data = await res.json();

      if (data.success) {
        setStatistics(data.statistics);
      } else {
        console.error("Failed to fetch statistics:", data);
      }
    } catch (err) {
      console.error("Error fetching dashboard statistics:", err);
    }
  };

  fetchDashboardStats();
}, []);

  const fetchAppointmentCounts = async (classification = 'acute') => {
  try {
    setCountsLoading(true);
    const response = await axios.patch(`${API_URL}/api/patient/sort-lost-patients`, {
      classification: classification,
    });

    if (response.data.success) {
      setAppointmentCounts(response.data.countsByStage);
    }
  } catch (error) {
    console.error('Error fetching appointment counts:', error);
  } finally {
    setCountsLoading(false);
  }
};

  const handleIndividualAllocation = async (patientId, doctorId) => {
    try {
      const response = await axios.post(`${API_URL}/api/assign/individual-allocation`, {
        patientId,
        doctorId
      });
      
      if (response.status === 200) {
        setIndividualAllocations(prev => ({
          ...prev,
          [patientId]: response.data.doctor
        }));
      }
    } catch (error) {
      console.error('Error allocating doctor:', error);
    }
  };

  const getDoctorForPatient = (patient) => {
    // First check if there's an individual allocation
    if (individualAllocations[patient._id]) {
      return individualAllocations[patient._id].name;
    }
  
    // If no individual allocation, fall back to role-based allocation
    if (!patient.follow || !allocations.length) return '---';
  
    let requiredFollowUpType = patient.follow;
  
    if (patient.follow === 'Follow up-C') {
      const diseaseType = patient.diseaseType?.name || '';
      const patientType = patient.newExisting || '';
      
      if (diseaseType && patientType) {
        requiredFollowUpType = `Follow up-${diseaseType}-${patientType}`;
      }
    }
  
    const allocation = allocations.find(a => a.followUpType === requiredFollowUpType);
    return allocation ? allocation.doctor.name : '---';
  };
  

  const prioritizePatients = (patientsList) => {
    return patientsList.sort((a, b) => {
      const priorityMap = {
        "Follow up-Mship": 1,
        "Follow up-C": 2,
        "Follow up-PCall": 3,
        "Follow up-Potential": 4,
        "Follow up-PCare": 5,
      };

      const getPriority = (patient) => {
        if (patient.follow === 'Follow up-Mship' && patient.medicalPayment === 'no') return 1;
        if (patient.follow === 'Follow up-C' && patient.appointmentFixed === 'no') return 2;
        return priorityMap[patient.follow] || 6;
      };

      return getPriority(a) - getPriority(b);
    });
  };

  const filteredPatients = prioritizePatients(patients.filter(patient => {
    const matchesSearchTerm =
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (patient.mobileNumber && String(patient.mobileNumber).includes(searchTerm));

    const matchesFilter =
      filterOption === 'all' ||
      (filterOption === 'pending' && patient.appointmentFixed === 'No') ||
      (filterOption === 'done' && patient.appointmentFixed === 'Yes');

    return matchesSearchTerm && matchesFilter;
  }));

  const makeCall = async (patient) => {
    try {
      const callResponse = await axios.post('https://41f4-122-15-77-226.ngrok-free.app/make-call', {
        to: patient.phone,
      });
      
      if (callResponse.status === 200) {
        const countResponse = await axios.post(`${API_URL}/api/log/increment-call-count/${patient._id}`);
        if (countResponse.status === 200) {
          setPatients(prevPatients => prevPatients.map(p =>
            p._id === patient._id ? countResponse.data.patient : p
          ));
          setCurrentCall(patient);
          window.alert('Call initiated and call count incremented successfully!');
        } else {
          console.error('Failed to increment call count:', countResponse.data);
        }
      } else {
        console.error('Failed to initiate call:', callResponse.data);
      }
    } catch (error) {
      console.error('Error making call or incrementing call count:', error.response ? error.response.data : error.message);
    }
  };

  const endCall = () => {
    setShowCallInterface(false);
    setCurrentCall(null);
  };

  const viewRecordings = async (patient) => {
    window.alert('Coming Soon !');
  };

  const closeRecordings = () => {
    setShowRecordingsInterface(false);
    setCurrentRecordings(null);
  };

  const sendMessage = async (patient) => {
    try {
      const response = await axios.post(`${API_URL}/api/log/send-message/${patient._id}`);
      if (response.status === 200) {
        setPatients(prevPatients => prevPatients.map(p =>
          p._id === patient._id
            ? { ...p, messageSent: { status: true, timeStamp: new Date().toISOString() } }
            : p
        ));
        console.log('Message sent successfully:', response.data);
      } else {
        console.error('Failed to send message:', response.data);
      }
    } catch (error) {
      console.error('Error sending message:', error.response ? error.response.data : error.message);
    }
  };

  useEffect(() => {
  fetchAppointmentCounts(tab);
}, [tab]);

const handleTabChange = (tab) => {
  setTab(tab);
};
  
  const getCallStatus = (patient) => {
    if (!patient || typeof patient.medicalDetails.enquiryStatus === 'undefined') {
      return 'Unknown';
    }

    const enquiryStatus = patient.medicalDetails.enquiryStatus ? patient.medicalDetails.enquiryStatus.trim() : '';
    const appointmentFixed = patient.appointmentFixed === 'Yes';
    const medicalPayment = patient.medicalDetails.medicalPayment === 'Yes';

    console.log('Patient ID:', patient._id);
    console.log('Enquiry Status:', enquiryStatus);
    console.log('Appointment Fixed:', appointmentFixed);
    
    if(appointmentFixed && medicalPayment) {
      return 'Completed';
    } else if(enquiryStatus === 'Not Interested') {
      return 'Lost';
    } else {
      return 'In-Progress';
    }
  };

  const handleEnquiryStatusChange = async (patientId, newStatus) => {
    try {
      const response = await axios.put(`${API_URL}/api/log/update-status/${patientId}`, {
        enquiryStatus: newStatus
      });

      if (response.status === 200) {
        setPatients(prevPatients => prevPatients.map(p => 
          p._id === patientId ? { ...p, medicalDetails: { ...p.medicalDetails, enquiryStatus: newStatus }, } : p
        ));
        console.log('Enquiry status updated successfully:', newStatus);
      } else {
        console.error('Failed to update enquiry status:', response.data);
      }
    } catch (error) {
      console.error('Error updating enquiry status:', error.response ? error.response.data : error.message);
    }
  };

  const [editingDiseaseType, setEditingDiseaseType] = useState(null);
  const handleEditDiseaseType = async (patientId, newDiseaseTypeName) => {
    try {
        const token = localStorage.getItem('token');
        console.log("Token:",token);
        const response = await axios.put(`${API_URL}/api/log/update-disease-type/${patientId}`, {
            diseaseType: {
                name: newDiseaseTypeName,
                edit: true,
            }
        }, {
            headers: {
                Authorization: `Bearer ${token}` // Set the bearer token
            }
        });
        console.log(response.data);
        if (response.data.success) {
            setPatients(prevPatients => prevPatients.map(p =>
                p._id === patientId ? {...p,medicalDetails: {...p.medicalDetails,diseaseType: response.data.medicalDetails.diseaseType, },
              }
            : p
            ));
            setEditingDiseaseType(null);
        } else {
            console.error('Failed to update disease type');
        }
    } catch (error) {
        console.error('Error updating disease type:', error);
    }
  };  

  const sections = [
    {
      id: 1,
      title: "Patient Information & Consultation Details",
      columns: ["S.No","Patient Type", "Who is the Consultation for", "Name", "Phone Number", "Whatsapp Number", "Age", "Email", "Gender", "Current Location", "Consulting For","If disease type is not available", "Acute / Chronic", "Patient Profile", "Enquiry Status"]
    },
    {
      id: 2,
      title: "Communication & Interaction Channels",
      columns: ["Role and Activity Status", "Messenger Comment", "Omni Channel", "Message Sent","Time Stamp", "Make a Call", "Recordings", "Follow up Comments", "Out of network"]
    },
    {
      id: 3,
      title: "Client Status & Tracking",
      columns: ["appDownload", "Call Status", "Call Attempted tracking", "Conversion Status"]
    },
    {
      id: 4,
      title: "Appointment & Payment",
      columns: ["Consultation payment","Appointment Fixed", "Medicine & Shipping Payment confirmation", "Role Allocation"]
    }
  ];

  const [activeTab, setActiveTab] = useState(1);
  const tableRef = useRef(null);
  
  const toggleSection = (sectionId) => {
    if (sectionId === activeTab) {
      setVisibleSections(prev => 
        prev.filter(id => id !== sectionId)
      );
      setActiveTab(null);
    } else {
      setVisibleSections([sectionId]);
      setActiveTab(sectionId);
    }
  };

  const [activeSection, setActiveSection] = useState(1);
  const scrollToSection = (sectionId) => {
    const sectionIndex = sections.findIndex(section => section.id === sectionId);
    if (sectionIndex !== -1 && tableRef.current) {
      const columnWidth = 150; // Adjust this value based on your actual column width
      const scrollPosition = sectionIndex * sections[sectionIndex].columns.length * columnWidth;
      tableRef.current.scrollLeft = scrollPosition;
    }
    setActiveSection(sectionId);
  };

  const TabSwitcher = () => (
    <div className="flex justify-around space-x-4 mb-4 mx-2 overflow-x-auto">
      {sections.map(section => (
        <button
          key={section.id}
          onClick={() => scrollToSection(section.id)}
        className={`flex-grow px-4 py-2 rounded-lg transition-colors duration-200 text-center whitespace-nowrap ${
            activeSection === section.id
              ? 'bg-blue-400 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {section.title}
        </button>
      ))}
    </div>
  );

  const renderTableHeader = () => (
    <thead>
      <tr className="border-b border-blue-200">
        {sections.flatMap((section, sectionIndex) => 
          section.columns.map((column, columnIndex) => {
            const isEvenColumn = (sectionIndex * section.columns.length + columnIndex) % 2 === 0;
            return (
              <th 
                key={column} 
                className={`${isEvenColumn ? 'bg-gray-100' : 'bg-white'} text-center p-4 font-bold text-gray-700 text-sm whitespace-nowrap`}
              >
                {column}
              </th>
            );
          })
        )}
      </tr>
    </thead>
  );

  const renderTableBody = () => (
    <tbody>
      {filteredPatients && filteredPatients.length > 0 ? (
        filteredPatients.map((patient, index) => (
          <tr key={patient._id} className="border-b border-blue-200 hover:bg-gray-50 transition-colors duration-200">
            {sections.flatMap((section, sectionIndex) => 
              section.columns.map((column, columnIndex) => {
                const isEvenColumn = (sectionIndex * section.columns.length + columnIndex) % 2 === 0;
                return (
                  <td 
                    key={column} 
                    className={`${isEvenColumn ? 'bg-gray-100' : 'bg-white'} p-4 text-gray-900 text-center text-sm`}
                  >
                    {renderCellContent(patient, column, index)}
                  </td>
                );
              })
            )}
          </tr>
        ))
      ) : (
        <tr>
          <td
            colSpan={sections.flatMap(section => section.columns).length}
            className="bg-white text-center text-gray-500 py-6"
          >
            No patients found.
          </td>
        </tr>
      )}
    </tbody>
  );

  const renderCellContent = (patient, column, index) => {
    switch (column) {
      case "S.No":
        return <span className="font-medium text-gray-900">{index + 1}</span>;
      case "Patient Type":
        return <span className="text-gray-600">{patient.newExisting || '---'}</span>;
      case "Who is the Consultation for":
        return <span className="text-gray-600">{patient.consultingFor || '---'}</span>;
      case "Name":
        return <span className="font-medium text-gray-900">{patient.name}</span>;
      case "Phone Number":
        return <span className="text-gray-600">{patient.phone}</span>;
      case "Whatsapp Number":
        return <span className="text-gray-600">{patient.whatsappNumber || '---'}</span>;
      case "Age":
        return <span className="text-gray-600">{patient.age || '---'}</span>;
      case "Email":
        return <span className="text-gray-600">{patient.email || '---'}</span>;
      case "Gender":
        return <span className="text-gray-600">{patient.gender || '---'}</span>;
      case "Current Location":
        return <span className="text-gray-600">{patient.currentLocation || '---'}</span>;
      case "Consulting For":
        return <span className="text-gray-600">{patient.medicalDetails.diseaseName || '---'}</span>;
      case "If disease type is not available":
        return <span className="text-gray-600">{patient.medicalDetails.diseaseName || '---'}</span>;
      case "Acute / Chronic":
        return <span className="text-gray-600">{patient.classification || '---'}</span>;
      case "Patient Profile":
        return <span className="text-gray-600">{patientFormsStatus[patient._id] || 'Loading...'}</span>;
      case "Enquiry Status":
        return (
          <select
            value={patient.medicalDetails.enquiryStatus || ''}
            onChange={(e) => handleEnquiryStatusChange(patient._id, e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select status</option>
            <option value="Interested">Interested</option>
            <option value="Not Interested">Not Interested</option>
            {/* <option value="Follow Up">Follow Up</option> */}
          </select>
        );
      case "Role and Activity Status":
        return <span className="text-gray-600">{patient.medicalDetails.follow || '---'}</span>;
      case "Messenger Comment":
        return <span className="text-gray-600">{patient.medicalDetails.followComment || '---'}</span>;
      case "Omni Channel":
        return <span className="text-gray-600">{patient.patientEntry || '---'}</span>;
      case "Message Sent":
        return patient.medicalDetails.messageSent?.status ? (
          <span className="bg-green-100 text-green-600 font-semibold px-3 py-1 rounded-full text-xs">
            Sent
          </span>
        ) : (
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-3 py-1 rounded-full text-xs transition"
            onClick={() => sendMessage(patient)}
          >
            Send Message
          </button>
        );
      case "Time Stamp":
        return <span className="text-gray-600">{patient.medicalDetails.messageSent?.timeStamp}</span>;
      case "Make a Call":
        return (
          <button 
            onClick={() => makeCall(patient)}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-3 py-1 rounded-full text-xs transition inline-flex items-center"
          >
            <FaPhoneAlt className="mr-1 h-3 w-3" /> Call
          </button>
        );
      case "Recordings":
        return (
          <div className="flex justify-center">
            <RecordingsButton patient={patient} />
          </div>
        );
      case "Follow up Comments":
        return (
          <div className="flex justify-center">
            <CommentCell 
              patient={patient} 
              API_URL={API_URL}
              onCommentAdded={(updatedPatient) => {
                if (updatedPatient && updatedPatient._id) {
                  setPatients((prevPatients) =>
                    prevPatients.map((p) =>
                      p._id === updatedPatient._id
                        ? {
                            ...p,
                            medicalDetails: {
                              ...p.medicalDetails,
                              comments: updatedPatient.medicalDetails.comments || [],
                            },
                          }
                        : p
                    )
                  );
                }
              }}
            />
          </div>
        );
      case "Out of network":
        return <span className="text-gray-600">{patient.outOfNetwork || '---'}</span>;
      case "appDownload":
        return patient.appDownload != '0' ? 
          <FaDownload className='text-green-500 mx-auto' /> : 
          <FaTimesCircle className='text-red-500 mx-auto' />;
      case "Call Status":
        return (
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            getCallStatus(patient) === 'Completed' ? 'bg-green-100 text-green-600' :
            getCallStatus(patient) === 'Lost' ? 'bg-red-100 text-red-600' :
            'bg-yellow-100 text-yellow-600'
          }`}>
            {getCallStatus(patient)}
          </span>
        );
      case "Call Attempted tracking":
        return <span className="text-gray-600">{patient.medicalDetails.callCount || 0}</span>;
      case "Conversion Status":
        return patient.appointmentFixed === 'Yes' ? 
          <FaCheckCircle className='text-green-500 mx-auto' /> : 
          <FaTimesCircle className='text-red-500 mx-auto' />;
      case "Consultation payment":
        return patient.appointmentFixed === 'Yes' ? 
          <FaCheckCircle className='text-green-500 mx-auto' /> : 
          <FaTimesCircle className='text-red-500 mx-auto' />;
      case "Appointment Fixed":
        return patient.appointmentFixed === 'Yes' ? 
          <FaCheckCircle className='text-green-500 mx-auto' /> : 
          <FaTimesCircle className='text-red-500 mx-auto' />;
      case "Medicine & Shipping Payment confirmation":
        return patient.medicalPayment === 'Yes' ? 
          <FaCheckCircle className='text-green-500 mx-auto' /> : 
          <FaTimesCircle className='text-red-500 mx-auto' />;
      case "Role Allocation":
        return (
          <div className="flex justify-center">
            <DoctorAllocationCell 
              patient={patient}
              currentDoctor={getDoctorForPatient(patient)}
              onAllocationChange={(newDoctor) => {
                setIndividualAllocations(prev => ({
                  ...prev,
                  [patient._id]: newDoctor
                }));
              }}
            />
          </div>
        );
      default:
        return <span className="text-gray-600">---</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6 bg-white p-3 rounded-lg">
        <h2 className="text-2xl font-bold text-black">Patients List</h2>
        
        <div className="flex items-center space-x-4">
          
          <div className="relative flex items-center">
            <div className="flex items-center bg-white rounded-l-lg border-2 border-r-0 border-[#1a237e] focus-within:border-[#534bae] transition-colors duration-300">
              <FaSearch className="ml-3 text-[#1a237e]" />
              <input
                type="text"
                placeholder="Search patients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="p-2 pl-2 w-64 outline-none text-[#212121]"
              />
            </div>
            <button 
              className="p-3 bg-[#1a237e] text-white rounded-r-lg hover:bg-[#000051] transition-all duration-300 border-2 border-[#1a237e] hover:border-[#000051] shadow-sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <FaFilter className="w-4 h-4" />
            </button>
          </div>
          {showFilters && (
            <select
              className="p-2 border-2 border-[#1a237e] rounded-lg outline-none text-[#212121] bg-white hover:border-[#534bae] transition-colors duration-300 cursor-pointer"
              value={filterOption}
              onChange={(e) => setFilterOption(e.target.value)}
            >
              <option value="all">All Patients</option>
              <option value="pending">Pending Calls</option>
              <option value="done">Completed Calls</option>
            </select> 
          )}
        </div>
      </div>
      {/* Tabs Section */}
<div className="flex gap-1 mb-6">
  <button 
    onClick={() => handleTabChange('acute')}
    className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
      tab === 'acute' 
        ? 'bg-blue-50 text-blue-600 border-blue-200' 
        : 'bg-gray-50 text-gray-600 border-gray-200'
    }`}
  >
    <div className={`w-2 h-2 rounded-full ${
      tab === 'acute' ? 'bg-blue-600' : 'bg-gray-400'
    }`}></div>
    Acute ({statistics?.notInterestedPatients?.acute ?? 0})
  </button>
  <button 
    onClick={() => handleTabChange('chronic')}
    className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
      tab === 'chronic' 
        ? 'bg-blue-50 text-blue-600 border-blue-200' 
        : 'bg-gray-50 text-gray-600 border-gray-200'
    }`}
  >
    <div className={`w-2 h-2 rounded-full ${
      tab === 'chronic' ? 'bg-blue-600' : 'bg-gray-400'
    }`}></div>
    Chronic ({statistics?.notInterestedPatients?.chronic ?? 0})
  </button>
</div>

{/* Status Cards */}
<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
  <div className="bg-white rounded-lg border border-gray-200 p-4 relative overflow-hidden">
    <div className="absolute left-0 top-0 w-1 h-full bg-blue-500"></div>
    <div className="ml-3">
      <div className="text-sm text-gray-500 mb-1">Consultation</div>
      <div className="text-2xl font-bold text-blue-500">
        {countsLoading ? '...' : appointmentCounts["Consultation"] || 0}
      </div>
    </div>
  </div>
  
  <div className="bg-white rounded-lg border border-gray-200 p-4 relative overflow-hidden">
    <div className="absolute left-0 top-0 w-1 h-full bg-orange-500"></div>
    <div className="ml-3">
      <div className="text-sm text-gray-500 mb-1">Prescription</div>
      <div className="text-2xl font-bold text-orange-500">
        {countsLoading ? '...' : appointmentCounts["Prescription"] || 0}
      </div>
    </div>
  </div>
  
  <div className="bg-white rounded-lg border border-gray-200 p-4 relative overflow-hidden">
    <div className="absolute left-0 top-0 w-1 h-full bg-green-500"></div>
    <div className="ml-3">
      <div className="text-sm text-gray-500 mb-1">Payment</div>
      <div className="text-2xl font-bold text-green-500">
        {countsLoading ? '...' : appointmentCounts["Payment"] || 0}
      </div>
    </div>
  </div>
  
  <div className="bg-white rounded-lg border border-gray-200 p-4 relative overflow-hidden">
    <div className="absolute left-0 top-0 w-1 h-full bg-yellow-500"></div>
    <div className="ml-3">
      <div className="text-sm text-gray-500 mb-1">Medicine Preparation</div>
      <div className="text-2xl font-bold text-yellow-500">
        {countsLoading ? '...' : appointmentCounts["Medicine Preparation"] || 0}
      </div>
    </div>
  </div>
  
  <div className="bg-white rounded-lg border border-gray-200 p-4 relative overflow-hidden">
    <div className="absolute left-0 top-0 w-1 h-full bg-blue-500"></div>
    <div className="ml-3">
      <div className="text-sm text-gray-500 mb-1">Shipment</div>
      <div className="text-2xl font-bold text-blue-500">
        {countsLoading ? '...' : appointmentCounts["Shipment"] || 0}
      </div>
    </div>
  </div>
  
  <div className="bg-white rounded-lg border border-gray-200 p-4 relative overflow-hidden">
    <div className="absolute left-0 top-0 w-1 h-full bg-blue-500"></div>
    <div className="ml-3">
      <div className="text-sm text-gray-500 mb-1">Patient Care</div>
      <div className="text-2xl font-bold text-blue-500">
        {countsLoading ? '...' : appointmentCounts["Patient Care"] || 0}
      </div>
    </div>
  </div>
</div>

      <TabSwitcher />
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto" ref={tableRef}>
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden">
              <div className="max-h-[calc(100vh-280px)] overflow-y-auto">
                <table className="w-full overflow-hidden rounded-lg">
                  {renderTableHeader()}
                  {renderTableBody()}
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showCallInterface && <CallInterface patient={currentCall} onClose={endCall} />}
      {showRecordingsInterface && <RecordingsInterface recordings={currentRecordings} onClose={closeRecordings} />}
    </div>
  );
};

export default LostTable;