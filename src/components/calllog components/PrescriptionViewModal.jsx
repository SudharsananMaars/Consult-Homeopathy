import React, { useState, useEffect } from 'react';
import { IoClose } from 'react-icons/io5';

const PrescriptionViewModal = ({ isOpen, onClose, appointmentId }) => {
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && appointmentId) {
      fetchPrescriptionData();
    }
  }, [isOpen, appointmentId]);

  // Frontend API service for fetching prescription data
  const fetchPrescriptionByAppointmentId = async (id) => {
    try {
      // Get token from localStorage or your auth state management
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(`/api/prescriptions/appointment/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Failed to fetch prescription');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching prescription:', error);
      throw error;
    }
  };

  const fetchPrescriptionData = async () => {
    try {
      setLoading(true);
      const data = await fetchPrescriptionByAppointmentId(appointmentId);
      setPrescription(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching prescription:', err);
      setError(err.message || 'Failed to load prescription. Please try again later.');
      setPrescription(null);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 my-8">
        {/* Header with close button */}
        <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4">
          <h3 className="text-xl font-bold text-gray-800">Prescription Details</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <IoClose size={24} />
          </button>
        </div>
        
        {loading ? (
          <div className="py-16 text-center">
            <p className="text-gray-600">Loading prescription data...</p>
          </div>
        ) : error ? (
          <div className="py-16 text-center">
            <p className="text-red-500">{error}</p>
          </div>
        ) : prescription ? (
          <>
            {/* Prescription Overview */}
            <div className="px-6 py-4 border-b border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="mb-2">
                  <span className="font-semibold text-gray-700">Appointment ID:</span>
                  <span className="ml-2">{prescription.appointmentId?.$oid || prescription.appointmentId || 'N/A'}</span>
                </div>
                <div className="mb-2">
                  <span className="font-semibold text-gray-700">Created On:</span>
                  <span className="ml-2">
                    {prescription.createdAt?.$date 
                      ? new Date(prescription.createdAt.$date).toLocaleDateString() 
                      : prescription.createdAt 
                        ? new Date(prescription.createdAt).toLocaleDateString()
                        : 'N/A'}
                  </span>
                </div>
                <div className="mb-2">
                  <span className="font-semibold text-gray-700">Follow-up After:</span>
                  <span className="ml-2">{prescription.followUpDays || 'N/A'} days</span>
                </div>
              </div>
              <div>
                <div className="mb-2">
                  <span className="font-semibold text-gray-700">Medicine Charges:</span>
                  <span className="ml-2">₹{prescription.medicineCharges?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="mb-2">
                  <span className="font-semibold text-gray-700">Shipping Charges:</span>
                  <span className="ml-2">₹{prescription.shippingCharges?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="mb-2">
                  <span className="font-semibold text-gray-700">Total Charges:</span>
                  <span className="ml-2 font-bold">
                    ₹{((Number(prescription.medicineCharges) || 0) + (Number(prescription.shippingCharges) || 0)).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Notes Section */}
            {prescription.notes && (
              <div className="px-6 py-3 border-b border-gray-200">
                <h4 className="font-semibold text-gray-700 mb-1">Special Instructions:</h4>
                <p className="text-gray-600 bg-gray-50 p-3 rounded">{prescription.notes}</p>
              </div>
            )}
            
            {/* Prescription Items Table */}
            <div className="px-6 py-4 max-h-96 overflow-y-auto">
              <h4 className="font-semibold text-gray-700 mb-3">Prescribed Medicines:</h4>
              
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Medicine</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Raw Material</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Form</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Quantity</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">UOM</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Preparation</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Frequency/Duration</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {prescription.prescriptionItems && prescription.prescriptionItems.length > 0 ? (
                      prescription.prescriptionItems.map((item, index) => (
                        <tr key={item._id?.$oid || index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-4 py-3 text-sm text-gray-900">{item.medicineName || 'N/A'}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{item.rawMaterialName || 'N/A'}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{item.form || 'N/A'}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{item.quantity || '0'}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{item.uom || 'N/A'}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{item.preparationSteps || 'N/A'}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{item.frequencyDuration || 'N/A'}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="px-4 py-4 text-center text-gray-500">
                          No prescription items found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Footer */}
            <div className="border-t border-gray-200 px-6 py-4 flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none"
              >
                Close
              </button>
            </div>
          </>
        ) : (
          <div className="py-16 text-center">
            <p className="text-gray-600">No prescription data available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrescriptionViewModal;