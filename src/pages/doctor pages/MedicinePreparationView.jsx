import React, { useState, useEffect, useRef } from "react";
import { FaCheck, FaExclamationTriangle } from "react-icons/fa";
import moment from "moment";
import config from "../../config";
import { ChevronDown, Filter, ListFilter } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom"; 
import referenceImgSrc from '../../assets/images/ReferenceImage.png';

const MedicinePreparationView = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [prescription, setPrescription] = useState(null);
  const [appointment, setAppointment] = useState(null);
  const [preWeightData, setPreWeightData] = useState({}); 
  const [selectedMedicineForRedo, setSelectedMedicineForRedo] = useState(null);
  const [scanSource, setScanSource] = useState(null);
  const [postWeightData, setPostWeightData] = useState({}); 
  const [rawMaterials, setRawMaterials] = useState([]);
  const [capturedImages, setCapturedImages] = useState({});
  const [isOpen, setIsOpen] = useState(false);
  const [init, setInit] = useState(null);
  const [step3Instructions, setStep3Instructions] = useState([]);
  const [loadingStep3Instructions, setLoadingStep3Instructions] = useState(false);
  const [summaryList, setSummaryList] = useState([]);
  const [showChecks, setShowChecks] = useState(false);
  const recordingTimerRef = useRef(null); 
  const [fullyUpdatedMaterials, setFullyUpdatedMaterials] = useState([]);
  const [isPostWeightPhase, setIsPostWeightPhase] = useState(false);
  const [packagingBottles, setPackagingBottles] = useState([]);
  const [preWeight, setPreWeight] = useState('');
  const [sortOpen, setSortOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [preparedMedicineIds, setPreparedMedicineIds] = useState([]);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordingStream, setRecordingStream] = useState(null);
  const [showPreWeightModal, setShowPreWeightModal] = useState(false);
  const [preWeightUpdated, setPreWeightUpdated] = useState([]);
  const [instructions, setInstructions] = useState([]);
  const [loadingInstructions, setLoadingInstructions] = useState(true);
  const [postWeightUpdated, setPostWeightUpdated] = useState([]);
  const [postWeight, setPostWeight] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [cvReady, setCvReady] = useState(false);
const [cameraVerified, setCameraVerified] = useState(false);
const [verificationInProgress, setVerificationInProgress] = useState(false);
const cameraStreamRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [showPostWeightModal, setShowPostWeightModal] = useState(false);
  const recordedChunksRef = useRef([]);
  const [cart, setCart] = useState([]);
  const [verifiedMaterials, setVerifiedMaterials] = useState([]);
  const [step, setStep] = useState(0); // 1: Select Medicine, 2: Add Raw Materials, 3: Confirm
  const [preparing, setPreparing] = useState(false);
  const [loadingRawMaterials, setLoadingRawMaterials] = useState(false);
  const [showBarcodeModal, setShowBarcodeModal] = useState(false);
  const [scanningMaterial, setScanningMaterial] = useState(null); // for which material is being scanned
  const [enteredBarcode, setEnteredBarcode] = useState("");
  const [updatingMaterial, setUpdatingMaterial] = useState(null);
  const [checkbox1, setCheckbox1] = useState(false);
  const [checkbox2, setCheckbox2] = useState(false);
  const [rawMaterialsConfirmed, setRawMaterialsConfirmed] = useState(false); 
  const [individualRawMaterialChecks, setIndividualRawMaterialChecks] = useState({}); 
  const [step3Check1, setStep3Check1] = useState(false);
  const [step3Check2, setStep3Check2] = useState(false);
  const [statistics, setStatistics] = useState({
  totalItems: 0,
  completed: 0,
  pending: 0,
  attempts: 0
});
  // New state for stock to be shelfed data
  const [stockToBeShelfedData, setStockToBeShelfedData] = useState({});
  const [hoveredMaterial, setHoveredMaterial] = useState(null);
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });
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

useEffect(() => {
  if (step === 1) {
    setLoadingInstructions(true);
    fetch(`${API_URL}/api/medicine-summary/get-all-instructions`)
      .then(res => res.json())
      .then(data => {
        // Show only "step-1" instructions, remove duplicates
        if (data["step-1"]) {
          const unique = [...new Set(data["step-1"])];
          setInstructions(unique);
        } else {
          setInstructions([]);
        }
      })
      .catch(err => {
        console.error("Error fetching instructions", err);
        setInstructions([]);
      })
      .finally(() => setLoadingInstructions(false));
  }
}, [step]);

useEffect(() => {
  if (prescription?.prescriptionItems) {
    const totalItems = prescription.prescriptionItems.length;
    const completed = preparedMedicineIds.length;
    const pending = totalItems - completed;
    
    // Fix: Access attempt from individual prescription items
    // Option 1: Get attempt from first item
    //const attemptValue = prescription.prescriptionItems[0]?.attempt || "0";
    
    // Option 2: Sum all attempts (if you want total across all items)
    const attemptValue = prescription.prescriptionItems.reduce((sum, item) => 
       sum + parseInt(item.attempt || "0"), 0
     );
    
    // Option 3: Get maximum attempt value
    // const attemptValue = Math.max(...prescription.prescriptionItems.map(item => 
    //   parseInt(item.attempt || "0")
    // ));
    
    setStatistics({
      totalItems,
      completed,
      pending,
      attempts: attemptValue 
    });
  }
}, [prescription?.prescriptionItems, preparedMedicineIds]);

useEffect(() => {
  if (!showBarcodeModal) return; // only listen when modal is open

  let buffer = "";
  let timer;

  const handleKeydown = (e) => {
    if (e.key === "Enter") {
      if (buffer.length > 0) {
        setEnteredBarcode(buffer); // auto-fill the input field
        buffer = "";
      }
    } else {
      buffer += e.key;
      clearTimeout(timer);
      timer = setTimeout(() => (buffer = ""), 300); // reset if idle >300ms
    }
  };

  window.addEventListener("keydown", handleKeydown);
  return () => window.removeEventListener("keydown", handleKeydown);
}, [showBarcodeModal]);



