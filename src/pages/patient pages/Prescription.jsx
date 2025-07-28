import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import Layout from "/src/components/patient components/Layout.jsx";
import PrescriptionPopup from "/src/pages/patient pages/PrescriptionPopup.jsx";
import Nocontent from '/src/assets/images/doctor images/Nocontent.jpg';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import {
  Clock4,
  Sun,
  Sunrise,
  Moon,
  XCircle,
  Activity,
  CalendarDays
} from 'lucide-react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import config from "../../config";


const API_URL = config.API_URL;
const patientId = localStorage.getItem("userId");

const Prescription = () => {
  const [activeTab, setActiveTab] = useState('Prescription');
  const [prescriptions, setPrescriptions] = useState([]);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [viewMode, setViewMode] = useState("weekly");
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
  const [weekKeys, setWeekKeys] = useState([]); 
  const [weeklyData, setWeeklyData] = useState(null); 
  const navigate = useNavigate();
  const [medicationSummary, setMedicationSummary] = useState(null);
  const [metrics, setMetrics] = useState({ adherence: 0, missed: 0 });
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);

  useEffect(() => {
  const fetchMedicationSummary = async () => {
    try {
      const response = await fetch(`${API_URL}/api/patient/medication-summary/${patientId}?date=${selectedDate}`);
      const data = await response.json();
      setMedicationSummary(data);
      const total = data?.viewMedications?.length || 0;
      const taken = data?.doses?.taken?.count || 0;
      const missed = data?.doses?.missed?.count || 0;
      const adherence = total > 0 ? Math.round((taken / total) * 100) : 0;

      setMetrics({
        adherence,
        missed,
      });
    } catch (err) {
      console.error("Failed to fetch medication summary:", err);
    }
  };

  fetchMedicationSummary();
}, [selectedDate]);
  useEffect(() => {
  const fetchPrescriptions = async () => {
    try {
      const response = await fetch(`${API_URL}/api/patient/prescriptions/grouped/${patientId}`);
      const data = await response.json();

      const extractedPrescriptions = Object.entries(data.prescriptions).map(([id, details]) => ({
        id, // prescription ID
        date: details.metadata.startDate,
        doctorName: details.metadata.doctorName,
        diagnosis: details.metadata.consultingFor,
      }));

      setPrescriptions(extractedPrescriptions);
    } catch (err) {
      console.error("Failed to fetch prescriptions:", err);
    }
  };

  fetchPrescriptions();
}, []);

