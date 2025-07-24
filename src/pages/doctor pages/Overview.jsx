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
              <table className="min-w-full border rounded-xl overflow-hidden">
                <thead className="bg-gray-100 text-sm text-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left">Patient Name</th>
                    <th className="px-4 py-3 text-left">Total Doses</th>
                    <th className="px-4 py-3 text-left">Doses Taken</th>
                    <th className="px-4 py-3 text-left">Doses Missed</th>
                    <th className="px-4 py-3 text-left">Doses Pending</th>
                    <th className="px-4 py-3 text-left">View Medication</th>
                    <th className="px-4 py-3 text-left">Call</th>
                    <th className="px-4 py-3 text-left">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-sm text-gray-800">
                  {patients.map((p, index) => {
                    const totalDoses = p.doses.taken.count + p.doses.missed.count + p.doses.pending.count;
                    return (
                      <tr key={p.patientId || index} className="hover:bg-gray-50">
                        <td className="px-4 py-3">{p.name}</td>
                        <td className="px-4 py-3">{totalDoses}</td>
                        <td className="px-4 py-3">
                          <span className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
                            {p.doses.taken.count}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-block bg-red-100 text-red-800 text-xs font-semibold px-3 py-1 rounded-full">
                            {p.doses.missed.count}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-block bg-gray-200 text-gray-700 text-xs font-semibold px-3 py-1 rounded-full">
                            {p.doses.pending.count}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button 
                          onClick={() => {
                            setSelectedMedications(p.viewMedications || []);
                            setShowModal(true);
                          }}
                          className="inline-flex items-center px-2.5 py-1.5 border text-xs font-medium rounded-[5px] text-white bg-[#1a237e] hover:bg-[#534bae] focus:ring-2 focus:ring-offset-2 focus:ring-[#534bae]">
                            View
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <button className="inline-flex items-center px-2.5 py-1.5 border text-xs font-medium rounded-[5px] text-white bg-[#1a237e] hover:bg-[#534bae] focus:ring-2 focus:ring-offset-2 focus:ring-[#534bae]">
                            Call
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            placeholder="Add remark"
                            className="w-full border px-2 py-1 rounded text-sm"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
      {showModal && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
    <div className="bg-white p-6 rounded-xl shadow-lg w-[90%] max-w-md">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Medication Schedule</h3>

      {selectedMedications?.length > 0 ? (
        <table className="min-w-full text-sm text-left text-gray-700 mb-4">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2">Medicine</th>
              <th className="px-4 py-2">Dose Time</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {selectedMedications.map((med, idx) => (
              <tr key={idx} className="border-t">
                <td className="px-4 py-2">{med.medicineName}</td>
                <td className="px-4 py-2">{med.doseTime}</td>
                <td className="px-4 py-2">
                  <span
                  className={`inline-block text-xs font-semibold px-3 py-1 rounded-full capitalize
                    ${med.status === 'taken' ? 'bg-green-100 text-green-800' :
                      med.status === 'missed' ? 'bg-red-100 text-red-800' :
                      'bg-gray-200 text-gray-800'}
                      `}
                      >
                        {med.status}
                    </span>
                  </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-sm text-gray-500">No medication data available.</p>
      )}

      <div className="flex justify-end">
        <button
          onClick={() => setShowModal(false)}
          className="mt-2 px-4 py-1.5 bg-[#1a237e] text-white text-sm rounded hover:bg-[#534bae]"
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
