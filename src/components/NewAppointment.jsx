import React, { useState } from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import dayjs from 'dayjs';
import calendar from '../assets/images/calender.png';
import { useNavigate } from 'react-router-dom';

const NewAppointment = () => {
  const [startDate, setStartDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [dateError, setDateError] = useState('');
  const [timeError, setTimeError] = useState('');
  const [isPopupOpen, setIsPopupOpen] = useState(false); // Control popup visibility
  const navigate = useNavigate(); // Use for redirection

  // Dynamically set min and max dates based on the current date
  const today = dayjs();
  const minDate = today; // Today as the minimum date
  const maxDate = today.add(1, 'month'); // 1 month from today

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
  const handleConfirmClick = () => {
    // Redirect to the payments page on confirm
    navigate('/paymentpage'); 
  };

  const handleCancelClick = () => {
    // Refresh the page when cancel is clicked
    window.location.reload();
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
            {['10:00 AM', '10:45 AM', '11:30 AM', '12:15 PM', '1:00 PM', '1:45 PM', '2:30 PM', '3:15 PM', '4:00 PM'].map((time) => (
              <div key={time}>
                <input
                  type="radio"
                  id={time}
                  name="timetable"
                  className="hidden peer"
                  value={time}
                  checked={selectedTime === time}
                  onChange={() => setSelectedTime(time)}
                />
                <label
                  htmlFor={time}
                  className={`block p-4 text-center bg-white border-2 border-gray-400 rounded-lg cursor-pointer ${
                    selectedTime === time ? 'bg-blue-300' : 'hover:bg-blue-200'
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
    
      {isPopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg  sm:w-1/4 sm:h-1/4">
            <h2 className="text-lg font-bold mb-4">Confirm Your Booking</h2>
            <p className="mb-4">
              Please Confirm your appointment on <br/> {startDate ? startDate.format('DD-MM-YYYY') : ''} at {selectedTime}
            </p>
              
            <div className="flex space-x-4 justify-center">
              <button  
                onClick={handleConfirmClick}
                className="text-white bg-green-600 hover:bg-green-700 px-5 py-2.5 rounded-lg"
              >
                Confirm

              </button>
              <button
                onClick={handleCancelClick}
                className="text-white bg-red-500 border  hover:bg-red-600 px-5 py-2.5 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewAppointment;
