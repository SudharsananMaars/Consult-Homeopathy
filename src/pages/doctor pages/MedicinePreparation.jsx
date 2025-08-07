import React, { useState, useEffect } from 'react';
import DoctorLayout from '/src/components/doctor components/DoctorLayout.jsx';
import { FaPlay, FaChevronDown, FaChevronRight } from "react-icons/fa";
import axios from 'axios';
import config from '/src/config.js';

const API_URL = config.API_URL;
const doctorId = localStorage.getItem("userId");
const token = localStorage.getItem("token");

const MedicinePreparation = () => {
  const [preparations, setPreparations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedPrescriptions, setExpandedPrescriptions] = useState(new Set());

  useEffect(() => {
    const fetchPreparations = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_URL}/api/medicine-summary/medicine-preparation-summaries/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (Array.isArray(res.data)) {
          setPreparations(res.data);
        } else {
          setPreparations([]);
          console.warn(res.data?.message || "No data found");
        }
      } catch (err) {
        console.error("Error fetching medicine preparations:", err);
        setPreparations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPreparations();
  }, []);

  const handleVideoPlay = (videoUrl) => {
    if (videoUrl) {
      window.open(videoUrl, '_blank');
    }
  };

  const togglePrescription = (prescriptionId) => {
    const newExpanded = new Set(expandedPrescriptions);
    if (newExpanded.has(prescriptionId)) {
      newExpanded.delete(prescriptionId);
    } else {
      newExpanded.add(prescriptionId);
    }
    setExpandedPrescriptions(newExpanded);
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <DoctorLayout>
      <div className="medicine-preparation-page px-6 py-4 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Medicine Preparation</h1>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Prescriptions</h2>

          {loading ? (
            <p className="text-gray-500 text-sm">Loading...</p>
          ) : preparations.length === 0 ? (
            <p className="text-gray-500 text-sm">No medicine preparations found.</p>
          ) : (
            <div className="space-y-4">
              {preparations.map((prescription, prescriptionIndex) => {
                const prescriptionId = prescription.prescriptionId || prescription._id;
                const isExpanded = expandedPrescriptions.has(prescriptionId);
                
                return (
                  <div key={prescriptionId || prescriptionIndex} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div 
                      className="bg-white p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => togglePrescription(prescriptionId)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-gray-800">
                            Medicine Prepared for: {prescription.patientName}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Medicine prepared by: {prescription.doctorName}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Prescription ID: {prescription.prescriptionId}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">
                            {formatDateTime(prescription.createdAt)}
                          </span>
                          {isExpanded ? (
                            <FaChevronDown className="w-4 h-4 text-gray-600" />
                          ) : (
                            <FaChevronRight className="w-4 h-4 text-gray-600" />
                          )}
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="p-4 space-y-4 border-t border-gray-200">
                        {prescription.medicinePreparations?.map((medicine, medicineIndex) => (
                          <div key={medicineIndex} className="bg-white border rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="text-md font-bold text-gray-800 mb-1">
                                  {medicine.medicineName}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  Created: {formatDateTime(prescription.createdAt)}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                {medicine.preparationVideoUrl && (
                                  <button
                                    onClick={() => handleVideoPlay(medicine.preparationVideoUrl)}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                  >
                                    <FaPlay className="w-3 h-3" />
                                    Play Video
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DoctorLayout>
  );
};

export default MedicinePreparation;