import React, { useEffect, useState } from 'react';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { X } from 'lucide-react';
import axios from 'axios';
import config from '../../config';

const API_URL = config.API_URL;

const PrescriptionPopup = ({ isOpen, onClose, prescriptionData, doctorName, diagnosis, date }) => {
  const [patientName, setPatientName] = useState("Loading...");
  const mockPrescription = prescriptionData;

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await axios.get(`${API_URL}/api/patient/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setPatientName(res.data?.name || "Unknown");
      } catch (err) {
        console.error("Failed to fetch patient info", err);
        setPatientName("Error fetching name");
      }
    };

    if (isOpen) fetchPatient(); // Only fetch if popup is open
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      {/* Panel */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="mx-auto w-full max-w-6xl rounded-lg bg-white p-6 overflow-auto max-h-[90vh] shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <DialogTitle className="text-2xl font-bold">Prescription Details</DialogTitle>
            <button onClick={onClose}>
              <X className="w-6 h-6 text-gray-600 hover:text-black" />
            </button>
          </div>

          {/* Meta Info */}
          <div className="mb-6 grid grid-cols-2 gap-4 text-sm text-gray-700 border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div><span className="font-semibold">Patient Name:</span> {patientName}</div>
            <div><span className="font-semibold">Date:</span> {new Date(date).toLocaleDateString()}</div>
            <div><span className="font-semibold">Doctor Name:</span> {doctorName}</div>
            <div><span className="font-semibold">Diagnosis:</span> {diagnosis}</div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300 text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border p-2">S.No</th>
                  <th className="border p-2">Label</th>
                  <th className="border p-2">Medicine Name</th>
                  <th className="border p-2">Form</th>
                  <th className="border p-2">Duration</th>
                  <th className="border p-2">Morning</th>
                  <th className="border p-2">Noon</th>
                  <th className="border p-2">Evening</th>
                  <th className="border p-2">Night</th>
                  <th className="border p-2">Instructions</th>
                </tr>
              </thead>
              <tbody>
                {mockPrescription.map((item, index) => (
                  <tr key={index}>
                    <td className="border p-2 text-center">{index + 1}</td>
                    <td className="border p-2 text-center">{item.label}</td>
                    <td className="border p-2">{item.medicineName}</td>
                    <td className="border p-2 text-center">{item.form}</td>
                    <td className="border p-2">{item.duration}</td>
                    <td className="border p-2 whitespace-pre-wrap">{item.morning}</td>
                    <td className="border p-2 whitespace-pre-wrap">{item.noon || '-'}</td>
                    <td className="border p-2 whitespace-pre-wrap">{item.evening}</td>
                    <td className="border p-2 whitespace-pre-wrap">{item.night}</td>
                    <td className="border p-2">{item.instructions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default PrescriptionPopup;
