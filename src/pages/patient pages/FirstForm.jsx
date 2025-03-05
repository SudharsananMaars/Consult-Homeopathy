// FirstForm.jsx   
import React, { useState } from "react";                                                                                                                                                                                   
import Select from 'react-select';
import axios from 'axios';

const countries = [
  { code: 'IN', name: 'India', dialCode: '+91' },
  { code: 'US', name: 'United States', dialCode: '+1' },
  { code: 'LK', name: 'Sri Lanka', dialCode: '+94' },
  { code: 'CN', name: 'China', dialCode: '+86' },
  { code: 'RU', name: 'Russia', dialCode: '+7' },
  // Add more countries as needed
];

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
  { value: 'Friend', label: 'Friend' }
];

const genderOptions = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Other", label: "Other" }
];

const ageOptions = Array.from({ length: 80 }, (_, i) => ({ value: i + 1, label: (i + 1).toString() }));

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
    location: '',
  });

  const [formError, setFormError] = useState({});
  const [selectedCountry, setSelectedCountry] = useState(countries[0].dialCode);
  const [selectedCountryWhatsApp, setSelectedCountryWhatsApp] = useState(countries[0].dialCode);
  const [isWhatsAppSame, setIsWhatsAppSame] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const ClearIndicator = () => null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
    if (formError[name]) {
      setFormError(prevErrors => ({ ...prevErrors, [name]: '' }));
    }
  };

  const handleSelectChange = (name, selectedOption) => {
    setFormData(prevData => ({ ...prevData, [name]: selectedOption ? selectedOption.value : '' }));
    if (formError[name]) {
      setFormError(prevErrors => ({ ...prevErrors, [name]: '' }));
    }
  };

  const handleCountryChange = (e) => {
    const selected = countries.find(country => country.code === e.target.value);
    setSelectedCountry(selected.dialCode);
  };

  const handleCountryChangeWhatsApp = (e) => {
    const selected = countries.find(country => country.code === e.target.value);
    setSelectedCountryWhatsApp(selected.dialCode);
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    const regex = /^[0-9]{0,15}$/; // Increased max length to accommodate country codes if needed
    if (regex.test(value)) {
      setFormData(prevData => ({ ...prevData, [name]: value }));
      setFormError(prevErrors => ({ ...prevErrors, [name]: '' }));
    }
  };

  const handleEmailChange = (e) => {
    const { value } = e.target;
    const regex = /^[A-Z0-9._%+-]+@gmail\.com$/i; // Updated to specifically validate Gmail addresses
    setFormData(prevData => ({ ...prevData, email: value }));
    if (regex.test(value)) {
      setFormError(prevErrors => ({ ...prevErrors, email: '' }));
    } else {
      setFormError(prevErrors => ({ ...prevErrors, email: 'Please enter a valid Gmail address' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!formData.consultingFor) errors.consultingFor = 'This field is required';
    if (!formData.fullName) errors.fullName = 'This field is required';
    if (!formData.age ) errors.age = 'This field is required';
    if (!formData.email) errors.email = 'This field is required';
    if (!formData.mobileNumber) errors.mobileNumber = 'This field is required';
    if (!formData.gender) errors.gender = 'This field is required';
    if (!formData.consultingReason) errors.consultingReason = 'This field is required';
    if (formData.consultingReason === 'Other' && !formData.symptom) errors.symptom = "This is required";
    if (!formData.referral) errors.referral = 'This field is required';

    if (Object.keys(errors).length === 0) {
      try {
        setIsSubmitting(true);
        const dataToSend = {
          consultingReason: formData.consultingReason,
          symptom: formData.symptom,
        };

        // Update the API URL if your Node.js backend runs on a different port or domain
        const response = await axios.post('http://localhost:5000/api/predict', dataToSend);

        setPrediction(response.data.message);

        // Optionally, reset the form fields except for prediction
        setFormData({
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
          location: '',
        });

        setIsWhatsAppSame(false);
        setSelectedCountry(countries[0].dialCode);
        setSelectedCountryWhatsApp(countries[0].dialCode);
        alert('Form Submitted Successfully');
      } catch (error) {
        console.error('Submission error:', error);
        if (error.response && error.response.data && error.response.data.error) {
          alert(`Error:${error.response.data.error}`);
        } else {
          alert('Error submitting form');
        }
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setFormError(errors);
    }
  };

  const handleWhatsAppSameChange = (e) => {
    const isChecked = e.target.checked;
    setIsWhatsAppSame(isChecked);
    if (isChecked) {
      setFormData(prevData => ({
        ...prevData,
        whatsappNumber: prevData.mobileNumber
      }));
      setSelectedCountryWhatsApp(selectedCountry);
    } else {
      setFormData(prevData => ({
        ...prevData,
        whatsappNumber: ''
      }));
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-200 p-4">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg">
        <h2 className="text-center h-[70px] bg-blue-300 p-6 text-white text-xl font-bold mb-4">Registration Form</h2>

        {/* Consulting Person */}
        <div className="mb-4">
          <label htmlFor="consultingFor" className="block text-gray-800 font-medium mb-2">Consulting Person</label>
          <Select
            name="consultingFor"
            options={consultingPersons}
            value={consultingPersons.find(option => option.value === formData.consultingFor) || null}
            onChange={(selectedOption) => handleSelectChange('consultingFor', selectedOption)}
            isClearable
            isSearchable
            components={{ ClearIndicator }}
            className="w-full border-gray-300 rounded text-gray-600"
          />
          {formError.consultingFor && <div className="text-red-500 text-sm mt-1">{formError.consultingFor}</div>}
        </div>

        {/* Full Name */}
        <div className="mb-4">
          <label htmlFor="fullName" className="block text-gray-800 font-medium mb-2">Full Name</label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded text-gray-600 h-10"
          />
          {formError.fullName && <div className="text-red-500 text-sm mt-1">{formError.fullName}</div>}
        </div>

        {/* Age */}
        <div className="mb-4">
          <label htmlFor="age" className="block text-gray-800 font-medium mb-2">Age</label>
          <Select
            name="age"
            options={ageOptions}
            value={ageOptions.find(option => option.value === formData.age) || null}
            onChange={(selectedOption) => handleSelectChange('age', selectedOption)}
            isClearable
            isSearchable
            components={{ ClearIndicator }}
            className="w-full border-gray-300 rounded text-gray-600"
          />
          {formError.age && <div className="text-red-500 text-sm mt-1">{formError.age}</div>}
        </div>

        {/* Mobile Number */}
        <div className="mb-4">
          <label htmlFor="mobileNumber" className="block text-gray-800 font-medium mb-2">Mobile Number</label>
          <div className="flex">
            <select
              name="countryCode"
              onChange={handleCountryChange}
              className="w-1/3 p-2 border border-gray-300 rounded-l text-gray-600 h-10"
              value={countries.find(country => country.dialCode === selectedCountry)?.code || countries[0].code}
            >
              {countries.map(country => (
                <option key={country.code} value={country.code}>{country.dialCode} {country.name}</option>
              ))}
            </select>
            <input
              type="text"
              id="mobileNumber"
              name="mobileNumber"
              value={formData.mobileNumber}
              onChange={handleNumberChange}
              className="w-full p-2 border border-gray-300 rounded-r text-gray-600 h-10"
              maxLength="15"
              placeholder="Enter mobile number"
            />
          </div>
          {formError.mobileNumber && <div className="text-red-500 text-sm mt-1">{formError.mobileNumber}</div>}
        </div>

        {/* WhatsApp Number Same as Mobile */}
        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            checked={isWhatsAppSame}
            onChange={handleWhatsAppSameChange}
            className="mr-2 h-4 w-4"
          />
          <span className="text-gray-600 text-sm">WhatsApp number is the same as mobile number</span>
        </div>

        {/* WhatsApp Number */}
        <div className="mb-4">
          <label htmlFor="whatsappNumber" className="block text-gray-800 font-medium mb-2">WhatsApp Number</label>
          <div className="flex">
            <select
              name="whatsappCountryCode"
              value={countries.find(country => country.dialCode === selectedCountryWhatsApp)?.code || countries[0].code}
              onChange={handleCountryChangeWhatsApp}
              disabled={isWhatsAppSame}
              className={`w-1/3 p-2 border border-gray-300 rounded-l text-gray-600 h-10 ${isWhatsAppSame ? 'bg-gray-300 cursor-not-allowed' : ''}`}
            >
              {countries.map(country => (
                <option key={country.code} value={country.code}>{country.dialCode} {country.name}</option>
              ))}
            </select>
            <input
              type="text"
              name="whatsappNumber"
              value={formData.whatsappNumber}
              onChange={handleNumberChange}
              className={`w-full p-2 border border-gray-300 rounded-r text-gray-600 h-10 ${isWhatsAppSame ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              disabled={isWhatsAppSame}
              placeholder="Enter WhatsApp number"
              maxLength="15"
            />
          </div>
          {formError.whatsappNumber && <div className="text-red-500 text-sm mt-1">{formError.whatsappNumber}</div>}
        </div>

        {/* Email */}
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-800 font-medium mb-2">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder='@gmail.com'
            value={formData.email}
            onChange={handleEmailChange}
            className="w-full p-2 border border-gray-300 rounded text-gray-600 h-10"
          />
          {formError.email && <div className="text-red-500 text-sm mt-1">{formError.email}</div>}
        </div>

        {/* Gender */}
        <div className="mb-4">
          <label htmlFor="gender" className="block text-gray-800 font-medium mb-2">Gender</label>
          <Select
            name="gender"
            options={genderOptions}
            value={genderOptions.find(option => option.value === formData.gender) || null}
            onChange={(selectedOption) => handleSelectChange('gender', selectedOption)}
            isClearable
            isSearchable
            components={{ ClearIndicator }}
            className="w-full border-gray-300 rounded text-gray-600"
          />
          {formError.gender && <div className="text-red-500 text-sm mt-1">{formError.gender}</div>}
        </div>

        {/* Consulting Reason */}
        <div className="mb-4">
          <label htmlFor="consultingReason" className="block text-gray-800 font-medium mb-2">Consulting Reason</label>
          <Select
            name="consultingReason"
            options={consultingReasonOptions}
            placeholder="Select"
            value={consultingReasonOptions.find(option => option.value === formData.consultingReason) || null}
            onChange={(selectedOption) => handleSelectChange('consultingReason', selectedOption)}
            isClearable
            isSearchable
            components={{ ClearIndicator }}
            className="w-full border-gray-300 rounded text-gray-600"
          />
          {formError.consultingReason && <div className="text-red-500 text-sm mt-1">{formError.consultingReason}</div>}
        </div>

        {/* Symptom (Conditional) */}
        {formData.consultingReason === 'Other' && (
          <div className="mb-4">
            <label htmlFor="symptom" className="block text-gray-800 font-medium mb-2">Symptom</label>
            <input
              type="text"
              id="symptom"
              name="symptom"
              value={formData.symptom}
              onChange={handleInputChange}
              className="w-full border p-2 border-gray-300 rounded text-gray-600 h-10"
              placeholder="Describe your symptom"
            />
            {formError.symptom && <div className="text-red-500 text-sm mt-1">{formError.symptom}</div>}
          </div>
        )}

        {/* Referral Option */}
        <div className="mb-4">
          <label htmlFor="referral" className="block text-gray-800 font-medium mb-2">Referral Option</label>
          <Select
            name="referral"
            options={referralOptions}
            value={referralOptions.find(option => option.value === formData.referral) || null}
            onChange={(selectedOption) => handleSelectChange('referral', selectedOption)}
            isClearable
            isSearchable
            components={{ ClearIndicator }}
            className="w-full border-gray-300 rounded text-gray-600"
          />
          {formError.referral && <div className="text-red-500 text-sm mt-1">{formError.referral}</div>}
        </div>

        <div className="mb-4">
        <label htmlFor="location" className="block text-gray-800 font-medium mb-2">Location</label>
        <input
          type="text"
          id="location"
          value={formData.location}
          readOnly
          className="w-full p-2 border border-gray-300 rounded text-gray-600 h-10"
        />
        <button
          type="button"
          onClick={handleGeolocation}
          className="bg-blue-500 text-white p-2 mt-2 rounded"
        >
          Get Current Location
        </button>
        {loadingLocation && <p className="text-sm text-gray-600 mt-1">Fetching location...</p>}
        {formError.location && <p className="text-red-500 text-sm mt-1">{formError.location}</p>}
      </div>


        {/* Submit Button */}
        <div className="flex justify-center">
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>

        {/* Prediction Result */}
        {prediction && (
          <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            <p className="text-lg font-medium">Prediction: {prediction}</p>
          </div>
        )}
      </form>
    </div>
  );
};

export default FirstForm;