import { useEffect, useState } from "react";
import Layout from "../../components/patient components/Layout";
import axios from "axios";
import {
  FaUserMd,
  FaCalendarAlt,
  FaClock,
  FaMoneyBillWave,
  FaTimes,
} from "react-icons/fa";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import dayjs from "dayjs";
import config from "../../config";


const API_URL = config.API_URL;

const AppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  
  // Reschedule popup states
  const [isReschedulePopupOpen, setIsReschedulePopupOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [rescheduleError, setRescheduleError] = useState("");
  const [isRescheduling, setIsRescheduling] = useState(false);

  // Date constraints
  const today = dayjs();
  const minDate = today;
  const maxDate = today.add(1, "month");

  const fetchAppointments = async (page = 1) => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/patient/?page=${page}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setAppointments(res.data.data);
      setCurrentPage(res.data.currentPage);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error("Failed to fetch appointments:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch time slots when date changes
  const fetchTimeSlots = async (selectedDate) => {
    if (selectedDate) {
      setIsLoadingSlots(true);
      const token = localStorage.getItem("token");
      const formattedDate = dayjs(selectedDate).format("YYYY-MM-DD");
      
      try {
        const res = await axios.post(
          `${API_URL}/api/patient/appointmentBookingTimeSlot`,
          { date: formattedDate }, 
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        
        setTimeSlots(res.data.result || []);
        setSelectedTimeSlot(null);
        setRescheduleError("");
        
      } catch (err) {
        console.error("Error fetching time slots:", err);
        setRescheduleError("Failed to load available time slots");
        setTimeSlots([]);
      } finally {
        setIsLoadingSlots(false);
      }
    } else {
      setTimeSlots([]);
    }
  };

  useEffect(() => {
    fetchAppointments(currentPage);
  }, [currentPage]);

  // Fetch time slots when reschedule date changes
  useEffect(() => {
    if (rescheduleDate) {
      fetchTimeSlots(rescheduleDate);
    }
  }, [rescheduleDate]);

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const getStatusBadge = (status) => {
    const base = "px-3 py-1 rounded-full text-sm font-medium";
    switch (status) {
      case "confirmed":
        return `${base} bg-green-100 text-green-700`;
      case "reserved":
        return `${base} bg-yellow-100 text-yellow-700`;
      case "cancelled":
        return `${base} bg-red-100 text-red-700`;
      case "completed":
        return `${base} bg-blue-100 text-blue-700`;
      default:
        return `${base} bg-gray-100 text-gray-700`;
    }
  };

  const handleRescheduleClick = (appointment) => {
    setSelectedAppointment(appointment);
    setIsReschedulePopupOpen(true);
    setRescheduleDate(null);
    setTimeSlots([]);
    setSelectedTimeSlot(null);
    setRescheduleError("");
  };

  const handleReschedulePopupClose = () => {
    setIsReschedulePopupOpen(false);
    setSelectedAppointment(null);
    setRescheduleDate(null);
    setTimeSlots([]);
    setSelectedTimeSlot(null);
    setRescheduleError("");
  };

  const handleRescheduleConfirm = async () => {
  if (!rescheduleDate || !selectedTimeSlot) {
    setRescheduleError("Please select both date and time slot");
    return;
  }
  
  setIsRescheduling(true);
  setRescheduleError("");
  
  try {
    const response = await axios.patch(
      `${API_URL}/api/patient/${selectedAppointment._id}/reschedule`,
      {
        appointmentDate: dayjs(rescheduleDate).format("YYYY-MM-DD"),
        timeSlot: selectedTimeSlot
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      }
    );
    
    // Refresh appointments after successful reschedule
    await fetchAppointments(currentPage);
    handleReschedulePopupClose();
    
  } catch (error) {
    console.error("Error rescheduling appointment:", error);
    setRescheduleError("Failed to reschedule appointment. Please try again.");
  } finally {
    setIsRescheduling(false);
  }
};

  const canReschedule = (appointment) => {
    // Only allow rescheduling for confirmed appointments
    return appointment.status === "confirmed";
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto mt-10 px-4">
        <h1 className="text-3xl font-semibold text-gray-800 mb-8 text-center">
          My Appointments
        </h1>

        {loading ? (
          <div className="text-center text-gray-500">
            Loading appointments...
          </div>
        ) : appointments.length === 0 ? (
          <p className="text-center text-gray-500">No appointments found.</p>
        ) : (
          <>
            <div className="grid gap-6">
              {appointments.map((appt) => (
                <div
                  key={appt._id}
                  className="bg-white rounded-2xl shadow-md border border-gray-200 p-6"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h2 className="text-xl font-bold text-black-600">
                      {appt.doctor?.name || "Dr. Unassigned"}
                    </h2>
                    <span className={getStatusBadge(appt.status)}>
                      {appt.status}
                    </span>
                  </div>

                  <div className="text-gray-700 space-y-2">
                   <div className="flex items-center gap-2">
  <FaCalendarAlt className="text-blue-500" />
  <span>
    {new Date(appt.appointmentDate).toLocaleDateString()} • {appt.timeSlot}
  </span>
</div>

                    {appt.diseaseName && (
                      <div className="text-sm text-gray-500">
                        Reason:{" "}
                        <span className="font-medium">{appt.diseaseName}</span>
                      </div>
                    )}
                    
                    <div className="flex gap-3 mt-3">
                      {appt.meetLink && (
                        <div>
                          {(() => {
                            const slotTime = appt.timeSlot || "00:00";
                            const [hours, minutes] = slotTime
                              .split(":")
                              .map(Number);

                            const appointmentDateTime = new Date(
                              appt.appointmentDate
                            );
                            appointmentDateTime.setHours(hours);
                            appointmentDateTime.setMinutes(minutes);
                            appointmentDateTime.setSeconds(0);
                            appointmentDateTime.setMilliseconds(0);

                            const now = new Date();
                            const fifteenMinutesBefore = new Date(
                              appointmentDateTime.getTime() - 15 * 60 * 1000
                            );
                            const thirtyMinutesAfter = new Date(
                              appointmentDateTime.getTime() + 30 * 60 * 1000
                            );

                            const isLive =
                              now >= fifteenMinutesBefore &&
                              now <= thirtyMinutesAfter;

                            return isLive ? (
                              <a
                                href={appt.meetLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
                              >
                                Join Video Call
                              </a>
                            ) : (
                              <button
                                disabled
                                className="inline-block px-4 py-2 bg-gray-300 text-gray-600 rounded-md text-sm cursor-not-allowed"
                                title="Link active 15 min before to 30 min after the slot"
                              >
                                Join Unavailable
                              </button>
                            );
                          })()}
                        </div>
                      )}

                      {canReschedule(appt) && (
                        <button
                          onClick={() => handleRescheduleClick(appt)}
                          className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 text-sm"
                        >
                          Reschedule
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center items-center gap-4 mt-10">
              <button
                onClick={handlePrev}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </>
        )}

        {/* Reschedule Popup */}
        {isReschedulePopupOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-800">
                    Reschedule Appointment
                  </h2>
                  <button
                    onClick={handleReschedulePopupClose}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <FaTimes size={20} />
                  </button>
                </div>

                {/* Current appointment info */}
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <h3 className="font-semibold text-gray-700 mb-2">Current Appointment:</h3>
                  <p className="text-sm text-gray-600">
                    {selectedAppointment && (
                      <>
                        <span className="font-medium">Date:</span>{" "}
                        {new Date(selectedAppointment.appointmentDate).toLocaleDateString()}
                        <br />
                        <span className="font-medium">Time:</span> {selectedAppointment.timeSlot}
                        <br />
                        <span className="font-medium">Doctor:</span>{" "}
                        {selectedAppointment.doctor?.name || "Dr. Unassigned"}
                      </>
                    )}
                  </p>
                </div>

                {/* Date Picker */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-700 mb-3">Select New Date:</h3>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DateCalendar
                      value={rescheduleDate}
                      onChange={setRescheduleDate}
                      minDate={minDate}
                      maxDate={maxDate}
                      sx={{
                        width: '100%',
                        '& .MuiPickersCalendarHeader-root': {
                          paddingLeft: 1,
                          paddingRight: 1,
                        },
                      }}
                    />
                  </LocalizationProvider>
                </div>

                {/* Time Slots */}
                {rescheduleDate && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-700 mb-3">Select New Time:</h3>
                    {isLoadingSlots ? (
                      <p className="text-gray-500 text-sm">Loading available slots...</p>
                    ) : timeSlots.length === 0 ? (
                      <p className="text-gray-500 text-sm">No slots available for this date</p>
                    ) : (
                      <div className="grid grid-cols-3 gap-2">
                        {timeSlots.map((time) => (
                          <button
                            key={time}
                            onClick={() => setSelectedTimeSlot(time)}
                            className={`p-2 rounded border text-sm transition ${
                              selectedTimeSlot === time
                                ? "bg-blue-500 text-white border-blue-500"
                                : "bg-white hover:bg-blue-50 border-gray-300"
                            }`}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Error message */}
                {rescheduleError && (
                  <p className="text-red-500 text-sm mb-4">{rescheduleError}</p>
                )}

                {/* Action buttons */}
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={handleReschedulePopupClose}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRescheduleConfirm}
                    disabled={!rescheduleDate || !selectedTimeSlot || isRescheduling}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isRescheduling ? "Rescheduling..." : "Confirm Reschedule"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AppointmentsPage;