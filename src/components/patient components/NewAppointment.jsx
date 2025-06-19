import React, { useState, useEffect } from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Select from "react-select";
import config from "../../config";
import Layout from "./Layout";
const API_URL = config.API_URL;

const NewAppointment = () => {
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);

  const [consultingForOptions, setConsultingForOptions] = useState([]);
  const [consultingFor, setConsultingFor] = useState(null);

  const [consultingReason, setConsultingReason] = useState(null);
  const [symptom, setSymptom] = useState("");

  const [formErrors, setFormErrors] = useState({});
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const today = dayjs();
  const minDate = today;
  const maxDate = today.add(1, "month");

  const timeSlots = [
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
  ];

  const consultingReasons = [
    "Accidents",
    "Acute Back Pain",
    "Acute Bronchitis",
    "Acute Contact Dermatitis",
    "Acute migraine / headache",
    "Acute Eczema Flare-ups",
    "Acute Kidney Injury",
    "Acute viral fever",
    "Acute Pelvic Inflammatory Disease (PID)",
    "Acute Sinusitis",
    "Acute Urticaria",
    "Alzheimer's Disease",
    "Allergic cough",
    "Allergic skin rashes",
    "Ankylosing Spondylitis",
    "Asthma",
    "Atrial Fibrillation",
    "Bipolar Disorder",
    "Boils, abscess",
    "Breast Cancer",
    "Chronic Bronchitis",
    "Chronic Hepatitis (B and C)",
    "Chronic Kidney Disease",
    "Chronic Migraine",
    "Chronic Obstructive Pulmonary Disease",
    "Colorectal Cancer",
    "Common Cold",
    "Coronary Artery Disease",
    "COVID-19",
    "Crohn's Disease",
    "Croup",
    "Dengue Fever",
    "Diabetes (Type 1 and Type 2)",
    "Diabetic Nephropathy",
    "Epilepsy",
    "Fibromyalgia",
    "Gastroenteritis",
    "Generalized Anxiety Disorder",
    "Glomerulonephritis",
    "Heart Failure",
    "Head injury",
    "Hypertension (High Blood Pressure)",
    "Hyperthyroidism",
    "Hypothyroidism",
    "Injury, cuts, burns, bruise, blow",
    "Impetigo",
    "Influenza (Flu)",
    "Irritable Bowel Syndrome (IBS)",
    "Leukemia",
    "Lung Cancer",
    "Major Depressive Disorder",
    "Malaria",
    "Metabolic Syndrome",
    "Multiple Sclerosis",
    "Nephrolithiasis (Kidney Stones)",
    "Non-Alcoholic Fatty Liver Disease",
    "Osteoarthritis",
    "Osteoporosis",
    "Oral Ulcers",
    "Parkinson's Disease",
    "Peripheral Artery Disease",
    "Polycystic Kidney Disease",
    "Polycystic Ovary Syndrome (PCOS)",
    "Post-Traumatic Stress Disorder (PTSD)",
    "Prostate Cancer",
    "Psoriasis",
    "Pulmonary Hypertension",
    "Rheumatoid Arthritis",
    "Schizophrenia",
    "Scleroderma",
    "Sjogren's Syndrome",
    "Sprains and Strains",
    "Strep Throat",
    "Systemic Lupus Erythematosus (SLE)",
    "Tooth Pain",
    "Trauma",
    "Ulcerative Colitis",
    "Urinary Tract Infection (UTI)",
    "Other",
  ];

  const consultingReasonOptions = consultingReasons.map((reason) => ({
    value: reason,
    label: reason,
  }));

  // Fetch family members and set consultingFor options
  useEffect(() => {
    const fetchFamilyMembers = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await axios.get(`${API_URL}/api/patient/getFamilyMembers`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userId = JSON.parse(atob(token.split(".")[1])).id; // Assuming JWT contains user id
        console.log("familyMembers: ", res.data.familyMembers);
        const options = [
          { value: userId, label: "Self" },
          ...res.data.familyMembers.map((member) => ({
            value: member.id,
            label: member.relationship,
          })),
        ];
        setConsultingForOptions(options);
        setConsultingFor(options[0]); // Default to Self
      } catch (err) {
        console.error("Error fetching family members:", err);
      }
    };
    fetchFamilyMembers();
  }, []);

  // Fetch available slots
  useEffect(() => {
    const fetchSlots = async () => {
      if (startDate) {
        const token = localStorage.getItem("token");
        const appointmentDate = dayjs(startDate).format("YYYY-MM-DD");
        try {
          const res = await axios.post(
            `${API_URL}/api/patient/checkSlots`,
            { appointmentDate },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setAvailableSlots(res.data.availableSlots);
        } catch (err) {
          console.error("Error fetching slots:", err);
        }
      }
    };
    fetchSlots();
  }, [startDate]);

  const validateForm = () => {
    const errors = {};
    if (!startDate) errors.date = "Please select a date";
    if (!selectedTime) errors.time = "Please select a time slot";
    if (!consultingFor)
      errors.consultingFor = "Please select consulting person";
    if (!consultingReason)
      errors.consultingReason = "Please select consulting reason";
    if (consultingReason?.value === "Other" && symptom.length < 10) {
      errors.symptom = "Please enter at least 10 characters for symptom";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleBookClick = () => {
    if (validateForm()) {
      setIsPopupOpen(true);
    }
  };

  const handleConfirmClick = async () => {
    setIsBooking(true);
    setErrorMessage("");
    const token = localStorage.getItem("token");
    const appointmentDate = dayjs(startDate).format("YYYY-MM-DD");

    const payload = {
      appointmentDate,
      timeSlot: selectedTime,
      consultingFor: consultingFor,
      consultingReason: consultingReason.value,
      symptom: consultingReason.value === "Other" ? symptom : "",
    };
    console.log("payload", payload);
    try {
      await axios.post(`${API_URL}/api/patient/bookAppointment`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate("/razor");
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Booking failed");
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow space-y-6">
          <h2 className="text-xl font-bold text-center bg-blue-100 p-3 rounded">
            Book an Appointment
          </h2>

          <label className="font-semibold">Consulting Person</label>
          <Select
            options={consultingForOptions}
            value={consultingFor}
            onChange={setConsultingFor}
          />
          {formErrors.consultingFor && (
            <p className="text-red-500 text-sm">{formErrors.consultingFor}</p>
          )}

          <label className="font-semibold">Consulting Reason</label>
          <Select
            options={consultingReasonOptions}
            value={consultingReason}
            onChange={setConsultingReason}
          />
          {formErrors.consultingReason && (
            <p className="text-red-500 text-sm">
              {formErrors.consultingReason}
            </p>
          )}

          {consultingReason?.value === "Other" && (
            <>
              <label className="font-semibold">Symptom (required)</label>
              <input
                type="text"
                value={symptom}
                onChange={(e) => setSymptom(e.target.value)}
                className="w-full border rounded p-2"
                placeholder="Describe your symptom"
              />
              {formErrors.symptom && (
                <p className="text-red-500 text-sm">{formErrors.symptom}</p>
              )}
            </>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateCalendar
              value={startDate}
              onChange={setStartDate}
              minDate={minDate}
              maxDate={maxDate}
            />
          </LocalizationProvider>
          {formErrors.date && (
            <p className="text-red-500 text-sm">{formErrors.date}</p>
          )}

          <label className="font-semibold">Pick Your Time</label>
          <div className="grid grid-cols-3 gap-2">
            {timeSlots.map((time) => (
              <button
                key={time}
                onClick={() => setSelectedTime(time)}
                disabled={!availableSlots.includes(time)}
                className={`p-2 rounded border transition ${
                  selectedTime === time
                    ? "bg-blue-500 text-white"
                    : availableSlots.includes(time)
                    ? "bg-white hover:bg-blue-100"
                    : "bg-gray-200 cursor-not-allowed"
                }`}
              >
                {time}
              </button>
            ))}
          </div>
          {formErrors.time && (
            <p className="text-red-500 text-sm">{formErrors.time}</p>
          )}

          <button
            onClick={handleBookClick}
            className="w-full bg-blue-600 text-white py-2 rounded mt-4 hover:bg-blue-700"
          >
            Book Appointment
          </button>
        </div>

        {isPopupOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow w-full max-w-md">
              <h2 className="text-lg font-bold mb-2">Confirm Your Booking</h2>
              <p className="mb-4">
                Date: {startDate?.format("DD-MM-YYYY")} <br />
                Time: {selectedTime}
              </p>
              {errorMessage && (
                <p className="text-red-500 mb-2">{errorMessage}</p>
              )}
              <div className="flex gap-4 justify-end">
                <button
                  onClick={handleConfirmClick}
                  disabled={isBooking}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  {isBooking ? "Booking..." : "Confirm"}
                </button>
                <button
                  onClick={() => setIsPopupOpen(false)}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default NewAppointment;