useEffect(() => {
  const fetchWeeklyData = async () => {
    try {
      const response = await fetch(`${API_URL}/api/patient/prescriptions/week-view/${patientId}`);
      const data = await response.json();
      const keys = Object.keys(data);
      setWeeklyData(data);
      setWeekKeys(keys);
    } catch (err) {
      console.error("Failed to fetch weekly summary:", err);
    }
  };

  fetchWeeklyData();
}, []);

  return (
    <Layout>
      <div className="min-h-screen flex flex-col p-7">
        <h2 className="text-2xl font-bold mb-4">Prescription</h2>

        <div className="flex mb-4 border-b border-gray-300">
          <button
            className={`py-2 px-4 ${activeTab === 'Prescription' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
            onClick={() => setActiveTab('Prescription')}
          >
            Prescriptions
          </button>
          <button
            className={`py-2 px-4 ${activeTab === 'Daily Intake Calendar' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
            onClick={() => setActiveTab('Daily Intake Calendar')}
          >
            Daily Intake Calendar
          </button>
        </div>

        {activeTab === 'Prescription' ? (
          <div className="flex flex-col gap-4">
            {prescriptions.length > 0 ? (
              prescriptions.map((prescription) => (
                <div
                  key={prescription.id}
                  className="bg-white shadow-md rounded-xl p-5 border hover:shadow-lg transition"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        {prescription.doctorName}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Date: {new Date(prescription.date).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        Diagnosis: {prescription.diagnosis}
                      </p>
                    </div>
<button
  onClick={() => navigate(`/view-prescription/${prescription.id}`)}
  className="bg-blue-500 text-white font-semibold px-4 py-2 rounded hover:bg-blue-600"
>
  View Prescription
</button>

                  </div>
                </div>
              ))
            ) : (
              <div className="flex-grow flex flex-col items-center justify-center mb-8">
                <img src={Nocontent} alt="No content" className="w-24 h-24 mb-4" />
                <p className="text-gray-500">No prescriptions available yet.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex gap-6">

          <div className="w-3/5">
  {/* Dropdown for View Mode */}
  <div className="flex justify-between items-center mb-4">
    <h3 className="text-lg font-semibold flex items-center gap-2">
      <CalendarDays className="w-5 h-5 text-blue-600" />
      {viewMode === "daily" ? "Daily Intake" : "Weekly Intake"}
    </h3>

    {/* View Mode Selector */}
    <select
      value={viewMode}
      onChange={(e) => setViewMode(e.target.value)}
      className="border rounded px-3 py-1 text-sm"
    >
      <option value="daily">Daily View</option>
      <option value="weekly">Weekly View</option>
    </select>
  </div>

  {/* Week Navigation for Weekly View */}
  {viewMode === "weekly" && (
    <div className="flex justify-between items-center mb-2 px-1">
      <button
        disabled={currentWeekIndex === 0}
        onClick={() => setCurrentWeekIndex(currentWeekIndex - 1)}
        className="text-sm text-blue-600 disabled:opacity-50"
      >
        &lt; 
      </button>
      <span className="text-sm font-medium">
        {weekKeys?.[currentWeekIndex]}
      </span>
      <button
        disabled={currentWeekIndex === weekKeys.length - 1}
        onClick={() => setCurrentWeekIndex(currentWeekIndex + 1)}
        className="text-sm text-blue-600 disabled:opacity-50"
      >
         &gt;
      </button>
    </div>
  )}

  {/* Table */}
  <table className="min-w-full bg-white border rounded-lg shadow-md text-sm">
    <thead className="bg-gray-100 text-gray-700 font-semibold">
      <tr>
        <th className="px-4 py-2 border">Medicine</th>
        <th className="px-4 py-2 border">Time</th>
        <th className="px-4 py-2 border">Status</th>
      </tr>
    </thead>
    <tbody className="text-gray-700">
      {viewMode === "daily" ? (
        medicationSummary?.viewMedications?.length > 0 ? (
          medicationSummary.viewMedications.map((med, index) => (
            <tr key={index}>
              <td className="px-4 py-2 border text-center">{med.medicineName}</td>
              <td className="px-4 py-2 border text-center">{med.doseTime}</td>
              <td className="px-4 py-2 border text-center">
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    med.status === "taken"
                      ? "bg-green-100 text-green-700"
                      : med.status === "missed"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {med.status.charAt(0).toUpperCase() + med.status.slice(1)}
                </span>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="3" className="px-4 py-2 border text-center text-gray-500">
              No medication records for this date.
            </td>
          </tr>
        )
      ) : weeklyData && weekKeys.length > 0 ? (
        Object.entries(weeklyData[weekKeys[currentWeekIndex]]).map(
          ([dayLabel, meds], i) => (
            <>
              <tr key={`day-${i}`}>
  <td
    colSpan="3"
    className="px-4 py-2 border text-left font-semibold bg-gray-50 text-blue-700"
  >
    {meds[0]?.date
      ? `${new Date(meds[0].date).toLocaleDateString('en-IN', {
          weekday: 'long',
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })}`
      : `Day ${i + 1}`}
  </td>
</tr>

              {meds.map((med, j) => (
                <tr key={`med-${i}-${j}`}>
                  <td className="px-4 py-2 border text-center">{med.medicineName}</td>
                  <td className="px-4 py-2 border text-center">{med.doseTime}</td>
                  <td className="px-4 py-2 border text-center text-gray-400">—</td>
                </tr>
              ))}
            </>
          )
        )
      ) : (
        <tr>
          <td colSpan="3" className="px-4 py-2 border text-center text-gray-500">
            No weekly data found.
          </td>
        </tr>
      )}
    </tbody>
  </table>
</div>


            <div className="w-2/5 flex flex-col gap-6">
  {/* Monthly Calendar block */}
<div className="bg-white rounded-xl p-5 shadow-md border">
  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
    <CalendarDays className="w-5 h-5 text-blue-600" />
    Monthly Calendar
  </h3>

  <div className="flex justify-center">
    <div className="[&_.react-calendar]:border-none [&_.react-calendar]:shadow-none [&_.react-calendar]:outline-none">
      <Calendar
        onChange={(date) =>
          setSelectedDate(date.toLocaleDateString('en-CA'))
        }
        value={new Date(selectedDate)}
      />
    </div>
  </div>
</div>

  {/* Daily Intake Metrics block */}
  <div className="bg-gray-50 rounded-xl p-5 shadow-md border flex flex-col gap-5">
    <div className="flex justify-between items-center">
      <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
        <CalendarDays className="w-5 h-5 text-blue-600" />
        Daily Intake Metrics
      </h3>
    </div>
    <div className="flex items-center gap-4">
      <div className="w-28 h-28">
        <CircularProgressbar 
          value={metrics.adherence}
          text={`${metrics.adherence}%`}  
          styles={buildStyles({
            pathColor: "#10B981",
            textColor: "#374151",
            trailColor: "#D1D5DB",
          })}
        />
      </div>
      <div className="text-left">
        <h4 className="text-md font-semibold text-gray-700">Adherence Score</h4>
        <p className="text-sm text-gray-500 max-w-[130px]">
          Overall medicine intake adherence.
        </p>
      </div>
    </div>

    <div className="w-full space-y-4 text-sm text-gray-700">
      <div className="bg-white rounded-lg p-4 shadow-sm border">
        <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
          <XCircle className="w-4 h-4 text-red-500" />
          Missed Doses
        </h4>
        <p className="text-sm text-gray-700">
          <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold text-xs">{metrics.missed}</span>
          <span className="ml-2">doses missed this week</span>
        </p>
      </div>
    </div>
  </div>
</div>

          </div>
        )}
      </div>
    </Layout>
  );
};

export default Prescription;