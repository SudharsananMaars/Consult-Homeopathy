import React, { useState, useEffect } from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import dayjs from 'dayjs';
import calendar from '/src/assets/images/patient images/calender.png';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';  // Import axios for API requests
import config from '../../config';
const API_URL = config.API_URL;

const NewAppointment = () => {
  const [startDate, setStartDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [dateError, setDateError] = useState('');
  const [timeError, setTimeError] = useState('');
  const [isPopupOpen, setIsPopupOpen] = useState(false); // Control popup visibility
  const [errorMessage, setErrorMessage] = useState(''); // Error state for API response
  const [successMessage, setSuccessMessage] = useState(''); // Success state for API response
  const [isBooking, setIsBooking] = useState(false); // Button state to avoid duplicate booking
  const [availableSlots, setAvailableSlots] = useState([]); // Store available time slots
  const navigate = useNavigate(); // Use for redirection

  // Dynamically set min and max dates based on the current date
  const today = dayjs();
  const minDate = today; // Today as the minimum date
  const maxDate = today.add(1, 'month'); // 1 month from today

  // Fetch available time slots for the selected date
  useEffect(() => {
    const fetchAvailableSlots = async () => {
      if (startDate) {
        try {
          const token = localStorage.getItem('accessToken');
          const appointmentDate = dayjs(startDate).format('YYYY-MM-DD');
    
          // Using the native fetch API
          const response = await fetch(`${API_URL}/api/patient/checkSlots`, {
            method: 'POST', // Specify the request method
            headers: {
              Authorization: `Bearer ${token}`, // Authorization header
              'Content-Type': 'application/json', // Specify content type
            },
            body: JSON.stringify({ appointmentDate }), // Send appointmentDate in the body
          });
    
          // Check if the response is successful
          if (!response.ok) {
            throw new Error('Failed to fetch available slots');
          }
    
          const data = await response.json(); // Parse the response data as JSON
          setAvailableSlots(data.availableSlots); // Assuming API returns available slots
        } catch (error) {
          console.error('Error fetching available slots:', error);
        }
      }
    };
    
    fetchAvailableSlots();
  }, [startDate]);

  const handleBookClick = () => {
    let hasError = false;

    if (!startDate) {
      setDateError('Please select a date.');
      hasError = true;
    } else {
      setDateError('');
    }

    if (!selectedTime) {
      setTimeError('Please select a time slot.');
      hasError = true;
    } else {
      setTimeError('');
    }

    if (!hasError) {
      setIsPopupOpen(true);
    }
  };

  const handleConfirmClick = async () => {
    setErrorMessage('');
    setSuccessMessage('');
    setIsBooking(true); // Disable button while booking is in progress
    try {
      const appointmentDate = dayjs(startDate).format('YYYY-MM-DD'); // Format the date for backend
      const timeSlot = selectedTime;
      const token = localStorage.getItem('accessToken');

      // Make the API request to book the appointment
      const response = await axios.post(
        `${API_URL}/api/patient/bookAppointment`,  // Adjust API endpoint as necessary
        { appointmentDate, timeSlot },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include token in Authorization header
          },
        }
      );

      // If the booking is successful, redirect to the payment page or show success message
      setSuccessMessage(response.data.message);
      setIsPopupOpen(false); // Close the popup on success
      navigate('/razor'); // Redirect to the payment page after booking
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || 'An error occurred while booking'
      );
    } finally {
      setIsBooking(false); // Enable the confirm button after request completes
    }
  };

  const handleCancelClick = () => {
    // Close the popup and clear states
    setIsPopupOpen(false);
    setErrorMessage('');
    setSuccessMessage('');
  };

  return (
    <div className="flex flex-col lg:flex-row items-center justify-center">
      {/* Calendar Image */}
      <div className="sm:w-1/2 mt-0">
        <img src={calendar} alt="Calendar" className="w-auto h-auto lg:mx-0" />
      </div>
      {/* Calendar and Time Slots Container */}
      <div className="p-3 bg-white sm:w-1/ rounded-lg shadow-lg">
        {/* Calendar */}
        <div className="mb-6 border-2">
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateCalendar
              value={startDate}
              onChange={(date) => setStartDate(date)}
              minDate={minDate}
              maxDate={maxDate}
            />
          </LocalizationProvider>
        </div>

        {/* Time Slots */}
        <div className="p-4">
          <label className="text-md font-semibold text-gray-900 mb-2 block">
            Pick Your Time
          </label>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'].map((time) => (
              <div key={time}>
                <input
                  type="radio"
                  id={time}
                  name="timetable"
                  className="sr-only peer"
                  value={time}
                  checked={selectedTime === time}
                  onChange={() => setSelectedTime(time)}
                  disabled={!availableSlots.includes(time)} // Disable unavailable slots
                />
                <label
                  htmlFor={time}
                  className={`block p-4 text-center border-2 rounded-lg cursor-pointer transition-colors ${
                    selectedTime === time
                      ? 'bg-blue-300 border-blue-500 text-white'
                      : availableSlots.includes(time)
                      ? 'bg-white border-gray-400 hover:bg-blue-100'
                      : 'bg-gray-200 cursor-not-allowed'
                  }`}
                >
                  {time}
                </label>
              </div>
            ))}
          </div>

          {dateError && <p className="text-red-500 text-sm mt-2">{dateError}</p>}
          {timeError && <p className="text-red-500 text-sm mt-2">{timeError}</p>}

          {/* Booking Buttons */}
          <div className="mt-6 flex space-x-4 justify-center">
            <button
              type="button"
              onClick={handleBookClick}
              className="text-white bg-blue-700 hover:bg-blue-800 px-5 py-2.5 rounded-lg sm:w-1/3 sm:h-1/3"
            >
              Book
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Popup */}
      {isPopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg sm:w-1/4 sm:h-1/4">
            <h2 className="text-lg font-bold mb-4">Confirm Your Booking</h2>
            <p className="mb-4">
              Please Confirm your appointment on <br />{' '}
              {startDate ? startDate.format('DD-MM-YYYY') : ''} at {selectedTime}
            </p>

            <div className="flex space-x-4 justify-center">
              <button
                onClick={handleConfirmClick}
                className="text-white bg-green-600 hover:bg-green-700 px-5 py-2.5 rounded-lg"
                disabled={isBooking} // Disable the confirm button while booking is in progress
              >
                {isBooking ? 'Booking...' : 'Confirm'}
              </button>
              <button
                onClick={handleCancelClick}
                className="text-white bg-red-500 border hover:bg-red-600 px-5 py-2.5 rounded-lg"
              >
                Cancel
              </button>
            </div>

            {/* Display error message */}
            {errorMessage && <p className="text-red-500 mt-4">{errorMessage}</p>}
            {/* Display success message */}
            {successMessage && <p className="text-green-500 mt-4">{successMessage}</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default NewAppointment;
