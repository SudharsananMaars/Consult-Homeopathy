import React, { useState, useEffect, useRef } from "react";
import { FaArrowLeft, FaPlus, FaMinus, FaTrash, FaShoppingCart, FaCheck, FaExclamationTriangle } from "react-icons/fa";
import moment from "moment";
import config from "../../config";
import { useParams, useNavigate } from "react-router-dom";

const MedicinePreparationView = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [prescription, setPrescription] = useState(null);
  const [appointment, setAppointment] = useState(null);
  const [rawMaterials, setRawMaterials] = useState([]);
  const [init, setInit] = useState(null);
  const [summaryList, setSummaryList] = useState([]);
  const recordingTimerRef = useRef(null); 
  const [fullyUpdatedMaterials, setFullyUpdatedMaterials] = useState([]);
  const [isPostWeightPhase, setIsPostWeightPhase] = useState(false);
  const [packagingBottles, setPackagingBottles] = useState([]);
  const [preWeight, setPreWeight] = useState('');
  const [preparedMedicineIds, setPreparedMedicineIds] = useState([]);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordingStream, setRecordingStream] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const recordedChunksRef = useRef([]);
  const [cart, setCart] = useState([]);
  const [verifiedMaterials, setVerifiedMaterials] = useState([]);
  const [step, setStep] = useState(1); // 1: Select Medicine, 2: Add Raw Materials, 3: Confirm
  const [preparing, setPreparing] = useState(false);
  const [loadingRawMaterials, setLoadingRawMaterials] = useState(false);
  const [showBarcodeModal, setShowBarcodeModal] = useState(false);
  const [scanningMaterial, setScanningMaterial] = useState(null); // for which material is being scanned
  const [enteredBarcode, setEnteredBarcode] = useState("");
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updatingMaterial, setUpdatingMaterial] = useState(null);
  const [checkbox1, setCheckbox1] = useState(false);
  const [checkbox2, setCheckbox2] = useState(false);
  const [rawMaterialsConfirmed, setRawMaterialsConfirmed] = useState(false); 
  const [individualRawMaterialChecks, setIndividualRawMaterialChecks] = useState({}); 
  const [step3Check1, setStep3Check1] = useState(false);
  const [step3Check2, setStep3Check2] = useState(false);
  const navigate = useNavigate();
  const API_URL = config.API_URL;
  const { appointmentId } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        // Fetch appointment details
        const appointmentResponse = await fetch(`${API_URL}/api/patient/appointment/${appointmentId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!appointmentResponse.ok) {
          throw new Error('Failed to fetch appointment details');
        }
        const appointmentData = await appointmentResponse.json();
        setAppointment(appointmentData);
        
        // Fetch prescription
        const prescriptionResponse = await fetch(`${API_URL}/api/prescription/appointment/${appointmentId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!prescriptionResponse.ok) {
          throw new Error('Failed to fetch prescription');
        }
        const prescriptionData = await prescriptionResponse.json();
        setPrescription(prescriptionData);
        // Sync cart if prescription already has rawMaterialDetails
        if (prescriptionData.prescriptionItems && selectedMedicine) {
          const selectedPrescriptionItem = prescriptionData.prescriptionItems.find(
            item => item.medicineName === selectedMedicine
          );
          if (selectedPrescriptionItem) {
            setCart(selectedPrescriptionItem.rawMaterialDetails || []);
          } else {
            setCart([]);
          }
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message || "Failed to fetch data");
        setLoading(false);
      }
    };
    fetchData();
    // eslint-disable-next-line
  }, [appointmentId, API_URL]);

  useEffect(() => {
  if (step === 3) {
    const token = localStorage.getItem("token");

    const fetchSummary = async () => {
      try {
        const res = await fetch(`${API_URL}/api/medicine-summary/summary`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ prescriptionId: prescription._id }) 
        });

        if (!res.ok) {
          throw new Error("Failed to fetch summary");
        }

        const data = await res.json();
        setSummaryList(data);
      } catch (err) {
        console.error("Failed to fetch summary:", err);
      }
    };

    fetchSummary();
  }
}, [step, prescription?._id]);


