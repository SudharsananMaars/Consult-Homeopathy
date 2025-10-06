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
  
  // New state for dynamic packaging rows
  const [packagingRows, setPackagingRows] = useState([
    { id: Date.now(), selectedItem: '', quantity: 0 }
  ]);
  
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
    
    if (id) {
      fetchMedicineSummary();
    }
  }, [id, API_URL]);

  // Function to add a new packaging row
  const addPackagingRow = () => {
    const newRow = {
      id: Date.now(),
      selectedItem: '',
      quantity: 0
    };
    setPackagingRows([...packagingRows, newRow]);
  };

  // Function to remove a packaging row
  const removePackagingRow = (rowId) => {
    if (packagingRows.length > 1) {
      setPackagingRows(packagingRows.filter(row => row.id !== rowId));
    }
  };

  // Function to update selected item for a row
  const updateSelectedItem = (rowId, itemId) => {
    setPackagingRows(packagingRows.map(row => 
      row.id === rowId ? { ...row, selectedItem: itemId } : row
    ));
  };

  // Function to update quantity for a row
  const updateQuantity = (rowId, quantity) => {
    setPackagingRows(packagingRows.map(row => 
      row.id === rowId ? { ...row, quantity: parseInt(quantity) || 0 } : row
    ));
  };

  // Function to get available items for a dropdown (excluding already selected items)
  const getAvailableItems = (currentRowId) => {
    const selectedItems = packagingRows
      .filter(row => row.id !== currentRowId && row.selectedItem)
      .map(row => row.selectedItem);
    
    return rawMaterials.filter(item => !selectedItems.includes(item.id));
  };

  // Function to get selected material data
  const getSelectedMaterial = (itemId) => {
    return originalData.find(item => item._id === itemId);
  };

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
      // Filter out rows with no selected item or zero quantity
      const validRows = packagingRows.filter(row => row.selectedItem && row.quantity > 0);
      
      if (validRows.length === 0) {
        alert('Please select at least one item with a valid quantity');
        return;
      }

      // Create packaging data from selected rows
      const packagingData = validRows.map(row => {
        const material = getSelectedMaterial(row.selectedItem);
        return {
          materialId: material._id,
          materialName: material.name,
          quantityUsed: row.quantity,
          presentQuantity: material.currentQuantity
        };
      });

      const packagingPayload = {
        prescriptionId: id,
        packagingData: packagingData,
        packedImage: uploadedFile
      };

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('prescriptionId', id);
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
      navigate('/medicine-preparation/preparation');

    } catch (error) {
      console.error(
        'Error in handleReturnToCRM:',
        error.response?.data || error.message
      );
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
                      {patientData.name}
                    </td>
                    <td className="bg-white p-4 text-gray-600 text-center">
                      {patientData.currentLocation}
                    </td>
                    <td className="bg-gray-100 p-4 text-gray-600 text-center">
                      {patientData.phone}
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
                          <button
                            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                            onClick={() => {
                              const medicineName = med.medicineName || "Medicine A";
                              const expiry = expiryDates[med.medicineName] || "";
                              const printWindow = window.open("", "_blank");
                              printWindow.document.write(`
                                <html>
                                  <head>
                                    <title>Print Label</title>
                                    <style>
                                      body { font-family: Arial, sans-serif; text-align: center; padding: 20px; }
                                      h1 { font-size: 24px; margin-bottom: 10px; }
                                      p { font-size: 18px; margin: 5px 0; }
                                    </style>
                                  </head>
                                  <body>
                                    <h1>${medicineName}</h1>
                                    ${expiry ? `<p>Expiry: ${expiry}</p>` : ""}
                                  </body>
                                </html>
                              `);
                              printWindow.document.close();
                              printWindow.focus();
                              printWindow.print();
                              printWindow.close();
                            }}
                          >
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
              <>
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
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {packagingRows.map((row, index) => {
                        const availableItems = getAvailableItems(row.id);
                        const selectedMaterial = row.selectedItem ? rawMaterials.find(item => item.id === row.selectedItem) : null;
                        
                        return (
                          <tr key={row.id} className="border-b border-blue-200">
                            <td className="bg-gray-100 p-4 text-center">
                              <select
                                value={row.selectedItem}
                                onChange={(e) => updateSelectedItem(row.id, e.target.value)}
                                className="border rounded px-2 py-1 w-full max-w-xs"
                              >
                                <option value="">Select Item</option>
                                {availableItems.map((item) => (
                                  <option key={item.id} value={item.id}>
                                    {item.name}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="bg-white p-4 text-gray-600 text-center">
                              {selectedMaterial ? selectedMaterial.category : '-'}
                            </td>
                            <td className="bg-gray-100 p-4 text-center">
                              <input
                                type="number"
                                min="0"
                                value={row.quantity}
                                onChange={(e) => updateQuantity(row.id, e.target.value)}
                                className="border rounded px-2 py-1 w-20 text-center"
                                placeholder="0"
                              />
                            </td>
                            <td className="bg-white p-4 text-center">
                              {!uploadedFile && (
                                <button
                                  onClick={handleClick}
                                  className="bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300 transition-colors"
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
                                  {uploadedFile.name} uploaded
                                </p>
                              )}
                            </td>
                            <td className="bg-gray-100 p-4 text-center">
                              <div className="flex justify-center space-x-2">
                                {index === packagingRows.length - 1 && (
                                  <button
                                    onClick={addPackagingRow}
                                    className="bg-green-500 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors"
                                    title="Add Row"
                                  >
                                    +
                                  </button>
                                )}
                                {packagingRows.length > 1 && (
                                  <button
                                    onClick={() => removePackagingRow(row.id)}
                                    className="bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                                    title="Remove Row"
                                  >
                                    -
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Print Button */}
                <div className="mt-4 flex justify-end">
                  <button
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                    onClick={() => {
                      if (!patientData) {
                        alert("Patient data not loaded yet!");
                        return;
                      }

                      const fromName = "Consult Homeopathy";
                      const fromPhone = "+919876543210";
                      const toName = patientData.name;
                      const toPhone = patientData.phone;
                      const toAddress = patientData.currentLocation;

                      const printWindow = window.open("", "_blank");

                      printWindow.document.write(`
                        <html>
                          <head>
                            <title>Shipping Label</title>
                            <style>
                              @page { size: 6in 4in; margin: 0; }
                              body { font-family: Arial, sans-serif; padding: 20px; margin:0; width: 6in; height: 4in; }
                              .container { display: flex; flex-direction: column; justify-content: space-between; height: 100%; }
                              .from, .to { border: 1px solid #000; padding: 10px; }
                              .label-title { font-weight: bold; margin-bottom: 5px; }
                              .address-line { margin: 2px 0; }
                            </style>
                          </head>
                          <body>
                            <div class="container">
                              <div class="from">
                                <div class="label-title">From:</div>
                                <div class="address-line">${fromName}</div>
                                <div class="address-line">Phone: ${fromPhone}</div>
                                <div class="address-line">Consult Homeopathy Clinic</div>
                              </div>
                              <div class="to">
                                <div class="label-title">To:</div>
                                <div class="address-line">${toName}</div>
                                <div class="address-line">Phone: ${toPhone}</div>
                                <div class="address-line">${toAddress}</div>
                              </div>
                            </div>
                          </body>
                        </html>
                      `);

                      printWindow.document.close();
                      printWindow.focus();
                      printWindow.print();
                      printWindow.close();
                    }}
                  >
                    Print Shipping Label
                  </button>
                </div>
              </>
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
            style={{ width: '380px', height: '2px', margin: '0 1rem', marginTop: '-25px' }}
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
            style={{ width: '380px', height: '2px', margin: '0 1rem', marginTop: '-25px' }}
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