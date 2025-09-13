import React, { useState, useEffect } from 'react';
import DoctorLayout from '/src/components/doctor components/DoctorLayout.jsx';
import { FaRegCalendarAlt } from "react-icons/fa";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';
import config from '/src/config.js';

const API_URL = config.API_URL;
const doctorId = localStorage.getItem("userId");
const token = localStorage.getItem("token");

const Overview = () => {
  const [selectedMedications, setSelectedMedications] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);

  // Format date to YYYY-MM-DD
  const formatDate = (date) => date.toISOString().split('T')[0];

useEffect(() => {
  const fetchData = async () => {
    setLoading(true);
    const dateStr = formatDate(selectedDate);

    try {
      const res = await axios.get(`${API_URL}/api/doctor/medications/summary/${doctorId}?date=${dateStr}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (Array.isArray(res.data)) {
        setPatients(res.data); 
      } else {
        setPatients([]); 
        console.warn(res.data?.message || "No data found");
      }
    } catch (err) {
      console.error("Error fetching patient summary:", err);
      setPatients([]); 
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, [selectedDate]);


  // Derived summary
  const totalPatients = patients.length;
  const totalDoses = patients.reduce((acc, p) => acc + p.doses.taken.count + p.doses.missed.count + p.doses.pending.count, 0);
  const totalTaken = patients.reduce((acc, p) => acc + p.doses.taken.count, 0);
  const compliancePercent = totalDoses ? Math.round((totalTaken / totalDoses) * 100) : 0;

  return (
    <DoctorLayout>
      <div className="overview-page px-6 py-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Overview</h1>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-medium text-gray-700 mb-2">Total Patients</h2>
            <p className="text-3xl font-bold text-blue-600">{totalPatients}</p>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-medium text-gray-700 mb-2">Medication Compliance</h2>
            <p className="text-3xl font-bold text-green-600">{compliancePercent}%</p>
            <p className="text-sm text-gray-500 mt-1">{totalTaken} / {totalDoses} doses taken</p>
          </div>
        </div>

        {/* Table + Date Picker */}
        <div className="bg-white rounded-xl shadow p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">Summary</h2>

            <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-1">
              <FaRegCalendarAlt className="text-gray-500 text-sm" />
              <DatePicker
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                className="outline-none text-sm text-gray-700 bg-transparent"
                dateFormat="yyyy-MM-dd"
              />
            </div>
          </div>

          {/* Patient Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <p className="text-gray-500 text-sm">Loading...</p>
            ) : (
              <div className="overflow-x-auto rounded-lg shadow pt-5">
  <table className="w-full overflow-hidden rounded-lg">
    <thead>
      <tr className="border-b border-blue-200">
        <th className="bg-gray-100 text-center p-4 font-bold text-gray-700 text-sm">
          Patient Name
        </th>
        <th className="bg-white text-center p-4 font-bold text-gray-700 text-sm">
          Total Doses
        </th>
        <th className="bg-gray-100 text-center p-4 font-bold text-gray-700 text-sm">
          Doses Taken
        </th>
        <th className="bg-white text-center p-4 font-bold text-gray-700 text-sm">
          Doses Missed
        </th>
        <th className="bg-gray-100 text-center p-4 font-bold text-gray-700 text-sm">
          Doses Pending
        </th>
        <th className="bg-white text-center p-4 font-bold text-gray-700 text-sm">
          View Medication
        </th>
        <th className="bg-gray-100 text-center p-4 font-bold text-gray-700 text-sm">
          Call
        </th>
        <th className="bg-white text-center p-4 font-bold text-gray-700 text-sm">
          Remarks
        </th>
      </tr>
    </thead>
    <tbody>
      {patients.length > 0 ? (
        patients.map((p, idx) => {
          const totalDoses =
            p.doses.taken.count +
            p.doses.missed.count +
            p.doses.pending.count;
          return (
            <tr
              key={p.patientId || idx}
              className="border-b border-blue-200"
            >
              {/* Patient Name */}
              <td className="bg-gray-100 p-4 text-gray-900 text-center">
                {p.name}
              </td>
              {/* Total Doses */}
              <td className="bg-white p-4 text-gray-600 text-center">
                {totalDoses}
              </td>
              {/* Taken */}
              <td className="bg-gray-100 p-4 text-center">
                <span className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
                  {p.doses.taken.count}
                </span>
              </td>
              {/* Missed */}
              <td className="bg-white p-4 text-center">
                <span className="inline-block bg-red-100 text-red-800 text-xs font-semibold px-3 py-1 rounded-full">
                  {p.doses.missed.count}
                </span>
              </td>
              {/* Pending */}
              <td className="bg-gray-100 p-4 text-center">
                <span className="inline-block bg-yellow-100 text-orange-600 text-xs font-semibold px-3 py-1 rounded-full">
                  {p.doses.pending.count}
                </span>
              </td>
              {/* View Medication */}
              <td className="bg-white p-4 text-center">
                <button
                  onClick={() => {
                    setSelectedMedications(p.viewMedications || []);
                    setShowModal(true);
                  }}
                  className="inline-flex items-center px-2.5 py-1.5 border text-xs font-medium rounded-[5px] text-white bg-blue-500 hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-700"
                >
                  View
                </button>
              </td>
              {/* Call */}
              <td className="bg-gray-100 p-4 text-center">
                <button className="inline-flex items-center px-2.5 py-1.5 border text-xs font-medium rounded-[5px] text-white bg-blue-500 hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-700">
                  Call
                </button>
              </td>
              {/* Remarks */}
              <td className="bg-white p-4 text-center">
                <input
                  type="text"
                  placeholder="Add remark"
                  className="w-full border px-2 py-1 rounded text-sm"
                />
              </td>
            </tr>
          );
        })
      ) : (
        <tr>
          <td
            colSpan={8}
            className="bg-white text-center text-gray-500 py-6"
          >
            No patient records found.
          </td>
        </tr>
      )}
    </tbody>
  </table>
</div>

            )}
          </div>
        </div>
      </div>
      {showModal && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
    <div className="bg-white p-6 rounded-xl shadow-lg w-[90%] max-w-md">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Medication Schedule</h3>

      {selectedMedications?.length > 0 ? (
  <table className="w-full overflow-hidden rounded-lg">
    <thead>
      <tr className="border-b border-blue-200">
        <th className="bg-gray-100 text-center p-4 font-bold text-gray-700 text-sm">
          Medicine
        </th>
        <th className="bg-white text-center p-4 font-bold text-gray-700 text-sm">
          Dose Time
        </th>
        <th className="bg-gray-100 text-center p-4 font-bold text-gray-700 text-sm">
          Status
        </th>
      </tr>
    </thead>
    <tbody>
      {selectedMedications.length > 0 ? (
        selectedMedications.map((med, idx) => (
          <tr key={idx} className="border-b border-blue-200">
            {/* Medicine Name */}
            <td className="bg-gray-100 p-4 text-gray-900 text-center">
              {med.medicineName}
            </td>
            {/* Dose Time */}
            <td className="bg-white p-4 text-gray-600 text-center">
              {med.doseTime}
            </td>
            {/* Status */}
            <td className="bg-gray-100 p-4 text-center">
              <span
                className={`inline-block text-xs font-semibold px-3 py-1 rounded-full capitalize
                  ${
                    med.status === "taken"
                      ? "bg-green-100 text-green-800"
                      : med.status === "missed"
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-200 text-gray-800"
                  }`}
              >
                {med.status}
              </span>
            </td>
          </tr>
        ))
      ) : (
        <tr>
          <td
            colSpan={3}
            className="bg-white text-center text-gray-500 py-6"
          >
            No medications found.
          </td>
        </tr>
      )}
    </tbody>
  </table>
      ) : (
        <p className="text-sm text-gray-500">No medication data available.</p>
      )}

      <div className="flex justify-end">
        <button
          onClick={() => setShowModal(false)}
          className="mt-2 px-4 py-1.5 bg-blue-500 text-white text-sm rounded hover:bg-blue-700"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}
    </DoctorLayout>
  );
};

export default Overview;
