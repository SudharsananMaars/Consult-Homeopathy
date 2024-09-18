import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import axios from 'axios';
import 'C:/Users/Mahima Sharon J R/Desktop/website_pro/website/src/index.css';

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
  "Accidents", "Acute Back Pain", "Acute Bronchitis", "Acute Contact Dermatitis",  "Acute migraine / headache", "Acute Eczema Flare-ups", "Acute Kidney Injury", 
  "Acute viral fever", "Acute Pelvic Inflammatory Disease (PID)", "Acute Sinusitis", "Acute Urticaria", "Alzheimer's Disease", "Allergic cough", "Allergic skin rashes", 
  "Ankylosing Spondylitis", "Asthma", "Atrial Fibrillation", "Bipolar Disorder", "Boils, abscess", "Breast Cancer", "Chronic Bronchitis", "Chronic Hepatitis (B and C)", 
  "Chronic Kidney Disease", "Chronic Migraine", "Chronic Obstructive Pulmonary Disease", "Colorectal Cancer", "Common Cold", "Coronary Artery Disease", "COVID-19", 
  "Crohn's Disease", "Croup", "Dengue Fever", "Diabetes (Type 1 and Type 2)", "Diabetic Nephropathy", "Epilepsy", "Fibromyalgia", "Gastroenteritis", 
  "Generalized Anxiety Disorder", "Glomerulonephritis", "Heart Failure", "Head injury", "Hypertension (High Blood Pressure)", "Hyperthyroidism", "Hypothyroidism", 
  "Injury, cuts, burns, bruise, blow", "Impetigo", "Influenza (Flu)", "Irritable Bowel Syndrome (IBS)", "Leukemia", "Lung Cancer", "Major Depressive Disorder", "Malaria", "Metabolic Syndrome", 
  "Multiple Sclerosis", "Nephrolithiasis (Kidney Stones)", "Non-Alcoholic Fatty Liver Disease", "Osteoarthritis", "Osteoporosis", 
  "Oral Ulcers", "Parkinson's Disease", "Peripheral Artery Disease", "Polycystic Kidney Disease", "Polycystic Ovary Syndrome (PCOS)", 
  "Post-Traumatic Stress Disorder (PTSD)", "Prostate Cancer", "Psoriasis",  "Pulmonary Hypertension", "Rheumatoid Arthritis", "Schizophrenia", 
  "Scleroderma", "Sjogren's Syndrome", "Sprains and Strains", "Strep Throat", "Systemic Lupus Erythematosus (SLE)", "Tooth Pain", "Trauma", "Ulcerative Colitis", "Urinary Tract Infection (UTI)", "Other"];

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
  });

  const [formError, setFormError] = useState({});
  const [selectedCountry, setSelectedCountry] = useState(countries[0].dialCode);
  const [selectedCountryWhatsApp, setSelectedCountryWhatsApp] = useState(countries[0].dialCode);
  const [isWhatsAppSame, setIsWhatsAppSame] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const ClearIndicator = () => null;
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (formError[name]) {
      setFormError({ ...formError, [name]: '' });
    }
  };
  const handleSelectChange = (name, selectedOption) => {
    setFormData({ ...formData, [name]: selectedOption ? selectedOption.value : '' });
    if (formError[name]) {
      setFormError({ ...formError, [name]: '' });
    }
  };
  
