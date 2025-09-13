import { useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import config from "../../config";

export default function ShippingForm() {
  const { id: appointmentId } = useParams(); // Get appointment ID from URL
  const location = useLocation(); // Get navigation state
  const navigate = useNavigate();
  const API_URL = config.API_URL;
  
  // Get prescription ID from navigation state
  const prescriptionId = location.state?.prescriptionId;
  
  const [formData, setFormData] = useState({
    trackingId: "",
    deliveryPartner: "",
    shippedDate: "",
    arrivalDate: "",
    status: "Transit"
  });
  
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFinish = async () => {
    if (!prescriptionId) {
      console.error('Prescription ID not available');
      alert('Prescription ID is missing. Please go back and try again.');
      return;
    }

    setIsLoading(true);
    try {
      // First API call - Update tracking information
      const trackingResponse = await fetch(`${API_URL}/api/doctor/prescriptions/${prescriptionId}/tracking`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!trackingResponse.ok) {
        console.error('Failed to update tracking information');
        alert('Failed to update tracking information. Please try again.');
        return;
      }

      // Second API call - Update shipment status
      const shipmentResponse = await fetch(`${API_URL}/api/medicine-summary/${prescriptionId}/update-shipment-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shipmentStatus: true
        }),
      });

      if (shipmentResponse.ok) {
        console.log('Tracking information and shipment status updated successfully');
        navigate("/medicine-preparation/preparation");
      } else {
        console.error('Failed to update shipment status');
        alert('Failed to update shipment status. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/medicine-preparation/preparation");
  };

  // Show error state if prescription ID not found in navigation state
  if (!prescriptionId) {
    return (
      <div className="w-full min-h-screen bg-gray-100 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-red-600 mb-4">
            Prescription information is missing. Please navigate from the medicine preparation page.
          </div>
          <button 
            onClick={handleCancel}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back to Medicine Preparation
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-100 p-8">
      <div className="w-full">
        <div className="bg-white rounded-3xl p-8 shadow-sm">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-medium text-gray-900">Shipping</h1>
              <p className="text-sm text-gray-500 mt-1">
                Prescription ID: {prescriptionId}
              </p>
            </div>
            <button 
              onClick={handleCancel}
              className="flex items-center gap-2 px-4 py-2 text-blue-600 border border-blue-200 rounded-xl hover:bg-blue-50 transition-colors text-sm font-medium"
            >
              <span>✕</span>
              Cancel
            </button>
          </div>

          {/* Shipping Form Card */}
          <div className="bg-gray-100 rounded-2xl p-6 mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Shipping Details</h2>
            
            {/* Form Table */}
              <table className="w-full overflow-hidden rounded-lg">
                <thead>
                  <tr className="border-b border-blue-200">
                    <th className="bg-gray-100 text-center p-4 font-bold text-gray-700 text-sm">
                      Shipping ID
                    </th>
                    <th className="bg-white text-center p-4 font-bold text-gray-700 text-sm">
                      Partner
                    </th>
                    <th className="bg-gray-100 text-center p-4 font-bold text-gray-700 text-sm">
                      Ship Date
                    </th>
                    <th className="bg-white text-center p-4 font-bold text-gray-700 text-sm">
                      Arrival Date
                    </th>
                    <th className="bg-gray-100 text-center p-4 font-bold text-gray-700 text-sm">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-blue-200">
                    {/* Shipping ID */}
                    <td className="bg-gray-100 p-4 text-gray-600 text-center">
                      <input
                        type="text"
                        value={formData.trackingId}
                        onChange={(e) => handleInputChange('trackingId', e.target.value)}
                        placeholder="Enter tracking ID"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md 
                                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </td>

                    {/* Partner */}
                    <td className="bg-white p-4 text-gray-600 text-center">
                      <input
                        type="text"
                        value={formData.deliveryPartner}
                        onChange={(e) => handleInputChange('deliveryPartner', e.target.value)}
                        placeholder="Enter partner name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md 
                                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </td>

                    {/* Ship Date */}
                    <td className="bg-gray-100 p-4 text-gray-600 text-center">
                      <input
                        type="date"
                        value={formData.shippedDate}
                        onChange={(e) => handleInputChange('shippedDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md 
                                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </td>

                    {/* Arrival Date */}
                    <td className="bg-white p-4 text-gray-600 text-center">
                      <input
                        type="date"
                        value={formData.arrivalDate}
                        onChange={(e) => handleInputChange('arrivalDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md 
                                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </td>

                    {/* Status */}
                    <td className="bg-gray-100 p-4 text-center">
                      <select
                        value={formData.status}
                        onChange={(e) => handleInputChange('status', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md 
                                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                                   bg-white text-gray-700"
                      >
                        <option value="Transit">Transit</option>
                        <option value="Ready for pickup">Ready for pickup</option>
                      </select>
                    </td>
                  </tr>
                </tbody>
              </table>
          </div>

          {/* Action Button */}
          <div className="flex justify-end">
            <button
              onClick={handleFinish}
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Processing...' : 'Finish'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}