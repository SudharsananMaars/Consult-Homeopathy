import React, { useState } from 'react';
import Select from 'react-select';

const countries = [
  { code: 'IN', name: 'India', dialCode: '+91' },
  { code: 'US', name: 'United States', dialCode: '+1' },
  { code: 'LK', name: 'Sri Lanka', dialCode: '+94' },
  { code: 'CN', name: 'China', dialCode: '+86' },
  { code: 'RU', name: 'Russia', dialCode: '+7' },
];

const consultingPersons = [
  { value: 'Self', label: 'Self' },
  { value: 'Husband', label: 'Husband' },
  { value: 'Wife', label: 'Wife' },
  { value: 'Son', label: 'Son' },
  { value: 'Daughter', label: 'Daughter' },
  { value: 'Father', label: 'Father' },
  { value: 'Mother', label: 'Mother' },
  { value: 'Friend', label: 'Friend' },
];

const genderOptions = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Other", label: "Other" }
];

const ageOptions = Array.from({ length: 80 }, (_, i) => ({ value: i + 1, label: (i + 1).toString() }));

const consultingReasons = [
  "Accidents", "Acute Back Pain", "Acute Bronchitis", "Acute Contact Dermatitis", "Acute migraine / headache",
  "Acute Urticaria", "Asthma", "Atrial Fibrillation", "Bipolar Disorder", "COVID-19", "Crohn's Disease", 
  "Diabetes (Type 1 and Type 2)", "Fibromyalgia", "Head injury", "Hypertension (High Blood Pressure)", 
  "Influenza (Flu)", "Irritable Bowel Syndrome (IBS)", "Multiple Sclerosis", "Osteoarthritis", "Parkinson's Disease", 
  "Pulmonary Hypertension", "Rheumatoid Arthritis", "Tooth Pain", "Trauma", "Urinary Tract Infection (UTI)", 
  "Other"
];

const consultingReasonOptions = consultingReasons.map(reason => ({
  value: reason,
  label: reason,
}));

const referralOptions = [
  { value: "Social Media", label: "Social Media" },
  { value: "Friends", label: "Friends" },
  { value: "Websites", label: "Websites" },
  { value: "Families", label: "Families" }
];