/*
  const handleBlur = (e) => {
    const { name, value } = e.target;
    if (!value) {
      setFormError({ ...formError, [name]: `${name.charAt(0).toUpperCase() + name.slice(1)} is required` });
    }
  };
*/
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
    const regex = /^[0-9]{0,10}$/;
    if (regex.test(value)) {
      setFormData({ ...formData, [name]: value });
      setFormError({ ...formError, [name]: '' });
    } 
  };

  const handleEmailChange = (e) => {
    const { value } = e.target;
    const regex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
    setFormData({ ...formData, email: value });
    if (regex.test(value)) {
      setFormError({ ...formError, email: '' });
    } else {
      setFormError({ ...formError, email: 'Please enter a valid Gmail address' });
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
        const dataToSend = {
          consultingReason: formData.consultingReason,
          symptom: formData.symptom,
        };

        const response = await axios.post('http://127.0.0.1:5000', dataToSend)
        setPrediction(response.data.message);
      
      // Reset the form
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
      });
      alert('Form Sumbitted Successfully');
    }
     
    catch (error) {
      console.error('Submission error:', error);
      alert('Error submitting form');
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
    <div className="flex justify-center items-center min-h-screen bg-grey-200 p-4"> 
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-center h-[70px] bg-blue-300 p-6  text-white text-xl font-bold mb-4">Registration Form</h2>
         
          <div className="mb-4">
          <label htmlFor="consultingFor" className="block text-gray-800 font-medium mb-2">Consulting Person</label>
          <Select
            name="consultingFor"
            options={consultingPersons}
            value={consultingPersons.find(option => option.value === formData.consultingFor)}
            onChange={(selectedOption) => {handleSelectChange('consultingFor', selectedOption)}}
            isClearable
            isSearchable={false}
            components={{ ClearIndicator }}
            className="w-full  border-gray-300 rounded text-gray-600"
          />
          {formError.consultingFor && <div className="text-red-500 text-sm mt-1">{formError.consultingFor}</div>}
        </div>

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

          <div className="mb-4">
          <label htmlFor="age" className="block text-gray-800 font-medium mb-2">Age</label>
          <Select
            name="age"
            options={ageOptions}
            value={ageOptions.find(option => option.value === formData.age)}
            onChange={(selectedOption) => {handleSelectChange('age', selectedOption)}}
            className="w-full  border-gray-300 rounded text-gray-600"
          />
          {formError.age && <div className="text-red-500 text-sm mt-1">{formError.age}</div>}
        </div>
        

          <div className="mb-4">
            <label htmlFor="mobileNumber" className="block text-gray-800 font-medium mb-2">Mobile Number</label>
            <div className="flex">
              <select
                name="countryCode"
                onChange={handleCountryChange}
                className="w-1/3 p-2 border border-gray-300 rounded-l text-gray-600 h-10"
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
                maxLength="10"
              />
            </div>
            {formError.mobileNumber && <div className="text-red-500 text-sm mt-1">{formError.mobileNumber}</div>}
          </div>
          <div className="flex items-center mb-2">
            <input
              type="checkbox"
              checked={isWhatsAppSame}
              onChange={handleWhatsAppSameChange}
              className="mr-2 h-10"
            />
            <div>
            <span className="text-gray-600 text-xs" p-3> WhatsApp number is the same as mobile number</span>
            </div>
          </div>

          <div className="mb-4">
          <label htmlFor="whatsappNumber" className="block text-gray-800 font-medium mb-2">WhatsApp Number</label>
          <div className="flex ">
            <select
              name="whatsappCountryCode"
              value={selectedCountryWhatsApp}
              onChange={handleCountryChangeWhatsApp}
              disabled={isWhatsAppSame}
              className={`w-1/3 p-2 border border-gray-300 rounded-l text-gray-600 ${isWhatsAppSame ? 'bg-gray-300 cursor-not-allowed' : ''}`}
            >
              {countries.map(country => (
                <option key={country.code} value={country.code}>{country.dialCode}{country.name}</option>
              ))}
            </select>
            <input
              type="text"
              name="whatsappNumber"
              value={formData.whatsappNumber}
              onChange={handleNumberChange}
              className={` w-full p-2 border border-gray-300 rounded-r text-gray-600 ${isWhatsAppSame ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              disabled={isWhatsAppSame}
            />
          </div>
          
          {formError.whatsappNumber && <div className="text-red-500 text-sm mt-1">{formError.whatsappNumber}</div>}
        </div>

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

          <div className="mb-4">
          <label htmlFor="gender" className="block text-gray-800 font-medium mb-2">Gender</label>
          <Select
            name="gender"
            options={genderOptions}
            value={genderOptions.find(option => option.value === formData.genderOptionsOptions)}
            onChange={(selectedOption) => {handleSelectChange('gender', selectedOption)}}
            isClearable
            isSearchable={false}
            components={{ ClearIndicator }}
            className="w-full  border-gray-300 rounded text-gray-600"
          />
          {formError.gender && <div className="text-red-500 text-sm mt-1">{formError.gender}</div>}
        </div>

        <div className="mb-4">
      <label htmlFor="consultingReason" className="block text-gray-800 font-medium mb-2">Consulting Reason</label>
      <Select
        name="consultingReason"
        options={consultingReasonOptions}
        placeholder="Select"
        value={consultingReasonOptions.find(option => option.value === formData.consultingReason)||null}
        onChange={(selectedOption) => {handleSelectChange('consultingReason', selectedOption)}}
        isClearable={true}
        isSearchable={true}
        components={{ ClearIndicator }}
        className="w-full  border-gray-300 rounded text-gray-600"
      />
      {formError.consultingReason && <div className="text-red-500 text-sm mt-1">{formError.consultingReason}</div>}
    </div>
  

        {formData.consultingReason === 'Other' && (
          <div className="mb-4">
            <label htmlFor="symptom" className="block text-gray-800 font-medium mb-2">Symptom</label>
            <input
              type="text"
              id="symptom"
              name="symptom"
              value={formData.symptom}
              onChange={handleInputChange}
              className="w-full border p-3 border-gray-300 rounded text-gray-600 h-10"
            />
            {formError.symptom && <div className="text-red-500 text-sm mt-1">{formError.symptom}</div>}
          </div>
        )}

          <div className="mb-4">
          <label htmlFor="referral" className="block text-gray-800 font-medium mb-2">Referral Option</label>
          <Select
            name="referral"
            options={referralOptions}
            value={referralOptions.find(option => option.value === formData.referralOptions)}
            onChange={(selectedOption) => {handleSelectChange('referral', selectedOption)}}
            isClearable
            isSearchable={false}
            components={{ ClearIndicator }}
            className="w-full  border-gray-300 rounded text-gray-600"
          />
          {formError.referral && <div className="text-red-500 text-sm mt-1">{formError.referral}</div>}
        </div>  

          <div className="flex justify-center">
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400">
              Submit
            </button>
          </div>
          
        {prediction && (
          <div className="mt-4">
            <p className="text-lg font-medium">Prediction: {prediction}</p>
          </div>
       )}
        </form>
      </div>
     
  );
};


export default FirstForm ;








