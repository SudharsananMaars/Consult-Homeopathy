import React, { useState } from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from 'react-router-dom';
import Pay from "/Pay";

const NewAppointment = () => {
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const navigate =useNavigate();

    const today = new Date();
    const oneMonthLater = new Date();
    oneMonthLater.setMonth(today.getMonth() + 1);

    const toggleModal = () => {
        setIsModalOpen(!isModalOpen);
        setErrorMessage(""); // Reset error message when opening modal
    };

    const handleBooking = () => {
        if (!selectedDate || !selectedTime) {
            setErrorMessage("Please select both Date and Time");
            return;
        }
        setIsModalOpen(false);  // Close the initial modal
        setIsConfirmModalOpen(true);  // Open the confirmation modal
    };

    const confirmBooking = () => {
        // Handle the booking confirmation logic here
        setIsConfirmModalOpen(false); // Close the confirmation modal after confirming
        navigate('/appointments/newappointment/pay');
    };

    const cancelBooking = () => {
        setIsConfirmModalOpen(false); // Close the confirmation modal
        setIsModalOpen(true); // Reopen the initial modal if booking is cancelled
    };

    const handleDateChange = (date) => {
        setSelectedDate(date);
        if (date && selectedTime) {
            setErrorMessage(""); // Clear error message when both date and time are selected
        }
    };

    const handleTimeChange = (event) => {
        setSelectedTime(event.target.value);
        if (selectedDate && event.target.value) {
            setErrorMessage(""); // Clear error message when both date and time are selected
        }
    };

    return (
        <div className="flex justify-center pt-5">
            <button 
                type="button"
                onClick={toggleModal}
                className="text-gray-600 bg-blue-300 hover:bg-blue-400 border border-gray-200 focus:ring-4 focus:outline-none focus:ring-gray-100 font-medium rounded-lg text-md px-6 py-2 text-center inline-flex items-center dark:focus:ring-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700"
            >
              <svg
                  className="w-5 h-5 me-1 pr-1"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  width={24}
                  height={24}
                  fill="currentColor"
                  viewBox="0 0 24 24"
              >
                  <path
                      fillRule="evenodd"
                      d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm11-4a1 1 0 1 0-2 0v4a1 1 0 0 0 .293.707l3 3a1 1 0 0 0 1.414-1.414L13 11.586V8Z"
                      clipRule="evenodd"
                  />
              </svg>
             Schedule Appointment
            </button>

                {isModalOpen && (
                    <div
                        id="timepicker-modal"
                        tabIndex={-1}
                        aria-hidden="true"
                        className="fixed inset-0 z-50 flex justify-center items-center w-full h-full bg-black bg-opacity-50"
                    >
                        <div className="relative p-6 pr-6 w-full max-w-3xl max-h-full">
                            <div className="relative bg-white rounded-lg shadow dark:bg-gray-800">
                                <div className="p-4" >
                                <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white justify-items-center text-center">
            Schedule an Appointment
        </h3>
        
        <button
            type="button"
            onClick={toggleModal}
            className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm h-8 w-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
        >
            <svg
                className="w-3 h-3"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 14 14"
            >
                <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                />
            </svg>
            <span className="sr-only">Close modal</span>
        </button>
    </div>

            
                    
                                    
                                    <div className="flex flex-col lg:flex-row justify-between items-center gap-10 pl-4">
                                        <DatePicker
                                            selected={selectedDate}
                                            onChange={handleDateChange}
                                            dateFormat="dd/MM/yyyy"
                                            minDate={today}
                                            maxDate={oneMonthLater}
                                            placeholderText="Select a date"
                                            inline
                                            className="shadow-none bg-gray-50 w-full lg:w-1/2"
                                        />
                                        
                                        <div className="w-full lg:w-1/2 pr-4 mr-6">
                                            <label className="text-md font-medium text-gray-900 dark:text-white mb-2 mr-2 block">
                                                Pick your time
                                            </label>
                                            
                                            <ul 
                                            id="timetable"
                                            className="grid w-full grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4 mr-4">
  <li className="inline-flex items-center">
    <input
        type="radio"
        id="10-am"
        value="10:00 AM"
        className="hidden peer"
        name="timetable"
        onChange={handleTimeChange}
        checked={selectedTime === '10:00 AM'}
    />
    <label
        htmlFor="10-am"
        className="inline-flex items-center justify-center px-4 py-2 text-sm lg:text-base font-medium text-center whitespace-nowrap bg-white hover:bg-blue-300 dark:bg-gray-800 border rounded-lg cursor-pointer text-gray-500 border-gray-200 dark:border-gray-700 peer-checked:bg-blue-400 peer-checked:text-white dark:peer-checked:bg-blue-900 dark:peer-checked:text-white"
    >
        10:00 AM
    </label>
</li>
<li className="inline-flex items-center">
    <input
        type="radio"
        id="10-45-am"
        value="10:45 AM"
        className="hidden peer"
        name="timetable"
        onChange={handleTimeChange}
        checked={selectedTime === '10:45 AM'}
    />
    <label
        htmlFor="10-45-am"
        className="inline-flex items-center justify-center px-4 py-2 text-sm lg:text-base font-medium text-center whitespace-nowrap bg-white hover:bg-blue-300 dark:bg-gray-800 border rounded-lg cursor-pointer text-gray-500 border-gray-200 dark:border-gray-700 peer-checked:bg-blue-400 peer-checked:text-white dark:peer-checked:bg-blue-900 dark:peer-checked:text-white"
    >
        10:45 AM
    </label>
</li>

<li className="inline-flex items-center">
    <input
        type="radio"
        id="11-30-am"
        value="11:30 AM"
        className="hidden peer"
        name="timetable"
        onChange={handleTimeChange}
        checked={selectedTime === '11:30 AM'}
    />
    <label
        htmlFor="11-30-am"
        className="inline-flex items-center justify-center px-4 py-2 text-sm lg:text-base font-medium text-center whitespace-nowrap bg-white hover:bg-blue-300 dark:bg-gray-800 border rounded-lg cursor-pointer text-gray-500 border-gray-200 dark:border-gray-700 peer-checked:bg-blue-400 peer-checked:text-white dark:peer-checked:bg-blue-900 dark:peer-checked:text-white"
    >
        11:30 AM
    </label>
</li>

<li className="inline-flex items-center">
    <input
        type="radio"
        id="12-15-pm"
        value="12:15 PM"
        className="hidden peer"
        name="timetable"
        onChange={handleTimeChange}
        checked={selectedTime === '12:15 PM'}
    />
    <label
        htmlFor="12-15-pm"
        className="inline-flex items-center justify-center px-4 py-2 text-sm lg:text-base font-medium text-center whitespace-nowrap bg-white hover:bg-blue-300 dark:bg-gray-800 border rounded-lg cursor-pointer text-gray-500 border-gray-200 dark:border-gray-700 peer-checked:bg-blue-400 peer-checked:text-white dark:peer-checked:bg-blue-900 dark:peer-checked:text-white"
    >
        12:15 PM
    </label>
</li>

<li className="inline-flex items-center">
    <input
        type="radio"
        id="1-pm"
        value="1:00 PM"
        className="hidden peer"
        name="timetable"
        onChange={handleTimeChange}
        checked={selectedTime === '1:00 PM'}
    />
    <label
        htmlFor="1-pm"
        className="inline-flex items-center justify-center px-4 py-2 text-sm lg:text-base font-medium text-center whitespace-nowrap bg-white hover:bg-blue-300 dark:bg-gray-800 border rounded-lg cursor-pointer text-gray-500 border-gray-200 dark:border-gray-700 peer-checked:bg-blue-400 peer-checked:text-white dark:peer-checked:bg-blue-900 dark:peer-checked:text-white"
    >
        1:00  PM
    </label>
</li>

<li className="inline-flex items-center">
    <input
        type="radio"
        id="1-45-pm"
        value="1:45 PM"
        className="hidden peer"
        name="timetable"
        onChange={handleTimeChange}
        checked={selectedTime === '1:45 PM'}
    />
    <label
        htmlFor="1-45-pm"
        className="inline-flex items-center justify-center px-4 py-2 text-sm lg:text-base font-medium text-center whitespace-nowrap bg-white hover:bg-blue-300 dark:bg-gray-800 border rounded-lg cursor-pointer text-gray-500 border-gray-200 dark:border-gray-700 peer-checked:bg-blue-400 peer-checked:text-white dark:peer-checked:bg-blue-900 dark:peer-checked:text-white"
    >
        1:45  PM
    </label>
</li>

<li className="inline-flex items-center">
    <input
        type="radio"
        id="2-30-pm"
        value="2:30 PM"
        className="hidden peer"
        name="timetable"
        onChange={handleTimeChange}
        checked={selectedTime === '2:30 PM'}
    />
    <label
        htmlFor="2-30-pm"
        className="inline-flex items-center justify-center px-4 py-2 text-sm lg:text-base font-medium text-center whitespace-nowrap bg-white hover:bg-blue-300 dark:bg-gray-800 border rounded-lg cursor-pointer text-gray-500 border-gray-200 dark:border-gray-700 peer-checked:bg-blue-400 peer-checked:text-white dark:peer-checked:bg-blue-900 dark:peer-checked:text-white"
    >
        2:30  PM
    </label>
</li>

<li className="inline-flex items-center">
    <input
        type="radio"
        id="3-15-pm"
        value="3:15 PM"
        className="hidden peer"
        name="timetable"
        onChange={handleTimeChange}
        checked={selectedTime === '3:15 PM'}
    />
    <label
        htmlFor="3-15-pm"
        className="inline-flex items-center justify-center px-4 py-2 text-sm lg:text-base font-medium text-center whitespace-nowrap bg-white hover:bg-blue-300 dark:bg-gray-800 border rounded-lg cursor-pointer text-gray-500 border-gray-200 dark:border-gray-700 peer-checked:bg-blue-400 peer-checked:text-white dark:peer-checked:bg-blue-900 dark:peer-checked:text-white"
    >
        3:15  PM
    </label>
</li>

<li className="inline-flex items-center">
    <input
        type="radio"
        id="4-pm"
        value="4:00 PM"
        className="hidden peer"
        name="timetable"
        onChange={handleTimeChange}
        checked={selectedTime === '4:00 PM'}
    />
    <label
        htmlFor="4-Pm"
        className="inline-flex items-center justify-center px-4 py-2 text-sm lg:text-base font-medium text-center whitespace-nowrap bg-white hover:bg-blue-300 dark:bg-gray-800 border rounded-lg cursor-pointer text-gray-500 border-gray-200 dark:border-gray-700 peer-checked:bg-blue-400 peer-checked:text-white dark:peer-checked:bg-blue-900 dark:peer-checked:text-white"
    >
        4:00  PM
    </label>
</li>

    </ul>
                                            {errorMessage && (
                                                <div className="text-red-500 text-sm mb-4">
                                                    {errorMessage}
                                                </div>
                                            )}
                                            <button
                                                type="button"
                                                onClick={handleBooking}
                                                className="w-full inline-flex justify-center items-center px-5 py-2.5 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                                            >
                                                Book
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

{isConfirmModalOpen && (
  <div
    id="confirm-modal"
    tabIndex={-1}
    aria-hidden="true"
    className="fixed inset-0 z-50 flex justify-center items-center w-full h-full bg-black bg-opacity-50"
  >
    <div className="relative p-6 w-full max-w-lg max-h-full">
      <div className="relative bg-white rounded-lg shadow dark:bg-gray-800">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Confirm Your Appointment
            </h3>
          </div>
          <div className="text-gray-700 dark:text-gray-300">
            You have selected {selectedDate?.toLocaleDateString()} at {selectedTime}. 
          </div>
          <div className="flex justify-between items-center mt-4">
            <button
              type="button"
              onClick={cancelBooking}
              className="inline-flex justify-center items-center px-5 py-2.5 text-sm font-medium text-center text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 focus:ring-4 focus:outline-none focus:ring-gray-400 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmBooking}
              className="inline-flex justify-center items-center px-5 py-2.5 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
)}

        </div>
    )
};

export default NewAppointment;