const FirstForm = () => {
  const [formData, setFormData] = useState({
    consultingFor: '',
    fullName: '',
    age: '',
    mobileNumber: '',
    whatsappNumber: '',
    email: '',
    gender: '',
    consultingReason: '',
    symptom: '',
    referral: '',
    location: '', // Place name added
  });

  const [formError, setFormError] = useState({});
  const [selectedCountry, setSelectedCountry] = useState(countries[0].dialCode);
  const [loadingLocation, setLoadingLocation] = useState(false);

  const handleGeolocation = () => {
    setLoadingLocation(true); // Start loading
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`;

          fetch(nominatimUrl)
            .then((response) => response.json())
            .then((data) => {
              const place = data.address.city || data.address.town || data.address.village || "Unknown location";
              setFormData((prevData) => ({
                ...prevData,
                location: place,
              }));
              setLoadingLocation(false); // Stop loading
            })
            .catch((error) => {
              console.error('Error with reverse geocoding:', error);
              setFormError((prevError) => ({
                ...prevError,
                location: 'Unable to retrieve location',
              }));
              setLoadingLocation(false); // Stop loading
            });
        },
        (error) => {
          console.error('Error getting geolocation:', error);
          setFormError((prevError) => ({
            ...prevError,
            location: 'Unable to retrieve location',
          }));
          setLoadingLocation(false); // Stop loading
        }
      );
    } else {
      setFormError((prevError) => ({
        ...prevError,
        location: 'Geolocation is not supported by this browser',
      }));
      setLoadingLocation(false); // Stop loading
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    let errors = {};

    // Validate Full Name
    if (!formData.fullName) {
      errors.fullName = 'Full name is required';
    }

    // Validate Email
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailPattern.test(formData.email)) {
      errors.email = 'Valid email is required';
    }

    // Validate Mobile Number
    if (!formData.mobileNumber || formData.mobileNumber.length < 10) {
      errors.mobileNumber = 'Mobile number is required and should be at least 10 digits';
    }

    // Update errors state if there are any validation errors
    if (Object.keys(errors).length > 0) {
      setFormError(errors);
      return;
    }

    // Handle form submission logic (e.g., send data to backend)
    console.log(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white rounded shadow-md">
      <div>
        <label htmlFor="consultingFor">Consulting For:</label>
        <Select
          id="consultingFor"
          options={consultingPersons}
          onChange={(option) => setFormData({ ...formData, consultingFor: option.value })}
          className="my-2"
        />
      </div>

      <div>
        <label htmlFor="fullName">Full Name:</label>
        <input
          type="text"
          id="fullName"
          value={formData.fullName}
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          className="my-2 p-2 border border-gray-300 rounded"
        />
        {formError.fullName && <p className="text-red-500">{formError.fullName}</p>}
      </div>

      <div>
        <label htmlFor="age">Age:</label>
        <Select
          id="age"
          options={ageOptions}
          onChange={(option) => setFormData({ ...formData, age: option.value })}
          className="my-2"
        />
      </div>

      <div>
        <label htmlFor="mobileNumber">Mobile Number:</label>
        <input
          type="text"
          id="mobileNumber"
          value={formData.mobileNumber}
          onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
          className="my-2 p-2 border border-gray-300 rounded"
        />
        {formError.mobileNumber && <p className="text-red-500">{formError.mobileNumber}</p>}
      </div>

      <div>
        <label htmlFor="whatsappNumber">WhatsApp Number:</label>
        <input
          type="text"
          id="whatsappNumber"
          value={formData.whatsappNumber}
          onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
          className="my-2 p-2 border border-gray-300 rounded"
        />
      </div>

      <div>
        <label htmlFor="email">Email:</label>
        <input
          type="text"
          id="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="my-2 p-2 border border-gray-300 rounded"
        />
        {formError.email && <p className="text-red-500">{formError.email}</p>}
      </div>

      <div>
        <label htmlFor="gender">Gender:</label>
        <Select
          id="gender"
          options={genderOptions}
          onChange={(option) => setFormData({ ...formData, gender: option.value })}
          className="my-2"
        />
      </div>

      <div>
        <label htmlFor="consultingReason">Consulting Reason:</label>
        <Select
          id="consultingReason"
          options={consultingReasonOptions}
          onChange={(option) => setFormData({ ...formData, consultingReason: option.value })}
          className="my-2"
        />
      </div>

      {formData.consultingReason === "Other" && (
        <div>
          <label htmlFor="symptom">Symptom:</label>
          <input
            type="text"
            id="symptom"
            value={formData.symptom}
            onChange={(e) => setFormData({ ...formData, symptom: e.target.value })}
            className="my-2 p-2 border border-gray-300 rounded"
          />
        </div>
      )}

      <div>
        <label htmlFor="referral">Referral:</label>
        <Select
          id="referral"
          options={referralOptions}
          onChange={(option) => setFormData({ ...formData, referral: option.value })}
          className="my-2"
        />
      </div>

      <div>
        <label htmlFor="location">Location:</label>
        <input
          type="text"
          id="location"
          value={formData.location}
          readOnly
          className="my-2 p-2 border border-gray-300 rounded"
        />
        <button type="button" onClick={handleGeolocation} className="bg-blue-500 text-white p-2 rounded">
          Get Current Location
        </button>
        {loadingLocation && <p>Fetching location...</p>}
        {formError.location && <p className="text-red-500">{formError.location}</p>}
      </div>

      <button type="submit" className="bg-green-500 text-white p-2 rounded">
        Submit
      </button>
    </form>
  );
};

export default FirstForm;
