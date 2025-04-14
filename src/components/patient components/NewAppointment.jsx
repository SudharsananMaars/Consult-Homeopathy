import React, { useState, useEffect } from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import dayjs from 'dayjs';
import calendar from '/src/assets/images/patient images/calender.png';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';  // Import axios for API requests
import Select from 'react-select';

const NewAppointment = () => {
  const [startDate, setStartDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [dateError, setDateError] = useState('');
  const [timeError, setTimeError] = useState('');
  const [consultingForError, setconsultingForError] = useState('');
  const [fullNameError, setfullNameError] = useState('');
  const [consultingReasonError, setconsultingReasonError] = useState('');
  const [isPopupOpen, setIsPopupOpen] = useState(false); // Control popup visibility
  const [errorMessage, setErrorMessage] = useState(''); // Error state for API response
  const [successMessage, setSuccessMessage] = useState(''); // Success state for API response
  const [isBooking, setIsBooking] = useState(false); // Button state to avoid duplicate booking
  const [availableSlots, setAvailableSlots] = useState([]); // Store available time slots
  // Declare state variables
  const [consultingFor, setConsultingFor] = useState(null);
  const [fullName, setFullName] = useState('');
  const [consultingReason, setConsultingReason] = useState(null);
  const [symptom, setSymptom] = useState('');
  const [formError, setFormError] = useState({ consultingFor: '', fullName: '', consultingReason: '' });
  const navigate = useNavigate(); // Use for redirection

  // Dynamically set min and max dates based on the current date
  const today = dayjs();
  const minDate = today; // Today as the minimum date
  const maxDate = today.add(1, 'month'); // 1 month from today
  const consultingPersons = [
    { value: 'Self', label: 'Self' },
    { value: 'Husband', label: 'Husband' },
    { value: 'Wife', label: 'Wife' },
    { value: 'Son', label: 'Son' },
    { value: 'Daughter', label: 'Daughter' },
    { value: 'Father', label: 'Father' },
    { value: 'Mother', label: 'Mother' },
    { value: 'Father-in-law', label: 'Father-in-law' },
    { value: 'Mother-in-law', label: 'Mother-in-law' },
    { value: 'Son-in-law', label: 'Son-in-law' },
    { value: 'Daughter-in-law', label: 'Daughter-in-law' },
    { value: 'Friend', label: 'Friend' },
  ];

  const consultingReasons = [
    "Accidents", "Acute Back Pain", "Acute Bronchitis", "Acute Contact Dermatitis", "Acute migraine / headache",
    "Acute Eczema Flare-ups", "Acute Kidney Injury", "Acute viral fever", "Acute Pelvic Inflammatory Disease (PID)",
    "Acute Sinusitis", "Acute Urticaria", "Alzheimer's Disease", "Allergic cough", "Allergic skin rashes",
    "Ankylosing Spondylitis", "Asthma", "Atrial Fibrillation", "Bipolar Disorder", "Boils, abscess",
    "Breast Cancer", "Chronic Bronchitis", "Chronic Hepatitis (B and C)", "Chronic Kidney Disease",
    "Chronic Migraine", "Chronic Obstructive Pulmonary Disease", "Colorectal Cancer", "Common Cold",
    "Coronary Artery Disease", "COVID-19", "Crohn's Disease", "Croup", "Dengue Fever",
    "Diabetes (Type 1 and Type 2)", "Diabetic Nephropathy", "Epilepsy", "Fibromyalgia",
    "Gastroenteritis", "Generalized Anxiety Disorder", "Glomerulonephritis", "Heart Failure",
    "Head injury", "Hypertension (High Blood Pressure)", "Hyperthyroidism", "Hypothyroidism",
    "Injury, cuts, burns, bruise, blow", "Impetigo", "Influenza (Flu)", "Irritable Bowel Syndrome (IBS)",
    "Leukemia", "Lung Cancer", "Major Depressive Disorder", "Malaria", "Metabolic Syndrome",
    "Multiple Sclerosis", "Nephrolithiasis (Kidney Stones)", "Non-Alcoholic Fatty Liver Disease",
    "Osteoarthritis", "Osteoporosis", "Oral Ulcers", "Parkinson's Disease", "Peripheral Artery Disease",
    "Polycystic Kidney Disease", "Polycystic Ovary Syndrome (PCOS)", "Post-Traumatic Stress Disorder (PTSD)",
    "Prostate Cancer", "Psoriasis", "Pulmonary Hypertension", "Rheumatoid Arthritis", "Schizophrenia",
    "Scleroderma", "Sjogren's Syndrome", "Sprains and Strains", "Strep Throat",
    "Systemic Lupus Erythematosus (SLE)", "Tooth Pain", "Trauma", "Ulcerative Colitis",
    "Urinary Tract Infection (UTI)", "Other"
  ];

  const consultingReasonOptions = consultingReasons.map((reason) => ({
    value: reason,
    label: reason,
  }));
  
  // Event Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'fullName') {
      setFullName(value);
    } else if (name === 'symptom') {
      setSymptom(value);
    }
  };

  const handleSelectChange = (name, selectedOption) => {
    if (name === 'consultingFor') {
      setConsultingFor(selectedOption);
    } else if (name === 'consultingReason') {
      setConsultingReason(selectedOption);
    }
  };

  // Fetch available time slots for the selected date
  useEffect(() => {
    const fetchAvailableSlots = async () => {
      if (startDate) {
        try {
          const token = localStorage.getItem('accessToken');
          const appointmentDate = dayjs(startDate).format('YYYY-MM-DD');
    
          // Using the native fetch API
          const response = await fetch(`http://localhost:5000/api/patient/checkSlots`, {
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

    if (!consultingFor) {
      setconsultingForError('Please select for whom you are consulting.');
      hasError = true;
    } else {
      setconsultingForError('');
    }

    if (!fullName) {
      setfullNameError('Please give the full name.');
      hasError = true;
    } else {
      setfullNameError('');
    }

    if (!consultingReason) {
      setconsultingReasonError('Please select the Consulting Reason.');
      hasError = true;
    } else {
      setconsultingReasonError('');
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
        'http://localhost:5000/api/patient/bookAppointment',  // Adjust API endpoint as necessary
        { appointmentDate, timeSlot, consultingFor, fullName, consultingReason, symptom },
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
    <div className="flex flex-col lg:flex-row justify-center space-x-6">
      {/* Calendar Image */}
      <div className="sm:w-1/2 space-y-8 p-5 bg-white rounded-lg shadow-md">
  {/* Consulting Person */}
  <div>
  <label
  className="block text-lg font-bold text-gray-700 mb-10 text-center bg-blue-100 p-4 rounded-lg shadow"
>
  Book an Appointment
</label>

    <label
      htmlFor="consultingFor"
      className="block text-base font-semibold text-gray-700 mb-2"
    >
      Consulting Person
    </label>
    <Select
      name="consultingFor"
      options={consultingPersons}
      value={consultingFor}
      onChange={(selectedOption) => handleSelectChange('consultingFor', selectedOption)}
      className="select-input"
    />
    {formError.consultingFor && (
      <div className="text-red-500 text-xs mt-1">{formError.consultingFor}</div>
    )}
  </div>

  {/* Full Name */}
  <div>
    <label
      htmlFor="fullName"
      className="block text-base font-semibold text-gray-700 mb-2"
    >
      Full Name
    </label>
    <input
      type="text"
      id="fullName"
      name="fullName"
      value={fullName}
      onChange={handleInputChange}
      className="block w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
      placeholder="Enter the full name"
    />
    {formError.fullName && (
      <div className="text-red-500 text-xs mt-1">{formError.fullName}</div>
    )}
  </div>

  {/* Consulting Reason */}
  <div>
    <label
      htmlFor="consultingReason"
      className="block text-base font-semibold text-gray-700 mb-2"
    >
      Consulting Reason
    </label>
    <Select
      name="consultingReason"
      options={consultingReasonOptions}
      value={consultingReason}
      onChange={(selectedOption) => handleSelectChange('consultingReason', selectedOption)}
      className="select-input"
    />
    {formError.consultingReason && (
      <div className="text-red-500 text-xs mt-1">{formError.consultingReason}</div>
    )}
  </div>

  {/* Symptom */}
  {consultingReason?.value === 'Other' && (
    <div>
      <label
        htmlFor="symptom"
        className="block text-base font-semibold text-gray-700 mb-2"
      >
        Symptom
      </label>
      <input
        type="text"
        id="symptom"
        name="symptom"
        value={symptom}
        onChange={handleInputChange}
        className="block w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        placeholder="Describe the symptom"
      />
      {formError.symptom && (
        <div className="text-red-500 text-xs mt-1">{formError.symptom}</div>
      )}
    </div>
  )}
</div>

      {/* Calendar and Time Slots Container */}
      <div className="p-5 bg-white sm:w- rounded-lg shadow-lg">
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
          {consultingForError && <p className="text-red-500 text-sm mt-2">{consultingForError}</p>}
          {fullNameError && <p className="text-red-500 text-sm mt-2">{fullNameError}</p>}
          {consultingReasonError && <p className="text-red-500 text-sm mt-2">{timeError}</p>}

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
