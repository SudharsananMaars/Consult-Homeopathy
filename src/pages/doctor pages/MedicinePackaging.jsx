import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from 'axios';
import config from "../../config";
const MedicinePackaging = () => {
  const { id } = useParams();
  const [rawMaterials, setRawMaterials] = useState([]);
  const [medicineList, setMedicineList] = useState([]);
  const [expiryDates, setExpiryDates] = useState({});
  const [loading, setLoading] = useState(true);
  const [originalData, setOriginalData] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [updating, setUpdating] = useState({});
  const [uploadedFile, setUploadedFile] = useState(null);
  const fileInputRef = useRef(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [patientData, setPatientData] = useState({
    name: "Al",
    address: "123 Main St, Coimbatore",
    phone: "9876543210",
    verified: false
  });
  const API_URL = config.API_URL;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRawMaterials = async () => {
      try {
        const response = await fetch(`${API_URL}/api/medicine-summary/non-bottle-packing`);
        if (!response.ok) {
          throw new Error("Failed to fetch raw materials");
        }
        const data = await response.json();
        setOriginalData(data);

        const transformed = data.map((item) => ({
          id: item._id,
          name: item.name,
          category: item.category,
          stock: `${item.currentQuantity}/${item.quantity} ${item.uom || ""}`.trim(),
        }));

        setRawMaterials(transformed);

        const initialQuantities = {};
        transformed.forEach((item) => {
          initialQuantities[item.id] = 0;
        });
        setQuantities(initialQuantities);

      } catch (error) {
        console.error("Error fetching raw materials:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRawMaterials();
  }, []);

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/medicine-summary/${id}/patient-address`);
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        const data = await res.json();
        setPatientData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, [id]);

   useEffect(() => {
  const fetchMedicineSummary = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_URL}/api/medicine-summary/summary`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prescriptionId: id }),
        }
      );
      if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
      const data = await res.json();
      setMedicineList(data);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching medicine summary:", err);
    } finally {
      setLoading(false);
    }
  };
  
  if (id) { // Only call if id exists
    fetchMedicineSummary();
  }
}, [id, API_URL]);

  const handleDateChange = (medicineName, newDate) => {
    setExpiryDates((prev) => ({
      ...prev,
      [medicineName]: newDate,
    }));
  };

    const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log("Selected file:", file);
      setUploadedFile(file);
      // later: send to backend
    }
  };

  const handleClick = () => {
    fileInputRef.current.click();
  };

  const handleVerifyAddress = () => {
    setPatientData(prev => ({
      ...prev,
      verified: true
    }));
  };

