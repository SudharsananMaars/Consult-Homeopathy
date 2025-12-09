import React, { useEffect, useState } from "react";
import axios from "axios";
import { IoIosSearch, IoIosWarning, IoIosHourglass } from "react-icons/io";
import {
  FaUserInjured,
  FaUserPlus,
  FaFileMedical,
  FaPhoneAlt,
  FaRecordVinyl,
  FaCheck,
  FaDownload,
  FaPencilAlt,
} from "react-icons/fa";
import config from "../../config";
import { useLocation, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import CommentCell from "./CommentCell";
import VideoCall from "../../pages/doctor pages/VideoCall";
import DraftViewModal from "./DraftViewModal"; // Make sure the path is correct
import PrescriptionViewModal from "../PrescriptionModule/PrescriptionViewModal";
import MedicinePreparationView from "../../pages/doctor pages/MedicinePreparationView";

const WorkTable = () => {
  const [patients, setPatients] = useState([]);
  const [specialAllocationPatients, setSpecialAllocationPatients] = useState(
    []
  );
  const [currentDoctorId, setCurrentDoctorId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [followTypes, setFollowTypes] = useState([]);
  const [selectedFollowType, setSelectedFollowType] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState("");
  const API_URL = config.API_URL;
  const [doctors, setDoctors] = useState([]);
  const [isDraftModalOpen, setIsDraftModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [activeTab, setActiveTab] = useState('acute');
const [appointmentCounts, setAppointmentCounts] = useState({
  "Consultation": 0,
  "Prescription": 0,
  "Payment": 0,
  "Medicine Preparation": 0,
  "Shipment": 0,
  "Patient Care": 0
});
const [countsLoading, setCountsLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [statistics, setStatistics] = useState(null);

  const location = useLocation();
  const userId = localStorage.getItem("userId");
  const storageKey = `selectedFollowType_${userId}`;

  const fetchDoctors = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/assign/doctors`);
      setDoctors(response.data);
    } catch (error) {
      console.error("Error fetching doctors:", error);
      setError("Failed to load doctors. Please try again later.");
    }
  };
  const getToken = () => {
    return localStorage.getItem("token");
  };

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const followFromUrl = queryParams.get("follow");
    const savedFollow = localStorage.getItem(storageKey);

    if (followTypes.length === 0) return; // Wait for fetch to finish

    if (followFromUrl && followTypes.includes(followFromUrl)) {
      setSelectedFollowType(followFromUrl);
      localStorage.setItem(storageKey, followFromUrl);
    } else if (savedFollow && followTypes.includes(savedFollow)) {
      setSelectedFollowType(savedFollow);
    }
  }, [location.search, followTypes]);

  const handleFollowChange = (e) => {
    const newType = e.target.value;
    setSelectedFollowType(newType);
    localStorage.setItem(storageKey, newType);
    const params = new URLSearchParams(location.search);
    params.set("follow", newType);
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  };


  const sections = [
  {
    id: 1,
    title: "Patient Information & Consultation Details",
  },
  {
    id: 2,
    title: "Communication & Interaction Channels",
  },
  {
    id: 3,
    title: "Client Status & Tracking",
  },
  {
    id: 4,
    title: "Appointment & Payment",
  }
];

const TabSwitcher = () => {
  return (
    <div className="flex justify-around space-x-4 mb-4 mx-2 overflow-x-auto">
      {sections.map((section) => (
        <button
          key={section.id}
          className="flex-grow px-4 py-2 rounded-lg transition-colors duration-200 text-center whitespace-nowrap bg-gray-100 text-gray-700 hover:bg-gray-200"
        >
          {section.title}
        </button>
      ))}
    </div>
  );
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

  useEffect(() => {
    fetchDoctors();
    const token = getToken();
    const userId = localStorage.getItem("userId");
    // console.log("Token:", token);
    if (token) {
      const decodedToken = jwtDecode(token);
      // console.log("decodedToken",decodedToken);
      // setUserRole(decodedToken.role); // Setting user role based on token
      setUserRole(decodedToken.user.userType);
      setCurrentDoctorId(userId);
      console.log("This is current doctor id: ", userId);
      // const decodedToken_id = "66faef2467d2c448c05a29ef";
      if (userId) {
        fetchSpecialAllocations(userId);
      }
    }
    fetchDoctorFollowTypes();
    fetchPatients();
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

  const fetchSpecialAllocations = async (doctorId) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/assign/special/${doctorId}`
      );
      setSpecialAllocationPatients(response.data);
    } catch (error) {
      console.error("Error fetching special allocations:", error);
      setError("Failed to load special allocations");
    }
  };

  const fetchAppointmentCounts = async (classification = 'acute', newExisting = 'New') => {
  try {
    setCountsLoading(true);
    const response = await axios.patch(`${API_URL}/api/patient/sort-classification`, {
      classification: classification,
      newExisting: newExisting
    });

    if (response.data.success) {
      setAppointmentCounts(response.data.appointmentCounts);
    }
  } catch (error) {
    console.error('Error fetching appointment counts:', error);
  } finally {
    setCountsLoading(false);
  }
};

  const handleDoctorChange = async (patientId, doctorId) => {
    try {
      await axios.post(`${API_URL}/api/assign/allocations`, {
        allocations: [{ role: "patient", doctorId, patientId }],
      });
      // Refresh the patient list or update the local state
      fetchPatients();
    } catch (error) {
      console.error("Error updating doctor allocation:", error);
      setError("Failed to update doctor allocation. Please try again.");
    }
  };

  const fetchDoctorFollowTypes = async () => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error("No authorization token found");
      }

      const response = await axios.get(
        `${API_URL}/api/doctor/getDoctorFollow`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      let followTypesArray = response.data.follow.split(", ");

      // Handle Follow up-C expansion
      if (followTypesArray.includes("Follow up-C")) {
        const index = followTypesArray.indexOf("Follow up-C");
        followTypesArray.splice(
          index,
          1,
          "Follow up-C-New",
          "Follow up-C-Existing"
        );
      }

      if (userRole === "admin-doctor") {
        followTypesArray.push("View All");
      }

      setFollowTypes(followTypesArray);

      // ✅ Do not overwrite selectedFollowType if already set from URL or localStorage
      const savedFollow = localStorage.getItem(storageKey);
      const queryParams = new URLSearchParams(location.search);
      const followFromUrl = queryParams.get("follow");

      if (!followFromUrl && !savedFollow) {
        setSelectedFollowType(followTypesArray[0]);
        localStorage.setItem(storageKey, followTypesArray[0]);
      }
    } catch (error) {
      console.error(
        "Error fetching doctor follow-up types:",
        error.response ? error.response.data : error.message
      );
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      let url = `${API_URL}/api/doctor/getAllAppointmentsWithPatientData`;
      if (selectedFollowType === "View All") {
        url = `${API_URL}/api/log/list?appointmentFixed=Yes`;
      }
      const response = await axios.get(url);
      console.log(response.data);
      setPatients(response.data);
    } catch (error) {
      console.error(
        "Error fetching patients:",
        error.response ? error.response.data : error.message
      );
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [selectedFollowType]);

  useEffect(() => {
  fetchAppointmentCounts(activeTab, 'New');
}, [activeTab]);

const handleTabChange = (tab) => {
  setActiveTab(tab);
  fetchPatients();
};

  const filteredPatients = patients.filter((patient) => {
    const tabFilter = activeTab === 'acute' 
    ? patient.medicalDetails.classification === 'acute'
    : patient.medicalDetails.classification === 'chronic';
    if (selectedFollowType === "View All") {
      return patient.newExisting === "New";
    }

    const isMatchingFollowType =
      // (selectedFollowType === 'Follow up-C-New' && patient.follow === 'Follow up-C' && patient.newExisting === 'New') ||
      // (selectedFollowType === 'Follow up-C-Existing' && patient.follow === 'Follow up-C' && patient.newExisting === 'Existing') ||
      // (selectedFollowType !== 'Follow up-C-New' && selectedFollowType !== 'Follow up-C-Existing' && patient.follow === selectedFollowType);

      (selectedFollowType === "Follow up-Chronic-New" &&
        patient.medicalDetails.diseaseType.name === "Chronic" &&
        patient.medicalDetails.follow === "Follow up-C" &&
        patient.newExisting === "New") ||
      (selectedFollowType === "Follow up-Chronic-Existing" &&
        patient.medicalDetails.diseaseType.name === "Chronic" &&
        patient.medicalDetails.follow === "Follow up-C" &&
        patient.newExisting === "Existing") ||
      (selectedFollowType === "Follow up-Acute-New" &&
        patient.medicalDetails.diseaseType.name === "Acute" &&
        patient.medicalDetails.follow === "Follow up-C" &&
        patient.newExisting === "New") ||
      (selectedFollowType === "Follow up-Acute-Existing" &&
        patient.medicalDetails.diseaseType.name === "Acute" &&
        patient.medicalDetails.follow === "Follow up-C" &&
        patient.newExisting === "Existing") ||
      (selectedFollowType !== "Follow up-Chronic-New" &&
        selectedFollowType !== "Follow up-Chronic-Existing" &&
        selectedFollowType !== "Follow up-Acute-New" &&
        selectedFollowType !== "Follow up-Acute-Existing" &&
        patient.medicalDetails.follow === selectedFollowType);
    // console.log("Checking patient: ",patient);
    return (
      isMatchingFollowType &&
      patient.newExisting === "New" &&
      tabFilter &&
      (searchTerm === "" ||
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phone.includes(searchTerm))
    );
  });

  const navigate = useNavigate();
  const handleJoinRoom = (patient) => {
    const appointmentID = patient.medicalDetails._id;
    if (patient && patient.medicalDetails && patient.medicalDetails.meetLink) {
      navigate("/video-call", {
        state: { meetLink: patient.medicalDetails.meetLink, appointmentID },
      });
    } else {
      alert("No valid Zoom link found!");
    }
  };

  const isOneHourPassed = (followUpTimestamp) => {
    if (!followUpTimestamp) return true; // If no timestamp, enable the button

    const followTime = new Date(followUpTimestamp);
    const now = new Date();
    const timeDifference = now - followTime;

    return timeDifference >= 3600000; // 3600000 ms = 1 hour
  };

  // Helper function to get remaining time in a human-readable format
  const getRemainingTime = (followUpTimestamp) => {
    const followTime = new Date(followUpTimestamp);
    const now = new Date();
    const remainingMs = 3600000 - (now - followTime);

    if (remainingMs <= 0) return "0 minutes";

    const minutes = Math.floor(remainingMs / 60000);
    return `${minutes} minute${minutes !== 1 ? "s" : ""}`;
  };

  const getTableConfig = () => {
    const getActionButtons = (item) => {
      const isMshipTable = selectedFollowType === "Payment";
      const isVoiceCallDisabled =
        isMshipTable && !isOneHourPassed(item.followUpTimestamp);
      return [
        <div className="action-buttons" key="viewDraft">
          {renderButton("View draft", () => handleAction("ViewDraft", item))}
        </div>,
        <div className="action-buttons" key="videoCall">
          {renderButton("Make video call", () =>
            handleAction("VideoCall", item)
          )}
        </div>,
        <div className="action-buttons" key="voiceCall">
          {renderButton(
            "Make Voice Call",
            () => handleAction("VoiceCall", item),
            isVoiceCallDisabled
          )}
        </div>,
        <div className="action-buttons" key="recordings">
          {renderButton("Recordings", () => handleAction("Recordings", item))}
        </div>,
        <div className="action-buttons" key="markDone">
          {renderButton("Mark Done", () => handleAction("MarkDone", item))}
        </div>,
      ];
    };
    const doctorDropdown = (item) => (
      <select
        value={item.assignedDoctor || ""}
        onChange={(e) => handleDoctorChange(item._id, e.target.value)}
        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
      >
        <option value="">Select a doctor</option>
        {doctors.map((doctor) => (
          <option key={doctor._id} value={doctor._id}>
            {doctor.name}
          </option>
        ))}
      </select>
    );
    switch (selectedFollowType) {
      case "Consultation":
        return {
          head: [
            "S.no",
            "Omni channel",
            "Patient Type",
            "Who is the Consultation for",
            "Appointment Date",
            "Appointment Timing",
            "Name",
            "Phone Number",
            "Whatsapp Number",
            "Email",
            "Consulting For",
            "If diseaseType is not available",
            "Age",
            "Gender",
            "Current location",
            // 'Message sent',
            // 'Time stamp',
            "Acute/Chronic",
            "Follow",
            "Follow comment",
            "Out of network",
            "Patient profile",
            "Enquiry status",
            "App downloaded status",
            "Consultation payment",
            "Appointment fixed",
            "Medicine Payment confirmation",
            "Call attempted tracking",
            "Comments",
            "View Drafts",
            "Video Call",
            "Voice call",
            "Recordings",
            "Mark Done",
          ],
          data: filteredPatients.map((item, index) => [
            index + 1,
            item.patientEntry || "---",
            item.newExisting || "",
            item.medicalDetails.consultingFor || "",
            item.medicalDetails.appointmentDate.split("T")[0] || "",
            item.medicalDetails.timeSlot || "",
            item.name || "",
            item.phone || "",
            item.whatsappNumber || "",
            item.email || "",
            item.medicalDetails.diseaseName || "",
            item.medicalDetails.diseaseTypeAvailable ? "Yes" : "No",
            item.age || "",
            item.gender || "",
            item.currentLocation || "",
            // item.medicalDetails.messageSent.message || '---',
            // item.medicalDetails.messageSent.timeStamp || '---',
            item.medicalDetails.classification || "",
            item.medicalDetails.follow || "",
            item.medicalDetails.followComment || "",
            "--",
            item.patientProfile || "No",
            <select
            value={item.medicalDetails.enquiryStatus || ''}
            onChange={(e) => handleEnquiryStatusChange(item._id, e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 text-sm w-full max-w-xs"
          >
            <option value="">Select status</option>
            <option value="Interested">Interested</option>
            <option value="Not Interested">Not Interested</option>
            {/* <option value="Follow Up">Follow Up</option> */}
          </select>,
            item.appDownload != "0" ? "Yes" : "No",
            item.appointmentFixed || "",
            item.appointmentFixed || "",
            item.medicinePaymentConfirmation ? "Confirmed" : "Pending",
            // item.callStatus || '',
            // item.conversionStatus || '',
            item.medicalDetails.callCount || "0",
            // item.comments.text || '--',
            <CommentCell
              patient={item}
              API_URL={API_URL}
              onCommentAdded={(updatedPatient) => {
                setPatients((prevPatients) =>
                  prevPatients.map((p) =>
                    p._id === updatedPatient._id ? updatedPatient : p
                  )
                );
              }}
            />,
            <div className="action-buttons">
              {renderButton("View draft", () =>
                handleAction("ViewDraft", item)
              )}
            </div>,
            <div className="action-buttons">
              {renderButton("Make video call", () =>
                handleAction("VideoCall", item)
              )}
            </div>,
            <div className="action-buttons">
              {renderButton("Make Voice Call", () =>
                handleAction("VoiceCall", item)
              )}
            </div>,
            <div className="action-buttons">
              {renderButton("Recordings", () =>
                handleAction("Recordings", item)
              )}
            </div>,
            <div className="action-buttons">
              {renderButton("Mark Done", () => handleAction("MarkDone", item))}
            </div>,
          ]),
        };
      case "Prescription":
        return {
          head: [
            "S.no",
            "Who is the Consultation for",
            "Patient Type",
            "Name",
            "Phone Number",
            "Email",
            "Consulting For",
            "If diseaseType is not available",
            "Age",
            "Gender",
            "Acute/Chronic",
            "Follow",
            "Follow comment",
            "Enquiry Status",
            "Medicine Payment confirmation",
            // 'Conversion Status',
            "Call attempted tracking",
            "Comments",
            "View Drafts",
            "Attach prescription",
            "Voice call",
            "Recordings",
            "Mark Done",
          ],
          data: filteredPatients.map((item, index) => [
            index + 1,
            item.medicalDetails.consultingFor || "",
            item.name || "",
            item.newExisting || "",
            item.phone || "",
            item.email || "",
            item.medicalDetails.diseaseName || "",
            item.medicalDetails.diseaseName || "",
            // item.diseaseTypeAvailable ? 'Yes' ? <FaCheckCircle /> : <FaTimesCircle /> : 'No',
            item.age || "",
            item.gender || "",
            item.medicalDetails.classification  || "",
            item.follow || "",
            item.medicalDetails.followComment || "",
            <select
            value={item.medicalDetails.enquiryStatus || ''}
            onChange={(e) => handleEnquiryStatusChange(item._id, e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 text-sm w-full max-w-xs"
          >
            <option value="">Select status</option>
            <option value="Interested">Interested</option>
            <option value="Not Interested">Not Interested</option>
            {/* <option value="Follow Up">Follow Up</option> */}
          </select>,
            item.medicinePaymentConfirmation ? "Confirmed" : "Pending",
            // item.conversionStatus || '',
            item.medicalDetails.callCount || "",
            // '--',// item.comments.text || '--',
            <CommentCell
              patient={item}
              API_URL={API_URL}
              onCommentAdded={(updatedPatient) => {
                setPatients((prevPatients) =>
                  prevPatients.map((p) =>
                    p._id === updatedPatient._id ? updatedPatient : p
                  )
                );
              }}
            />,

            <div className="action-buttons">
              {renderButton("View draft", () =>
                handleAction("ViewDraft", item)
              )}
            </div>,
            <div className="action-buttons">
              {item.medicalDetails?.prescriptionCreated ? (
                <button className="btn btn-success" disabled>
                  Prescription written
                </button>
              ) : (
                renderButton("Attach prescription", () =>
                  handleAction("AttachPrescription", item)
                )
              )}
            </div>,
            <div className="action-buttons">
              {renderButton("Make Voice Call", () =>
                handleAction("VoiceCall", item)
              )}
            </div>,
            <div className="action-buttons">
              {renderButton("Recordings", () =>
                handleAction("Recordings", item)
              )}
            </div>,
            <div className="action-buttons">
              {renderButton("Mark Done", () => handleAction("MarkDone", item))}
            </div>,
          ]),
        };
      case "Medicine Preparation":
        return {
          head: [
            "S.no",
            "Who is the Consultation for",
            "Patient Type",
            "Name",
            "Phone Number",
            "Email",
            "Consulting For",
            "If diseaseType is not available",
            "Age",
            "Gender",
            "Acute/Chronic",
            "Follow",
            "Follow comment",
            "Enquiry Status",
            "Medicine Payment confirmation",
            "Call attempted tracking",
            "Comments",
            "View Drafts",
            "View prescription",
            "Prepare Medicine",
            "Voice call",
            "Recordings",
            "Mark Done",
          ],
          data: filteredPatients.map((item, index) => [
            index + 1,
            item.medicalDetails.consultingFor || "",
            item.name || "",
            item.newExisting || "",
            item.phone || "",
            item.email || "",
            item.medicalDetails.diseaseName || "",
            item.medicalDetails.diseaseTypeAvailable ? "Yes" : "No",
            item.age || "",
            item.gender || "",
            item.medicalDetails.classification  || "",
            item.medicalDetails.follow || "",
            item.medicalDetails.followComment || "",
            <select
            value={item.medicalDetails.enquiryStatus || ''}
            onChange={(e) => handleEnquiryStatusChange(item._id, e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 text-sm w-full max-w-xs"
          >
            <option value="">Select status</option>
            <option value="Interested">Interested</option>
            <option value="Not Interested">Not Interested</option>
            {/* <option value="Follow Up">Follow Up</option> */}
          </select>,
            item.medicinePaymentConfirmation ? "Confirmed" : "Pending",
            item.medicalDetails.callCount || "",
            // item.medicalDetails.comments.text || '',
            <CommentCell
              patient={item}
              API_URL={API_URL}
              onCommentAdded={(updatedPatient) => {
                setPatients((prevPatients) =>
                  prevPatients.map((p) =>
                    p._id === updatedPatient._id ? updatedPatient : p
                  )
                );
              }}
            />,
            <div className="action-buttons">
              {renderButton("View draft", () =>
                handleAction("ViewDraft", item)
              )}
            </div>,
            <div className="action-buttons">
              {renderButton("View prescription", () =>
                handleAction("ViewPrescription", item)
              )}
            </div>,
            <div className="action-buttons">
              {item.medicalDetails?.medicinePrepared ? (
                <button className="btn btn-success" disabled>
                  Medicine Prepared
                </button>
              ) : (
                renderButton("Prepare Medicine", () =>
                  handleAction("PrepareMedicine", item)
                )
              )}
            </div>,
            <div className="action-buttons">
              {renderButton("Make Voice Call", () =>
                handleAction("VoiceCall", item)
              )}
            </div>,
            <div className="action-buttons">
              {renderButton("Recordings", () =>
                handleAction("Recordings", item)
              )}
            </div>,
            <div className="action-buttons">
              {renderButton("Mark Done", () => handleAction("MarkDone", item))}
            </div>,
          ]),
        };
      case "Payment":
        return {
          head: [
            "S.no",
            "Who is the Consultation for",
            "Name",
            "Patient Type",
            "Phone Number",
            "Email",
            "Consulting For",
            "If diseaseType is not available",
            "Age",
            "Gender",
            "Acute/Chronic",
            "Follow",
            "Follow comment",
            "Enquiry Status",
            "Medicine Payment confirmation",
            "Call attempted tracking",
            "Comments",
            "View Prescription",
            "Voice call",
            "Recordings",
            "Mark Done",
          ],
          data: filteredPatients.map((item, index) => {
            return [
              index + 1,
              item.medicalDetails.consultingFor || "",
              item.name || "",
              item.newExisting || "",
              item.phone || "",
              item.email || "",
              item.medicalDetails.diseaseName || "",
              item.medicalDetails.diseaseTypeAvailable ? "Yes" : "No",
              item.age || "",
              item.gender || "",
              item.medicalDetails.classification  || "",
              item.medicalDetails.follow || "",
              item.medicalDetails.followComment || "",
              <select
            value={item.medicalDetails.enquiryStatus || ''}
            onChange={(e) => handleEnquiryStatusChange(item._id, e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 text-sm w-full max-w-xs"
          >
            <option value="">Select status</option>
            <option value="Interested">Interested</option>
            <option value="Not Interested">Not Interested</option>
            {/* <option value="Follow Up">Follow Up</option> */}
          </select>,
              item.medicinePaymentConfirmation ? "Confirmed" : "Pending",
              item.medicalDetails.callCount || "",
              <CommentCell
                key={`comment-${item._id}`}
                patient={item}
                API_URL={API_URL}
                onCommentAdded={(updatedPatient) => {
                  setPatients((prevPatients) =>
                    prevPatients.map((p) =>
                      p._id === updatedPatient._id ? updatedPatient : p
                    )
                  );
                }}
              />,
              <div
                key={`view-prescription-${item._id}`}
                className="action-buttons"
              >
                {renderButton("View Prescription", () =>
                  handleAction("ViewPrescription", item)
                )}
              </div>,
              <div key={`voice-call-${item._id}`} className="action-buttons">
                {renderButton("Make Voice Call", () =>
                  handleAction("VoiceCall", item)
                )}
              </div>,
              <div key={`recordings-${item._id}`} className="action-buttons">
                {renderButton("Recordings", () =>
                  handleAction("Recordings", item)
                )}
              </div>,
              <div key={`mark-done-${item._id}`} className="action-buttons">
                {renderButton("Mark Done", () =>
                  handleAction("MarkDone", item)
                )}
              </div>,
            ];
          }),
        };

      case "Shipment":
        return {
          head: [
            "S.no",
            "Who is the Consultation for",
            "Name",
            "Patient Type",
            "Phone Number",
            "Email",
            "Consulting For",
            "If diseaseType is not available",
            "Age",
            "Gender",
            "Acute/Chronic",
            "Follow",
            "Follow comment",
            "Enquiry Status",
            "Medicine Payment confirmation",
            "Call attempted tracking",
            "Comments",
            "View Prescription",
            "Voice call",
            "Recordings",
            "Mark As Lost",
            "Mark Done",
          ],
          data: filteredPatients.map((item, index) => {
            return [
              index + 1,
              item.medicalDetails.consultingFor || "",
              item.name || "",
              item.newExisting || "",
              item.phone || "",
              item.email || "",
              item.medicalDetails.diseaseName || "",
              item.medicalDetails.diseaseTypeAvailable ? "Yes" : "No",
              item.age || "",
              item.gender || "",
              item.medicalDetails.classification  || "",
              item.medicalDetails.follow || "",
              item.medicalDetails.followComment || "",
              <select
            value={item.medicalDetails.enquiryStatus || ''}
            onChange={(e) => handleEnquiryStatusChange(item._id, e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 text-sm w-full max-w-xs"
          >
            <option value="">Select status</option>
            <option value="Interested">Interested</option>
            <option value="Not Interested">Not Interested</option>
            {/* <option value="Follow Up">Follow Up</option> */}
          </select>,
              item.medicinePaymentConfirmation ? "Confirmed" : "Pending",
              item.medicalDetails.callCount || "",
              <CommentCell
                key={`comment-${item._id}`}
                patient={item}
                API_URL={API_URL}
                onCommentAdded={(updatedPatient) => {
                  setPatients((prevPatients) =>
                    prevPatients.map((p) =>
                      p._id === updatedPatient._id ? updatedPatient : p
                    )
                  );
                }}
              />,
              <div
                key={`view-prescription-${item._id}`}
                className="action-buttons"
              >
                {renderButton("View Prescription", () =>
                  handleAction("ViewPrescription", item)
                )}
              </div>,
              <div key={`voice-call-${item._id}`} className="action-buttons">
                {renderButton("Make Voice Call", () =>
                  handleAction("VoiceCall", item)
                )}
              </div>,
              <div key={`recordings-${item._id}`} className="action-buttons">
                {renderButton("Recordings", () =>
                  handleAction("Recordings", item)
                )}
              </div>,
              <div key={`mark-as-lost-${item._id}`} className="action-buttons">
              {renderButton("Mark As Lost", () =>
                handleAction("MarkAsLost", item)
              )}
            </div>,
              <div key={`mark-done-${item._id}`} className="action-buttons">
                {renderButton("Mark Done", () =>
                  handleAction("MarkDone", item)
                )}
              </div>,
            ];
          }),
        };

      case "Patient Care":
        return {
          head: [
            "S.no",
            "Who is the Consultation for",
            "Patient Type",
            "Name",
            "Phone Number",
            "Email",
            "Consulting For",
            "If diseaseType is not available",
            "Age",
            "Gender",
            "Acute/Chronic",
            "Follow",
            "Follow comment",
            "Enquiry Status",
            "Start Date for Prescription",
            "Comments",
            "Shipment Status",
            "View Prescription",
            "Voice call",
            "Recordings",
            "Mark Done",
          ],
          data: filteredPatients.map((item, index) => [
            index + 1,
            item.medicalDetails.consultingFor || "",
            item.newExisting || "",
            item.name || "",
            item.phone || "",
            item.email || "",
            item.medicalDetails.diseaseName || "",
            item.medicalDetails.diseaseTypeAvailable ? "Yes" : "No",
            item.age || "",
            item.gender || "",
            item.medicalDetails.classification  || "",
            item.medicalDetails.follow || "",
            item.medicalDetails.followComment || "",
            <select
            value={item.medicalDetails.enquiryStatus || ''}
            onChange={(e) => handleEnquiryStatusChange(item._id, e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 text-sm w-full max-w-xs"
          >
            <option value="">Select status</option>
            <option value="Interested">Interested</option>
            <option value="Not Interested">Not Interested</option>
            {/* <option value="Follow Up">Follow Up</option> */}
          </select>,

            // Start Date Input with API call
            <div
              key={`start-date-${item._id}`}
              style={{ display: "flex", gap: "8px", alignItems: "center" }}
            >
              <input
                id={`start-date-input-${item._id}`}
                type="date"
                defaultValue={item.prescriptionStartDate || ""}
                required
                style={{
                  padding: "4px 8px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                }}
              />
              <button
                onClick={async (event) => {
                  const input = document.getElementById(
                    `start-date-input-${item._id}`
                  );
                  const startDate = input?.value.trim();

                  if (!startDate) {
                    alert("Start Date is required.");
                    return;
                  }

                  // Check if shipment status is "Done" before allowing API call
                  const shipmentStatus = item.isProductReceived
                    ? "Done"
                    : "Pending";
                  if (shipmentStatus !== "Pending") {
                    alert(
                      'Cannot set start date. Shipment status must be "Done" first.'
                    );
                    return;
                  }

                  try {
                    // Show loading state
                    const button = event.target;
                    const originalText = button.textContent;
                    button.textContent = "Saving...";
                    button.disabled = true;

                    // Get the token from localStorage
                    const token =
                      localStorage.getItem("token") ||
                      localStorage.getItem("authToken") ||
                      sessionStorage.getItem("token");

                    if (!token) {
                      throw new Error(
                        "No authentication token found. Please login again."
                      );
                    }

                    // Use hardcoded prescription ID as requested
                    const prescriptionId = item.medicalDetails.prescription_id;

                    console.log("=== START DATE API CALL ===");
                    console.log("Patient ID:", item._id);
                    console.log("Prescription ID:", prescriptionId);
                    console.log("Start Date:", startDate);
                    console.log("Shipment Status:", shipmentStatus);
                    console.log("Token exists:", !!token);

                    // Construct the API URL
                    const apiUrl = `https://clinic-backend-jdob.onrender.com/api/doctor/prescriptions/${prescriptionId}/start`;
                    console.log("API URL:", apiUrl);

                    const response = await fetch(apiUrl, {
                      method: "PATCH",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                      },
                      body: JSON.stringify({
                        startDate: startDate,
                      }),
                    });

                    console.log("Response status:", response.status);
                    console.log("Response ok:", response.ok);

                    // Get response text first
                    const responseText = await response.text();
                    console.log("Raw response text:", responseText);

                    if (!response.ok) {
                      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

                      // Try to parse error response
                      try {
                        const errorData = JSON.parse(responseText);
                        errorMessage =
                          errorData.message || errorData.error || errorMessage;
                        console.log("Parsed error data:", errorData);
                      } catch (parseError) {
                        console.log(
                          "Could not parse error response as JSON:",
                          parseError
                        );
                        errorMessage = responseText || errorMessage;
                      }

                      throw new Error(errorMessage);
                    }

                    // Parse successful response
                    let data;
                    try {
                      data = JSON.parse(responseText);
                      console.log("Parsed success data:", data);
                    } catch (parseError) {
                      console.log(
                        "Could not parse success response as JSON:",
                        parseError
                      );
                      data = { message: "Success", raw: responseText };
                    }

                    console.log("Start Date saved successfully:", data);

                    // Update local state
                    setPatients((prevPatients) =>
                      prevPatients.map((p) =>
                        p._id === item._id
                          ? { ...p, prescriptionStartDate: startDate }
                          : p
                      )
                    );

                    alert("Start Date saved successfully!");

                    // Reset button
                    button.textContent = originalText;
                    button.disabled = false;
                  } catch (error) {
                    console.error("=== START DATE ERROR ===");
                    console.error("Error message:", error.message);
                    console.error("Error stack:", error.stack);

                    // Show detailed error to user
                    alert(
                      `Failed to save Start Date: ${error.message}\n\nCheck browser console for more details.`
                    );

                    // Reset button on error
                    const button = event.target;
                    if (button) {
                      button.textContent = "Save";
                      button.disabled = false;
                    }
                  }
                }}
                style={{
                  padding: "4px 12px",
                  cursor: "pointer",
                  backgroundColor: "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  fontSize: "12px",
                }}
              >
                Save
              </button>
            </div>,

            // Comment Cell
            <CommentCell
              key={`comment-${item._id}`}
              patient={item}
              API_URL={API_URL}
              onCommentAdded={(updatedPatient) => {
                setPatients((prevPatients) =>
                  prevPatients.map((p) =>
                    p._id === updatedPatient._id ? updatedPatient : p
                  )
                );
              }}
            />,

            // Shipment Status - Fetched from backend based on isProductReceived
            <div
              key={`shipment-status-${item._id}`}
              style={{ padding: "8px", textAlign: "center" }}
            >
              <span
                style={{
                  padding: "4px 8px",
                  backgroundColor: item.isProductReceived
                    ? "#28a745"
                    : "#ffc107",
                  color: item.isProductReceived ? "white" : "#212529",
                  borderRadius: "4px",
                  fontSize: "12px",
                  fontWeight: "bold",
                }}
              >
                {item.isProductReceived === false ? "Pending" : "Done"}
              </span>
            </div>,

            // Action buttons
            <div
              key={`view-prescription-${item._id}`}
              className="action-buttons"
            >
              {renderButton("View Prescription", () =>
                handleAction("ViewPrescription", item)
              )}
            </div>,
            <div key={`voice-call-${item._id}`} className="action-buttons">
              {renderButton("Make Voice Call", () =>
                handleAction("VoiceCall", item)
              )}
            </div>,
            <div key={`recordings-${item._id}`} className="action-buttons">
              {renderButton("Recordings", () =>
                handleAction("Recordings", item)
              )}
            </div>,
            <div key={`mark-done-${item._id}`} className="action-buttons">
              {renderButton("Mark Done", () => handleAction("MarkDone", item))}
            </div>,
          ]),
        };
      case "View All":
        return {
          head: [
            "S.no",
            "Omni channel",
            "Patient Type",
            "Who is the Consultation for",
            "Name",
            "Phone Number",
            "Whatsapp Number",
            "Email",
            "Consulting For",
            "If diseaseType is not available",
            "Age",
            "Gender",
            "Current location",
            // 'Message sent',
            // 'Time stamp',
            "Acute/Chronic",
            "Follow",
            "Follow comment",
            "Out of network",
            "Patient profile",
            "Enquiry status",
            "App downloaded status",
            "Consultation payment",
            "Appointment fixed",
            "Medicine Payment confirmation",
            "Call attempted tracking",
            "Comments",
            "View Allocations",
            "View Drafts",
            "Video Call",
            "Voice call",
            "Recordings",
            "Mark Done",
          ],
          data: filteredPatients.map((item, index) => [
            index + 1,
            item.patientEntry || "---",
            item.newExisting || "",
            item.medicalDetails.consultingFor || "",
            item.name || "",
            item.phone || "",
            item.whatsappNumber || "",
            item.email || "",
            item.medicalDetails.diseaseName || "",
            item.medicalDetails.diseaseTypeAvailable ? "Yes" : "No",
            item.age || "",
            item.gender || "",
            item.currentLocation || "",
            // item.medicalDetails.messageSent.message || '---',
            // item.medicalDetails.messageSent.timeStamp || '---',
            item.medicalDetails.diseaseType.name || "",
            item.medicalDetails.follow || "",
            item.medicalDetails.followComment || "",
            "--",
            item.patientProfile || "No",
            item.medicalDetails.enquiryStatus || "",
            item.appDownload != "0" ? "Yes" : "No",
            item.appointmentFixed || "",
            item.appointmentFixed || "",
            item.medicalDetails.medicalPayment ? "Confirmed" : "Pending",
            // item.callStatus || '',
            // item.conversionStatus || '',
            item.medicalDetails.callCount || "0",
            // item.medicalDetails.comments.text || '--',
            <CommentCell
              patient={item}
              API_URL={API_URL}
              onCommentAdded={(updatedPatient) => {
                setPatients((prevPatients) =>
                  prevPatients.map((p) =>
                    p._id === updatedPatient._id ? updatedPatient : p
                  )
                );
              }}
            />,
            doctorDropdown(item),
            <div className="action-buttons">
              {renderButton("View draft", () =>
                handleAction("ViewDraft", item)
              )}
            </div>,
            <div className="action-buttons">
              {renderButton("Make video call", () =>
                handleAction("VideoCall", item)
              )}
            </div>,
            <div className="action-buttons">
              {renderButton("Make Voice Call", () =>
                handleAction("VoiceCall", item)
              )}
            </div>,
            <div className="action-buttons">
              {renderButton("Recordings", () =>
                handleAction("Recordings", item)
              )}
            </div>,
            <div className="action-buttons">
              {renderButton("Mark Done", () => handleAction("MarkDone", item))}
            </div>,
          ]),
        };
      /*case "Special Allocation":
      return {
          head: [
            "S.no",
            "Omni channel",
            "Patient Type",
            "Who is the Consultation for",
            "Name",
            "Phone Number",
            "Whatsapp Number",
            "Email",
            "Consulting For",
            "If diseaseType is not available",
            "Age",
            "Gender",
            "Current location",
            // 'Message sent',
            // 'Time stamp',
            "Acute/Chronic",
            "Follow",
            "Follow comment",
            "Out of network",
            "Patient profile",
            "Enquiry status",
            "App downloaded status",
            "Consultation payment",
            "Appointment fixed",
            "Medicine Payment confirmation",
            "Call attempted tracking",
            "Comments",
            "View Drafts",
            "Video Call",
            "Voice call",
            "Recordings",
            "Mark Done",
          ],
          data:
            specialAllocationPatients.length > 0
              ? specialAllocationPatients.map((item, index) => [
                  index + 1,
                  item.patientEntry || "---",
                  item.newExisting || "",
                  item.medicalDetails.consultingFor || "",
                  item.name || "",
                  item.phone || "",
                  item.whatsappNumber || "",
                  item.email || "",
                  item.medicalDetails.diseaseName || "",
                  item.medicalDetails.diseaseTypeAvailable ? "Yes" : "No",
                  item.age || "",
                  item.gender || "",
                  item.currentLocation || "",
                  // item.medicalDetails.messageSent?.message || '---',
                  // item.medicalDetails.messageSent?.timeStamp || '---',
                  item.medicalDetails.diseaseType?.name || "",
                  item.medicalDetails.follow || "",
                  item.medicalDetails.followComment || "",
                  "--",
                  item.patientProfile || "No",
                  item.medicalDetails.enquiryStatus || "",
                  item.appDownload != "0" ? "Yes" : "No",
                  item.appointmentFixed || "",
                  item.appointmentFixed || "",
                  item.medicalDetails.medicalPayment ? "Confirmed" : "Pending",
                  item.medicalDetails.callCount || "0",
                  item.medicalDetails.comments?.text || "--",
                  <div className="action-buttons">
                    {renderButton("View draft", () =>
                      handleAction("ViewDraft", item)
                    )}
                  </div>,
                  <div className="action-buttons">
                    {renderButton("Make video call", () =>
                      handleAction("VideoCall", item)
                    )}
                  </div>,
                  <div className="action-buttons">
                    {renderButton("Make Voice Call", () =>
                      handleAction("VoiceCall", item)
                    )}
                  </div>,
                  <div className="action-buttons">
                    {renderButton("Recordings", () =>
                      handleAction("Recordings", item)
                    )}
                  </div>,
                  <div className="action-buttons">
                    {renderButton("Mark Done", () =>
                      handleAction("MarkDone", item)
                    )}
                  </div>,
                ])
              : [
                  [
                    <td colSpan="31" className="text-center py-4">
                      No special allocations found
                    </td>,
                  ],
                ],
        };   */
      default:
        return { head: [], data: [] };
    }
  };

  const renderButton = (text, onPress, disabled = false) => (
    <button
      onClick={disabled ? null : onPress}
      disabled={disabled}
      className={`inline-flex items-center px-2.5 py-1.5 border text-xs font-medium rounded-[5px] 
                  transition-all duration-300 ${
                    disabled
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "text-[#f5f5f5] bg-[#1a237e] hover:bg-[#534bae] border-transparent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#534bae]"
                  }`}
    >
      {text}
    </button>
  );

  const handleAction = async (action, item) => {
    const isMshipTable = selectedFollowType === "Payment";

    if (
      isMshipTable &&
      action === "VoiceCall" &&
      !isOneHourPassed(item.followUpTimestamp)
    ) {
      const remainingTime = getRemainingTime(item.followUpTimestamp);
      alert(`Voice call will be available in ${remainingTime}`);
      return;
    }
    switch (action) {
      case "ViewDraft":
        // alert(`Viewing draft for ${item.name}`);
        setSelectedPatient(item);
        setIsDraftModalOpen(true);
        break;
      case "VideoCall":
        alert(`Starting video call with ${item.name}`);
        handleJoinRoom(item);
        break;
        case "VoiceCall":
    alert(`Calling ${item.phone}`);
    const token = localStorage.getItem("token");
    fetch(`${API_URL}/api/doctor/${item._id}/increment-call`, {
        method: "PATCH",
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Failed to increment call");
        }
        // Optionally handle success
    })
    .catch(error => {
        console.error(error);
        // Optionally handle error
    });
    break;

      case "Recordings":
        alert(`Viewing recordings for ${item.name}`);
        break;
      case "AttachPrescription":
        navigate("/prescription-writing", {
          state: {
            patientData: item,
          },
        });
        break;
        case "ViewPrescription":
  const prescriptionId = item.medicalDetails.prescription_id;
  if (prescriptionId) {
    navigate(`/view-prescription/${prescriptionId}`);
  } else {
    alert("Prescription ID not found for this patient");
  }
  break;
      case "PrepareMedicine":
        const appointment_Id = item.medicalDetails._id;
        navigate(`/prepare-medicine/${appointment_Id}`);
        break;
        case "MarkAsLost":
  try {
    const prescriptionId = item.medicalDetails.prescription_id;
    
    if (!prescriptionId) {
      alert("Prescription ID not found for this patient");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Authentication token not found. Please login again.");
      return;
    }

    const response = await axios.patch(
      `${API_URL}/api/doctor/${prescriptionId}/mark-lost`,
      { shipmentLost: true },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      }
    );

    if (response.status === 200) {
      alert(`Shipment marked as lost for ${item.name}`);
      fetchPatients(); // Refresh the patient list
    }
  } catch (error) {
    console.error("Error marking shipment as lost:", error);
    alert(`Failed to mark shipment as lost: ${error.response?.data?.message || error.message}`);
  }
  break;
      case "MarkDone":
        try {
          const response = await axios.put(
            `${API_URL}/api/patient/updateFollowUp/${item.medicalDetails._id}`
          );
          alert("Follow-up status updated for " + item.name);
          fetchPatients();
        } catch (error) {
          console.error("Error updating follow-up status:", error);
          alert("Failed to update follow-up status");
        }
        break;
      default:
        break;
    }
  };

  if (isLoading) {
    return (
      <div className="loading-indicator">
        <IoIosHourglass size={48} color="#FF5722" />
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-indicator">
        <IoIosWarning size={48} color="#FF5722" />
        <p>Something went wrong: {error}</p>
      </div>
    );
  }

  const tableConfig = getTableConfig();

  return (
    
    <div className="w-full px-2 py-4">
      <h2 className="text-2xl font-bold text-black-500 pb-2">Patients List</h2>
      {/* Tabs Section */}
<div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
  {/* Left: Tabs */}
  <div className="flex gap-2">
    <button 
      onClick={() => handleTabChange('acute')}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
        activeTab === 'acute' 
          ? 'bg-blue-50 text-blue-600 border-blue-200' 
          : 'bg-gray-50 text-gray-600 border-gray-200'
      }`}
    >
      <div className={`w-2 h-2 rounded-full ${
        activeTab === 'acute' ? 'bg-blue-600' : 'bg-gray-400'
      }`}></div>
      Acute ({statistics?.newAppointments?.acute ?? 0})
    </button>
    <button 
      onClick={() => handleTabChange('chronic')}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
        activeTab === 'chronic' 
          ? 'bg-blue-50 text-blue-600 border-blue-200' 
          : 'bg-gray-50 text-gray-600 border-gray-200'
      }`}
    >
      <div className={`w-2 h-2 rounded-full ${
        activeTab === 'chronic' ? 'bg-blue-600' : 'bg-gray-400'
      }`}></div>
      Chronic ({statistics?.newAppointments?.chronic ?? 0})
    </button>
  </div>

  {/* Right: Search + Dropdown */}
  <div className="flex flex-col md:flex-row items-center gap-4">
    {/* Search */}
    <div className="relative w-72">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <IoIosSearch className="h-5 w-5 text-gray-500" />
      </div>
      <input
        type="text"
        placeholder="Search by name or phone number..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>

    {/* Dropdown */}
    <select
      value={selectedFollowType}
      onChange={handleFollowChange}
      className="border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-700 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
    >
      {followTypes.map((type) => (
        <option key={type} value={type}>
          {type}
        </option>
      ))}
    </select>
  </div>
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

{/* Tabs */}
  <TabSwitcher />
  
      <div className="w-full overflow-x-auto">
        <table className="w-full overflow-hidden rounded-lg">
          <thead>
            <tr className="border-b border-blue-200">
              {tableConfig.head.map((header, index) => (
                <th
                  key={header}
                  className={`text-center p-4 font-bold text-gray-700 text-sm ${
                    index % 2 === 0 ? "bg-gray-100" : "bg-white"
                  }`}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableConfig.data.length > 0 ? (
              tableConfig.data.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-b border-blue-200">
                  {row.map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      className={`p-4 text-center text-sm ${
                        cellIndex % 2 === 0
                          ? "bg-gray-100 text-gray-900 font-medium"
                          : "bg-white text-gray-600"
                      }`}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={tableConfig.head.length}
                  className="bg-white text-center text-gray-500 py-6"
                >
                  No patients found matching your criteria
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <DraftViewModal
        isOpen={isDraftModalOpen}
        onClose={() => setIsDraftModalOpen(false)}
        patientData={selectedPatient}
      />
      {showModal && modalContent}
    </div>
  );
};

export default WorkTable;