useEffect(() => {
  if (step === 3) {
    setLoadingStep3Instructions(true);
    fetch(`${API_URL}/api/medicine-summary/get-all-instructions`)
      .then(res => res.json())
      .then(data => {
        if (data["step-3"]) {
          const unique = [...new Set(data["step-3"])];
          setStep3Instructions(unique);
        } else {
          setStep3Instructions([]);
        }
      })
      .catch(err => {
        console.error("Error fetching step-3 instructions", err);
        setStep3Instructions([]);
      })
      .finally(() => setLoadingStep3Instructions(false));
  }
}, [step]);

useEffect(() => {
  const checkCv = setInterval(() => {
    if (window.cv && window.cv.Mat) {
      clearInterval(checkCv);
      setCvReady(true);
      console.log("OpenCV.js loaded");
    }
  }, 500);
  return () => clearInterval(checkCv);
}, []);


const handleImageCapture = async (material) => {
  try {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment'; // Use camera on mobile
    
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      // Store the image file
      setCapturedImages(prev => ({
        ...prev,
        [material.rawMaterialId]: file
      }));
    };
    
    input.click();
  } catch (error) {
    console.error("Error capturing image:", error);
    alert("Failed to capture image");
  }
};


const handleSelectMedicine = async (medicine) => {
  setSelectedMedicine(medicine);
  setStep(1);
  setCart([]);
  setCameraVerified(false); // Reset verification for new medicine
  setIsRecording(false); // Reset recording state
  
  // Only setup camera stream, don't start recording yet
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: { width: 1280, height: 720 }, 
      audio: true 
    });
    cameraStreamRef.current = stream;
    console.log("Camera stream ready for verification");
  } catch (err) {
    console.error("Failed to setup camera:", err);
    alert("Camera and microphone access is needed for verification and recording.");
    return;
  }
  
  if (prescription && medicine.medicineName) {
    await fetchRawMaterialsForMedicine(medicine.medicineName);
  }
};

  const handleScanClick = (item, source) => {
  setScanningMaterial(item);
  setScanSource(source);
  setEnteredBarcode("");
  setShowBarcodeModal(true);
};

const startActualRecording = async () => {
  try {
    if (!cameraStreamRef.current) {
      throw new Error("No camera stream available");
    }

    const recorder = new MediaRecorder(cameraStreamRef.current, {
      mimeType: 'video/webm;codecs=vp9,opus'
    });
    
    recordedChunksRef.current = [];

    recorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        recordedChunksRef.current.push(event.data);
        console.log("Recording chunk:", event.data.size, "bytes");
      }
    };

    recorder.onstart = () => {
      console.log("Recording ACTUALLY started");
      setIsRecording(true);
      setRecordingTime(0);
    };

    recorder.onerror = (event) => {
      console.error("MediaRecorder error:", event);
      setIsRecording(false);
    };

    // Start recording with smaller chunks for better reliability
    recorder.start(500); // 500ms chunks
    setMediaRecorder(recorder);
    setRecordingStream(cameraStreamRef.current);

    // Start timer
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
    }

    recordingTimerRef.current = setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);

  } catch (error) {
    console.error("Failed to start actual recording:", error);
    alert("Failed to start recording. Please try again.");
  }
};



const handlePrepare = async () => {
  if (!cameraVerified) {
    alert("Please verify camera position before completing preparation.");
    return;
  }

  if (!isRecording) {
    alert("No active recording found. Please verify camera position first.");
    return;
  }
  
  console.log("Stopping recording...");
  let videoBlob = null;
  
  try {
    videoBlob = await stopRecording();
    
    if (!videoBlob || videoBlob.size === 0) {
      console.error("Invalid video blob");
      alert("Failed to create video recording. Please try again.");
      return;
    }
    
    console.log("Video ready for upload:", videoBlob.size, "bytes");
  } catch (error) {
    console.error("Error stopping recording:", error);
    alert("Failed to stop recording properly. Please try again.");
    return;
  }

  // Validate required data
  if (!prescription?._id || !selectedMedicine?.medicineName) {
    alert("Missing prescription or medicine data. Please refresh and try again.");
    return;
  }

  console.log("Prescription ID:", prescription._id);

  // Upload video with proper headers and error handling
  try {
    const formData = new FormData();
    formData.append("prescriptionId", prescription._id);
    formData.append("medicineName", selectedMedicine.medicineName);
    formData.append("video", videoBlob, `${selectedMedicine.medicineName}_${Date.now()}.webm`);

    console.log("Uploading video to API...");
    
    const token = localStorage.getItem('token');
    
    const res = await fetch(`${API_URL}/api/medicine-summary/upload-preparation-video`, {
      method: "POST",
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: formData,
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Upload failed:", res.status, errorText);
      alert(`Video upload failed: ${res.status} ${res.statusText}`);
      return;
    }

    const responseData = await res.json();
    console.log("Video upload successful:", responseData);

    for (const material of rawMaterials) {
  const imageFile = capturedImages[material.rawMaterialId];
  if (imageFile) {
    try {
      const imageFormData = new FormData();
      imageFormData.append("prescriptionId", prescription._id);
      imageFormData.append("medicineName", selectedMedicine.medicineName);
      imageFormData.append("photo", imageFile);

      await fetch(`${API_URL}/api/medicine-summary/upload-preparation-photo`, {
        method: "POST",
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: imageFormData,
      });
      
      console.log(`Image uploaded for ${material.name}`);
    } catch (imgErr) {
      console.error(`Failed to upload image for ${material.name}:`, imgErr);
      // Continue with other uploads even if one fails
    }
  }
}
    
  } catch (err) {
    console.error("Network error during video upload:", err);
    alert("Network error during video upload. Please check your connection and try again.");
    return;
  }

  // Continue with the rest of the preparation logic
  const newPrepared = [...preparedMedicineIds, selectedMedicine._id];
  setPreparedMedicineIds(newPrepared);

  setStep(0);
  setSelectedMedicine(null);
  setCart([]);
  setRawMaterials([]);
  setCapturedImages({});

  const remainingItems = prescription.prescriptionItems.filter(
    item => !newPrepared.includes(item._id)
  );

  if (remainingItems.length === 0) {
    alert("All medicines prepared successfully!");
    return;
  }

  alert("Medicine prepared successfully! Continue with the next one.");
};

const verifyPosition = async () => {
  if (!cvReady || !cameraStreamRef.current) return;
  
  setVerificationInProgress(true);
  
  try {
    // Create video element for capture
    const video = document.createElement('video');
    video.srcObject = cameraStreamRef.current;
    video.play();
    
    // Wait for video to be ready
    await new Promise(resolve => {
      video.onloadeddata = resolve;
    });
    
    // Load reference image from your assets
    const referenceImg = await loadImage(referenceImgSrc);
    const refMat = window.cv.imread(referenceImg);
    window.cv.cvtColor(refMat, refMat, window.cv.COLOR_RGBA2GRAY);
    
    // Capture current frame
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    
    const frameMat = window.cv.imread(canvas);
    window.cv.cvtColor(frameMat, frameMat, window.cv.COLOR_RGBA2GRAY);
    
    // ORB feature detection and matching
    const orb = new window.cv.ORB();
    const kp1 = new window.cv.KeyPointVector();
    const des1 = new window.cv.Mat();
    orb.detectAndCompute(refMat, new window.cv.Mat(), kp1, des1);
    
    const kp2 = new window.cv.KeyPointVector();
    const des2 = new window.cv.Mat();
    orb.detectAndCompute(frameMat, new window.cv.Mat(), kp2, des2);
    
    if (des1.rows > 0 && des2.rows > 0) {
      const bf = new window.cv.BFMatcher(window.cv.NORM_HAMMING, true);
      const matches = new window.cv.DMatchVector();
      bf.match(des1, des2, matches);
      
      const totalMatches = matches.size();
      let goodMatches = 0;
      for (let i = 0; i < totalMatches; i++) {
        const m = matches.get(i);
        if (m.distance < 50) goodMatches++;
      }
      
      const similarity = totalMatches > 0 ? goodMatches / totalMatches : 0;
      
      if (similarity > 0.2) {
        setCameraVerified(true);
        
        // NOW start recording after verification
        await startActualRecording();
        
        alert("Camera position verified! Recording has started.");
      } else {
        alert("Please adjust the camera to match the reference position.");
        setCameraVerified(false);
      }
      
      bf.delete();
      matches.delete();
    }
    
    // Cleanup
    refMat.delete();
    frameMat.delete();
    des1.delete();
    des2.delete();
    kp1.delete();
    kp2.delete();
    orb.delete();
    
  } catch (err) {
    console.error("Verification error:", err);
    alert("Camera verification failed. Please try again.");
  } finally {
    setVerificationInProgress(false);
  }
};

const loadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;
    img.onload = () => resolve(img);
    img.onerror = reject;
  });
};