const handleReturnToCRM = async () => {
  try {
    // First API call - Add packaging data
    const packagingPayload = {
  prescriptionID: id,
  packagingData: originalData.map((material) => ({
    materialId: material._id,
    materialName: material.name,
    quantityUsed: 1, 
    currentQuantity: material.currentQuantity
  })),
  packedImage: uploadedFile
};


    // Create FormData for file upload
    const formData = new FormData();
    formData.append('prescriptionID', id);
    formData.append('packagingData', JSON.stringify(packagingPayload.packagingData));
    if (uploadedFile) {
      formData.append('packedImage', uploadedFile);
    }

    // Call packaging API
    await axios.post(`${API_URL}/api/medicine-summary/add-packaging`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    console.log("Packaging API call successful");

    // Second API call - Update medicine prepared status
    await axios.patch(`${API_URL}/api/medicine-summary/update-medicine-prepared`, {
      prescriptionId: id,
      medicinePrepared: true
    });
    console.log("Medicine prepared status update successful");

    // Navigate after both calls succeed
    navigate('/doctor-dashboard/myAllocation');

  } catch (error) {
    console.error(
      'Error in handleReturnToCRM:',
      error.response?.data || error.message
    );
    // Optionally show user-friendly error message
    // alert('An error occurred. Please try again.');
  }
};

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCancel = () => {
    navigate('/doctor-dashboard/myAllocation');
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="bg-white rounded-lg p-6">
      <h2 className="text-xl font-medium text-gray-800 mb-6">Verify Address</h2>
      <div className="overflow-x-auto rounded-lg shadow pt-5">
  <table className="w-full overflow-hidden rounded-lg">
    <thead>
      <tr className="border-b border-blue-200">
        <th className="bg-gray-100 text-center p-4 font-bold text-gray-700 text-sm">
          Patient Name
        </th>
        <th className="bg-white text-center p-4 font-bold text-gray-700 text-sm">
          Address
        </th>
        <th className="bg-gray-100 text-center p-4 font-bold text-gray-700 text-sm">
          Phone
        </th>
        <th className="bg-white text-center p-4 font-bold text-gray-700 text-sm">
          Verification Status
        </th>
      </tr>
    </thead>
    <tbody>
      <tr className="border-b border-blue-200">
        <td className="bg-gray-100 p-4 font-medium text-gray-900 text-center">
          {patientData.name || "John Doe"}
        </td>
        <td className="bg-white p-4 text-gray-600 text-center">
          {patientData.address || "123 Main Street"}
        </td>
        <td className="bg-gray-100 p-4 text-gray-600 text-center">
          {patientData.phone || "+91 9876543210"}
        </td>
        <td className="bg-white p-4 text-center">
          {patientData.verified ? (
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-md text-xs font-medium">
              Verified
            </span>
          ) : (
            <button
              onClick={handleVerifyAddress}
              className="bg-blue-500 text-white px-3 py-1 rounded-md text-xs font-medium hover:bg-blue-600 transition-colors"
            >
              Verify
            </button>
          )}
        </td>
      </tr>
    </tbody>
  </table>
</div>

    </div>
        );
      case 2:
        return (
          <div className="bg-white rounded-lg p-6">
      <h2 className="text-xl font-medium text-gray-800 mb-6">Print Label</h2>
      {medicineList.length === 0 ? (
        <p className="text-gray-600">No medicines found for this prescription.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow pt-5">
  <table className="w-full overflow-hidden rounded-lg">
    <thead>
      <tr className="border-b border-blue-200">
        <th className="bg-gray-100 text-center p-4 font-bold text-gray-700 text-sm">
          Medicine Name
        </th>
        <th className="bg-white text-center p-4 font-bold text-gray-700 text-sm">
          Expiry Date
        </th>
        <th className="bg-gray-100 text-center p-4 font-bold text-gray-700 text-sm">
          Stick Label
        </th>
        <th className="bg-white text-center p-4 font-bold text-gray-700 text-sm">
          Upload Image
        </th>
        <th className="bg-gray-100 text-center p-4 font-bold text-gray-700 text-sm">
          Print Label
        </th>
      </tr>
    </thead>
    <tbody>
      {medicineList.map((med, idx) => (
        <tr key={idx} className="border-b border-blue-200">
          <td className="bg-gray-100 p-4 font-medium text-gray-900 text-center">
            {med.medicineName || "Medicine A"}
          </td>
          <td className="bg-white p-4 text-gray-600 text-center">
            <input
              type="date"
              value={expiryDates[med.medicineName] || ""}
              onChange={(e) => handleDateChange(med.medicineName, e.target.value)}
              className="border rounded px-2 py-1 text-center"
            />
          </td>
          <td className="bg-gray-100 p-4 text-gray-600 text-center">
            <select className="border rounded px-2 py-1">
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </td>
          <td className="bg-white p-4 text-center">
            <button className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300">
              Upload
            </button>
          </td>
          <td className="bg-gray-100 p-4 text-center">
            <button className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">
              Print
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

      )}
    </div>
        );
      case 3:
        return (
          <div className="bg-white rounded-lg p-6">
      <h2 className="text-xl font-medium text-gray-800 mb-6">Packaging</h2>
      {loading ? (
        <p className="text-gray-600">Loading packaging materials...</p>
      ) : rawMaterials.length === 0 ? (
        <p className="text-gray-600">No packaging materials found.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow pt-5">
  <table className="w-full overflow-hidden rounded-lg">
    <thead>
      <tr className="border-b border-blue-200">
        <th className="bg-gray-100 text-center p-4 font-bold text-gray-700 text-sm">
          Item Type
        </th>
        <th className="bg-white text-center p-4 font-bold text-gray-700 text-sm">
          Size Option
        </th>
        <th className="bg-gray-100 text-center p-4 font-bold text-gray-700 text-sm">
          Quantity
        </th>
        <th className="bg-white text-center p-4 font-bold text-gray-700 text-sm">
          Upload Image
        </th>
        <th className="bg-gray-100 text-center p-4 font-bold text-gray-700 text-sm">
          Print Label
        </th>
      </tr>
    </thead>
    <tbody>
      {rawMaterials.map((material) => (
        <tr key={material.id} className="border-b border-blue-200">
          <td className="bg-gray-100 p-4 text-gray-900 text-center">
            <select className="border rounded px-2 py-1 w-full text-center">
              <option value={material.name}>{material.name}</option>
            </select>
          </td>
          <td className="bg-white p-4 text-gray-600 text-center">
            <select className="border rounded px-2 py-1 w-full text-center">
              <option value={material.category}>{material.category}</option>
            </select>
          </td>
          <td className="bg-gray-100 p-4 text-gray-600 text-center">
            <input
              type="number"
              value={1}
              readOnly
              className="border rounded px-2 py-1 w-16 bg-gray-50 text-center"
            />
          </td>
          <td className="bg-white p-4 text-center">
      {!uploadedFile && (
        <button
          onClick={handleClick}
          className="bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300 transition-colors flex items-center justify-center"
        >
          Upload
        </button>
      )}

      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: "none" }}
      />

      {uploadedFile && (
        <p className="mt-2 text-green-600 text-sm">
          {uploadedFile.name} uploaded successfully
        </p>
      )}
    </td>
          <td className="bg-gray-100 p-4 text-center">
            <button className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors">
              Print
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

      )}
    </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-gray-800">Printing & Packaging</h1>
        <button
          onClick={handleCancel}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          ✕ Cancel
        </button>
      </div>

      {/* Stepper */}
      <div className="mb-8">
  <div className="flex items-center justify-between mx-auto" style={{ maxWidth: '1200px' }}>
    {/* Step 1 */}
    <div className="flex flex-col items-center">
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${
          currentStep >= 1 ? 'bg-green-500' : 'bg-gray-300'
        }`}
      >
        {currentStep > 1 ? '✓' : '1'}
      </div>
      <span className="text-sm font-medium text-gray-600 mt-2">Verify Address</span>
    </div>

    {/* Connector 1 */}
    <div
      className={`${currentStep > 1 ? 'bg-green-500' : 'bg-gray-300'}`}
      style={{ width: '380px', height: '2px', margin: '0 1rem' }}
    ></div>

    {/* Step 2 */}
    <div className="flex flex-col items-center">
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${
          currentStep >= 2 ? 'bg-green-500 text-white' : currentStep === 2 ? 'bg-gray-400 text-white' : 'bg-gray-300 text-gray-600'
        }`}
      >
        {currentStep > 2 ? '✓' : '2'}
      </div>
      <span className="text-sm font-medium text-gray-600 mt-2">Print Label</span>
    </div>

    {/* Connector 2 */}
    <div
      className={`${currentStep > 2 ? 'bg-green-500' : 'bg-gray-300'}`}
      style={{ width: '380px', height: '2px', margin: '0 1rem' }}
    ></div>

    {/* Step 3 */}
    <div className="flex flex-col items-center">
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${
          currentStep >= 3 ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
        }`}
      >
        3
      </div>
      <span className="text-sm font-medium text-gray-600 mt-2">Packaging</span>
    </div>
  </div>
</div>


      {/* Step Content */}
      <div className="min-h-[60vh]">
        {renderStepContent()}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        <button
          onClick={handlePrevious}
          disabled={currentStep === 1}
          className={`px-6 py-2 rounded-lg border transition-colors ${
            currentStep === 1
              ? 'border-gray-300 text-gray-400 cursor-not-allowed'
              : 'border-gray-300 text-gray-600 hover:bg-gray-50'
          }`}
        >
          Previous
        </button>

        <div className="flex space-x-3">
          {currentStep === 3 ? (
            <button
      onClick={handleReturnToCRM} 
      className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
    >
      Complete & Return to CRM
    </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MedicinePackaging;