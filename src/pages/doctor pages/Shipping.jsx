import { useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import config from "../../config";

export default function ShippingForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const API_URL = config.API_URL;
  const [formData, setFormData] = useState({
    trackingId: "",
    deliveryPartner: "",
    shippedDate: "",
    arrivalDate: ""
  });
  
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFinish = async () => {
  setIsLoading(true);
  try {
    const response = await fetch(`${API_URL}/api/doctor/prescriptions/${id}/tracking`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      console.log('Tracking information updated successfully');
      navigate("/medicine-preparation/preparation"); // ✅ Only navigate on success
    } else {
      console.error('Failed to update tracking information');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    setIsLoading(false);
  }
};


  const handleCancel = () => {
    // Handle cancel action
    console.log('Cancel clicked');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Shipping</h1>
        <button 
          onClick={handleCancel}
          className="flex items-center gap-2 px-4 py-2 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
        >
          <span>✕</span>
          Cancel
        </button>
      </div>

      {/* Shipping Form Card */}
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-6">Shipping</h2>
        
        {/* Form Table */}
        <div className="overflow-x-auto rounded-lg shadow pt-5">
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
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Pending
          </span>
        </td>
      </tr>
    </tbody>
  </table>
</div>

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
  );
}