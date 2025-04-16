import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { IoIosArrowBack, IoIosAdd, IoMdTrash, IoIosSave } from "react-icons/io";
import { FaSpinner, FaExclamationTriangle } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import config from "../../config";

// Auth helper to check token
const checkAuth = () => {
  const token = localStorage.getItem('token');
  return !!token;
};
// console.log("token", localStorage.getItem('token'));
// console.log("access token",localStorage.getItem('accessToken'));
// Create axios instance with auth headers
const createAuthAxios = () => {
  const accessToken = localStorage.getItem('token');
  console.log(accessToken);
  return axios.create({
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
};

const PrescriptionWriting = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { patientData } = location.state || {};
  const API_URL = config.API_URL;

  // State for all form data
  const [medicines, setMedicines] = useState([]);
  const [rawMaterials, setRawMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchRawTerm, setSearchRawTerm] = useState("");
  
  // Prescription details
  const [prescriptionData, setPrescriptionData] = useState({
    patientId: patientData?._id || "",
    prescriptionItems: [
      { 
        id: 1, 
        medicineName: "", 
        rawMaterials: [], 
        preparationSteps: "", 
        form: "Tablets", 
        uom: "Graam", 
        quantity: 0, 
        frequency: "",
        Duration: "" ,
        totalPrice: 0
      },
      { 
        id: 2, 
        medicineName: "", 
        rawMaterials: [], 
        preparationSteps: "", 
        form: "Tablets", 
        uom: "Graam", 
        quantity: 0, 
        frequency: "",
        Duration: "", 
        totalPrice: 0
      },
      { 
        id: 3, 
        medicineName: "", 
        rawMaterials: [], 
        preparationSteps: "", 
        form: "Tablets", 
        uom: "Graam", 
        quantity: 0, 
        frequency: "",
        Duration: "", 
        totalPrice: 0
      }
    ],
    followUpDays: 10,
    medicineCharges: 0,
    shippingCharges: 0,
    notes: ""
  });

  // Check authentication on component load
  useEffect(() => {
    if (!checkAuth()) {
      toast.error("Please login to access this page");
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    
    if (!patientData || !patientData._id) {
      toast.error("Patient data is missing");
      navigate('/doctor-dashboard');
      return;
    }
    
    fetchData();
  }, [API_URL, navigate, location.pathname, patientData]);

  // Fetch medicines and raw materials
  const fetchData = async () => {
    try {
      setLoading(true);
      const authAxios = createAuthAxios();
      
      const [medicinesRes, rawMaterialsRes] = await Promise.all([
        authAxios.get(`http://${API_URL}:5000/api/prescription/medicines`),
        authAxios.get(`http://${API_URL}:5000/api/prescription/rawMaterials`)
      ]);
      
      setMedicines(medicinesRes.data);
      setRawMaterials(rawMaterialsRes.data);
    } catch (err) {
      console.error("Error fetching data:", err);
      if (err.response?.status === 401) {
        toast.error("Session expired. Please login again");
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setError("Failed to load prescription data. Please try again.");
        toast.error("Failed to load prescription data");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRawMaterialSelection = (itemId, rawMaterialId, isChecked) => {
    setPrescriptionData(prev => {
      const updatedItems = prev.prescriptionItems.map(item => {
        if (item.id === itemId) {
          let updatedRawMaterials = [...item.rawMaterials];
          const rawMaterial = rawMaterials.find(rm => rm._id === rawMaterialId);
          
          if (isChecked) {
            // Add raw material if it doesn't exist
            if (!updatedRawMaterials.some(rm => rm._id === rawMaterialId)) {
              updatedRawMaterials.push({
                _id: rawMaterialId,
                name: rawMaterial.name,
                quantity: 1,
                unit: rawMaterial.unit,
                pricePerUnit: rawMaterial.costPerUnit,
                totalPrice: rawMaterial.costPerUnit
              });
            }
          } else {
            // Remove raw material
            updatedRawMaterials = updatedRawMaterials.filter(rm => rm._id !== rawMaterialId);
          }
          
          // Calculate total price for this item
          const totalPrice = updatedRawMaterials.reduce((sum, rm) => sum + rm.totalPrice, 0);
          
          return { ...item, rawMaterials: updatedRawMaterials, totalPrice };
        }
        return item;
      });
      
      // Calculate total medicine charges
      const totalMedicineCharges = updatedItems.reduce((sum, item) => sum + item.totalPrice, 0);
      
      return {
        ...prev,
        prescriptionItems: updatedItems,
        medicineCharges: totalMedicineCharges
      };
    });
  };

  const updateRawMaterialQuantity = (itemId, rawMaterialId, quantity) => {
    setPrescriptionData(prev => {
      const updatedItems = prev.prescriptionItems.map(item => {
        if (item.id === itemId) {
          const updatedRawMaterials = item.rawMaterials.map(rm => {
            if (rm._id === rawMaterialId) {
              const parsedQuantity = parseFloat(quantity) || 0;
              const totalPrice = parsedQuantity * rm.pricePerUnit;
              return { ...rm, quantity: parsedQuantity, totalPrice };
            }
            return rm;
          });
          
          // Calculate total price for this item
          const totalPrice = updatedRawMaterials.reduce((sum, rm) => sum + rm.totalPrice, 0);
          
          return { ...item, rawMaterials: updatedRawMaterials, totalPrice };
        }
        return item;
      });
      
      // Calculate total medicine charges
      const totalMedicineCharges = updatedItems.reduce((sum, item) => sum + item.totalPrice, 0);
      
      return {
        ...prev,
        prescriptionItems: updatedItems,
        medicineCharges: totalMedicineCharges
      };
    });
  };
  
  

  // const fetchData = async () => {
  //   try {
  //     const token = localStorage.getItem('accessToken');
  //     console.log(token);
  //     const [medicinesRes, rawMaterialsRes] = await Promise.all([
  //       axios.get(`http://${API_URL}:5000/api/prescription/medicines`,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       }
  //       ),
  //       axios.get(`http://${API_URL}:5000/api/prescription/rawMaterials`,
  //         {
  //           headers: {
  //             Authorization: `Bearer ${"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7InBob25lIjoiKzkxOTA5MjU1NjYxNyIsInVzZXJUeXBlIjoiRG9jdG9yIn0sImlhdCI6MTc0NDQzNTUyNiwiZXhwIjoxNzQ0NTIxOTI2fQ.ikAP3siWTm1A457pZKlYAgMbQ4xPrZWStvh8ZPSR3No"}`,
  //           },
  //         }
  //       )
  //     ]);
  
  //     setMedicines(medicinesRes.data);
  //     setRawMaterials(rawMaterialsRes.data);
  //   } catch (error) {
  //     console.error('Error fetching data:', error);
  //   }
  // };

  // Handle adding a new medicine to the database
  const handleAddNewMedicine = async (medicineName) => {
    try {
      const authAxios = createAuthAxios();
      const response = await authAxios.post(`http://${API_URL}:5000/api/prescription/medicines`, {
        name: medicineName
      });
      setMedicines([...medicines, response.data]);
      toast.success(`Added new medicine: ${medicineName}`);
      return response.data;
    } catch (err) {
      console.error("Error adding new medicine:", err);
      
      if (err.response?.status === 401) {
        toast.error("Session expired. Please login again");
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        toast.error("Failed to add new medicine");
        setError("Failed to add new medicine. Please try again.");
      }
      return null;
    }
  };

  // Handle adding a new raw material to the database
  const handleAddNewRawMaterial = async (rawMaterialName) => {
    try {
      const authAxios = createAuthAxios();
      const response = await authAxios.post(`http://${API_URL}:5000/api/prescription/rawMaterials`, {
        name: rawMaterialName
      });
      setRawMaterials([...rawMaterials, response.data]);
      toast.success(`Added new raw material: ${rawMaterialName}`);
      return response.data;
    } catch (err) {
      console.error("Error adding new raw material:", err);
      
      if (err.response?.status === 401) {
        toast.error("Session expired. Please login again");
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        toast.error("Failed to add new raw material");
        setError("Failed to add new raw material. Please try again.");
      }
      return null;
    }
  };

  // Handle updates to prescription items
  const handleItemChange = (id, field, value) => {
    setPrescriptionData(prev => ({
      ...prev,
      prescriptionItems: prev.prescriptionItems.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
  };

  // Handle general form field changes
  const handleChange = (field, value) => {
    setPrescriptionData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Add a new row to the prescription
  const addNewRow = () => {
    const newId = prescriptionData.prescriptionItems.length > 0 
      ? Math.max(...prescriptionData.prescriptionItems.map(item => item.id)) + 1 
      : 1;
    
    setPrescriptionData(prev => ({
      ...prev,
      prescriptionItems: [
        ...prev.prescriptionItems,
        { 
          id: newId, 
          medicineName: "", 
          rawMaterialName: "", 
          preparationSteps: "", 
          form: "Tablets", 
          uom: "Graam", 
          quantity: 0, 
          frequency: "",
          Duration: "" 
        }
      ]
    }));
  };

  // Remove a row from the prescription
  const removeRow = (id) => {
    if (prescriptionData.prescriptionItems.length <= 1) {
      toast.warning("Cannot remove the last row. At least one medicine is required.");
      setError("Cannot remove the last row. At least one medicine is required.");
      return;
    }
    
    setPrescriptionData(prev => ({
      ...prev,
      prescriptionItems: prev.prescriptionItems.filter(item => item.id !== id)
    }));
    
    toast.info("Prescription item removed");
  };

  // Validate prescription data before saving
  const validatePrescription = () => {
    const emptyItems = prescriptionData.prescriptionItems.filter(
      item => !item.medicineName || item.medicineName === 'new'
    );
    
    if (emptyItems.length > 0) {
      toast.warning("Please fill in all medicine names");
      return false;
    }
    
    const itemsWithoutRawMaterials = prescriptionData.prescriptionItems.filter(
      item => item.rawMaterials.length === 0
    );
    
    if (itemsWithoutRawMaterials.length > 0) {
      toast.warning("Each medicine must have at least one raw material selected");
      return false;
    }
    
    return true;
  };

  // Save the prescription
  const savePrescription = async () => {
    if (!validatePrescription()) return;
    
    try {
      setSaving(true);
      const authAxios = createAuthAxios();
      
      // Format prescription data for API
      const formattedData = {
        ...prescriptionData,
        patientId: patientData._id,
        doctorId: localStorage.getItem('userId'),
        appointmentId: patientData.medicalDetails?._id,
        // Format prescription items for the backend schema
        prescriptionItems: prescriptionData.prescriptionItems.map(item => ({
          medicineName: item.medicineName,
          rawMaterialDetails: item.rawMaterials,
          preparationSteps: item.preparationSteps,
          form: item.form,
          uom: item.uom,
          frequency: item.frequency,
          Duration: item.Duration,
          totalPrice: item.totalPrice
        }))
      };
      
      const response = await authAxios.post(`http://${API_URL}:5000/api/prescription/create`, formattedData);
      
      toast.success("Prescription saved successfully!");
      setTimeout(() => navigate('/doctor-dashboard'), 1500);
    } catch (err) {
      console.error("Error saving prescription:", err);
      
      if (err.response?.status === 401) {
        toast.error("Session expired. Please login again");
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        toast.error("Failed to save prescription");
        setError("Failed to save prescription. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  // Filter medicines based on search term
  const filteredMedicines = medicines.filter(med => 
    med.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter raw materials based on search term
  const filteredRawMaterials = rawMaterials.filter(material => 
    material.name.toLowerCase().includes(searchRawTerm.toLowerCase())
  );

  // Calculate total charges
  const totalCharges = prescriptionData.medicineCharges + prescriptionData.shippingCharges;

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-50">
        <FaSpinner className="animate-spin text-blue-600 text-4xl mb-4" />
        <p className="text-lg text-gray-700 font-medium">Loading prescription data...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-9xl bg-gray-50 min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} />
      
      {/* Header with back button */}
      <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center">
          <button 
            onClick={() => navigate(-1)}
            className="mr-4 text-gray-600 hover:text-gray-900 transition duration-150"
            aria-label="Go back"
          >
            <IoIosArrowBack size={24} />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Write Prescription</h1>
        </div>
        <div>
          <button
            onClick={savePrescription}
            disabled={saving}
            className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md shadow-sm disabled:bg-blue-300 transition duration-150"
          >
            {saving ? <FaSpinner className="animate-spin mr-2" /> : <IoIosSave className="mr-2" />}
            {saving ? "Saving..." : "Save Prescription"}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 flex items-center rounded-md" role="alert">
          <FaExclamationTriangle className="mr-2 text-red-500" />
          <p>{error}</p>
        </div>
      )}

      {/* Patient Details Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
          <span className="w-1 h-6 bg-blue-500 rounded mr-2"></span>
          Patient Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-3 rounded-md">
            <p className="text-sm text-gray-500">Patient Name</p>
            <p className="font-medium text-gray-800">{patientData?.name || 'N/A'}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-md">
            <p className="text-sm text-gray-500">Phone Number</p>
            <p className="font-medium text-gray-800">{patientData?.phone || 'N/A'}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-md">
            <p className="text-sm text-gray-500">Age</p>
            <p className="font-medium text-gray-800">{patientData?.age || 'N/A'}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-md">
            <p className="text-sm text-gray-500">Gender</p>
            <p className="font-medium text-gray-800">{patientData?.gender || 'N/A'}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-md">
            <p className="text-sm text-gray-500">Follow Type</p>
            <p className="font-medium text-gray-800">{patientData?.follow || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Draft Section */}
      {patientData?.medicalDetails?.drafts && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
            <span className="w-1 h-6 bg-yellow-500 rounded mr-2"></span>
            Draft Notes
          </h2>
          <div className="bg-gray-50 p-4 rounded-lg text-gray-700 whitespace-pre-wrap border-l-4 border-yellow-400">
            {patientData.medicalDetails.drafts}
          </div>
        </div>
      )}

      {/* Prescription Table */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-6 overflow-x-auto">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
          <span className="w-1.5 h-8 bg-green-500 rounded mr-3"></span>
          Prescription Details
        </h2>
        
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">S.No</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medicine Name</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Raw Material</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Raw Material Quantities
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price (₹)
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preparation Steps</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Form</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">UOM</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Frequency</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {prescriptionData.prescriptionItems.map((item, index) => (
              <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{index + 1}</td>
                <td className="px-4 py-4 min-w-[220px]">
                  <div className="space-y-2">
                    <div>
                      <input
                        type="text"
                        placeholder="Search medicines..."
                        className="block w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 py-2 px-3"
                        value={item.id === index + 1 ? searchTerm : ''}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <select
                      className="block w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 py-2 px-3"
                      value={item.medicineName}
                      onChange={(e) => handleItemChange(item.id, 'medicineName', e.target.value)}
                    >
                      <option value="">Select Medicine</option>
                      {filteredMedicines.map(med => (
                        <option key={med._id} value={med.name}>{med.name}</option>
                      ))}
                      <option value="new">+ Add New Medicine</option>
                    </select>
                    {item.medicineName === 'new' && (
                      <input
                        type="text"
                        placeholder="Type new medicine name"
                        className="block w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 py-2 px-3"
                        onBlur={(e) => {
                          if (e.target.value) {
                            handleAddNewMedicine(e.target.value).then(newMed => {
                              if (newMed) {
                                handleItemChange(item.id, 'medicineName', newMed.name);
                              }
                            });
                          }
                        }}
                      />
                    )}
                  </div>
                </td>

                <td className="px-4 py-4 min-w-[220px]">
                  <div className="space-y-2">
                    <div>
                      <input
                        type="text"
                        placeholder="Search raw materials..."
                        className="block w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 py-2 px-3"
                        value={item.id === index + 1 ? searchRawTerm : ''}
                        onChange={(e) => setSearchRawTerm(e.target.value)}
                      />
                    </div>
                    <div className="max-h-40 overflow-y-auto border rounded-md p-3">
                      {filteredRawMaterials.map(material => (
                        <div key={material._id} className="flex items-center mb-2">
                          <input
                            type="checkbox"
                            id={`raw-${item.id}-${material._id}`}
                            className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            checked={item.rawMaterials.some(rm => rm._id === material._id)}
                            onChange={(e) => handleRawMaterialSelection(item.id, material._id, e.target.checked)}
                          />
                          <label htmlFor={`raw-${item.id}-${material._id}`} className="text-sm text-gray-700">
                            {material.name}
                          </label>
                        </div>
                      ))}
                      {filteredRawMaterials.length === 0 && (
                        <p className="text-sm text-gray-500 italic py-2">No matching raw materials</p>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        const newName = prompt("Enter new raw material name:");
                        if (newName) {
                          handleAddNewRawMaterial(newName);
                        }
                      }}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center"
                    >
                      <IoIosAdd className="mr-1" size={16} />
                      Add New Raw Material
                    </button>
                  </div>
                </td>

                {/* Raw Material Quantities - Improved */}
                <td className="px-4 py-4 min-w-[220px]">
                  {item.rawMaterials.length > 0 ? (
                    <div className="space-y-3">
                      {item.rawMaterials.map(rm => (
                        <div key={rm._id} className="flex items-center space-x-2">
                          <span className="text-sm font-medium w-2/5 truncate">{rm.name}:</span>
                          <div className="flex flex-1 items-center space-x-2">
                            <input
                              type="number"
                              className="block w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 py-2 px-3"
                              value={rm.quantity}
                              onChange={(e) => updateRawMaterialQuantity(item.id, rm._id, e.target.value)}
                              min="0.1"
                              step="0.1"
                            />
                            <span className="text-sm text-gray-600 w-10">{rm.unit}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500 italic">No raw materials selected</span>
                  )}
                </td>

                {/* Price - Improved layout */}
                <td className="px-4 py-4 min-w-[180px]">
                  <div className="space-y-3">
                    {item.rawMaterials.map(rm => (
                      <div key={rm._id} className="flex justify-between">
                        <span className="text-sm font-medium">{rm.name}:</span>
                        <span className="text-sm">₹{rm.totalPrice.toFixed(2)}</span>
                      </div>
                    ))}
                    {item.rawMaterials.length > 0 && (
                      <div className="flex justify-between pt-2 border-t mt-2">
                        <span className="text-sm font-semibold">Total:</span>
                        <span className="text-sm font-semibold">₹{item.totalPrice.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                </td>

                {/* Preparation Steps - Improved */}
                <td className="px-4 py-4 min-w-[220px]">
                  <textarea
                    className="block w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 py-2 px-3"
                    rows="3"
                    value={item.preparationSteps}
                    onChange={(e) => handleItemChange(item.id, 'preparationSteps', e.target.value)}
                    placeholder="Preparation instructions..."
                  ></textarea>
                </td>
                
                {/* Form - Improved */}
                <td className="px-4 py-4 min-w-[140px]">
                  <select
                    className="block w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 py-2 px-3"
                    value={item.form}
                    onChange={(e) => handleItemChange(item.id, 'form', e.target.value)}
                  >
                    <option value="Tablets">Tablets</option>
                    <option value="Pills">Pills</option>
                    <option value="Liquid form">Liquid form</option>
                  </select>
                </td>
                
                {/* UOM - Improved */}
                <td className="px-4 py-4 min-w-[140px]">
                  <select
                    className="block w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 py-2 px-3"
                    value={item.uom}
                    onChange={(e) => handleItemChange(item.id, 'uom', e.target.value)}
                  >
                    <option value="Graam">Graam</option>
                    <option value="Dram">Dram</option>
                    <option value="ML">ML</option>
                    <option value="Pieces">Pieces</option>
                  </select>
                </td>
                
                {/* Frequency - Improved */}
                <td className="px-4 py-4 min-w-[160px]">
                  <input
                    type="text"
                    className="block w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 py-2 px-3"
                    value={item.frequency}
                    onChange={(e) => handleItemChange(item.id, 'frequency', e.target.value)}
                    placeholder="e.g. every 45mins"
                  />
                </td>
                
                {/* Duration - Improved */}
                <td className="px-4 py-4 min-w-[160px]">
                  <input
                    type="text"
                    className="block w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 py-2 px-3"
                    value={item.Duration}
                    onChange={(e) => handleItemChange(item.id, 'Duration', e.target.value)}
                    placeholder="e.g. 1-0-1 for 7 days"
                  />
                </td>
                
                {/* Actions - Improved */}
                <td className="px-4 py-4 text-center">
                  <button 
                    onClick={() => removeRow(item.id)}
                    className="text-red-600 hover:text-red-900 transition-colors duration-150 p-2 rounded-full hover:bg-red-100"
                    aria-label="Remove item"
                  >
                    <IoMdTrash size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div className="mt-6">
          <button
            type="button"
            onClick={addNewRow}
            className="inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm transition duration-150"
          >
            <IoIosAdd className="mr-2" size={20} />
            Add Medicine
          </button>
        </div>
      </div>

      {/* Additional Details Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
          <span className="w-1 h-6 bg-purple-500 rounded mr-2"></span>
          Additional Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Follow Up (Days)
            </label>
            <input
              type="number"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
              value={prescriptionData.followUpDays}
              onChange={(e) => handleChange('followUpDays', parseInt(e.target.value) || 0)}
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Medicine Charges (₹)
            </label>
            <div className="flex items-center">
              <input
                type="text"
                className="block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                value={prescriptionData.medicineCharges.toFixed(2)}
                readOnly
              />
              <span className="ml-2 text-sm text-gray-500">Auto-calculated</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Shipping Charges (₹)
            </label>
            <input
              type="number"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
              value={prescriptionData.shippingCharges}
              onChange={(e) => handleChange('shippingCharges', parseInt(e.target.value) || 0)}
              min="0"
            />
          </div>
        </div>
        
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Additional Notes
          </label>
          <textarea
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
            rows="4"
            value={prescriptionData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="Any additional notes or instructions..."
          ></textarea>
        </div>
        
        {/* Total charges summary */}
        <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-gray-700 font-medium">Total Charges:</span>
            <span className="text-xl font-bold text-blue-700">₹{totalCharges}</span>
          </div>
        </div>
      </div>
      
      {/* Bottom action bar - fixed at bottom for easy access */}
      <div className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-lg border-t border-gray-200 flex justify-between items-center">
        <button 
          onClick={() => navigate(-1)}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <div className="flex space-x-4">
          <button
            onClick={savePrescription}
            disabled={saving}
            className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md shadow-sm disabled:bg-blue-300 transition duration-150"
          >
            {saving ? <FaSpinner className="animate-spin mr-2" /> : <IoIosSave className="mr-2" />}
            {saving ? "Saving..." : "Save Prescription"}
          </button>
        </div>
      </div>
      
      {/* Add padding at bottom to account for fixed bottom bar */}
      <div className="h-20"></div>
    </div>
  );
};

// Higher-order component for protected routes
export const withAuth = (Component) => {
  return (props) => {
    const navigate = useNavigate();
    const location = useLocation();
    
    useEffect(() => {
      const checkAuthentication = () => {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login', { state: { from: location.pathname } });
        }
      };
      
      checkAuthentication();
    }, [navigate, location.pathname]);
    
    return <Component {...props} />;
  };
};

export default withAuth(PrescriptionWriting);