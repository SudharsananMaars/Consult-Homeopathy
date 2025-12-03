import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  IoIosArrowBack,
  IoIosAdd,
  IoMdTrash,
  IoIosSave,
  IoMdCalendar,
} from "react-icons/io";
import {
  FaSpinner,
  FaExclamationTriangle,
  FaClock,
  FaEdit,
} from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import config from "../../config";
import { duration } from "@mui/material";
import { Plus } from "lucide-react";
import LabelDropdown from "./LabelDropdown";
import MedicineConsumptionSelector from "./MedicineConsumptionSelector";
import FrequencyModal from "./FrequencyModal";
import DurationModal from "./DurationModal";

// Auth helper to check token
const checkAuth = () => {
  const token = localStorage.getItem("token");
  return !!token;
};

// Create axios instance with auth headers
const createAuthAxios = () => {
  const accessToken = localStorage.getItem("token");
  return axios.create({
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
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
  const [existingPrescriptions, setExistingPrescriptions] = useState([]);
  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState(null);
  const [appointmentData, setAppointmentData] = useState(null);
  const [showPrescriptionTable, setShowPrescriptionTable] = useState(true);
  const [mixedMedicineCounter, setMixedMedicineCounter] = useState(1);
  const [frequencyType, setFrequencyType] = useState("standard");
// Add these to your existing state declarations
const [discountType, setDiscountType] = useState("percentage"); // or "fixed"
const [discountValue, setDiscountValue] = useState(0);
const [discountedAmount, setDiscountedAmount] = useState(0);
  // Modal states
  const [showFrequencyModal, setShowFrequencyModal] = useState(false);
  const [showDurationModal, setShowDurationModal] = useState(false);
  const [currentItemForModal, setCurrentItemForModal] = useState(null);
  const [currentRowIndex, setCurrentRowIndex] = useState(null);

  const [allDurationRanges, setAllDurationRanges] = useState([]);
  const [currentMedicineIndex, setCurrentMedicineIndex] = useState(null);
  const [isDurationModalOpen, setIsDurationModalOpen] = useState(false);
  const [specialNote, setSpecialNote] = useState("");
const [polishingNote, setPolishingNote] = useState(false);

  const [allGapRanges, setAllGapRanges] = useState([]); // Track gap ranges for all medicines
  const [originalMedicineCourse, setOriginalMedicineCourse] = useState(10); // Store original course days

  // Prescription details
  const [prescriptionData, setPrescriptionData] = useState(() => {
    // Initialize with default structure
    const defaultData = {
      patientId: "",
      consultingType: "",
      consultingFor: "",
      medicineCourse: 10,
      action: {
        status: "In Progress",
        closeComment: "",
      },
      prescriptionItems: [
        {
          id: 1,
          isMixedMedicine: false,
          mixedMedicines: [], 
          prescriptionType: "Only Prescription",
          consumptionType: "Sequential",
          medicineName: "",
          form: "Tablets",
          dispenseQuantity: 0,
          rawMaterials: [],
          preparationQuantity: [],
          duration: "",
          uom: "Pieces",
          frequencyType: "standard",
          frequencies: [],
          standardSchedule: [],
          frequentSchedule: [],
          durationRanges: [],
          gapRanges: [], // Add gap ranges support
          price: 0,
          medicineConsumption: "",
          customConsumption: "",
          label: "A",
          additionalComments: "",
        },
      ],
      followUpDays: 10,
      medicineCharges: 0,
      shippingCharges: 0,
      additionalCharges: 0,
      notes: "",
      parentPrescriptionId: null,
    };

    // Try to load saved data with gap support
    try {
      const saved = localStorage.getItem("draftPrescription");
      if (saved) {
        const parsed = JSON.parse(saved);

        if (
          parsed &&
          typeof parsed === "object" &&
          parsed.prescriptionItems &&
          Array.isArray(parsed.prescriptionItems)
        ) {
          return {
            ...defaultData,
            ...parsed,
            prescriptionItems: parsed.prescriptionItems.map((item) => ({
              ...defaultData.prescriptionItems[0],
              ...item,
              id: item.id || Date.now() + Math.random(),
              gapRanges: item.gapRanges || [], // Ensure gap ranges exist
            })),
          };
        }
      }
    } catch (error) {
      console.error("Failed to parse saved prescription:", error);
      localStorage.removeItem("draftPrescription");
    }

    return defaultData;
  });

  const initialPatientId = useMemo(
    () => patientData?._id || "",
    [patientData?._id]
  );

  useEffect(() => {
    if (initialPatientId) {
      setPrescriptionData((prev) => ({
        ...prev,
        patientId: initialPatientId,
      }));
    }
  }, [initialPatientId]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      try {
        // Add timestamp for cleanup purposes
        const dataToSave = {
          ...prescriptionData,
          _savedAt: new Date().toISOString(),
          _version: "1.0", // Add version for future migrations
        };

        localStorage.setItem("draftPrescription", JSON.stringify(dataToSave));
        console.log("Prescription draft saved successfully");
      } catch (error) {
        console.error("Failed to save prescription draft:", error);
        // Handle storage quota exceeded
        if (error.name === "QuotaExceededError") {
          alert("Storage limit exceeded. Please submit or clear your draft.");
        }
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [prescriptionData]);

  const clearDraft = useCallback(() => {
    localStorage.removeItem("draftPrescription");
    console.log("Draft cleared");
  }, []);

  const resetPrescriptionData = useCallback(() => {
    localStorage.removeItem("draftPrescription");

    setPrescriptionData({
      patientId: "",
      consultingType: "",
      consultingFor: "",
      medicineCourse: 10,
      action: {
        status: "In Progress",
        closeComment: "",
      },
      prescriptionItems: [
        {
          id: Date.now() + Math.random(),
          prescriptionType: "Only Prescription",
          consumptionType: "Sequential",
          medicineName: "",
          form: "Tablets",
          dispenseQuantity: 0,
          rawMaterials: [],
          preparationQuantity: [],
          duration: "",
          uom: "Pieces",
          frequencyType: "standard",
          frequencies: [],
          standardSchedule: [],
          frequentSchedule: [],
          durationRanges: [],
          price: 0,
          medicineConsumption: "",
          customConsumption: "",
          label: "A",
          additionalComments: "",
        },
      ],
      followUpDays: 10,
      medicineCharges: 0,
      shippingCharges: 0,
      notes: "",
      parentPrescriptionId: null,
    });

    console.log("Prescription reset and draft cleared.");
  }, []);

  const hasDraft = useCallback(() => {
    try {
      const saved = localStorage.getItem("draftPrescription");
      return saved !== null && saved !== "null";
    } catch {
      return false;
    }
  }, []);

  // Auto-cleanup old drafts (call this on app startup)
  const cleanupOldDrafts = useCallback(() => {
    try {
      const saved = localStorage.getItem("draftPrescription");
      if (saved) {
        const parsed = JSON.parse(saved);
        const savedAt = new Date(parsed._savedAt);
        const now = new Date();
        const daysDiff = (now - savedAt) / (1000 * 60 * 60 * 24);

        // Remove drafts older than 7 days
        if (daysDiff > 7) {
          localStorage.removeItem("draftPrescription");
          console.log("Old draft cleaned up");
        }
      }
    } catch (error) {
      console.error("Error cleaning up old drafts:", error);
    }
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      // Only show warning if there's unsaved data and it's been modified
      const hasUnsavedData =
        hasDraft() &&
        (prescriptionData.prescriptionItems.some(
          (item) =>
            item.medicineName ||
            item.additionalComments ||
            item.rawMaterials.length > 0
        ) ||
          prescriptionData.notes);

      if (hasUnsavedData) {
        e.preventDefault();
        e.returnValue = ""; // Modern browsers require this
        return "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [prescriptionData, hasDraft]);

  useEffect(() => {
    cleanupOldDrafts();
  }, [cleanupOldDrafts]);

  const [prescriptionItems, setPrescriptionItems] = useState([]);
  const [fieldVisibility, setFieldVisibility] = useState({
    rawMaterial: true,
    preparationQuantity: true,
  });

  // Helper function to convert drops to ml (1ml = 20 drops standard)
  const dropsToMl = (drops) => {
    return parseFloat(drops) / 20;
  };

  // Helper function to convert ml to drops
  const mlToDrops = (ml) => {
    return parseFloat(ml) * 20;
  };

  const calculateDistilledWaterQuantity = (itemId) => {
    setPrescriptionData((prev) => {
      const updatedItems = prev.prescriptionItems.map((item) => {
        if (
          item.id !== itemId ||
          item.form !== "Liquid form" ||
          !item.dispenseQuantity
        ) {
          return item;
        }

        // Extract numeric value from dispense quantity (e.g., "15ml" -> 15)
        const dispenseQuantityValue = parseFloat(
          item.dispenseQuantity.replace(/[^0-9.]/g, "")
        );

        if (isNaN(dispenseQuantityValue) || dispenseQuantityValue <= 0) {
          return item;
        }

        // Calculate total drops used by other materials (excluding distilled water)
        let totalDropsUsed = 0;
        const otherMaterials = item.preparationQuantity.filter(
          (prep) => !prep.name.toLowerCase().includes("distilled water")
        );

        otherMaterials.forEach((prep) => {
          const quantity = parseFloat(prep.quantity || 0);
          if (!isNaN(quantity)) {
            // FIXED: In your structure, ML unit quantities are already in drops
            // So we don't need to convert ML to drops - they're already drops
            totalDropsUsed += quantity;
          }
        });

        // Convert total drops used to ml
        const totalMlUsed = dropsToMl(totalDropsUsed);

        // Calculate remaining ml needed
        const remainingMl = dispenseQuantityValue - totalMlUsed;

        // Convert remaining ml to drops for distilled water
        const distilledWaterDrops = Math.max(0, mlToDrops(remainingMl));

        // Update distilled water quantity in preparation
        const updatedPreparationQuantity = item.preparationQuantity.map(
          (prep) => {
            if (prep.name.toLowerCase().includes("distilled water")) {
              const parsedQuantity = parseFloat(distilledWaterDrops.toFixed(1));
              const totalPrice = parsedQuantity * prep.pricePerUnit;
              return {
                ...prep,
                quantity: parsedQuantity,
                totalPrice: totalPrice,
              };
            }
            return prep;
          }
        );

        // Recalculate total price
        const totalPrice = updatedPreparationQuantity.reduce(
          (sum, rm) => sum + rm.totalPrice,
          0
        );

        return {
          ...item,
          preparationQuantity: updatedPreparationQuantity,
          price: totalPrice,
        };
      });

      const totalMedicineCharges = updatedItems.reduce(
        (sum, item) => sum + item.price,
        0
      );

      return {
        ...prev,
        prescriptionItems: updatedItems,
        medicineCharges: totalMedicineCharges,
      };
    });
  };

  // Rest of your functions remain the same...
  const handleRawMaterialSelection = (itemId, rawMaterialId, isChecked) => {
    setPrescriptionData((prev) => {
      const updatedItems = prev.prescriptionItems.map((item) => {
        if (item.id === itemId) {
          let updatedRawMaterials = [...item.rawMaterials];
          let updatedPreparationQuantity = [...item.preparationQuantity];
          const rawMaterial = rawMaterials.find(
            (rm) => rm._id === rawMaterialId
          );

          if (isChecked && rawMaterial) {
            if (!updatedRawMaterials.some((rm) => rm._id === rawMaterialId)) {
              updatedRawMaterials.push({
                _id: rawMaterialId,
                name: rawMaterial.name,
                selected: true,
              });
              updatedPreparationQuantity.push({
                _id: rawMaterialId,
                name: rawMaterial.name,
                quantity: 1,
                unit: rawMaterial.uom,
                pricePerUnit: rawMaterial.costPerUnit,
                totalPrice: rawMaterial.costPerUnit,
              });
            }
          } else {
            updatedRawMaterials = updatedRawMaterials.filter(
              (rm) => rm._id !== rawMaterialId
            );
            updatedPreparationQuantity = updatedPreparationQuantity.filter(
              (rm) => rm._id !== rawMaterialId
            );
          }

          const totalPrice = updatedPreparationQuantity.reduce(
            (sum, rm) => sum + rm.totalPrice,
            0
          );

          return {
            ...item,
            rawMaterials: updatedRawMaterials,
            preparationQuantity: updatedPreparationQuantity,
            price: totalPrice,
          };
        }
        return item;
      });

      const totalMedicineCharges = updatedItems.reduce(
        (sum, item) => sum + item.price,
        0
      );

      return {
        ...prev,
        prescriptionItems: updatedItems,
        medicineCharges: totalMedicineCharges,
      };
    });

    // Trigger distilled water calculation after material selection
    setTimeout(() => {
      const currentItem = prescriptionData.prescriptionItems.find(
        (item) => item.id === itemId
      );
      if (currentItem && currentItem.form === "Liquid form") {
        calculateDistilledWaterQuantity(itemId);
      }
    }, 100);
  };

  const calculateDiscountedAmount = () => {
  const subtotal = prescriptionData.medicineCharges + 
                   prescriptionData.shippingCharges + 
                   prescriptionData.additionalCharges;
  
  let discount = 0;
  if (discountType === "percentage") {
    discount = (subtotal * discountValue) / 100;
  } else {
    discount = discountValue;
  }
  
  return Math.max(0, subtotal - discount); // Ensure total doesn't go negative
};

  const updatePreparationQuantity = (itemId, rawMaterialId, quantity) => {
    setPrescriptionData((prev) => {
      const updatedItems = prev.prescriptionItems.map((item) => {
        if (item.id === itemId) {
          const updatedPreparationQuantity = item.preparationQuantity.map(
            (rm) => {
              if (rm._id === rawMaterialId) {
                const parsedQuantity = parseFloat(quantity) || 0;
                const totalPrice = parsedQuantity * rm.pricePerUnit;
                return { ...rm, quantity: parsedQuantity, totalPrice };
              }
              return rm;
            }
          );

          const totalPrice = updatedPreparationQuantity.reduce(
            (sum, rm) => sum + rm.totalPrice,
            0
          );

          return {
            ...item,
            preparationQuantity: updatedPreparationQuantity,
            price: totalPrice,
          };
        }
        return item;
      });

      const totalMedicineCharges = updatedItems.reduce(
        (sum, item) => sum + item.price,
        0
      );

      return {
        ...prev,
        prescriptionItems: updatedItems,
        medicineCharges: totalMedicineCharges,
      };
    });

    // Trigger distilled water calculation after quantity update
    setTimeout(() => {
      const currentItem = prescriptionData.prescriptionItems.find(
        (item) => item.id === itemId
      );
      if (currentItem && currentItem.form === "Liquid form") {
        // Don't recalculate if the changed item is distilled water itself
        const changedMaterial = currentItem.preparationQuantity.find(
          (prep) => prep._id === rawMaterialId
        );
        if (
          changedMaterial &&
          !changedMaterial.name.toLowerCase().includes("distilled water")
        ) {
          calculateDistilledWaterQuantity(itemId);
        }
      }
    }, 50);
  };


  const addMixedMedicineItem = () => {
  const newId = Math.max(...prescriptionData.prescriptionItems.map(item => item.id), 0) + 1;
  
  const newMixedItem = {
    id: newId,
    isMixedMedicine: true, // Flag to identify mixed medicine
    prescriptionType: "Only Prescription",
    medicineConsumptionType: "Sequential",
    duration: "",
    frequencies: [],
    durationRanges: [],
    medicineConsumption: "",
    customConsumption: "",
    label: `M${mixedMedicineCounter}`, // M for Mixed
    additionalComments: "",
    // Nested medicines array
    mixedMedicines: [
      {
        id: `${newId}-1`,
        medicineName: "",
        form: "Tablets",
        dispenseQuantity: 0,
        rawMaterials: [],
        preparationQuantity: [],
        uom: "Pieces",
        price: 0,
      }
    ]
  };

  setPrescriptionData(prev => ({
    ...prev,
    prescriptionItems: [...prev.prescriptionItems, newMixedItem]
  }));
  
  setMixedMedicineCounter(prev => prev + 1);
};

const addMedicineToMixedGroup = (mixedItemId) => {
  setPrescriptionData(prev => ({
    ...prev,
    prescriptionItems: prev.prescriptionItems.map(item => {
      if (item.id === mixedItemId && item.isMixedMedicine) {
        const newMedicineId = `${mixedItemId}-${item.mixedMedicines.length + 1}`;
        return {
          ...item,
          mixedMedicines: [
            ...item.mixedMedicines,
            {
              id: newMedicineId,
              medicineName: "",
              form: "Tablets",
              dispenseQuantity: 0,
              rawMaterials: [],
              preparationQuantity: [],
              uom: "Pieces",
              price: 0,
            }
          ]
        };
      }
      return item;
    })
  }));
};

const removeMedicineFromMixedGroup = (mixedItemId, medicineId) => {
  setPrescriptionData(prev => ({
    ...prev,
    prescriptionItems: prev.prescriptionItems.map(item => {
      if (item.id === mixedItemId && item.isMixedMedicine) {
        return {
          ...item,
          mixedMedicines: item.mixedMedicines.filter(med => med.id !== medicineId)
        };
      }
      return item;
    })
  }));
};

  const updatePrescriptionItem = (itemId, field, value) => {
  setPrescriptionData((prev) => {
    const updatedItems = prev.prescriptionItems.map((item) => {
      if (item.id === itemId) {
        let updatedItem = { ...item };

        if (field === "frequencies") {
          // Store frequencies directly without transformation
          updatedItem.frequencies = value;

          // Update frequencyType from the first frequency
          if (value && value.length > 0) {
            updatedItem.frequencyType = value[0].frequencyType;
          }
        } else if (field === "form") {
          const formQuantity = getQuantityByForm(value);
          updatedItem = {
            ...updatedItem,
            form: value,
            dispenseQuantity: formQuantity.quantity,
            uom: formQuantity.uom,
            preparationQuantity: (item.preparationQuantity || []).map(
              (prep) => ({
                ...prep,
                unit: formQuantity.uom,
              })
            ),
          };
        } else {
          updatedItem[field] = value;
        }
        console.log("Updating", field, "with", value);

        return updatedItem;
      }
      return item;
    });

    // Recalculate total medicine charges
    const totalMedicineCharges = updatedItems.reduce(
      (sum, item) => sum + (parseFloat(item.price) || 0),
      0
    );

    return {
      ...prev,
      prescriptionItems: updatedItems,
      medicineCharges: totalMedicineCharges,
    };
  });

  // Trigger distilled water calculation for liquid forms when dispense quantity changes
  if (field === "dispenseQuantity" || field === "form") {
    setTimeout(() => {
      const currentItem = prescriptionData.prescriptionItems.find(
        (item) => item.id === itemId
      );
      if (currentItem && currentItem.form === "Liquid form") {
        calculateDistilledWaterQuantity(itemId);
      }
    }, 100);
  }
};

  // Form quantity mapping based on medicine form
  const getQuantityByForm = (form) => {
    const quantityMap = {
      Tablets: { quantity: 10, uom: "Graam" },
      Pills: { quantity: 20, uom: "Dram" },
      "Liquid form": { quantity: 100, uom: "ML" },
      "Individual Medicine": { quantity: 1, uom: "Pieces" },
    };
    return quantityMap[form] || { quantity: 1, uom: "Pieces" };
  };

  const LOCAL_STORAGE_KEY = "customConsumptionSuggestions";

  // Inside your component
  const [customSuggestions, setCustomSuggestions] = useState([]);

  // Load from localStorage when component mounts
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      setCustomSuggestions(JSON.parse(saved));
    }
  }, []);

  // Function to update and store new custom values
  const addCustomSuggestion = (newVal) => {
    const trimmed = newVal.trim();
    if (
      trimmed.length > 2 && // Optional: minimum length to avoid "a", "he", etc.
      !customSuggestions.includes(trimmed)
    ) {
      const updated = [...customSuggestions, trimmed];
      setCustomSuggestions(updated);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    }
  };

  // Check authentication on component load
  useEffect(() => {
    if (!checkAuth()) {
      toast.error("Please login to access this page");
      navigate("/login", { state: { from: location.pathname } });
      return;
    }

    if (!patientData || !patientData._id) {
      toast.error("Patient data is missing");
      navigate(-1);
      return;
    }

    fetchData();
  }, [API_URL, navigate, location.pathname, patientData]);

  // Fetch medicines, raw materials, and existing prescriptions
  const fetchData = async () => {
    try {
      setLoading(true);
      const authAxios = createAuthAxios();

      const [medicinesRes, rawMaterialsRes, prescriptionsRes, appointmentRes] =
        await Promise.all([
          authAxios.get(`${API_URL}/api/prescriptionControl/medicines`),
          authAxios.get(`${API_URL}/api/prescriptionControl/rawMaterials`),
          authAxios.get(
            `${API_URL}/api/prescriptionControl/patient/${patientData._id}`
          ),
          patientData.appointmentId
            ? authAxios.get(
                `${API_URL}/api/prescription/appointment/${patientData.appointmentId}`
              )
            : Promise.resolve(null),
        ]);
      // console.log("medicines: ", medicinesRes.data);
      setMedicines(medicinesRes.data?.data || []);
      setRawMaterials(rawMaterialsRes.data?.data || []);
      setExistingPrescriptions(prescriptionsRes.data?.data || []);

      if (appointmentRes) {
        const appointment = appointmentRes.data?.data || {};
        setAppointmentData(appointment);
        setPrescriptionData((prev) => ({
          ...prev,
          consultingType: appointment.consultingType || "",
          consultingFor: appointment.consultingFor || "",
        }));
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      if (err.response?.status === 401) {
        toast.error("Session expired. Please login again");
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        setError("Failed to load prescription data. Please try again.");
        toast.error("Failed to load prescription data");
      }
    } finally {
      setLoading(false);
    }
  };

  const addPrescriptionItem = () => {
    const newId =
      Math.max(
        ...prescriptionData.prescriptionItems.map((item) => item.id),
        0
      ) + 1;
    const labels = ["A", "B", "C", "1", "2", "3", "4"];
    const nextLabel =
      labels[prescriptionData.prescriptionItems.length % labels.length];

    const newItem = {
      id: newId,
      prescriptionType: "Only Prescription",
      medicineConsumptionType: "Sequential",
      medicineName: "",
      form: "Tablets",
      dispenseQuantity: 0,
      rawMaterials: [],
      preparationQuantity: [],
      duration: "",
      frequencies: [],
      durationRanges: [],
      selectedDurationDays: [],
      price: 0,
      medicineConsumption: "",
      customConsumption: "",
      label: nextLabel,
      additionalComments: "",
    };

    setPrescriptionData((prev) => ({
      ...prev,
      prescriptionItems: [...prev.prescriptionItems, newItem],
    }));
  };

  const removePrescriptionItem = (itemId) => {
    setPrescriptionData((prev) => {
      const updatedItems = prev.prescriptionItems.filter(
        (item) => item.id !== itemId
      );
      const totalMedicineCharges = updatedItems.reduce(
        (sum, item) => sum + item.price,
        0
      );

      return {
        ...prev,
        prescriptionItems: updatedItems,
        medicineCharges: totalMedicineCharges,
      };
    });
  };

  const openFrequencyModal = (item, rowIndex) => {
    setCurrentItemForModal(item);
    setCurrentRowIndex(rowIndex);
    setShowFrequencyModal(true);
  };

  const openDurationModal = (item, rowIndex) => {
    setCurrentItemForModal(item);
    setCurrentRowIndex(rowIndex);
    setShowDurationModal(true);
  };

  const transformFrequencyData = (frequencies) => {
    if (!frequencies || frequencies.length === 0) {
      return {
        frequencies: [],
        standardSchedule: [],
        frequentSchedule: [],
        frequencyType: "standard",
      };
    }

    const frequencyType = frequencies[0]?.frequencyType || "standard";

    if (frequencyType === "standard") {
      // Transform to backend format for standard schedule
      const standardSchedule = frequencies.map((freq) => ({
        day: freq.day,
        duration: freq.duration,
        timing: freq.timing || {
          morning: {
            food: freq.standardFrequency?.morning?.foodType || "",
            time: freq.standardFrequency?.morning?.from || "",
          },
          afternoon: {
            food: freq.standardFrequency?.afternoon?.foodType || "",
            time: freq.standardFrequency?.afternoon?.from || "",
          },
          evening: {
            food: freq.standardFrequency?.evening?.foodType || "",
            time: freq.standardFrequency?.evening?.from || "",
          },
          night: {
            food: freq.standardFrequency?.night?.foodType || "",
            time: freq.standardFrequency?.night?.from || "",
          },
        },
      }));

      return {
        frequencies: frequencies,
        standardSchedule: standardSchedule,
        frequentSchedule: [],
        frequencyType: "standard",
      };
    } else {
      // Transform to backend format for frequent schedule
      const frequentSchedule = frequencies.map((freq) => ({
        day: freq.day,
        frequency:
          freq.frequency ||
          `${freq.frequentFrequency?.hours || 0}hr ${
            freq.frequentFrequency?.minutes || 0
          }mins`,
      }));

      return {
        frequencies: frequencies,
        standardSchedule: [],
        frequentSchedule: frequentSchedule,
        frequencyType: "frequent",
      };
    }
  };

  const saveFrequency = (frequencies) => {
    if (currentItemForModal) {
      console.log("Saving frequencies:", frequencies);

      // No transformation needed - save frequencies as-is
      updatePrescriptionItem(
        currentItemForModal.id,
        "frequencies",
        frequencies
      );

      // Update parallel schedule if needed
      setPrescriptionData((prev) => {
        const hasParallelItems = prev.prescriptionItems.some(
          (item) =>
            item.consumptionType === "Parallel" &&
            item.frequencies?.some((freq) => freq.parallelConsumption)
        );

        if (hasParallelItems) {
          const updatedItems = generatePrescriptionWideParallelSchedule(
            prev.prescriptionItems
          );
          return { ...prev, prescriptionItems: updatedItems };
        }
        return prev;
      });
    }

    setShowFrequencyModal(false);
    setCurrentItemForModal(null);
  };

  const saveDuration = (
    durationRanges,
    summary,
    gapRanges = [],
    updatedCourseDays
  ) => {
    if (currentItemForModal && currentRowIndex !== null) {
      // Extract selected days from ranges
      const selectedDurationDays = [];
      durationRanges.forEach((range) => {
        if (range.startDay && range.endDay) {
          for (let day = range.startDay; day <= range.endDay; day++) {
            if (!selectedDurationDays.includes(day)) {
              selectedDurationDays.push(day);
            }
          }
        }
      });

      // Update specific item in prescription data
      setPrescriptionData((prev) => ({
        ...prev,
        medicineCourse: updatedCourseDays || prev.medicineCourse, // Update course days if provided
        prescriptionItems: prev.prescriptionItems.map((item, index) => {
          if (index === currentRowIndex) {
            return {
              ...item,
              durationRanges,
              duration: summary || item.duration,
              selectedDurationDays: selectedDurationDays.sort((a, b) => a - b),
              gapRanges: gapRanges || [], // Store gap ranges for this medicine
            };
          }
          return item;
        }),
      }));

      // Update global allDurationRanges
      setAllDurationRanges((prev) => {
        const updated = [...prev];
        // Ensure the array is long enough
        while (updated.length <= currentRowIndex) {
          updated.push([]);
        }
        updated[currentRowIndex] = durationRanges;
        return updated;
      });

      // Update global allGapRanges
      setAllGapRanges((prev) => {
        const updated = [...prev];
        // Ensure the array is long enough
        while (updated.length <= currentRowIndex) {
          updated.push([]);
        }
        updated[currentRowIndex] = gapRanges || [];
        return updated;
      });
    }

    // Close modal
    setShowDurationModal(false);
    setCurrentItemForModal(null);
    setCurrentRowIndex(null);
  };

  const handleCreateNewPrescription = () => {
    setShowPrescriptionTable(false);
    setSelectedPrescriptionId(null);
    setPrescriptionData((prev) => ({
      ...prev,
      parentPrescriptionId: null,
    }));
  };

  const handleAddToPrescription = (prescriptionId) => {
    setSelectedPrescriptionId(prescriptionId);
    setShowPrescriptionTable(false);
    setPrescriptionData((prev) => ({
      ...prev,
      parentPrescriptionId: prescriptionId,
    }));
  };
  const handlePolishSpecialNote = async () => {
  if (!specialNote.trim()) return;

  try {
    setPolishingNote(true);
    const authAxios = createAuthAxios();
    
    const response = await authAxios.post(
      `${API_URL}/api/gemini/polish-text`,
      { text: specialNote }
    );

    if (response.data?.improvedText) {
      setSpecialNote(response.data.improvedText);
      toast.success("Text polished successfully!");
    } else {
      toast.error("Failed to polish text");
    }
  } catch (err) {
    console.error("Error polishing text:", err);
    toast.error("Error polishing text. Please try again.");
  } finally {
    setPolishingNote(false);
  }
};

  const prepareDataForBackend = (prescriptionData) => {
    const backendData = {
      appointmentID: patientData.medicalDetails._id,
      ...prescriptionData,
      specialNote: specialNote,
      prescriptionItems: prescriptionData.prescriptionItems.map((item) => ({
        medicineName: item.medicineName || "",
        rawMaterialDetails: (item.preparationQuantity || []).map((rm) => ({
          _id: rm._id,
          name: rm.name,
          quantity: rm.quantity || 0,
          pricePerUnit: rm.pricePerUnit || 0,
          totalPrice: rm.totalPrice || 0,
        })),
        form: item.form || "Tablets",
        dispenseQuantity: item.dispenseQuantity || "",
        duration: item.duration || "",
        uom: item.uom || "Pieces",
        price: item.price || 0,
        additionalComments: item.additionalComments || "",
        // Send frequencies directly - no transformation
        frequencies: item.frequencies || [],
        frequencyType: item.frequencyType || "standard",

        // Keep legacy fields for backward compatibility
        standardSchedule: item.standardSchedule || [],
        frequentSchedule: item.frequentSchedule || [],
        parallelConsumption: item.parallelConsumption || null,

        prescriptionType: item.prescriptionType || "Only Prescription",
        consumptionType: item.consumptionType || "Sequential",
        medicineConsumption: item.medicineConsumption || "",
        label: item.label || "A",
        durationRanges: item.durationRanges || [],
        gapRanges: item.gapRanges || [],
        selectedDurationDays: item.selectedDurationDays || [],
        
      })),
    };

    console.log("Backend data prepared:", backendData);
    return backendData;
  };

  const handleSavePrescription = async () => {
    try {
      setSaving(true);

      if (!prescriptionData.prescriptionItems.length) {
        toast.error("Please add at least one prescription item");
        return;
      }

      const validationErrors = [];
      prescriptionData.prescriptionItems.forEach((item, index) => {
        if (!item.medicineName?.trim()) {
          validationErrors.push(
            `Medicine name is required for item ${index + 1}`
          );
        }
        if (!item.duration?.trim()) {
          validationErrors.push(`Duration is required for item ${index + 1}`);
        }
        if (!item.frequencies || item.frequencies.length === 0) {
          validationErrors.push(
            `Frequency configuration is required for item ${index + 1}`
          );
        }
      });

      if (validationErrors.length > 0) {
        toast.error(
          `Please fix the following:\n${validationErrors.join("\n")}`
        );
        return;
      }

      const authAxios = createAuthAxios();

      // Use the updated data preparation function
      const apiData = prepareDataForBackend(prescriptionData);
      console.log("Final Data: ", apiData);
      const response = await authAxios.post(
        `${API_URL}/api/prescriptionControl/create`,
        apiData
      );

      if (response.data.success) {
        toast.success("Prescription saved successfully!");
        clearDraft();
        navigate("/doctor-dashboard/myAllocation?follow=Follow+up-P");
      } else {
        toast.error(response.data.message || "Failed to save prescription");
      }
    } catch (err) {
      console.error("Error saving prescription:", err);
      if (err.response) {
        toast.error(
          err.response.data?.message || `Server Error: ${err.response.status}`
        );
      } else if (err.request) {
        toast.error("Network error. Please check your connection.");
      } else {
        toast.error(err.message || "An unexpected error occurred");
      }
    } finally {
      setSaving(false);
    }
  };

  const updateMixedMedicine = (mixedItemId, medicineId, field, value) => {
  setPrescriptionData(prev => ({
    ...prev,
    prescriptionItems: prev.prescriptionItems.map(item => {
      if (item.id === mixedItemId && item.isMixedMedicine) {
        return {
          ...item,
          mixedMedicines: item.mixedMedicines.map(med => {
            if (med.id === medicineId) {
              let updatedMed = { ...med, [field]: value };
              
              // Handle form change
              if (field === "form") {
                const formQuantity = getQuantityByForm(value);
                updatedMed = {
                  ...updatedMed,
                  dispenseQuantity: formQuantity.quantity,
                  uom: formQuantity.uom,
                };
              }
              
              return updatedMed;
            }
            return med;
          })
        };
      }
      return item;
    })
  }));
};

  // OPTIONAL: Helper function to validate frequency data structure
  const validateFrequencyData = (frequencies, frequencyType) => {
    if (!frequencies || frequencies.length === 0) {
      return false;
    }

    const isStandard =
      frequencyType === "standard" || frequencyType === "Standard";

    return frequencies.every((freq) => {
      if (isStandard) {
        // Validate standard frequency structure
        const standardFreq = freq.standardFrequency;
        return (
          standardFreq &&
          (standardFreq.morning ||
            standardFreq.afternoon ||
            standardFreq.evening ||
            standardFreq.night)
        );
      } else {
        // Validate frequent frequency structure
        const frequentFreq = freq.frequentFrequency;
        return (
          frequentFreq &&
          ((frequentFreq.hours && frequentFreq.hours > 0) ||
            (frequentFreq.minutes && frequentFreq.minutes > 0))
        );
      }
    });
  };

  // OPTIONAL: Enhanced validation function
  const validatePrescriptionData = (prescriptionData) => {
    const errors = [];

    if (!prescriptionData.patientId) {
      errors.push("Patient ID is required");
    }

    if (!prescriptionData.prescriptionItems.length) {
      errors.push("At least one prescription item is required");
    }

    prescriptionData.prescriptionItems.forEach((item, index) => {
      const itemNum = index + 1;

      if (!item.medicineName?.trim()) {
        errors.push(`Medicine name is required for item ${itemNum}`);
      }

      if (!item.duration?.trim()) {
        errors.push(`Duration is required for item ${itemNum}`);
      }

      if (!item.frequencies || item.frequencies.length === 0) {
        errors.push(`Frequency configuration is required for item ${itemNum}`);
      } else if (!validateFrequencyData(item.frequencies, item.frequencyType)) {
        errors.push(`Invalid frequency configuration for item ${itemNum}`);
      }

      if (item.price && isNaN(parseFloat(item.price))) {
        errors.push(`Invalid price for item ${itemNum}`);
      }
    });

    return errors;
  };

  const filteredRawMaterials = rawMaterials.filter((material) =>
    material.name.toLowerCase().includes(searchRawTerm.toLowerCase())
  );

  const getSelectedDaysFromDurationRanges = (durationRanges) => {
    const selectedDays = [];
    if (durationRanges && durationRanges.length > 0) {
      durationRanges.forEach((range) => {
        for (let day = range.startDay; day <= range.endDay; day++) {
          if (!selectedDays.includes(day)) {
            selectedDays.push(day);
          }
        }
      });
    }
    return selectedDays.sort((a, b) => a - b);
  };

  const getFieldVisibility = (prescriptionType) => {
    const fieldConfig = {
      prescriptionType: true, // Always visible
      medicineConsumptionType: false,
      medicineName: true, // Always visible
      medicineForm: true, // Always visible
      dispenseQuantity: true, // Always visible
      rawMaterial: false,
      preparationQuantity: false,
      duration: false,
      frequency: false, // Always visible
      medicineConsumption: false,
      label: false,
      additionalComments: true, // Always visible
      actions: true, // Always visible
    };

    switch (prescriptionType) {
      case "Prescription + Medicine":
      case "Prescription + Medicine kit":
        return {
          ...fieldConfig,
          medicineConsumptionType: true,
          rawMaterial: true,
          preparationQuantity: true,
          duration: true,
          frequency: true,
          price: true,
          medicineConsumption: true,
          label: true,
        };

      case "Only Prescription":
        return {
          ...fieldConfig,
          medicineConsumptionType: true,
          duration: true,
          frequency: true,
          medicineConsumption: true,
          label: true,
        };

      case "SOS Medicine":
        return {
          ...fieldConfig,
          rawMaterial: true,
          // medicineConsumptionType: true,
          price: true,
          medicineConsumption: true,
          preparationQuantity: true,
        };
      case "Only Medicine":
      case "Medicine + Kit":
        return {
          ...fieldConfig,
          rawMaterial: true,
          price: true,
          preparationQuantity: true,
        };

      default:
        return fieldConfig;
    }
  };

  const [showAddMedicineModal, setShowAddMedicineModal] = useState(false);
  const [newMedicineName, setNewMedicineName] = useState("");

  const handleAddMedicine = async () => {
    if (!newMedicineName.trim()) return alert("Medicine name cannot be empty.");

    const authAxios = createAuthAxios();
    try {
      const response = await authAxios.post(
        `${API_URL}/api/prescriptionControl/medicines`,
        { name: newMedicineName.trim() }
      );

      if (response.status === 201) {
        alert("Medicine added successfully!");
        setShowAddMedicineModal(false);
        setNewMedicineName("");
        fetchData(); // Refresh list
      }
    } catch (error) {
      if (error.response?.status === 409) {
        alert("This medicine already exists.");
      } else {
        console.error("Error adding medicine", error);
        alert("Failed to add medicine");
      }
    }
  };

  const [showCloseModal, setShowCloseModal] = useState(false);
  const [selectedCommentPrescriptionId, setSelectedCommentPrescriptionId] =
    useState(null);
  const [closeComment, setCloseComment] = useState("");

  const handleOpenCloseModal = (prescriptionId) => {
    setSelectedPrescriptionId(prescriptionId);
    setCloseComment("");
    setShowCloseModal(true);
  };

  const handleConfirmCloseStatus = async () => {
    try {
      const authAxios = createAuthAxios();
      const response = await authAxios.patch(
        `${API_URL}/api/prescriptionControl/${selectedPrescriptionId}/closeComment`,
        {
          status: "Close",
          closeComment: closeComment,
        }
      );

      if (response.data.success) {
        toast.success("Prescription marked as closed!");

        // ✅ Update the prescription in the existingPrescriptions list
        setExistingPrescriptions((prev) =>
          prev.map((p) =>
            p._id === selectedPrescriptionId ? response.data.data : p
          )
        );

        setShowCloseModal(false);
      } else {
        toast.error(response.data.message || "Failed to update status.");
      }
    } catch (err) {
      console.error("Error updating status:", err);
      toast.error("An error occurred while updating the status.");
    }
  };

  const handleUpdateActionStatus = async (
    prescriptionId,
    status = "In Progress"
  ) => {
    try {
      const authAxios = createAuthAxios();
      const response = await authAxios.patch(
        `${API_URL}/api/prescriptionControl/${prescriptionId}/closeComment`,
        {
          status: status,
          closeComment: "", // Empty since it's a reopen
        }
      );

      if (response.data.success) {
        toast.success(`Prescription marked as ${status}`);
        // ✅ Update UI with new data
        setExistingPrescriptions((prev) =>
          prev.map((p) => (p._id === prescriptionId ? response.data.data : p))
        );
      } else {
        toast.error(response.data.message || "Failed to update status");
      }
    } catch (err) {
      console.error("Error updating action status:", err);
      toast.error("An error occurred while updating the status");
    }
  };

  const updateMedicineCourse = (newCourseDays) => {
    setPrescriptionData((prev) => ({
      ...prev,
      medicineCourse: Math.max(prev.medicineCourse, newCourseDays),
    }));
  };

  const generatePrescriptionWideParallelSchedule = (prescriptionItems) => {
    const parallelItems = prescriptionItems.filter(
      (item) =>
        item.consumptionType === "Parallel" &&
        item.frequencies?.some((freq) => freq.frequencyType === "frequent")
    );

    if (parallelItems.length < 2) return prescriptionItems;

    const updatedItems = [...prescriptionItems];

    // Process each day separately
    const allDays = [
      ...new Set(
        parallelItems.flatMap((item) =>
          item.frequencies.map((freq) => freq.day)
        )
      ),
    ];

    allDays.forEach((day) => {
      const daySchedules = [];

      // Collect all doses for this day from all parallel medicines
      parallelItems.forEach((item, itemIndex) => {
        const dayFrequency = item.frequencies.find((freq) => freq.day === day);
        if (dayFrequency && dayFrequency.frequentFrequency) {
          const config = dayFrequency.frequentFrequency;
          const totalDoses = config.doses || 1;
          const intervalMinutes =
            (config.hours || 0) * 60 + (config.minutes || 0);

          for (let dose = 1; dose <= totalDoses; dose++) {
            daySchedules.push({
              itemIndex,
              medicineName: item.medicineName,
              day: day,
              doseNumber: dose,
              intervalMinutes: intervalMinutes,
              originalItemIndex: prescriptionItems.findIndex(
                (p) => p.id === item.id
              ),
            });
          }
        }
      });

      // Sort by medicine index and dose number for proper interleaving
      daySchedules.sort((a, b) => {
        if (a.itemIndex !== b.itemIndex) return a.itemIndex - b.itemIndex;
        return a.doseNumber - b.doseNumber;
      });

      // Calculate interleaved times
      const baseTime = new Date();
      baseTime.setHours(8, 0, 0, 0);

      daySchedules.forEach((schedule, index) => {
        // Space doses 1 hour apart between different medicines
        const offsetMinutes = index * 60;
        const doseTime = new Date(baseTime.getTime() + offsetMinutes * 60000);
        schedule.assignedTime = doseTime.toTimeString().slice(0, 5);
      });

      // Update each medicine's frequency parallel consumption data
      daySchedules.forEach((schedule) => {
        const item = updatedItems[schedule.originalItemIndex];
        const dayFrequency = item.frequencies.find(
          (freq) => freq.day === schedule.day
        );

        if (dayFrequency) {
          if (!dayFrequency.parallelConsumption) {
            dayFrequency.parallelConsumption = {
              type: "parallel",
              schedule: [],
              autoGenerated: true,
            };
          }

          dayFrequency.parallelConsumption.schedule.push({
            day: schedule.day,
            doseNumber: schedule.doseNumber,
            time: schedule.assignedTime,
            medicineIndex: schedule.itemIndex,
            medicineName: schedule.medicineName,
            type: "parallel",
            isOverlapping: false,
          });
        }
      });
    });

    return updatedItems;
  };

  const getMedicineCount = () => {
    console.log(
      "Calculating medicine count...",
      prescriptionData.prescriptionItems.length
    );
    // if (!prescriptionData || !prescriptionData.prescriptionItems) {
    //   return 0;
    // }
    return prescriptionData.prescriptionItems.length;
  };

  // Update the FrequencyModal props
  {
    showFrequencyModal && (
      <FrequencyModal
        isOpen={showFrequencyModal}
        onClose={() => setShowFrequencyModal(false)}
        onSave={saveFrequency}
        selectedDurationDays={
          currentItemForModal?.selectedDurationDays ||
          getSelectedDaysFromDurationRanges(
            currentItemForModal?.durationRanges
          ) ||
          []
        }
        consumptionType={
          currentItemForModal.medicineConsumptionType || "Sequential"
        }
        currentFrequencies={currentItemForModal?.frequencies || []}
        frequencyType={currentItemForModal?.frequencyType || "standard"}
        medicineName={currentItemForModal?.medicineName || ""}
        itemIndex={currentItemForModal?.id || 0}
        totalMedicines={getMedicineCount()} // Add this line
        allMedicines={prescriptionData.prescriptionItems} // Add this line
      />
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <FaSpinner className="animate-spin text-4xl text-blue-600" />
        <span className="ml-2 text-lg">Loading prescription data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <FaExclamationTriangle className="text-red-500 text-4xl mb-4" />
          <p className="text-lg text-red-600">{error}</p>
          <button
            onClick={fetchData}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  const formToUOM = {
  Tablets: "tablets",
  Pills: "pills",
  "Liquid form": "drops",
  "Individual Medicine": "" // no unit
};

  return (
    
    <div className="max-w-9xl mx-auto p-6">
      <ToastContainer position="top-right" autoClose={1000} />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate("/doctor-dashboard")}
            className="flex items-center text-blue-600 hover:text-blue-800 mr-4"
          >
            <IoIosArrowBack className="text-xl mr-1" />
            Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold text-gray-800">
            Prescription for {patientData?.name || "Patient"}
          </h1>
        </div>
      </div>

      {/* Patient Info */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <span className="font-medium">Patient Name:</span>{" "}
            {patientData?.name}
          </div>
          <div>
            <span className="font-medium">Age:</span> {patientData?.age}
          </div>
          <div>
            <span className="font-medium">Phone:</span> {patientData?.phone}
          </div>
        </div>
      </div>

      {/* Existing Prescriptions Table */}
      {showPrescriptionTable && (
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Existing Prescriptions</h2>
            <button
              onClick={handleCreateNewPrescription}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Create New Prescription
            </button>
          </div>

          {existingPrescriptions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-2 text-left">
                      Date
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left">
                      Consulting Type
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left">
                      Consulting For
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left">
                      Medicine Course
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left">
                      View Prescription
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left">
                      Action Status
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {existingPrescriptions.map((prescription) => (
                    <tr key={prescription._id} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2">
                        {new Date(prescription.createdAt).toLocaleDateString()}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {/* {prescription.consultingType || "N/A"} */}
                        {patientData?.medicalDetails?.diseaseType?.name}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {/* {prescription.consultingFor || "N/A"} */}
                        {patientData?.medicalDetails?.drafts}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {prescription.medicineCourse} days
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <button
                          onClick={() =>
                            navigate(`/view-prescription/${prescription._id}`)
                          }
                          className="text-blue-600 hover:underline"
                        >
                          View Prescription
                        </button>
                      </td>
                      <div>
                        <td className="border border-gray-300 px-4 py-2 text-center">
                          {prescription.action?.status === "In Progress" ? (
                            <button
                              className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                              onClick={() =>
                                handleOpenCloseModal(prescription._id)
                              }
                            >
                              Mark as Closed
                            </button>
                          ) : (
                            <button
                              className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                              // onClick={() => handleUpdateActionStatus(prescription._id, "In Progress")}
                            >
                              Closed
                            </button>
                          )}
                        </td>
                      </div>
                      <td className="border border-gray-300 px-4 py-2">
                        <button
                          onClick={() =>
                            handleAddToPrescription(prescription._id)
                          }
                          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                        >
                          Add Prescription
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                {showCloseModal && (
                  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
                      <h2 className="text-lg font-semibold mb-4">
                        Add Close Comment
                      </h2>
                      <textarea
                        rows="4"
                        className="w-full p-2 border rounded mb-4"
                        placeholder="Enter reason or notes for closing..."
                        value={closeComment}
                        onChange={(e) => setCloseComment(e.target.value)}
                      />
                      <div className="flex justify-end gap-3">
                        <button
                          className="bg-gray-300 text-gray-700 px-4 py-2 rounded"
                          onClick={() => setShowCloseModal(false)}
                        >
                          Cancel
                        </button>
                        <button
                          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                          onClick={handleConfirmCloseStatus}
                        >
                          Confirm Close
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No existing prescriptions found for this patient.</p>
              <button
                onClick={handleCreateNewPrescription}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Create First Prescription
              </button>
            </div>
          )}
        </div>
      )}
      

      {showAddMedicineModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Add New Medicine</h2>
            <input
              type="text"
              value={newMedicineName}
              onChange={(e) => setNewMedicineName(e.target.value)}
              placeholder="Enter medicine name"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowAddMedicineModal(false)}
                className="px-3 py-1.5 text-sm bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleAddMedicine}
                className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Prescription Form */}
      {!showPrescriptionTable && (
        <div className="space-y-6">
          {/* Prescription Details */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Prescription Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-3.5">
                  Consulting Type:
                </label>
                <p>{patientData?.medicalDetails?.diseaseType?.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-3.5">
                  Consulting For
                </label>
                <p>{patientData?.medicalDetails?.drafts}</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-3.5">
                  Medicine Course (Days)
                </label>
                <input
                  type="number"
                  value={prescriptionData.medicineCourse}
                  onChange={(e) =>
                    setPrescriptionData((prev) => ({
                      ...prev,
                      medicineCourse: parseInt(e.target.value) || 0,
                    }))
                  }
                  className="w-full border rounded px-3 py-2"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-3.5">
                  Action
                </label>

                <p>In progress</p>
              </div>
            </div>
          </div>

          {/* Prescription Items Table */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Prescription Items
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Manage medicines and prescriptions
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={addPrescriptionItem}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <IoIosAdd className="text-lg" />
                  Add Medicine
                </button>

                 <button
    onClick={addMixedMedicineItem}
    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-md hover:shadow-lg"
  >
    <IoIosAdd className="text-lg" />
    Add Mixed Medicine
  </button>

                <button
                  onClick={resetPrescriptionData}
                  className="flex items-center gap-2 px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 shadow hover:shadow-lg"
                >
                  🗑️ Clear All
                </button>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <th className="border-b border-gray-200 px-4 py-4 text-sm font-semibold text-gray-700 text-left">
                      S.No
                    </th>
                    <th className="border-b border-gray-200 px-4 py-4 text-sm font-semibold text-gray-700 text-left">
                      Prescription Type
                    </th>
                    <th className="border-b border-gray-200 px-4 py-4 text-sm font-semibold text-gray-700 text-left">
                      Medicine Consumption Type
                    </th>
                    <th className="border-b border-gray-200 px-4 py-4 text-sm font-semibold text-gray-700 text-left">
                      Medicine Name
                    </th>
                    <th className="border-b border-gray-200 px-4 py-4 text-sm font-semibold text-gray-700 text-left">
                      Medicine Form
                    </th>
                    <th className="border-b border-gray-200 px-4 py-4 text-sm font-semibold text-gray-700 text-left">
                      Dispense Quantity
                    </th>
                    <th className="border-b border-gray-200 px-4 py-4 text-sm font-semibold text-gray-700 text-left">
                      Raw Material
                    </th>
                    <th className="border-b border-gray-200 px-4 py-4 text-sm font-semibold text-gray-700 text-left">
                      Preparation + Quantity
                    </th>
                    <th className="border-b border-gray-200 px-4 py-4 text-sm font-semibold text-gray-700 text-left">
                      Duration
                    </th>
                    <th className="border-b border-gray-200 px-4 py-4 text-sm font-semibold text-gray-700 text-left">
                      Frequency
                    </th>
                    <th className="border-b border-gray-200 px-4 py-4 text-sm font-semibold text-gray-700 text-left">
                      Medicine Consumption
                    </th>
                    <th className="border-b border-gray-200 px-4 py-4 text-sm font-semibold text-gray-700 text-left">
                      Label
                    </th>
                    <th className="border-b border-gray-200 px-4 py-4 text-sm font-semibold text-gray-700 text-left">
                      Instructions
                    </th>
                    <th className="border-b border-gray-200 px-4 py-4 text-sm font-semibold text-gray-700 text-left">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {prescriptionData.prescriptionItems.map((item, index) => {
    const fieldVisibility = getFieldVisibility(item.prescriptionType);

    // Check if this is a mixed medicine row
    if (item.isMixedMedicine) {
      return (
        <React.Fragment key={item.id}>
          {/* Main Mixed Medicine Row - Common Fields */}
          <tr className="bg-purple-50 hover:bg-purple-100 transition-colors duration-150">
            <td className="px-4 py-4 text-center" rowSpan={item.mixedMedicines.length + 1}>
              <span className="inline-flex items-center justify-center w-8 h-8 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                {index + 1}
              </span>
            </td>
            
            {/* Common fields for mixed medicine */}
            <td className="px-4 py-4 min-w-48" colSpan="2">
              <select
    value={item.prescriptionType}
    onChange={(e) => updatePrescriptionItem(item.id, "prescriptionType", e.target.value)}
    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
  >
    <option value="Only Prescription">Only Prescription</option>
    <option value="Prescription + Medicine">Prescription + Medicine</option>
    <option value="Medicine + Kit">Medicine + Kit</option>
    <option value="Only Medicine">Only Medicine</option>
    <option value="Prescription + Medicine kit">Prescription + Medicine kit</option>
    <option value="SOS Medicine">SOS Medicine</option>
  </select>
            </td>
            
            <td className="px-4 py-4 min-w-44">
              <select
    value={item.medicineConsumptionType}
    onChange={(e) => updatePrescriptionItem(item.id, "medicineConsumptionType", e.target.value)}
    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
  >
    <option value="Sequential">Sequential</option>
    <option value="Sequential + Gap">Sequential + Gap</option>
    <option value="Parallel">Parallel</option>
    <option value="Parallel + Gap">Parallel + Gap</option>
  </select>
            </td>
            
            {/* Empty cells for medicine-specific fields */}
            <td colSpan="4" className="px-4 py-4 text-center text-gray-400">
              → Individual medicines below
            </td>
            
            {/* Duration */}
            <td
                          className={`px-4 py-4 min-w-32 ${
                            !fieldVisibility.duration
                              ? "opacity-30 pointer-events-none"
                              : ""
                          }`}
                        >
                          <button
                            type="button"
                            disabled={!fieldVisibility.duration}
                            onClick={() =>
                              fieldVisibility.duration &&
                              openDurationModal(item, index)
                            }
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white hover:bg-gray-50 hover:border-gray-300 text-left transition-all duration-200 flex items-center justify-between disabled:bg-gray-100 disabled:cursor-not-allowed"
                          >
                            <span className="text-gray-700">
                              {item.duration && item.duration !== "undefined"
                                ? item.duration
                                : "Set Duration"}
                            </span>
                            <svg
                              className="w-4 h-4 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
                              />
                            </svg>
                          </button>
                        </td>
            
            {/* Frequency */}
<td className="px-4 py-4 min-w-32">
  <div className="space-y-2">
    {/* Frequency Type Selector */}
    <select
      value={item.frequencyType || "standard"}
      onChange={(e) =>
        updatePrescriptionItem(item.id, "frequencyType", e.target.value)
      }
      className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs bg-white hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
    >
      <option value="standard">Standard (4 times/day)</option>
      <option value="frequent">Frequent Interval</option>
    </select>

    {/* Frequency Config Button */}
    <button
      type="button"
      onClick={() => openFrequencyModal(item, index)}
      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white hover:bg-gray-50 hover:border-gray-300 text-left transition-all duration-200 flex items-center justify-between"
    >
      <span className="text-gray-700">
        {item.frequencies?.length > 0
          ? `${item.frequencies.length} frequencies`
          : "Set Frequency"}
      </span>
      <svg
        className="w-4 h-4 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
        />
      </svg>
    </button>
  </div>
</td>
            
            {/* Medicine Consumption */}
            <td className="px-4 py-4 min-w-64">
  <MedicineConsumptionSelector 
    form={item.form}
    value={item.medicineConsumption}
    customValue={item.customConsumption}
    onChange={(val) => updatePrescriptionItem(item.id, "medicineConsumption", val)}
    onCustomChange={(val) => updatePrescriptionItem(item.id, "customConsumption", val)}
    disabled={!fieldVisibility.medicineConsumption}
    itemId={item.id}
  />
</td>

{/* Label */}
<td className="px-4 py-4">
  <LabelDropdown
    item={item}
    updatePrescriptionItem={updatePrescriptionItem}
    fieldVisibility={fieldVisibility}
  />
</td>
            
            {/* Instructions */}
            <td className="px-4 py-4 min-w-48">
              <textarea
                value={item.additionalComments}
                onChange={(e) => updatePrescriptionItem(item.id, "additionalComments", e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                rows="2"
                placeholder="Instructions..."
              />
            </td>
            
            {/* Actions */}
            <td className="px-4 py-4 text-center">
                          {prescriptionData.prescriptionItems.length > 1 && (
                            <button
                              onClick={() => removePrescriptionItem(item.id)}
                              className="inline-flex items-center px-3 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors duration-200 shadow-sm hover:shadow-md"
                              title="Remove item"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                ></path>
                              </svg>
                            </button>
                          )}
                        </td>
          </tr>

          {/* Nested Medicine Rows */}
          {item.mixedMedicines.map((medicine, medIndex) => (
            <tr key={medicine.id} className="bg-white border-l-4 border-purple-300">
              <td className="px-4 py-4 pl-12" colSpan="2">
                <div className="flex items-center gap-2">
                  <span className="text-purple-600 font-medium">#{medIndex + 1}</span>
                  <select
                    value={medicine.medicineName}
                    onChange={(e) => updateMixedMedicine(item.id, medicine.id, "medicineName", e.target.value)}
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="">Select medicine</option>
                    {medicines.map(med => (
                      <option key={med._id} value={med.name}>{med.name}</option>
                    ))}
                  </select>
                </div>
              </td>
              
              {/* Medicine Form */}
              <td className="px-4 py-4">
                <select
                  value={medicine.form}
                  onChange={(e) => updateMixedMedicine(item.id, medicine.id, "form", e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="Tablets">Tablets</option>
                  <option value="Pills">Pills</option>
                  <option value="Liquid form">Liquid form</option>
                  <option value="Individual Medicine">Individual Medicine</option>
                </select>
              </td>
              
              {/* Dispense Quantity */}
              <td className="px-4 py-4 min-w-32">
                          {item.form === "Liquid form" ? (
                            <select
                              value={item.dispenseQuantity}
                              onChange={(e) => {
                                updatePrescriptionItem(
                                  item.id,
                                  "dispenseQuantity",
                                  e.target.value
                                );
                              }}
                              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white hover:border-gray-300 transition-colors"
                            >
                              <option value="">Select quantity</option>
                              <option value="5ml">5ml</option>
                              <option value="15ml">15ml</option>
                              <option value="30ml">30ml</option>
                            </select>
                          ) : item.form === "Pills" ? (
                            <select
                              value={item.dispenseQuantity}
                              onChange={(e) =>
                                updatePrescriptionItem(
                                  item.id,
                                  "dispenseQuantity",
                                  e.target.value
                                )
                              }
                              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white hover:border-gray-300 transition-colors"
                            >
                              <option value="">Select quantity</option>
                              <option value="1/2 dram">1/2 dram</option>
                              <option value="1 dram">1 dram</option>
                              <option value="2 dram">2 dram</option>
                            </select>
                          ) : item.form === "Tablets" ? (
                            <select
                              value={item.dispenseQuantity}
                              onChange={(e) =>
                                updatePrescriptionItem(
                                  item.id,
                                  "dispenseQuantity",
                                  e.target.value
                                )
                              }
                              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white hover:border-gray-300 transition-colors"
                            >
                              <option value="">Select quantity</option>
                              <option value="10gram">10gram</option>
                              <option value="20gram">20gram</option>
                              <option value="25gram">25gram</option>
                            </select>
                          ) : (
                            <input
                              type="text"
                              value={item.dispenseQuantity}
                              onChange={(e) =>
                                updatePrescriptionItem(
                                  item.id,
                                  "dispenseQuantity",
                                  e.target.value
                                )
                              }
                              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white hover:border-gray-300 transition-colors"
                              placeholder="Enter quantity"
                            />
                          )}
                        </td>

              {/* Raw Material */}
<td className="px-4 py-4">
  <div className="relative">
    <button
      type="button"
      onClick={() => {
        const dropdown = document.getElementById(`raw-material-dropdown-${item.id}-${medicine.id}`);
        dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
      }}
      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-left bg-white hover:bg-gray-50"
    >
      Raw Materials ({medicine.rawMaterials?.length || 0})
    </button>
    <div
      id={`raw-material-dropdown-${item.id}-${medicine.id}`}
      className="absolute z-10 w-72 bg-white border rounded-lg shadow-lg mt-2 max-h-48 overflow-y-auto hidden"
    >
      {/* Same structure as regular medicine raw material dropdown */}
      {filteredRawMaterials.map((material) => (
        <div key={material._id} className="grid grid-cols-2 px-3 py-2 hover:bg-blue-50">
          <label className="flex items-center text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={medicine.rawMaterials?.some(rm => rm._id === material._id)}
              onChange={(e) => {
                // Handle nested medicine raw material selection
                setPrescriptionData(prev => ({
                  ...prev,
                  prescriptionItems: prev.prescriptionItems.map(pItem => {
                    if (pItem.id === item.id) {
                      return {
                        ...pItem,
                        mixedMedicines: pItem.mixedMedicines.map(med => {
                          if (med.id === medicine.id) {
                            let updatedRawMaterials = [...(med.rawMaterials || [])];
                            if (e.target.checked) {
                              updatedRawMaterials.push({
                                _id: material._id,
                                name: material.name,
                                selected: true
                              });
                            } else {
                              updatedRawMaterials = updatedRawMaterials.filter(rm => rm._id !== material._id);
                            }
                            return { ...med, rawMaterials: updatedRawMaterials };
                          }
                          return med;
                        })
                      };
                    }
                    return pItem;
                  })
                }));
              }}
              className="mr-3 rounded border-gray-300 text-blue-600"
            />
            {material.name}
          </label>
          <span className="text-sm">{material.currentQuantity ?? 0}</span>
        </div>
      ))}
    </div>
  </div>
</td>

{/* Preparation Quantity */}
<td className="px-4 py-4 min-w-52">
      <div className="space-y-2">
        {medicine.preparationQuantity?.map((prep) => (
          <div key={prep._id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-100">
            <span className="text-sm text-gray-700 flex-1 truncate">{prep.name}</span>
            <input
              type="number"
              value={
                prep.name.toLowerCase().includes("distilled water")
                  ? dropsToMl(prep.quantity).toFixed(1)
                  : prep.quantity
              }
              onChange={(e) => {
                setPrescriptionData(prev => ({
                  ...prev,
                  prescriptionItems: prev.prescriptionItems.map(pItem => {
                    if (pItem.id === item.id) {
                      return {
                        ...pItem,
                        mixedMedicines: pItem.mixedMedicines.map(med => {
                          if (med.id === medicine.id) {
                            const updatedPrep = med.preparationQuantity.map(p => {
                              if (p._id === prep._id) {
                                const qty = parseFloat(e.target.value) || 0;
                                return { ...p, quantity: qty, totalPrice: qty * p.pricePerUnit };
                              }
                              return p;
                            });
                            
                            // Recalculate total price for this medicine
                            const totalPrice = updatedPrep.reduce((sum, rm) => sum + rm.totalPrice, 0);
                            
                            return { 
                              ...med, 
                              preparationQuantity: updatedPrep,
                              price: totalPrice 
                            };
                          }
                          return med;
                        })
                      };
                    }
                    return pItem;
                  })
                }));
              }}
              disabled={
                item.form === "Liquid form" &&
                prep.name.toLowerCase().includes("distilled water")
              }
              className="w-20 border border-gray-200 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              min="0"
              step="0.1"
            />
            <span className="text-sm text-gray-500">
              {prep.name.toLowerCase().includes("distilled water")
                ? "ml"
                : prep.unit === "ml"
                ? "drops"
                : prep.unit}
            </span>
            {item.form === "Liquid form" &&
              prep.name.toLowerCase().includes("distilled water") && (
                <span className="text-xs text-blue-600 ml-2">(Auto)</span>
              )}
          </div>
        ))}
        {(!medicine.preparationQuantity || medicine.preparationQuantity.length === 0) && (
          <div className="p-3 text-center">
            <span className="text-sm text-gray-400">No materials selected</span>
          </div>
        )}
      </div>
    </td>
              
              {/* Empty cells for common fields (rowspan) */}
              <td colSpan="6"></td>
              
              {/* Delete button for individual medicine */}
              <td className="px-4 py-4 text-center">
                {item.mixedMedicines.length > 1 && (
                  <button
                    onClick={() => removeMedicineFromMixedGroup(item.id, medicine.id)}
                    className="inline-flex items-center px-2 py-1 bg-red-500 text-white rounded text-xs"
                  >
                    <IoMdTrash />
                  </button>
                )}
              </td>
            </tr>
          ))}

          {/* Add Medicine Button Row */}
          <tr className="bg-purple-50">
            <td colSpan="14" className="px-4 py-2 text-center">
              <button
                onClick={() => addMedicineToMixedGroup(item.id)}
                className="inline-flex items-center gap-1 px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
              >
                <IoIosAdd /> Add Medicine to Group
              </button>
            </td>
          </tr>
        </React.Fragment>
      );
    }
                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-blue-50 transition-colors duration-150"
                      >
                        {/* S.No */}
                        <td className="px-4 py-4 text-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                            {index + 1}
                          </span>
                        </td>

                        {/* Prescription Type */}
                        <td className="px-4 py-4 min-w-48">
                          <select
                            value={item.prescriptionType}
                            onChange={(e) =>
                              updatePrescriptionItem(
                                item.id,
                                "prescriptionType",
                                e.target.value
                              )
                            }
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white hover:border-gray-300 transition-colors"
                          >
                            <option value="Only Prescription">
                              Only Prescription
                            </option>
                            <option value="Prescription + Medicine">
                              Prescription + Medicine
                            </option>
                            <option value="Medicine + Kit">
                              Medicine + Kit
                            </option>
                            <option value="Only Medicine">Only Medicine</option>
                            <option value="Prescription + Medicine kit">
                              Prescription + Medicine kit
                            </option>
                            <option value="SOS Medicine">SOS Medicine</option>
                          </select>
                        </td>

                        {/* Medicine Consumption Type */}
                        <td
                          className={`px-4 py-4 min-w-44 ${
                            !fieldVisibility.medicineConsumptionType
                              ? "opacity-30 pointer-events-none"
                              : ""
                          }`}
                        >
                          <select
                            value={item.medicineConsumptionType}
                            onChange={(e) =>
                              updatePrescriptionItem(
                                item.id,
                                "medicineConsumptionType",
                                e.target.value
                              )
                            }
                            disabled={!fieldVisibility.medicineConsumptionType}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white hover:border-gray-300 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                          >
                            <option value="Sequential">Sequential</option>
                            <option value="Sequential + Gap">
                              Sequential + Gap
                            </option>
                            <option value="Parallel">Parallel</option>
                            <option value="Parallel">Parallel + Gap</option>
                          </select>
                        </td>

                        {/* Medicine Name */}
                        <td className="px-4 py-4 min-w-44">
                          <div className="flex items-center space-x-2">
                            <select
                              value={item.medicineName}
                              onChange={(e) =>
                                updatePrescriptionItem(
                                  item.id,
                                  "medicineName",
                                  e.target.value
                                )
                              }
                              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white hover:border-gray-300 transition-colors"
                            >
                              <option value="">Select medicine</option>
                              {medicines.map((med) => (
                                <option key={med._id} value={med.name}>
                                  {med.name}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              onClick={() => setShowAddMedicineModal(true)}
                              className="text-blue-500 hover:text-blue-700"
                              title="Add new medicine"
                            >
                              <Plus size={18} />
                            </button>
                          </div>
                        </td>
                        

                        {/* Medicine Form */}
                        <td className="px-4 py-4 min-w-36">
  <select
    value={item.form}
    onChange={(e) =>
      updatePrescriptionItem(item.id, "form", e.target.value)
    }
    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm 
               focus:ring-2 focus:ring-blue-500 focus:border-transparent 
               bg-white hover:border-gray-300 transition-colors"
  >
    <option value="Tablets">Tablets</option>
    <option value="Pills">Pills</option>
    <option value="Liquid form">Liquid form</option>
    <option value="Individual Medicine">Individual Medicine</option>
  </select>
</td>

                        {/* Dispense Quantity */}
                        <td className="px-4 py-4 min-w-32">
                          {item.form === "Liquid form" ? (
                            <select
                              value={item.dispenseQuantity}
                              onChange={(e) => {
                                updatePrescriptionItem(
                                  item.id,
                                  "dispenseQuantity",
                                  e.target.value
                                );
                              }}
                              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white hover:border-gray-300 transition-colors"
                            >
                              <option value="">Select quantity</option>
                              <option value="5ml">5ml</option>
                              <option value="15ml">15ml</option>
                              <option value="30ml">30ml</option>
                            </select>
                          ) : item.form === "Pills" ? (
                            <select
                              value={item.dispenseQuantity}
                              onChange={(e) =>
                                updatePrescriptionItem(
                                  item.id,
                                  "dispenseQuantity",
                                  e.target.value
                                )
                              }
                              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white hover:border-gray-300 transition-colors"
                            >
                              <option value="">Select quantity</option>
                              <option value="1/2 dram">1/2 dram</option>
                              <option value="1 dram">1 dram</option>
                              <option value="2 dram">2 dram</option>
                            </select>
                          ) : item.form === "Tablets" ? (
                            <select
                              value={item.dispenseQuantity}
                              onChange={(e) =>
                                updatePrescriptionItem(
                                  item.id,
                                  "dispenseQuantity",
                                  e.target.value
                                )
                              }
                              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white hover:border-gray-300 transition-colors"
                            >
                              <option value="">Select quantity</option>
                              <option value="10gram">10gram</option>
                              <option value="20gram">20gram</option>
                              <option value="25gram">25gram</option>
                            </select>
                          ) : (
                            <input
                              type="text"
                              value={item.dispenseQuantity}
                              onChange={(e) =>
                                updatePrescriptionItem(
                                  item.id,
                                  "dispenseQuantity",
                                  e.target.value
                                )
                              }
                              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white hover:border-gray-300 transition-colors"
                              placeholder="Enter quantity"
                            />
                          )}
                        </td>

                        {/* Raw Material */}
                        <td
                          className={`px-4 py-4 min-w-44 ${
                            !fieldVisibility.rawMaterial
                              ? "opacity-30 pointer-events-none"
                              : ""
                          }`}
                        >
                          <div className="relative">
                            <button
                              type="button"
                              disabled={!fieldVisibility.rawMaterial}
                              onClick={() => {
                                if (fieldVisibility.rawMaterial) {
                                  const dropdown = document.getElementById(
                                    `raw-material-dropdown-${item.id}`
                                  );
                                  dropdown.style.display =
                                    dropdown.style.display === "block"
                                      ? "none"
                                      : "block";
                                }
                              }}
                              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-left bg-white hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 flex items-center justify-between disabled:bg-gray-100 disabled:cursor-not-allowed"
                            >
                              <span>
                                Raw Materials ({item.rawMaterials.length})
                              </span>
                              <svg
                                className="w-4 h-4 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M19 9l-7 7-7-7"
                                ></path>
                              </svg>
                            </button>
                            {fieldVisibility.rawMaterial && (
                              <div
                                id={`raw-material-dropdown-${item.id}`}
                                className="absolute z-10 w-72 bg-white border border-gray-200 rounded-lg shadow-lg mt-2 max-h-48 overflow-y-auto hidden"
                              >
                                <div className="p-3 border-b border-gray-100">
                                  <input
                                    type="text"
                                    placeholder="Search raw materials..."
                                    value={searchRawTerm}
                                    onChange={(e) =>
                                      setSearchRawTerm(e.target.value)
                                    }
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  />
                                </div>
                                <div className="max-h-36 overflow-y-auto">
                                  <div className="grid grid-cols-2 text-sm font-semibold text-gray-600 px-3 py-2 border-b bg-gray-100">
                                    <span>Material Name</span>
                                    <span>Quantity</span>
                                  </div>

                                  {filteredRawMaterials.map((material) => (
                                    <div
                                      key={material._id}
                                      className="grid grid-cols-2 px-3 py-2 hover:bg-blue-50 transition-colors items-center"
                                    >
                                      <label className="flex items-center text-sm cursor-pointer">
                                        <input
                                          type="checkbox"
                                          checked={item.rawMaterials.some(
                                            (rm) => rm._id === material._id
                                          )}
                                          onChange={(e) =>
                                            handleRawMaterialSelection(
                                              item.id,
                                              material._id,
                                              e.target.checked
                                            )
                                          }
                                          className="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-gray-700">
                                          {material.name}
                                        </span>
                                      </label>
                                      <span className="text-sm text-gray-800">
                                        {material.currentQuantity ?? 0}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Preparation + Quantity */}
                        <td
                          className={`px-4 py-4 min-w-52 ${
                            !fieldVisibility.preparationQuantity
                              ? "opacity-30 pointer-events-none"
                              : ""
                          }`}
                        >
                          <div className="space-y-2">
                            {item.preparationQuantity.map((prep) => (
                              <div
                                key={prep._id}
                                className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-100"
                              >
                                <span className="text-sm text-gray-700 flex-1 truncate">
                                  {prep.name}
                                </span>
                                <input
                                  type="number"
                                  value={
                                    prep.name
                                      .toLowerCase()
                                      .includes("distilled water")
                                      ? dropsToMl(prep.quantity).toFixed(1)
                                      : prep.quantity
                                  }
                                  onChange={(e) => {
                                    updatePreparationQuantity(
                                      item.id,
                                      prep._id,
                                      e.target.value
                                    );
                                  }}
                                  disabled={
                                    !fieldVisibility.preparationQuantity ||
                                    (item.form === "Liquid form" &&
                                      prep.name
                                        .toLowerCase()
                                        .includes("distilled water"))
                                  }
                                  className="w-20 border border-gray-200 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                                  min="0"
                                  step="0.1"
                                />

                                <span className="text-sm text-gray-500">
                                  {prep.name
                                    .toLowerCase()
                                    .includes("distilled water")
                                    ? "ml"
                                    : prep.unit === "ml"
                                    ? "drops"
                                    : prep.unit}
                                </span>
                                {item.form === "Liquid form" &&
                                  prep.name
                                    .toLowerCase()
                                    .includes("distilled water") && (
                                    <span className="text-xs text-blue-600 ml-2">
                                      (Auto)
                                    </span>
                                  )}
                              </div>
                            ))}
                            {item.preparationQuantity.length === 0 && (
                              <div className="p-3 text-center">
                                <span className="text-sm text-gray-400">
                                  No materials selected
                                </span>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Duration */}
                        <td
                          className={`px-4 py-4 min-w-32 ${
                            !fieldVisibility.duration
                              ? "opacity-30 pointer-events-none"
                              : ""
                          }`}
                        >
                          <button
                            type="button"
                            disabled={!fieldVisibility.duration}
                            onClick={() =>
                              fieldVisibility.duration &&
                              openDurationModal(item, index)
                            }
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white hover:bg-gray-50 hover:border-gray-300 text-left transition-all duration-200 flex items-center justify-between disabled:bg-gray-100 disabled:cursor-not-allowed"
                          >
                            <span className="text-gray-700">
                              {item.duration && item.duration !== "undefined"
                                ? item.duration
                                : "Set Duration"}
                            </span>
                            <svg
                              className="w-4 h-4 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
                              />
                            </svg>
                          </button>
                        </td>

                        {/* Frequency */}
                        <td
                          className={`px-4 py-4 min-w-32 ${
                            !fieldVisibility.frequency
                              ? "opacity-30 pointer-events-none"
                              : ""
                          }`}
                        >
                          <div className="space-y-2">
                            {/* Frequency Type Selector */}
                            <select
                              value={item.frequencyType || "standard"}
                              onChange={(e) =>
                                updatePrescriptionItem(
                                  item.id,
                                  "frequencyType",
                                  e.target.value
                                )
                              }
                              disabled={!fieldVisibility.frequency}
                              className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs bg-white hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                            >
                              <option value="standard">
                                Standard (4 times/day)
                              </option>
                              <option value="frequent">
                                Frequent Interval
                              </option>
                            </select>

                            {/* Frequency Config Button */}
                            <button
                              type="button"
                              disabled={!fieldVisibility.frequency}
                              onClick={() =>
                                fieldVisibility.frequency &&
                                openFrequencyModal(item, index)
                              }
                              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white hover:bg-gray-50 hover:border-gray-300 text-left transition-all duration-200 flex items-center justify-between disabled:bg-gray-100 disabled:cursor-not-allowed"
                            >
                              <span className="text-gray-700">
                                {item.frequencies.length > 0
                                  ? `${item.frequencies.length} frequencies`
                                  : "Set Frequency"}
                              </span>
                              <svg
                                className="w-4 h-4 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
                                />
                              </svg>
                            </button>
                          </div>
                        </td>
                        {/* Medicine Consumption */}
                        <td
  className={`px-4 py-4 min-w-64 ${
    !fieldVisibility.medicineConsumption
      ? "opacity-30 pointer-events-none"
      : ""
  }`}
>
  <div className="flex items-center gap-2">
    <MedicineConsumptionSelector
      form={item.form}
      value={item.medicineConsumption}
      customValue={item.customConsumption}
      onChange={(val) =>
        updatePrescriptionItem(item.id, "medicineConsumption", val)
      }
      onCustomChange={(val) =>
        updatePrescriptionItem(item.id, "customConsumption", val)
      }
      disabled={!fieldVisibility.medicineConsumption}
      itemId={item.id}
    />
    
    {/* Unit of measure text */}
    {formToUOM[item.form] && (
      <span className="text-gray-600 text-sm">
        {formToUOM[item.form]}
      </span>
    )}
  </div>
</td>
                        <LabelDropdown
                          item={item}
                          updatePrescriptionItem={updatePrescriptionItem}
                          fieldVisibility={fieldVisibility}
                        />

                        {/* Additional Comments */}
                        <td className="px-4 py-4 min-w-48">
                          <textarea
                            value={item.additionalComments}
                            onChange={(e) =>
                              updatePrescriptionItem(
                                item.id,
                                "additionalComments",
                                e.target.value
                              )
                            }
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white hover:border-gray-300 transition-colors"
                            rows="2"
                            placeholder="Instructions..."
                          />
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-4 text-center">
                          {prescriptionData.prescriptionItems.length > 1 && (
                            <button
                              onClick={() => removePrescriptionItem(item.id)}
                              className="inline-flex items-center px-3 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors duration-200 shadow-sm hover:shadow-md"
                              title="Remove item"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                ></path>
                              </svg>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Prescription Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Medicine Charges
                </label>
                <input
                  type="number"
                  value={prescriptionData.medicineCharges}
                  onChange={(e) =>
                    setPrescriptionData((prev) => ({
                      ...prev,
                      medicineCharges: parseFloat(e.target.value) || 0,
                    }))
                  }
                  className="w-full border rounded px-3 py-2"
                  min="0"
                  step="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Shipping Charges
                </label>
                <input
                  type="number"
                  value={prescriptionData.shippingCharges}
                  onChange={(e) =>
                    setPrescriptionData((prev) => ({
                      ...prev,
                      shippingCharges: parseFloat(e.target.value) || 0,
                    }))
                  }
                  className="w-full border rounded px-3 py-2"
                  min="0"
                  step="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Consultation Charges
                </label>
                <input
                  type="number"
                  value={prescriptionData.additionalCharges}
                  onChange={(e) =>
                    setPrescriptionData((prev) => ({
                      ...prev,
                      additionalCharges: parseFloat(e.target.value) || 0,
                    }))
                  }
                  className="w-full border rounded px-3 py-2"
                  min="0"
                  step="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Total Amount
                </label>
                <input
                  type="number"
                  value={
                    prescriptionData.medicineCharges +
                    prescriptionData.shippingCharges +
                    prescriptionData.additionalCharges
                  }
                  readOnly
                  className="w-full border rounded px-3 py-2 bg-gray-100 font-medium"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium mb-1">
                Additional Notes
              </label>
              <textarea
                value={prescriptionData.notes}
                onChange={(e) =>
                  setPrescriptionData((prev) => ({
                    ...prev,
                    notes: e.target.value,
                  }))
                }
                className="w-full border rounded px-3 py-2"
                rows="3"
                placeholder="Enter any additional notes for the prescription..."
              />
            </div>
          </div>
          {/* Discount Section */}
<div className="bg-white rounded-lg shadow p-6">
  <h2 className="text-lg font-semibold mb-4">Discount</h2>
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <div>
      <label className="block text-sm font-medium mb-1">
        Discount Type
      </label>
      <select
        value={discountType}
        onChange={(e) => setDiscountType(e.target.value)}
        className="w-full border rounded px-3 py-2"
      >
        <option value="percentage">Percentage (%)</option>
        <option value="fixed">Fixed Amount (₹)</option>
      </select>
    </div>
    <div>
      <label className="block text-sm font-medium mb-1">
        Discount Value
      </label>
      <input
        type="number"
        value={discountValue}
        onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
        className="w-full border rounded px-3 py-2"
        min="0"
        step={discountType === "percentage" ? "1" : "0.01"}
        max={discountType === "percentage" ? "100" : undefined}
      />
    </div>
    <div>
      <label className="block text-sm font-medium mb-1">
        Final Total Amount
      </label>
      <input
        type="number"
        value={calculateDiscountedAmount()}
        readOnly
        className="w-full border rounded px-3 py-2 bg-white font-bold text-green-800"
      />
    </div>
  </div>
</div>

<div className="mt-4">
  <label className="block text-sm font-medium mb-1">
    Special Note
  </label>
  <div className="relative">
    <textarea
      value={specialNote}
      onChange={(e) => setSpecialNote(e.target.value)}
      className="w-full border rounded px-3 py-2 pr-20"
      rows="3"
      placeholder="Enter special notes (will be automatically improved)..."
    />
    <button
      type="button"
      onClick={handlePolishSpecialNote}
      disabled={polishingNote || !specialNote.trim()}
      className="absolute top-2 right-2 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
    >
      {polishingNote ? (
        <>
          <FaSpinner className="animate-spin mr-1" />
          Polishing...
        </>
      ) : (
        "Polish Text"
      )}
    </button>
  </div>
</div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center">
  <button
    onClick={() => setShowPrescriptionTable(true)}
    className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-50"
  >
    Back to Prescriptions
  </button>

  <div className="flex items-center space-x-4">
    <button
      onClick={() => navigate("/doctor-dashboard")}
      className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-50 flex items-center"
    >
      Cancel
    </button>
    <button
      onClick={handleSavePrescription}
      disabled={saving}
      className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
    >
      {saving ? (
        <>
          <FaSpinner className="animate-spin mr-2" />
          Saving...
        </>
      ) : (
        "Save Prescription"
      )}
    </button>
  </div>
</div>

        </div>
      )}

      {showFrequencyModal && (
        <FrequencyModal
          isOpen={showFrequencyModal}
          onClose={() => setShowFrequencyModal(false)}
          onSave={saveFrequency}
          selectedDurationDays={
            currentItemForModal?.selectedDurationDays ||
            getSelectedDaysFromDurationRanges(
              currentItemForModal?.durationRanges
            ) ||
            []
          }
          consumptionType={
            currentItemForModal.medicineConsumptionType || "Sequential"
          }
          currentFrequencies={currentItemForModal?.frequencies || []}
          frequencyType={currentItemForModal?.frequencyType || "standard"}
          medicineName={currentItemForModal?.medicineName || ""}
          itemIndex={currentItemForModal?.id || 0}
          totalMedicines={getMedicineCount()} // Add this line
          allMedicines={prescriptionData.prescriptionItems} // Add this line
        />
      )}

      {/* Duration Modal */}
      {showDurationModal && currentItemForModal && (
        <DurationModal
          isOpen={showDurationModal}
          onClose={() => {
            setShowDurationModal(false);
            setCurrentItemForModal(null);
            setCurrentRowIndex(null);
          }}
          onSave={saveDuration}
          days={prescriptionData.medicineCourse}
          prescriptionItems={prescriptionData.prescriptionItems}
          rawMaterials={currentItemForModal.rawMaterials || []}
          consumptionType={
            currentItemForModal.medicineConsumptionType || "Sequential"
          }
          currentDuration={currentItemForModal.durationRanges || []}
          currentRowIndex={currentRowIndex}
          allDurationRanges={allDurationRanges}
          allGapRanges={allGapRanges} // Add this new prop
          onUpdateMedicineCourse={updateMedicineCourse} // Add this callback
          updatePrescriptionItem={updatePrescriptionItem}
          setPrescriptionData={setPrescriptionData}
          selectedMedicine={currentItemForModal}
          selectedDays={currentItemForModal.selectedDurationDays || []}
          conflictInfo={currentItemForModal.conflictInfo || null}
          clickStart={null}
        />
      )}
    </div>
  );
};

export default PrescriptionWriting;
