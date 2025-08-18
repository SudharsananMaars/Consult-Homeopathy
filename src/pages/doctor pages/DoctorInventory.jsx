import React, { useState, useEffect } from 'react';
import DoctorLayout from '/src/components/doctor components/DoctorLayout.jsx';
import config from '/src/config.js';

const API_URL = config.API_URL;

const DoctorInventory = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showMedicationPopup, setShowMedicationPopup] = useState(false);

  // Fetch patient data from API
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        // Get userId from localStorage
        const userId = localStorage.getItem('userId');
        
        if (!userId) {
          throw new Error('User ID not found in localStorage');
        }

        const response = await fetch(`${API_URL}/api/doctor-stock/${userId}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setPatients(data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching patient data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  // Calculate total medicine count for a patient
  const calculateTotalMedicineCount = (medicationStock) => {
    return medicationStock ? medicationStock.length : 0;
  };

  // Handle view medication button click
  const handleViewMedication = (patient) => {
    setSelectedPatient(patient);
    setShowMedicationPopup(true);
  };

  // Close popup
  const closePopup = () => {
    setShowMedicationPopup(false);
    setSelectedPatient(null);
  };

  if (loading) {
    return (
      <DoctorLayout>
        <div className="p-6">
          <div className="bg-white rounded-xl shadow p-6">
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a237e] mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading patients...</p>
            </div>
          </div>
        </div>
      </DoctorLayout>
    );
  }

  if (error) {
    return (
      <DoctorLayout>
        <div className="p-6">
          <div className="bg-white rounded-xl shadow p-6">
            <div className="text-center py-8">
              <p className="text-red-600">Error: {error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-4 px-4 py-2 bg-[#1a237e] text-white rounded hover:bg-[#534bae]"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </DoctorLayout>
    );
  }

  return (
    <DoctorLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Doctor Inventory</h1>
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Patient Summary</h2>
         
          <div className="overflow-x-auto">
            <table className="min-w-full border rounded-xl overflow-hidden">
              <thead className="bg-gray-100 text-sm text-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left">Patient Name</th>
                  <th className="px-4 py-3 text-left">Total Medicine Count</th>
                  <th className="px-4 py-3 text-left">View Medication</th>
                </tr>
              </thead>
              <tbody className="divide-y text-sm text-gray-800">
                {patients.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="px-4 py-8 text-center text-gray-500">
                      No patients found
                    </td>
                  </tr>
                ) : (
                  patients.map((patient, index) => (
                    <tr key={patient.patientId || index} className="hover:bg-gray-50">
                      <td className="px-4 py-3">{patient.patientName}</td>
                      <td className="px-4 py-3">
                        {calculateTotalMedicineCount(patient.medicationStock)}
                      </td>
                      <td className="px-4 py-3">
                        <button 
                          onClick={() => handleViewMedication(patient)}
                          className="inline-flex items-center px-2.5 py-1.5 border text-xs font-medium rounded-[5px] text-white bg-[#1a237e] hover:bg-[#534bae] focus:ring-2 focus:ring-offset-2 focus:ring-[#534bae]"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Medication Details Popup */}
      {showMedicationPopup && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Popup Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">
                Medication Details - {selectedPatient.patientName}
              </h3>
              <button
                onClick={closePopup}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                ×
              </button>
            </div>

            {/* Popup Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {selectedPatient.medicationStock && selectedPatient.medicationStock.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full border rounded-xl overflow-hidden">
                    <thead className="bg-gray-100 text-sm text-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left">Medicine Name</th>
                        <th className="px-4 py-3 text-left">Form</th>
                        <th className="px-4 py-3 text-left">Quantity Prescribed</th>
                        <th className="px-4 py-3 text-left">Quantity Consumed</th>
                        <th className="px-4 py-3 text-left">Quantity Remaining</th>
                        <th className="px-4 py-3 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y text-sm text-gray-800">
                      {selectedPatient.medicationStock.map((medication, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium">{medication.medicineName}</td>
                          <td className="px-4 py-3">{medication.form}</td>
                          <td className="px-4 py-3">{medication.dispenseQuantity}</td>
                          <td className="px-4 py-3">{medication.totalQuantityConsumed}</td>
                          <td className="px-4 py-3">{medication.quantityRemaining}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              medication.medicineStatus === 'Available' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {medication.medicineStatus}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No medication data available for this patient
                </div>
              )}
            </div>

            {/* Popup Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={closePopup}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
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

export default DoctorInventory;