const allPrepared = prescription?.prescriptionItems?.every(item => preparedMedicineIds.includes(item._id));


  // Function to fetch raw materials based on selected medicine
  const fetchRawMaterialsForMedicine = async (medicineName) => {
    try {
      setLoadingRawMaterials(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/prescription/${prescription._id}/prepare`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          medicineName: medicineName 
        })
      });
      if (!response.ok) {
        throw new Error('Failed to fetch raw materials for medicine');
      }
      const rawMaterialsData = await response.json();
      setInit(rawMaterialsData);
      setRawMaterials(rawMaterialsData.rawMaterials);
      setLoadingRawMaterials(false);
    } catch (err) {
      console.error("Error fetching raw materials:", err);
      setError(err.message || "Failed to fetch raw materials");
      setLoadingRawMaterials(false);
    }
  };

  useEffect(() => {
  const fetchPackagingBottles = async () => {
    if (!init?.dispenseQuantity) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/medicine-summary/dispense-check?quantity=${init.dispenseQuantity}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch packaging bottles.");
      }

      const data = await response.json(); 
      setPackagingBottles([data.rawMaterial]); 
    } catch (error) {
      console.error("Error fetching packaging bottles:", error);
    }
  };

  fetchPackagingBottles();
}, [init?.dispenseQuantity]);


  const handleSelectMedicine = async (medicine) => {
    if (!isRecording) {
    await startRecording();
  }
    setSelectedMedicine(medicine);
    setStep(2);
    setCart([]);
    // Fetch raw materials for the selected medicine
    if (prescription && medicine.medicineName) {
      await fetchRawMaterialsForMedicine(medicine.medicineName);
    }
  };

  const handleScanClick = (material) => {
  setScanningMaterial(material);
  setEnteredBarcode(""); // Reset previous input
  setShowBarcodeModal(true);
};

const handlePrepare = async () => {
  // Stop recording
  const videoBlob = await stopRecording(); // Ensure this returns the blob

  console.log(prescription._id);

  // Upload video to backend
  if (videoBlob && prescription && selectedMedicine) {
    const formData = new FormData();
    formData.append("prescriptionId", prescription._id);
    formData.append("medicineName", selectedMedicine.medicineName);
    formData.append("video", videoBlob, `${selectedMedicine.medicineName}.webm`);

    try {
      const res = await fetch(`${API_URL}/api/medicine-summary/upload-preparation-video`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        console.error("Video upload failed.");
      } else {
        console.log("Video uploaded successfully.");
      }
    } catch (err) {
      console.error("Error uploading video:", err);
    }
  }

  // Continue with prepare logic
  const newPrepared = [...preparedMedicineIds, selectedMedicine._id];
  setPreparedMedicineIds(newPrepared);

  setStep(1);
  setSelectedMedicine(null);
  setCart([]);
  setRawMaterials([]);

  const remainingItems = prescription.prescriptionItems.filter(
    item => !newPrepared.includes(item._id)
  );

  if (remainingItems.length === 0) {
    alert("All medicines prepared!");
    return;
  }

  alert("Medicine prepared! Continue with the next.");
};


  const startRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    const recorder = new MediaRecorder(stream);


    recordedChunksRef.current = [];


    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunksRef.current.push(event.data); 
        console.log("Video data chunk pushed");
      }
    };

    recorder.start();
    setMediaRecorder(recorder);
    setRecordingStream(stream);
    setIsRecording(true);
    setRecordingTime(0);


    // ✅ Clean up existing timer
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
    }

    recordingTimerRef.current = setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);

    recorder.onstop = () => {
      setIsRecording(false);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
      setRecordingTime(0);
    };

  } catch (err) {
    console.error("Failed to start recording:", err);
    alert("Camera + mic access is needed to record.");
  }
};



const stopRecording = () => {
  return new Promise((resolve, reject) => {
    if (mediaRecorder) {
      mediaRecorder.onstop = () => {
        const videoBlob = new Blob(recordedChunksRef.current, { type: "video/webm" });
        recordedChunksRef.current = []; // Clear chunks
        console.log("🛑 Recording stopped and blob created");
        resolve(videoBlob);
      };
      mediaRecorder.stop();
      setIsRecording(false);
    } else {
      reject("No media recorder found.");
    }

    if (recordingStream) {
      recordingStream.getTracks().forEach(track => track.stop());
    }

    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
  });
};



  const isExpiryWarning = (expiryDate) => {
    const expiry = moment(expiryDate);
    const today = moment();
    const daysToExpiry = expiry.diff(today, 'days');
    return daysToExpiry < 30;
  };

  const isLowStock = (current, total) => {
    return (current / total) < 0.2; // Less than 20% remaining
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
        {error}
      </div>
    );
  }

  return (
    <div className="p-4 max-w-6xl mx-auto bg-white rounded-lg shadow">
      {/* Header with back button */}
      <div className="flex justify-between items-center mb-6">
        {step > 1 ? (
          <button
            onClick={() => setStep(step - 1)}
            className="flex items-center text-blue-600 hover:text-blue-800 transition duration-300"
          >
            <FaArrowLeft className="mr-2" /> Back
          </button>
        ) : (
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-blue-600 hover:text-blue-800 transition duration-300"
          >
            <FaArrowLeft className="mr-2" /> Back to Dashboard
          </button>
        )}
        
        <h1 className="text-2xl font-bold text-gray-800">Medicine Preparation</h1>

        {isRecording && (
          <div className="flex items-center gap-2 text-red-600 font-semibold text-sm mb-4">
            <span className="h-3 w-3 bg-red-600 rounded-full animate-pulse"></span>
            <span>REC {Math.floor(recordingTime / 60)}:{String(recordingTime % 60).padStart(2, '0')}</span>
            </div>
          )}

        <div className="w-24">
          {/* Empty div for spacing */}
        </div>
      </div>
      
      {/* Stepper */}
      <div className="mb-8">
        <div className="flex items-center justify-center">
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>
            1
          </div>
          <div className={`flex-1 h-1 mx-2 ${step > 1 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>
            2
          </div>
          <div className={`flex-1 h-1 mx-2 ${step > 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>
            3
          </div>
        </div>
        <div className="flex justify-between text-sm mt-2">
          <div className="text-center w-24">Select Medicine</div>
          <div className="text-center w-32">Add Raw Materials</div>
          <div className="text-center w-24">Confirm & Prepare</div>
        </div>
      </div>
      
      <div className="grid grid-cols-12 gap-6">
        {/* Left panel - Prescription view */}
<div className="col-span-12 lg:col-span-4">
  <div className="bg-gray-50 p-4 rounded-lg shadow-sm mb-6">
    <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Prescription Details</h2>

    {prescription && (
      <div className="text-sm">
        {/* Patient Info */}
        <div className="mb-4">
          <p className="font-medium">Patient: {prescription.patientName}</p>
          <p className="text-gray-600">Date: {moment(prescription.createdAt).format("MMM DD, YYYY")}</p>
        </div>

        {/* Doctor Info */}
        <div className="mb-4">
          <p className="font-medium">Doctor: Dr. {prescription.doctorName}</p>
          <p className="text-gray-600">{prescription.doctorSpecialty || "Specialist"}</p>
        </div>

        {/* STEP 1: Final Checkboxes */}
        {step === 1 && allPrepared && (
          <div className="mt-6 space-y-3 border-t pt-4">
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="confirm-prepared"
                checked={checkbox1}
                onChange={() => setCheckbox1(prev => !prev)}
                className="mt-1"
              />
              <label htmlFor="confirm-prepared" className="text-gray-700">
                Have you prepared all the medicines?
              </label>
            </div>

            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="confirm-quantity"
                checked={checkbox2}
                onChange={() => setCheckbox2(prev => !prev)}
                className="mt-1"
              />
              <label htmlFor="confirm-quantity" className="text-gray-700">
                Have you ensured the quantity matches the prescription?
              </label>
            </div>
          </div>
        )}

        {/* STEP 2: Raw Material Checkboxes */}
        {step === 2 && (
          <div className="mt-6 space-y-3 border-t pt-4">
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="all-raw-materials"
                checked={rawMaterialsConfirmed}
                onChange={() => setRawMaterialsConfirmed(prev => !prev)}
                className="mt-1"
              />
              <label htmlFor="all-raw-materials" className="text-gray-700">
                Have you taken all the necessary raw materials?
              </label>
            </div>

            {rawMaterials.map((material) => (
              <div key={material.rawMaterialId} className="flex items-start gap-2 pl-4">
                <input
                  type="checkbox"
                  id={`rm-${material.rawMaterialId}`}
                  checked={individualRawMaterialChecks[material.rawMaterialId] || false}
                  onChange={() =>
                    setIndividualRawMaterialChecks(prev => ({
                      ...prev,
                      [material.rawMaterialId]: !prev[material.rawMaterialId],
                    }))
                  }
                  className="mt-1"
                />
                <label htmlFor={`rm-${material.rawMaterialId}`} className="text-gray-700">
                  Have you poured <strong>{material.name}</strong> in the correct quantity?
                </label>
              </div>
            ))}
          </div>
        )}

        {/* STEP 3: Wrap-Up Checkboxes */}
        {step === 3 && (
          <div className="mt-6 space-y-3 border-t pt-4">
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="prepared-using-raw-materials"
                checked={step3Check1}
                onChange={() => setStep3Check1(prev => !prev)}
                className="mt-1"
              />
              <label htmlFor="prepared-using-raw-materials" className="text-gray-700">
                Have you prepared the medicines using the raw materials?
              </label>
            </div>

            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="returned-raw-materials"
                checked={step3Check2}
                onChange={() => setStep3Check2(prev => !prev)}
                className="mt-1"
              />
              <label htmlFor="returned-raw-materials" className="text-gray-700">
                Have you returned the raw materials to their place?
              </label>
            </div>
          </div>
        )}
      </div>
    )}
  </div>
</div>



        
        {/* Right panel - Raw Materials / Cart */}
        <div className="col-span-12 lg:col-span-8">
          {step === 1 && (
  <div className="bg-white p-4 rounded-lg shadow-sm">
    <h2 className="text-xl font-semibold text-gray-800 mb-4">
      Select a Medicine to Prepare
    </h2>
    <p className="text-gray-600">
      Select a medicine from the prescription on the left to begin preparation.
    </p>

    <div>
      <p className="font-medium mb-2">Prescription Items:</p>
      {prescription?.prescriptionItems?.length > 0 ? (
        <div className="space-y-2">
          {prescription.prescriptionItems.map((item, index) => {
            const isSelected = selectedMedicine?._id === item._id;
            const isPrepared = preparedMedicineIds.includes(item._id);

            return (
              <div
                key={index}
                className={`p-3 border rounded ${
                  isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                } ${isPrepared ? 'bg-green-50 border-green-300' : ''}`}
              >
                <div className="flex justify-between items-center">
                  <p className="font-medium">{item.medicineName}</p>
                  {isPrepared && (
                    <span className="text-xs text-green-700 font-semibold px-2 py-0.5 bg-green-100 rounded">
                      Prepared
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 text-xs text-gray-600 mt-1">
                  <p>
  Raw Material:{" "}
  {item.rawMaterialDetails && item.rawMaterialDetails.length > 0
    ? item.rawMaterialDetails.map((rm) => rm.name).join(", ")
    : "N/A"}
</p>
                  <p>Form: {item.form}</p>
                  <p>UOM: {item.uom}</p>
                  <p>Quantity: {item.dispenseQuantity || "N/A"}</p>
                </div>

                {!isPrepared && (
                  <button
                    className="mt-2 w-full py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition"
                    onClick={() => handleSelectMedicine(item)}
                  >
                    Prepare this medicine
                  </button>
                )}
              </div>
            );
          })}

          {/* Show "Finish Preparing" button if all are prepared */}
          {prescription.prescriptionItems.every(item =>
            preparedMedicineIds.includes(item._id)
          ) && (
           <div className="pt-4 text-right">
  <button
    className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
    onClick={async () => {
      try {
        const token = localStorage.getItem("token");
        const prescriptionId = prescription._id; 

        const res = await fetch(`${API_URL}/api/medicine-summary/update-medicine-prepared`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            prescriptionId,
            medicinePrepared: true,
          }),
        });

        if (!res.ok) {
          throw new Error("Failed to update medicine prepared status");
        }

        // Navigate after successful update
        navigate("/medicinepackaging");
      } catch (error) {
        console.error(error);
        alert("Something went wrong while updating");
      }
    }}
  >
    Finish Preparing
  </button>
</div>

          )}
        </div>
      ) : (
        <p className="text-gray-500 italic">No prescription items available</p>
      )}
    </div>
  </div>
)}

          
          {step === 2 && (
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Add Raw Materials for: {selectedMedicine?.medicineName}
              </h2>
              
              {loadingRawMaterials ? (
                <div className="flex justify-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <span className="ml-2">Loading raw materials...</span>
                </div>
              ) : (
                <>
                  {/* Search box */}
                  {/*<div className="mb-4">
                    <input
                      type="text"
                      placeholder="Search raw materials..."
                      className="w-full p-2 border border-gray-300 rounded"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>*/}
                  
                  {/* Raw materials table */}
                  <div className="overflow-y-auto max-h-96 mb-4">
                    {rawMaterials.length > 0 ? (
                      <table className="min-w-full border-collapse">
                        <thead className="bg-gray-100 sticky top-0">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prescribed Quantity</th>
                            {/*<th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expires</th>*/}
                            <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                            <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Pre-Weight & Post-Weight</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {rawMaterials
                            .filter(material => material.name.toLowerCase().includes(searchTerm.toLowerCase()))
                            .map((material) => (
                              <tr key={material.rawMaterialId} className={`hover:bg-gray-50 ${isExpiryWarning(material.expiryDate) ? 'bg-red-50 border-l-4 border-red-400' : ''}`}>
                                <td className="px-4 py-2 whitespace-nowrap">
                                  <div className="flex items-center">
                                    {isExpiryWarning(material.expiryDate) && (
                                      <span className="mr-2 text-red-500 animate-pulse" title="Expires soon!">
                                        <FaExclamationTriangle />
                                      </span>
                                    )}
                                    <span className={isExpiryWarning(material.expiryDate) ? 'font-semibold text-red-700' : ''}>
                                      {material.name}
                                    </span>
                                    {isLowStock(material.currentQuantity, material.quantity) && (
                                      <span className="ml-2 text-yellow-500" title="Low stock">
                                        <FaExclamationTriangle />
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                  {material.category || "N/A"}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm">
                                  <span className={isLowStock(material.currentQuantity, material.quantity) ? "text-yellow-600" : "text-gray-700"}>
                                    {material.currentQuantity} / {material.packageSize || 'units'}
                                  </span>
                                </td>
                                 <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                  {material.prescribedQuantity || "N/A"}
                                </td>
                                {/*<td className="px-4 py-2 whitespace-nowrap text-sm">
                                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    isExpiryWarning(material.expiryDate) 
                                      ? 'bg-red-100 text-red-800 border border-red-200' 
                                      : 'text-gray-700'
                                  }`}>
                                    {moment(material.expiryDate).format("MMM DD, YYYY")}
                                    {isExpiryWarning(material.expiryDate) && (
                                      <span className="ml-1 font-bold">⚠️</span>
                                    )}
                                  </div>
                                </td>*/}
                               <td className="px-4 py-2 whitespace-nowrap text-center">
  {verifiedMaterials.includes(material.rawMaterialId) ? (
    <span className="text-green-600 font-semibold">Verified</span>
  ) : (
    <button 
      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm shadow-sm"
      onClick={() => handleScanClick(material)}
    >
      Scan
    </button>
  )}
</td>

<td className="px-4 py-2 whitespace-nowrap text-center">
  {verifiedMaterials.includes(material.rawMaterialId) && (
    fullyUpdatedMaterials.includes(material.rawMaterialId) ? (
      <span className="text-blue-600 font-semibold"> Updated</span>
    ) : (
      <button
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm shadow-sm"
        onClick={async () => {
          try {
            await fetch(`${API_URL}/api/medicine-summary/init`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(init),
            });

            setUpdatingMaterial(material);
            setShowUpdateModal(true);
          } catch (err) {
            console.error('Failed to prepare prescription item:', err);
            alert('Failed to update item. Please try again.');
          }
        }}
      >
        Update
      </button>
    )
  )}
</td>

                              </tr>
                            ))}
                        </tbody>
                      </table>
                    ) : (
                      <p className="text-gray-500 text-center py-8">No raw materials found for this medicine.</p>
                    )}
                  </div>
                  {/* Packaging Bottles Table Header */}
