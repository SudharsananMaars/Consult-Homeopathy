import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Pill,
  FileText,
  User,
  Stethoscope,
  CreditCard,
  Truck,
} from "lucide-react";
import axios from "axios";
import config from "../../config";
import { useParams } from "react-router-dom";

const PrescriptionViewModal = () => {
  const [prescriptionData, setPrescriptionData] = useState(null);
  const [groupedPrescriptionData, setGroupedPrescriptionData] = useState(null);
  const [loading, setLoading] = useState(false);

  const { prescriptionId } = useParams();
  const apiUrl = config.API_URL;
  const accessToken = localStorage.getItem("token");

  useEffect(() => {
    const fetchPrescriptionData = async () => {
      try {
        setLoading(true);

        // Fetch from first API (existing)
        console.log(
          "Prescription api:",
          `${apiUrl}/api/prescriptionControl/prescription/${prescriptionId}`
        );
        const firstResponse = await axios.get(
          `${apiUrl}/api/prescriptionControl/prescription/${prescriptionId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        const firstData = firstResponse.data;
        console.log("First API - Prescription data:", firstData);

        if (firstData.success) {
          setPrescriptionData(firstData.data);

          // Get userId from localStorage for second API call
          const userId = localStorage.getItem("userId");

          if (userId) {
            // Fetch from second API
            console.log(
              "Second API call:",
              `${apiUrl}/api/patient/prescriptions/grouped/${userId}`
            );

            try {
              const secondResponse = await axios.get(
                `${apiUrl}/api/patient/prescriptions/grouped/${userId}`,
                {
                  headers: {
                    Authorization: `Bearer ${accessToken}`,
                  },
                }
              );

              const secondData = secondResponse.data;
              console.log(
                "Second API - Grouped prescription data:",
                secondData
              );
              setGroupedPrescriptionData(secondData);
            } catch (secondApiError) {
              console.error("Failed to fetch from second API:", secondApiError);
              // Continue with first API data even if second API fails
            }
          } else {
            console.warn(
              "userId not found in localStorage, skipping second API call"
            );
          }
        } else {
          console.error("Error:", firstData.message);
        }
      } catch (err) {
        console.error("Failed to load prescription data", err);
      } finally {
        setLoading(false);
      }
    };

    if (prescriptionId && apiUrl && accessToken) {
      fetchPrescriptionData();
    }
  }, [prescriptionId, apiUrl, accessToken]);

  // Function to get medicine duration from second API
  const getMedicineDuration = (medicineName, prescriptionId) => {
    if (!groupedPrescriptionData || !groupedPrescriptionData.prescriptions) {
      return null;
    }

    // Find the prescription data for the current prescriptionId
    const currentPrescription =
      groupedPrescriptionData.prescriptions[prescriptionId];

    if (!currentPrescription || !currentPrescription.medicineDurations) {
      return null;
    }

    // Find the medicine duration for the specific medicine
    const medicineDuration = currentPrescription.medicineDurations.find(
      (duration) =>
        duration.medicineName.toLowerCase() === medicineName.toLowerCase()
    );

    return medicineDuration;
  };

  // Function to format date range
  const formatDateRange = (startDate, endDate) => {
    if (!startDate || !endDate) return "N/A";

    const start = new Date(startDate).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    const end = new Date(endDate).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    return `${start} - ${end}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const renderTimingForSlot = (slot, standardSchedule) => {
    if (!standardSchedule || standardSchedule.length === 0) return null;

    const groups = [];
    let currentGroup = {
      startDay: standardSchedule[0].day,
      endDay: standardSchedule[0].day,
      time: standardSchedule[0]?.timing?.[slot]?.time || "",
      food: standardSchedule[0]?.timing?.[slot]?.food || "",
    };

    for (let i = 1; i < standardSchedule.length; i++) {
      const sched = standardSchedule[i];
      const prev = standardSchedule[i - 1];

      const currTime = sched?.timing?.[slot]?.time || "";
      const currFood = sched?.timing?.[slot]?.food || "";

      const prevTime = prev?.timing?.[slot]?.time || "";
      const prevFood = prev?.timing?.[slot]?.food || "";

      if (currTime === prevTime && currFood === prevFood) {
        currentGroup.endDay = sched.day;
      } else {
        groups.push({ ...currentGroup });
        currentGroup = {
          startDay: sched.day,
          endDay: sched.day,
          time: currTime,
          food: currFood,
        };
      }
    }

    groups.push({ ...currentGroup });

    return groups.map((group, idx) =>
      group.time || group.food ? (
        <div key={idx} className="mb-1">
          <div className="font-semibold text-gray-700">
            Day{" "}
            {group.startDay === group.endDay
              ? `${group.startDay}`
              : `${group.startDay}-${group.endDay}`}
          </div>
          <div className="text-blue-700">
            {group.food ? `${group.food}, ` : ""}
            {group.time}
          </div>
        </div>
      ) : null
    );
  };

const renderGroupedSchedule = (item, slot) => {
  if (item.frequentSchedule && item.frequentSchedule.length > 0) {
    if (slot !== "morning") return "0";
    
    // Check if any day has a dose scheduled
    const hasDosage = item.frequentSchedule.some(
      (sched) => sched.frequentFrequency?.doses > 0
    );
    return hasDosage ? "1" : "0";
  }

  // For standardSchedule
  if (!item.standardSchedule || item.standardSchedule.length === 0) return "0";
  
  const hasDosage = item.standardSchedule.some(
    (sched) => sched?.timing?.[slot]?.time || sched?.timing?.[slot]?.food
  );
  
  return hasDosage ? "1" : "0";
};

  // Check if prescription has any frequent frequency items
  const hasFrequentItems = () => {
    if (!prescriptionData || !prescriptionData.prescriptionItems) return false;
    return prescriptionData.prescriptionItems.some(
      (item) => item.frequencyType === "frequent"
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 shadow-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
          <div className="text-center mt-4 text-gray-600">
            Loading prescription...
          </div>
        </div>
      </div>
    );
  }

  if (!prescriptionData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">⚠️</div>
          <div className="text-gray-800">Failed to load prescription data</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 font-[Poppins]">
      <div className="max-w-4xl mx-auto bg-white shadow-2xl relative overflow-hidden">
        {/* CH Watermark in Center */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <img
            src="/src/assets/images/doctor images/prescriptionBG.png"
            alt="CH Watermark"
            className="w-[500px] h-auto object-contain"
          />
        </div>

        {/* Header */}
        <div className="relative z-10">
          {/* Top Gradient Line */}
          <div className="h-1.5 bg-[linear-gradient(to_right,_#ec4899_50%,_#1e3a8a_50%)]"></div>

          <div className="relative bg-white">
            <div className="flex justify-between items-center px-4 py-3">
              <div className="flex items-center">
                <img
                  src="/src/assets/images/doctor images/homeologo.png"
                  alt="Consult Homeopathy Icon"
                  className="w-72 h-32 mr-3"
                />
              </div>

              <div className="text-right text-gray-700 flex items-center space-x-4">
                <div>
                  <h2 className="text-blue-900 font-bold text-3xl">
                    Dr. Katyayani Shrivastava
                  </h2>
                  <p className="text-xl text-gray-700">
                    BHMS, PGDEMS (TISS - Mumbai)
                  </p>
                  <p className="text-blue-900 font-semibold text-xl">
                    +91 9406949646
                  </p>
                </div>
                <img
                  src="/src/assets/images/doctor images/caduceusImg.png"
                  alt="Medical Symbol"
                  className="w-24 h-16 mt-1 ml-auto"
                />
              </div>
            </div>

            {/* Bottom Gradient Line */}
            <div className="absolute bottom-0 left-0 w-full h-1.5 bg-[linear-gradient(to_right,_#ec4899_50%,_#1e3a8a_50%)]"></div>
          </div>
        </div>

        {/* Prescription Body */}
        <div className="relative z-10 p-8">
          <div className="flex justify-between items-center mb-6">
            {/* ID on the left */}
            <div className="text-lg font-semibold text-black-600">
              ID: {prescriptionData._id.slice(-8)}
            </div>

            {/* Status on the right */}
            <div className="text-sm text-gray-600">
              {" "}
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${
                  prescriptionData.action.status === "In Progress"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-green-100 text-green-800"
                }`}
              >
                {prescriptionData.action.status}
              </span>
            </div>
          </div>

          {/* Start and End Dates */}
          <div className="flex flex-col gap-2 mb-6 text-sm text-gray-700 text-left">
            <div>
              <span className="font-medium">Start Date:</span>{" "}
              <span>{formatDate(prescriptionData.startDate)}</span>
            </div>
            <div>
              <span className="font-medium">End Date:</span>{" "}
              <span>{formatDate(prescriptionData.endDate)}</span>
            </div>
          </div>

        <table className="w-full text-xs text-gray-500 border-separate border-spacing-y-2">
  <thead>
    <tr className="bg-gray-50">
      <th className="px-3 py-2 font-semibold text-left">S No</th>
      <th className="px-3 py-2 font-semibold text-center">Label</th>
      <th className="px-3 py-2 font-semibold text-center">Date</th>
      <th className="px-3 py-2 font-semibold text-left">Medicine Name</th>
      <th className="px-3 py-2 font-semibold text-left">Type</th>
      {hasFrequentItems() ? (
        <th className="px-3 py-2 font-semibold text-left">Dosage</th>
      ) : (
        <>
          <th className="px-3 py-2 font-semibold text-left">Morning</th>
          <th className="px-3 py-2 font-semibold text-left">Noon</th>
          <th className="px-3 py-2 font-semibold text-left">Evening</th>
          <th className="px-3 py-2 font-semibold text-left">Night</th>
        </>
      )}
       <th className="px-3 py-2 font-semibold text-left">Duration</th>
      <th className="px-3 py-2 font-semibold text-left">Consumption</th>
    </tr>
  </thead>

<tbody>
    {prescriptionData.prescriptionItems.map((item, index) => {
      const medicineDuration = getMedicineDuration(item.medicineName, prescriptionData._id);
      const dateRange = medicineDuration
        ? formatDateRange(medicineDuration.startDate, medicineDuration.endDate)
        : item.label;

      const showData = (value) => (value ? value : "-");

      return (
        <>
          {/* Main medicine row */}
          <tr key={index} className="align-middle">
            <td className="px-3 py-2 text-center align-middle">{index + 1}</td>
            <td className="px-3 py-2 text-center font-bold align-middle">{showData(item.label)}</td>
            <td className="px-3 py-2 text-center font-bold align-middle">{showData(dateRange)}</td>
            <td className="px-3 py-2 align-middle">{showData(item.medicineName)}</td>
            <td className="px-3 py-2 align-middle">{showData(item.form)}</td>
            {hasFrequentItems() ? (
              <td className="px-3 py-2 align-middle">
                {item.frequencyType === "frequent" ? (
                  renderGroupedSchedule(item, "morning") || "-"
                ) : (
                  <div className="space-y-1">
                    <div>
                      <strong>Morning:</strong> {renderGroupedSchedule(item, "morning") || "-"}
                    </div>
                    <div>
                      <strong>Noon:</strong> {renderGroupedSchedule(item, "afternoon") || "-"}
                    </div>
                    <div>
                      <strong>Evening:</strong> {renderGroupedSchedule(item, "evening") || "-"}
                    </div>
                    <div>
                      <strong>Night:</strong> {renderGroupedSchedule(item, "night") || "-"}
                    </div>
                  </div>
                )}
              </td>
            ) : item.frequentSchedule && item.frequentSchedule.length > 0 ? (
              <td className="px-3 py-2 align-middle" colSpan={4}>
                {renderGroupedSchedule(item, "morning") || "-"}
              </td>
            ) : (
              <>
                <td className="px-3 py-2 align-middle">{renderGroupedSchedule(item, "morning") || "-"}</td>
                <td className="px-3 py-2 align-middle">{renderGroupedSchedule(item, "afternoon") || "-"}</td>
                <td className="px-3 py-2 align-middle">{renderGroupedSchedule(item, "evening") || "-"}</td>
                <td className="px-3 py-2 align-middle">{renderGroupedSchedule(item, "night") || "-"}</td>
              </>
            )}
            <td className="px-3 py-2 align-middle">
              {showData(item.duration)}
              {item.standardSchedule?.[0]?.day && (
                <div className="mt-1">{item.standardSchedule[0].day}</div>
              )}
            </td>
            <td className="px-3 py-2 align-middle">{showData(item.medicineConsumption)}</td>
          </tr>

          {/* Instructions row - only if additionalComments exist */}
          {item.additionalComments && (
            <tr key={`${index}-instruction`}>
              <td colSpan={hasFrequentItems() ? 9 : 12} className="px-3 py-2  border-l-4 border-yellow-400">
                <span className="font-semibold text-gray-700">Instructions: </span>
                <span className="text-gray-600">{item.additionalComments}</span>
              </td>
            </tr>
          )}
        </>
      );
    })}
  </tbody>
</table>


          {/* Summary and Billing */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div className="bg-blue-50 p-4 rounded-lg border">
              <h4 className="font-semibold text-blue-900 mb-3">
                Treatment Summary
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Total Medicines:</span>
                  <span className="font-medium">
                    {prescriptionData.prescriptionItems.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Course Duration:</span>
                  <span className="font-medium">
                    {prescriptionData.medicineCourse} days
                  </span>
                </div>
                {groupedPrescriptionData && (
                  <div className="flex justify-between"></div>
                )}
              </div>
            </div>
          </div>

          {/* Footer Signature */}
          <div className="mt-8 flex justify-end">
            <div className="border-t border-gray-300 pt-2 mt-8 w-48 text-right">
              <div className="text-sm font-medium">
                Dr. Katyayani Shrivastava
              </div>
              <div className="text-xs text-gray-600">BHMS, PGDEMS</div>
            </div>
          </div>

          {/* Footer Links */}
          <div className="mt-8 text-center text-sm text-blue-900">
            <div className="font-bold text-2xl py-2">
              Online Consultation | Homeopathy Products | Counseling
            </div>
            <div className="flex justify-center items-center gap-4 mb-2">
              <a
                href="https://www.instagram.com/consulthomeopathy"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png"
                  alt="Instagram"
                  className="w-6 h-6"
                />
              </a>
              <a
                href="https://www.facebook.com/consulthomeopathy"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg"
                  alt="Facebook"
                  className="w-6 h-6"
                />
              </a>
              <a
                href="https://www.consulthomeopathyonline.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-lg"
              >
                www.consulthomeopathyonline.com
              </a>
            </div>
            <div className="font-bold text-lg py-2">#katyayanishomeopathy | #consulthomeopathy</div>
          </div>
        </div>

      <div className="absolute bottom-0 left-0 w-full h-1.5 bg-[linear-gradient(to_right,_#ec4899_50%,_#1e3a8a_50%)]"></div>
      </div>
    </div>
  );
};

export default PrescriptionViewModal;