const stopRecording = () => {
  return new Promise((resolve, reject) => {
    if (!mediaRecorder) {
      console.warn("No active recording to stop");
      resolve(null);
      return;
    }
    
    if (mediaRecorder.state === 'inactive') {
      console.warn("Recording already stopped");
      resolve(null);
      return;
    }

    // Add timeout to prevent hanging
    const timeout = setTimeout(() => {
      console.error("Recording stop timeout");
      reject(new Error("Recording stop timeout"));
    }, 5000);
    
    mediaRecorder.onstop = () => {
      clearTimeout(timeout);
      try {
        const videoBlob = new Blob(recordedChunksRef.current, { type: "video/webm" });
        recordedChunksRef.current = [];
        console.log("Recording stopped - Blob size:", videoBlob.size, "bytes");
        
        // Clean up streams
        if (recordingStream) {
          recordingStream.getTracks().forEach(track => track.stop());
          setRecordingStream(null);
        }
        if (cameraStreamRef.current) {
          cameraStreamRef.current.getTracks().forEach(track => track.stop());
          cameraStreamRef.current = null;
        }

        setIsRecording(false);
        if (recordingTimerRef.current) {
          clearInterval(recordingTimerRef.current);
          recordingTimerRef.current = null;
          setRecordingTime(0);
        }

        resolve(videoBlob);
      } catch (error) {
        clearTimeout(timeout);
        reject(error);
      }
    };

    mediaRecorder.onerror = (event) => {
      clearTimeout(timeout);
      reject(new Error("MediaRecorder error: " + event.error));
    };

    try {
      mediaRecorder.stop();
    } catch (error) {
      clearTimeout(timeout);
      reject(error);
    }
  });
};

  // New function to fetch stock data after post-weight update
  const fetchStockToBeShelfedData = async (material) => {
    try {
      const payload = {
        rawMaterialId: material.rawMaterialId,
        medicineName: init?.medicineName,
        prescriptionId: init?.prescriptionId,
        postWeight
      };

      const response = await fetch(
        `${API_URL}/api/medicine-summary/update-postweight`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) throw new Error("Failed to update post-weight");

      const data = await response.json();
      
      // Store the stock data for this material
      setStockToBeShelfedData(prev => ({
        ...prev,
        [material.rawMaterialId]: {
          updatedRawMaterialQuantity: data.updatedRawMaterialQuantity,
          bottleCapWeight: data.bottleCapWeight,
          totalWeight: data.updatedRawMaterialQuantity + data.bottleCapWeight
        }
      }));

      return data;
    } catch (err) {
      console.error("Error fetching stock data:", err);
      throw err;
    }
  };

  const handleMouseEnter = (material, event) => {
    setHoveredMaterial(material.rawMaterialId);
    setHoverPosition({ x: event.clientX, y: event.clientY });
  };

  const handleMouseLeave = () => {
    setHoveredMaterial(null);
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
      <div className="h-5"></div>
      <div className="mb-6">
  {/* Title + Back Button row */}
  <div className="flex justify-between items-center w-full mb-2">
  {/* Left: Title */}
  <h1 className="text-2xl font-semibold text-gray-800">
    Medicine Preparation
  </h1>

  {/* Right: Buttons */}
  <div className="flex items-center gap-2">
    <div className="flex gap-2 relative">
      {/* Sort Button */}
      <div className="relative">
        <button
          onClick={() => {
            setSortOpen(!sortOpen);
            setStatusOpen(false); // close other dropdown
          }}
          className="h-[30px] px-3 rounded-[5px] border border-black flex items-center gap-2 text-black font-semibold bg-white hover:bg-blue-100 transition"
        >
          <ListFilter size={16} />
          Sort
          <ChevronDown size={14} />
        </button>

        {sortOpen && (
          <div className="absolute left-0 mt-1 w-32 bg-white border border-gray-300 rounded shadow-md z-10">
            <button className="w-full px-3 py-1 text-left hover:bg-blue-100 text-sm">
              Name
            </button>
            <button className="w-full px-3 py-1 text-left hover:bg-blue-100 text-sm">
              Date
            </button>
            <button className="w-full px-3 py-1 text-left hover:bg-blue-100 text-sm">
              Priority
            </button>
          </div>
        )}
      </div>

      {/* Status Button */}
      <div className="relative">
        <button
          onClick={() => {
            setStatusOpen(!statusOpen);
            setSortOpen(false); // close other dropdown
          }}
          className="h-[30px] px-3 rounded-[5px] border border-black flex items-center gap-2 text-black font-semibold bg-white hover:bg-blue-100 transition"
        >
          <Filter size={16} />
          Status
          <ChevronDown size={14} />
        </button>

        {statusOpen && (
          <div className="absolute left-0 mt-1 w-32 bg-white border border-gray-300 rounded shadow-md z-10">
            <button className="w-full px-3 py-1 text-left hover:bg-blue-100 text-sm">
              Active
            </button>
            <button className="w-full px-3 py-1 text-left hover:bg-blue-100 text-sm">
              Inactive
            </button>
            <button className="w-full px-3 py-1 text-left hover:bg-blue-100 text-sm">
              Pending
            </button>
          </div>
        )}
      </div>
    </div>


    {/* Cancel Button */}
    <button
      onClick={() => navigate(-1)}
      className="ml-[50px] w-[85px] h-[30px] rounded-[5px] opacity-100 border border-blue-500 flex items-center justify-center gap-[5px] text-blue-500 font-semibold bg-white hover:bg-blue-100 transition"
      style={{
        paddingTop: '8px',
        paddingBottom: '8px',
      }}
    >
      ✕ Cancel
    </button>
  </div>
</div>



  {/* Recording indicator row */}
  {isRecording && (
    <div className="flex items-center gap-2 text-red-600 font-semibold text-sm">
      <span className="h-3 w-3 bg-red-600 rounded-full animate-pulse"></span>
      <span>
        REC {Math.floor(recordingTime / 60)}:
        {String(recordingTime % 60).padStart(2, '0')}
      </span>
    </div>
  )}

  {/* After your existing recording indicator */}
{cameraStreamRef.current && !cameraVerified && (
  <div className="flex items-center gap-2 text-yellow-600 font-semibold text-sm mb-2">
    <span> Camera ready - Please verify position before recording</span>
    {cvReady && (
      <button
        onClick={verifyPosition}
        disabled={verificationInProgress}
        className="px-3 py-1 bg-yellow-500 text-white rounded text-xs hover:bg-yellow-600"
      >
        {verificationInProgress ? "Verifying..." : "Verify Position"}
      </button>
    )}
  </div>
)}

{cameraVerified && (
  <div className="flex items-center gap-2 text-green-600 font-semibold text-sm mb-2">
    <span> Camera position verified</span>
  </div>
)}


  <div className="h-4"></div>
  {step > 0 && (
    <div className="mb-8">
  <div className="flex justify-between items-start">
    {/* Step 1 */}
    <div className="flex flex-col items-center w-32">
      <div
        className={`flex items-center justify-center w-10 h-10 rounded-full ${
          step >= 1 ? 'bg-[#22C55E] text-white' : 'bg-gray-300'
        }`}
      >
        1
      </div>
      <div className="text-center mt-2 text-sm">
        Choose Dispense Bottle
      </div>
    </div>

    {/* Line between steps */}
    <div className="flex-1 h-1 bg-gray-300 self-center -mt-9 mx-2"></div>

    {/* Step 2 */}
    <div className="flex flex-col items-center w-32">
      <div
        className={`flex items-center justify-center w-10 h-10 rounded-full ${
          step >= 2 ? 'bg-[#22C55E] text-white' : 'bg-gray-300'
        }`}
      >
        2
      </div>
      <div className="text-center mt-2 text-sm">
        Add Raw Materials
      </div>
    </div>

    {/* Line between steps */}
    <div className="flex-1 h-1 bg-gray-300 self-center -mt-9 mx-2"></div>

    {/* Step 3 */}
    <div className="flex flex-col items-center w-32">
      <div
        className={`flex items-center justify-center w-10 h-10 rounded-full ${
          step >= 3 ? 'bg-[#22C55E] text-white' : 'bg-gray-300'
        }`}
      >
        3
      </div>
      <div className="text-center mt-2 text-sm">
        Record Material Leakage
      </div>
    </div>
  </div>
</div>

      )}
</div>      
  <div className="col-span-12 lg:col-span-8">
  {/* Front Page - Medicine Selection */}
  {step === 0 && (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white p-6 shadow-sm">
        {/* Statistics Cards */}
        <div className="grid grid-cols-4 gap-6 mb-6">
  <div className="p-5 rounded-lg border bg-blue-100 border-gray-200 text-center">
    <h3 className="text-base font-semibold mb-1 text-blue-700">Total Items</h3>
    <p className="text-xl font-semibold text-blue-700">{statistics.totalItems}</p>
  </div>
  <div className="p-5 rounded-lg border bg-green-100 border-gray-200 text-center">
    <h3 className="text-base text-green-600 mb-1 font-semibold">Completed</h3>
    <p className="text-xl font-semibold text-green-600">{statistics.completed}</p>
  </div>
  <div className="p-5 rounded-lg border bg-yellow-100 border-gray-200 text-center">
    <h3 className="text-base text-orange-600 mb-1 font-semibold">Pending</h3>
    <p className="text-xl font-semibold text-orange-600">{statistics.pending}</p>
  </div>
  <div className="p-5 rounded-lg border bg-red-100 border-gray-200 text-center">
    <h3 className="text-base text-red-600 mb-1 font-semibold">Attempts</h3>
    <p className="text-xl font-semibold text-red-600">{statistics.attempts}</p>
  </div>
</div>
      </div>
  {/* Main Content */}
  <div className="bg-white rounded-lg shadow-sm p-6">
  <h2 className="text-xl font-semibold text-gray-800 mb-1">
    Select a Medicine to Prepare
  </h2>
  <p className="text-gray-600 text-sm mb-4">
    Select a medicine from the prescription on the left to begin preparation.
  </p>

  <div>
    <p className="font-medium text-gray-800 mb-4">Prescription Items:</p>
    {prescription?.prescriptionItems?.length > 0 ? (
      <>
        <div className="space-y-2">
          {prescription.prescriptionItems.map((item, index) => {
            const isPrepared = preparedMedicineIds.includes(item._id);
            
            return (
              <div
                key={index}
                className="bg-white border rounded-lg flex flex-col md:flex-row items-center p-4 justify-between gap-y-2 shadow-sm"
                // Each item card
              >
                {/* Left: Medicine Name & Details */}
                <div className="flex flex-col justify-center flex-1 min-w-0">
    <h3 className="font-semibold text-gray-800 text-base mb-1">
      {item.medicineName}
    </h3>

    {/* Two-row layout */}
    <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-xs text-gray-600">
      <div>
        Raw Materials: {item.rawMaterialDetails?.length > 0
          ? item.rawMaterialDetails.map(rm => rm.name).join(", ")
          : "A1"}
      </div>
      <div>
        Form: {item.form || "Tablets"}
      </div>
      <div>
        UOM: {item.uom || "ML"}
      </div>
      <div>
        Quantity: {item.dispenseQuantity || "5ml"}
      </div>
    </div>
  </div>
                {/* Right: Button, Status, Attempt */}
                <div className="flex items-center gap-3 flex-shrink-0 mt-3 md:mt-0">
                  <button
                    className={`rounded-full px-4 py-1.5 text-sm font-semibold shadow transition focus:outline-none ${
                      isPrepared 
                        ? "bg-gray-400 text-gray-600 cursor-not-allowed" 
                        : "bg-blue-500 text-white hover:bg-[#3B82F6]"
                    }`}
                    onClick={() => {
                      if (!isPrepared) {
                        handleSelectMedicine(item);
                        setStep(1);
                      }
                    }}
                    disabled={isPrepared}
                  >
                    {isPrepared ? "Already Prepared" : "Prepare this Medicine"}
                  </button>
                  <span
                    className={`px-3 py-1 text-sm font-semibold rounded-full ${
                      isPrepared
                        ? "bg-[#22C55E] text-white"
                        : "bg-[#EFBB55] text-white"
                    }`}
                    style={{
                      minWidth: "90px",
                      textAlign: "center"
                    }}
                  >
                    {isPrepared ? "Completed" : "Pending"}
                  </span>



                  {/* Refresh icon */}
                  <button
  type="button"
  className="flex items-center gap-1 text-gray-500 text-xs px-2 py-1 rounded hover:bg-gray-100 active:bg-gray-200 focus:outline-none"
  onClick={() => {
    setSelectedMedicineForRedo(item);
    setIsOpen(true);
  }}
>
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
  >
    <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
  </svg>
</button>

                </div>
              </div>
            );
          })}
        </div>
        
        {/* Go to Printing & Packaging Button - Shows when all medicines are completed */}
        {prescription.prescriptionItems.length > 0 && 
         prescription.prescriptionItems.every(item => preparedMedicineIds.includes(item._id)) && (
          
          <div className="mt-6 flex justify-end">   
  <button
    className="px-6 py-2 bg-[#3B82F6] text-white text-sm font-semibold rounded-lg shadow-md hover:bg-[#3B82F6] transition-colors focus:outline-none focus:ring-2 focus:ring-[#22C55E] focus:ring-offset-2"
    onClick={() => navigate(`/medicinepackaging/${prescription._id}`)}
  >
    Go to Medicine & Packaging
  </button>
</div>
        )}
      </>
    ) : (
      <p className="text-gray-500 italic text-center py-8">
        No prescription items available
      </p>
    )}
  </div>
</div>

</div>
  )}

  {/* Step 1 - Packaging Bottles */}
  {step === 1 && (
  <div className="bg-white p-6 rounded-xl shadow-sm">
    
    {/* Step 1 Instructions with checkboxes */}
    {loadingInstructions ? (
      <div className="flex justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-700 font-medium">Loading instructions...</span>
      </div>
    ) : (
      instructions.length > 0 && (
        <div className="mb-4">
          {instructions.map((item, idx) => (
            <label key={idx} className="flex items-center space-x-2 mb-1">
              <input
                type="checkbox"
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <span className="text-gray-700">{item}</span>
            </label>
          ))}
        </div>
      )
    )}

    {/* Bottles Table */}
    {loadingRawMaterials ? (
      <div className="flex justify-center py-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-700 font-medium">Loading raw materials...</span>
      </div>
    ) : (
      <>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Choose the Dispense Bottle</h3>
  <table className="w-full overflow-hidden rounded-lg">
    <thead>
      <tr className="border-b border-blue-200">
        <th className="bg-gray-100 text-center p-4 font-bold text-gray-700 text-sm">
          Name
        </th>
        <th className="bg-white text-center p-4 font-bold text-gray-700 text-sm">
          Category
        </th>
        <th className="bg-gray-100 text-center p-4 font-bold text-gray-700 text-sm">
          Quantity
        </th>
        <th className="bg-white text-center p-4 font-bold text-gray-700 text-sm">
          Quantity To Be Taken
        </th>
        <th className="bg-gray-100 text-center p-4 font-bold text-gray-700 text-sm">
          Action
        </th>
      </tr>
    </thead>
    <tbody>
      {packagingBottles && packagingBottles.length > 0 ? (
        packagingBottles.map((bottle, idx) => (
          <tr key={idx} className="border-b border-blue-200">
            <td className="bg-gray-100 p-4 font-medium text-gray-900 text-center">
              {bottle.name || "N/A"}
            </td>
            <td className="bg-white p-4 text-gray-600 text-center">
              {bottle.category || "N/A"}
            </td>
            <td className="bg-gray-100 p-4 text-gray-600 text-center">
              {bottle.currentQuantity} / {bottle.quantity}
            </td>
            <td className="bg-white p-4 text-gray-600 text-center">
              {bottle.quantityToBeTaken ?? 1}
            </td>
            <td className="bg-gray-100 p-4 text-center">
              {verifiedMaterials.includes(bottle._id) ? (
                <span className="bg-green-100 text-green-600 font-semibold px-4 py-1 rounded-full text-xs">
                  Verified
                </span>
              ) : (
                <button
                  className="bg-green-500 hover:bg-green-600 text-white font-medium px-4 py-1 rounded-full text-xs transition"
                  onClick={() => handleScanClick(bottle, "packagingBottles")}
                >
                  Scan
                </button>
              )}
            </td>
          </tr>
        ))
      ) : (
        <tr>
          <td
            colSpan={5}
            className="bg-white text-center text-gray-500 py-6"
          >
            No packaging bottles found.
          </td>
        </tr>
      )}
    </tbody>
  </table>


        <div className="flex justify-between mt-10">
          <button
            onClick={() => setStep(0)}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
          >
            Back to Medicine Selection
          </button>
          <button
            onClick={() => setStep(2)}
            className="px-6 py-2 rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            Continue to Raw Materials
          </button>
        </div>
      </>
    )}
  </div>
)}

          
  {/* Step 2 - Raw Materials */}
  {step === 2 && (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      {loadingRawMaterials ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2">Loading raw materials...</span>
        </div>
      ) : (
        <>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            Add Raw Materials for: {selectedMedicine?.medicineName}
          </h2>

  {rawMaterials.length > 0 ? (
    <table className="w-full overflow-hidden rounded-lg">
      <thead>
        <tr className="border-b border-blue-200">
          <th className="bg-gray-100 text-center p-4 font-bold text-gray-700 text-sm">
            Name
          </th>
          <th className="bg-white text-center p-4 font-bold text-gray-700 text-sm">
            Type
          </th>
          
          <th className="bg-gray-100 text-center p-4 font-bold text-gray-700 text-sm">
            Scan
          </th>
          <th className="bg-white text-center p-4 font-bold text-gray-700 text-sm">
            Current Stock
          </th>
          <th className="bg-gray-100 text-center p-4 font-bold text-gray-700 text-sm">
            Pre‑Weight
          </th>
          <th className="bg-white text-center p-4 font-bold text-gray-700 text-sm">
            Dispense Quantity
          </th>
          <th className="bg-gray-100 text-center p-4 font-bold text-gray-700 text-sm">
            Post‑Weight
          </th>
          <th className="bg-white text-center p-4 font-bold text-gray-700 text-sm">
            Stock to be Shelfed
          </th>
        </tr>
      </thead>
      <tbody>
        {rawMaterials
          .filter((material) =>
            material.name.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .map((material) => (
            <tr
              key={material.rawMaterialId}
              className={`border-b border-blue-200 hover:bg-gray-50 transition ${
                isExpiryWarning(material.expiryDate)
                  ? "bg-red-50 border-l-4 border-red-400"
                  : ""
              }`}
            >
              {/* Name */}
              <td className="bg-gray-100 p-4 text-gray-900 text-center">
                <div className="flex items-center justify-center gap-2">
                  {isExpiryWarning(material.expiryDate) && (
                    <FaExclamationTriangle
                      className="text-red-500 animate-pulse"
                      title="Expires soon!"
                    />
                  )}
                  <span
                    className={
                      isExpiryWarning(material.expiryDate)
                        ? "font-semibold text-red-700"
                        : ""
                    }
                  >
                    {material.name}
                  </span>
                  {isLowStock(material.currentQuantity, material.quantity) && (
                    <FaExclamationTriangle
                      className="text-yellow-500"
                      title="Low stock"
                    />
                  )}
                </div>
              </td>

              {/* Category */}
              <td className="bg-white p-4 text-gray-600 text-center">
                {material.category || "N/A"}
              </td>

             

              {/* Action */}
              <td className="bg-gray-100 p-4 text-center">
                {verifiedMaterials.includes(material.rawMaterialId) ? (
                  <span className="bg-green-100 text-green-600 font-semibold px-4 py-1 rounded-full text-xs shadow">
                    Verified
                  </span>
                ) : (
                  <button
                    className="bg-green-500 hover:bg-green-600 text-white font-medium px-4 py-1 rounded-full text-xs shadow transition"
                    onClick={() => handleScanClick(material, "rawMaterials")}
                  >
                    Scan
                  </button>
                )}
              </td>

               {/* Stock */}
              <td
  className="bg-white p-4 text-center relative"
  onMouseEnter={(e) => {
    setHoverPosition({ x: e.clientX, y: e.clientY });
    setHoveredMaterial(material.rawMaterialId);
  }}
  onMouseMove={(e) => {
    setHoverPosition({ x: e.clientX, y: e.clientY });
  }}
  onMouseLeave={() => setHoveredMaterial(null)}
>
  {/* Table display */}
  <span
    className={
      isLowStock(material.currentQuantity, material.quantity)
        ? "text-yellow-700 font-semibold"
        : "text-gray-800"
    }
  >
    {material.currentQuantity} / {material.packageSize || "units"}
  </span>

  {/* Tooltip */}
  {hoveredMaterial === material.rawMaterialId && (
    <div
      className="fixed bg-white border border-gray-300 shadow-lg rounded-lg p-3 z-50 min-w-[200px]"
      style={{
        left: hoverPosition.x + 10,
        top: hoverPosition.y - 10,
      }}
    >
      <div className="text-sm text-gray-700">
        <div>Bottle Weight: {material.bottleWeight}</div>
        <div>Substance Weight: {material.currentQuantity}</div>
        <div>Total Weight: {material.bottleWeight + material.currentQuantity}</div>
      </div>
    </div>
  )}
</td>


              {/* Pre‑Weight */}
              <td className="bg-gray-100 p-4 text-center">
                {verifiedMaterials.includes(material.rawMaterialId) &&
                  (preWeightUpdated.includes(material.rawMaterialId) ? (
                    <span className="bg-blue-100 text-blue-700 font-semibold px-4 py-1 rounded-full shadow text-xs">
                      Updated
                    </span>
                  ) : (
                    <button
                      className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-1 rounded-full text-xs shadow transition"
                      onClick={async () => {
                        try {
                          await fetch(`${API_URL}/api/medicine-summary/init`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(init),
                          });
                          setUpdatingMaterial(material);
                          setShowPreWeightModal(true);
                        } catch (err) {
                          console.error(
                            "Failed to prepare prescription item:",
                            err
                          );
                        }
                      }}
                    >
                      Update
                    </button>
                  ))}
              </td>

              {/* Prescribed Quantity + Info checks */}
              <td className="bg-white p-4 text-gray-600 relative text-center">
                {material.prescribedQuantity || "N/A"}

                {showChecks && (
                  <div className="absolute left-0 top-full mt-2 bg-white border border-gray-200 shadow-lg rounded-lg p-4 z-50 w-80">
                    <div className="space-y-3 text-left">
                      <div className="flex items-start gap-2">
                        <input
                          type="checkbox"
                          id="all-raw-materials"
                          checked={rawMaterialsConfirmed}
                          onChange={() =>
                            setRawMaterialsConfirmed((prev) => !prev)
                          }
                          className="mt-1 accent-blue-500"
                        />
                        <label
                          htmlFor="all-raw-materials"
                          className="text-gray-700"
                        >
                          Have you taken all the necessary raw materials?
                        </label>
                      </div>
                      {rawMaterials.map((rm) => (
                        <div
                          key={rm.rawMaterialId}
                          className="flex items-start gap-2 pl-4"
                        >
                          <input
                            type="checkbox"
                            id={`rm-${rm.rawMaterialId}`}
                            checked={
                              individualRawMaterialChecks[rm.rawMaterialId] ||
                              false
                            }
                            onChange={() =>
                              setIndividualRawMaterialChecks((prev) => ({
                                ...prev,
                                [rm.rawMaterialId]:
                                  !prev[rm.rawMaterialId],
                              }))
                            }
                            className="mt-1 accent-blue-500"
                          />
                          <label
                            htmlFor={`rm-${rm.rawMaterialId}`}
                            className="text-gray-700"
                          >
                            Have you poured <strong>{rm.name}</strong> in the
                            correct quantity?
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </td>

              {/* Post‑Weight */}
              <td className="bg-gray-100 p-4 text-center">
                {verifiedMaterials.includes(material.rawMaterialId) &&
                  (postWeightUpdated.includes(material.rawMaterialId) ? (
                    <span className="bg-blue-100 text-blue-700 font-semibold px-4 py-1 rounded-full shadow text-xs">
                      Updated
                    </span>
                  ) : (
                    <button
                      className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-1 rounded-full text-xs shadow transition"
                      onClick={() => {
                        setUpdatingMaterial(material);
                        setShowPostWeightModal(true);
                      }}
                    >
                      Update
                    </button>
                  ))}
              </td>

               {/* Stock to be Shelfed with hover popup */}
               <td className="bg-white p-4 text-center relative">
                <span
                  className={`cursor-pointer ${
                    isLowStock(material.currentQuantity, material.quantity)
                      ? "text-yellow-700 font-semibold"
                      : "text-gray-800"
                  }`}
                  onMouseEnter={(e) => handleMouseEnter(material, e)}
                  onMouseLeave={handleMouseLeave}
                >
                  {stockToBeShelfedData[material.rawMaterialId]?.updatedRawMaterialQuantity 
                  }
                </span>

                {/* Hover popup */}
                {hoveredMaterial === material.rawMaterialId && stockToBeShelfedData[material.rawMaterialId] && (
                  <div 
                    className="fixed bg-white border border-gray-300 shadow-lg rounded-lg p-3 z-50 min-w-[200px]"
                    style={{
                      left: hoverPosition.x + 10,
                      top: hoverPosition.y - 10,
                    }}
                  >
                    <div className="text-sm text-gray-700">
                     
                     
                        <div>Bottle Weight: {stockToBeShelfedData[material.rawMaterialId].bottleCapWeight}</div>
                        <div>Substance Weight: {stockToBeShelfedData[material.rawMaterialId].updatedRawMaterialQuantity}</div>
                        <div>
                         Total Weight: {stockToBeShelfedData[material.rawMaterialId].totalWeight}
                        </div>
                    
                    </div>
                  </div>
                )}
              </td>
              
            </tr>
          ))}
      </tbody>
    </table>
  ) : (
    <p className="text-gray-500 text-center py-8">No raw materials found for this medicine.</p>
  )}
<div className="h-5"></div>
          <div className="flex justify-between">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
            >
              Back to Packaging Bottles
            </button>
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
          
  {/* Step 3 - Confirmation (unchanged) */}
  {step === 3 && (
  <div className="bg-white p-4 rounded-lg shadow-sm">
    
    {/* Step-3 Instructions with checkboxes */}
    {loadingStep3Instructions ? (
      <div className="flex justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-700 font-medium">Loading instructions...</span>
      </div>
    ) : (
      step3Instructions.length > 0 && (
        <div className="mb-4">
          {step3Instructions.map((item, idx) => (
            <label key={idx} className="flex items-center space-x-2 mb-1">
              <input
                type="checkbox"
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <span className="text-gray-700">{item}</span>
            </label>
          ))}
        </div>
      )
    )}

    <h2 className="text-xl font-semibold text-gray-800 mb-4">
      Record Material Leakage
    </h2>


  <table className="w-full overflow-hidden rounded-lg">
    <thead>
      <tr className="border-b border-blue-200">
        <th className="bg-gray-100 text-center p-4 font-bold text-gray-700 text-sm">
          Leakage by storage
        </th>
        <th className="bg-white text-center p-4 font-bold text-gray-700 text-sm">
          Leakage by usage
        </th>
        <th className="bg-gray-100 text-center p-4 font-bold text-gray-700 text-sm">
          Upload
        </th>
      </tr>
    </thead>
    <tbody>
      {rawMaterials.map((material, idx) => (
        <tr key={material.rawMaterialId || idx} className="border-b border-blue-200">
          {/* Leakage by storage */}
          <td className="bg-gray-100 p-4 text-gray-600 text-center">
            {preWeightData[material.rawMaterialId] || ""}
          </td>

          {/* Leakage by usage */}
          <td className="bg-white p-4 text-gray-600 text-center">
            {postWeightData[material.rawMaterialId] || ""}
          </td>

          {/* Upload button */}
<td className="bg-gray-100 p-4 text-center">
  <button
    onClick={() => handleImageCapture(material)}
    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors text-xs font-medium"
  >
    {capturedImages[material.rawMaterialId] ? "✓ Uploaded" : "Upload"}
  </button>
</td>
        </tr>
      ))}
    </tbody>
  </table>

<div className="h-5"></div>
    {/* Footer Buttons */}
   <div className="flex justify-between items-center mb-4 px-2">
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
    {showBarcodeModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
      <h2 className="text-lg font-semibold mb-4">
        Enter Barcode for {scanningMaterial?.name}
      </h2>

      {/* Manual input (still available) */}
      <input
        type="text"
        value={enteredBarcode}
        onChange={(e) => setEnteredBarcode(e.target.value)}
        placeholder="Enter barcode here or scan now"
        className="w-full border p-2 rounded mb-4"
        autoFocus
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
            const sourceList =
              scanSource === "rawMaterials" ? rawMaterials : packagingBottles;

            const matched =
              scanSource === "rawMaterials"
                ? sourceList.find(
                    (item) =>
                      item.rawMaterialId === scanningMaterial.rawMaterialId &&
                      item.barcode === enteredBarcode.trim()
                  )
                : sourceList.find(
                    (item) =>
                      item._id === scanningMaterial._id &&
                      item.barcode === enteredBarcode.trim()
                  );

            if (matched) {
              const idToAdd =
                scanSource === "rawMaterials"
                  ? matched.rawMaterialId
                  : matched._id;

              setVerifiedMaterials((prev) => [...prev, idToAdd]);
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


{showPreWeightModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
      <h2 className="text-lg font-semibold mb-4">
        Enter Pre-Weight for {updatingMaterial?.name}
      </h2>

      <input
        type="text"
        placeholder="Enter Pre-weight"
        value={preWeight}
        onChange={(e) => setPreWeight(e.target.value)}
        className="w-full border rounded px-3 py-2 mb-4"
      />

      <div className="flex justify-end space-x-3">
        <button
          onClick={() => {
            setShowPreWeightModal(false);
            setPreWeight('');
          }}
          className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
        >
          Cancel
        </button>

        <button
          className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded shadow-sm"
          onClick={async () => {
            try {
              if (!preWeight) {
                alert("Please enter the weight value.");
                return;
              }

              const payload = {
                rawMaterialId: updatingMaterial.rawMaterialId,
                medicineName: init?.medicineName,
                prescriptionId: init?.prescriptionId,
                preWeight
              };

              const response = await fetch(
                `${API_URL}/api/medicine-summary/update-preweight`,
                {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(payload),
                }
              );
              
              const data = await response.json();
      setPreWeightData(prev => ({
  ...prev,
  [updatingMaterial.rawMaterialId]: data.updatedRawMaterial.storageLeakedQuantity
}));

              if (!response.ok) throw new Error("Failed to update pre-weight");

              setPreWeightUpdated(prev => [...prev, updatingMaterial.rawMaterialId]);

              console.log("Pre weight updated");
              setShowPreWeightModal(false);
              setPreWeight('');
            } catch (err) {
              console.error("Update error:", err);
              alert("Failed to update weight.");
            }
          }}
        >
          Update Pre-Weight
        </button>
      </div>
    </div>
  </div>
)}

{showPostWeightModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
      <h2 className="text-lg font-semibold mb-4">
        Enter Post-Weight for {updatingMaterial?.name}
      </h2>

      <input
        type="text"
        placeholder="Enter Post-weight"
        value={postWeight}
        onChange={(e) => setPostWeight(e.target.value)}
        className="w-full border rounded px-3 py-2 mb-4"
      />

      <div className="flex justify-end space-x-3">
        <button
          onClick={() => {
            setShowPostWeightModal(false);
            setPostWeight('');
          }}
          className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
        >
          Cancel
        </button>

        <button
  className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded shadow-sm"
  onClick={async () => {
    try {
      if (!postWeight) {
        alert("Please enter the weight value.");
        return;
      }

      // Call the API and get the response data
      const data = await fetchStockToBeShelfedData(updatingMaterial);

      setPostWeightUpdated(prev => [...prev, updatingMaterial.rawMaterialId]);

      setPostWeightData(prev => ({
  ...prev,
  [updatingMaterial.rawMaterialId]: data.quantityLeaked
}));

      console.log("Post weight updated", data);
      setShowPostWeightModal(false);
      setPostWeight('');

      setFullyUpdatedMaterials(prev => [
        ...prev,
        updatingMaterial.rawMaterialId
      ]);
    } catch (err) {
      console.error("Update error:", err);
      alert("Failed to update weight.");
    }
  }}
>
  Update Post-Weight
</button>
      </div>
    </div>
  </div>
)}

{isOpen && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div className="bg-white rounded-2xl shadow-lg w-[350px] p-6 relative">
      {/* Title + Close Button */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Redo</h2>
        <button
          onClick={() => {
            setIsOpen(false);
            setSelectedMedicineForRedo(null);
          }}
          className="text-gray-500 hover:text-gray-700 text-xl font-bold"
        >
          ✕
        </button>
      </div>
      
      {/* Centered Question */}
      <p className="text-center text-lg text-black mb-6">Are you sure?</p>
      
      {/* Buttons */}
      <div className="flex justify-center gap-4">
        <button
          className="px-6 py-2 rounded-md border border-blue-500 text-gray-500 font-medium hover:bg-gray-100"
          onClick={() => {
            setIsOpen(false);
            setSelectedMedicineForRedo(null);
          }}
        >
          Cancel
        </button>
        <button
  className="px-6 py-2 rounded-md bg-blue-500 text-white font-medium hover:bg-blue-600"
  onClick={() => {
    // Remove the medicine from preparedMedicineIds to re-enable the button
    setPreparedMedicineIds(prev => 
      prev.filter(id => id !== selectedMedicineForRedo._id)
    );
    
    // Call the API in background (don't wait for it)
    fetch(`${API_URL}/api/medicine-summary/log-wastage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prescriptionId: prescription._id,
        medicineName: selectedMedicineForRedo.medicineName
      }),
    }).catch(error => {
      console.error('Error logging wastage:', error);
      // Optionally show error message, but don't revert the button state
    });
    
    // Close modal
    setIsOpen(false);
    setSelectedMedicineForRedo(null);
  }}
>
  Confirm
</button>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default MedicinePreparationView;