<div className="mt-8">
  <h3 className="text-lg font-semibold text-gray-800 mb-2">Packaging Bottles</h3>
  <div className="overflow-x-auto">
    <table className="min-w-full border-collapse">
      <thead className="bg-gray-100">
        <tr>
          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
  {packagingBottles.length > 0 ? (
    packagingBottles.map((bottle, idx) => (
      <tr key={idx} className="hover:bg-gray-50">
        <td className="px-4 py-2 whitespace-nowrap">{bottle.name || "N/A"}</td>
        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{bottle.category || "N/A"}</td>
        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
          {bottle.currentQuantity} / {bottle.quantity}
        </td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan="3" className="text-center text-gray-500 py-4">No packaging bottles found.</td>
    </tr>
  )}
</tbody>
    </table>
  </div>
</div>

                  
                  <div className="flex justify-end">
                    <button
                    onClick={() => setStep(3)}
                    className="px-6 py-2 rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Continue to Confirmation
                      </button>
                      </div>
                </>
              )}
            </div>
          )}
          
          {step === 3 && (
  <div className="bg-white p-4 rounded-lg shadow-sm">
    <h2 className="text-xl font-semibold text-gray-800 mb-4">Confirm & Prepare Medicine</h2>

    {/*<div className="bg-green-50 border border-green-200 p-4 rounded-md mb-6">
      <h3 className="font-medium text-green-800 mb-2">Medicine to Prepare:</h3>
      <p className="text-lg font-semibold">{selectedMedicine?.medicineName}</p>
      <div className="grid grid-cols-2 gap-2 mt-2 text-sm text-green-800">
        <p>Form: {selectedMedicine?.form}</p>
        <p>Frequency: {selectedMedicine?.frequency}</p>
        <p>Duration: {selectedMedicine?.duration}</p>
      </div>
    </div>*/}

    {summaryList.length > 0 && (
  <div className="bg-blue-50 border border-blue-200 p-4 rounded-md mb-6">
    {summaryList.map((item, index) => (
      <div key={index} className="mb-6">
        <p className="font-semibold text-blue-900 mb-2">Medicine: {item.medicineName}</p>
        
        <div className="space-y-2">
          {item.rawMaterials.map((rm, idx) => (
            <div
              key={idx}
              className="flex flex-wrap items-center gap-6 bg-white border border-blue-200 rounded-md px-4 py-2 shadow-sm"
            >
              <div>
                <span className="text-blue-600 font-semibold">Raw Material:</span>{" "}
                <span className="text-blue-900">{rm.materialName}</span>
              </div>
              <div>
                <span className="text-blue-600 font-semibold">Prescribed Quantity:</span>{" "}
                <span className="text-blue-900">{rm.prescribedQuantity ?? "N/A"}</span>
              </div>
              <div>
                <span className="text-blue-600 font-semibold">Usage:</span>{" "}
                <span className="text-blue-900">
                  {rm.quantityUsed} unit{rm.quantityUsed > 1 ? "s" : ""}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
)}
    <div className="flex justify-between">
      <button
        onClick={() => setStep(2)}
        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
      >
        Back to Raw Materials
      </button>
      <button
        onClick={handlePrepare}
        className="flex items-center px-6 py-2 rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
      >
        <FaCheck className="mr-2" /> Prepare Medicine
      </button>
    </div>
  </div>
)}

        </div>
      </div>
      {showBarcodeModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
      <h2 className="text-lg font-semibold mb-4">Enter Barcode for {scanningMaterial?.name}</h2>
      <input
        type="text"
        value={enteredBarcode}
        onChange={(e) => setEnteredBarcode(e.target.value)}
        placeholder="Enter barcode here"
        className="w-full border p-2 rounded mb-4"
      />
      <div className="flex justify-end space-x-3">
        <button
          onClick={() => setShowBarcodeModal(false)}
          className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
        >
          Cancel
        </button>
        <button
          onClick={() => {
  const matched = rawMaterials.find(
    (material) =>
      material.rawMaterialId === scanningMaterial.rawMaterialId &&
      material.barcode === enteredBarcode.trim()
  );

  if (matched) {
    setVerifiedMaterials((prev) => [...prev, matched.rawMaterialId]);
    setShowBarcodeModal(false);
  } else {
    alert("Invalid barcode! Please try again.");
  }
}}
          disabled={!enteredBarcode.trim()}
          className={`px-4 py-2 text-white rounded ${
            !enteredBarcode.trim()
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          Submit
        </button>
      </div>
    </div>
  </div>
)}
{showUpdateModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
      <h2 className="text-lg font-semibold mb-4">
        Enter {isPostWeightPhase ? 'Post-Weight' : 'Pre-Weight'} for {updatingMaterial?.name}
      </h2>

      <input
        type="text"
        placeholder={`Enter ${isPostWeightPhase ? 'Postweight' : 'Preweight'}`}
        value={preWeight}
        onChange={(e) => setPreWeight(e.target.value)}
        className="w-full border rounded px-3 py-2 mb-4"
      />

      <div className="flex justify-end space-x-3">
        <button
          onClick={() => {
            setShowUpdateModal(false);
            setPreWeight('');
            setIsPostWeightPhase(false); // reset
          }}
          className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
        >
          Cancel
        </button>

        <button
          className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded shadow-sm"
          onClick={async () => {
            try {
              const payload = {
                rawMaterialId: updatingMaterial.rawMaterialId,
                medicineName: init?.medicineName,
                prescriptionId: init?.prescriptionId,
                ...(isPostWeightPhase
                  ? { postWeight: preWeight }
                  : { preWeight: preWeight })
              };

              if (!preWeight) {
                alert("Please enter the weight value.");
                return;
              }

              const route = isPostWeightPhase
                ? `${API_URL}/api/medicine-summary/update-postweight`
                : `${API_URL}/api/medicine-summary/update-preweight`;

              const response = await fetch(route, {
                method: 'PATCH',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
              });

              if (!response.ok) throw new Error("Failed to update weight.");

              const result = await response.json();
              console.log(`${isPostWeightPhase ? 'Post' : 'Pre'} weight updated:`, result);

              if (!isPostWeightPhase) {
                setPreWeight('');
                setIsPostWeightPhase(true);
              } else {
                setShowUpdateModal(false);
                setPreWeight('');
                setIsPostWeightPhase(false);

                // ✅ Mark as fully updated
                setFullyUpdatedMaterials(prev => [
                  ...prev,
                  updatingMaterial.rawMaterialId
                ]);
              }
            } catch (err) {
              console.error("Update error:", err);
              alert("Failed to update weight.");
            }
          }}
        >
          {isPostWeightPhase ? 'Update Post-Weight' : 'Update Pre-Weight'}
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default MedicinePreparationView;
