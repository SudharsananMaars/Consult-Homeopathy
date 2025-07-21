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
import { use } from "react";
const PrescriptionViewModal = () => {
  const [prescriptionData, setPrescriptionData] = useState(null);
  const [loading, setLoading] = useState(false);
  // { prescriptionId, apiUrl, accessToken }
  const { prescriptionId } = useParams();
  const apiUrl = config.API_URL;
  const accessToken = localStorage.getItem("token");

  useEffect(() => {
    const fetchPrescription = async () => {
      try {
        setLoading(true);
        console.log(
          "Prescription api:",
          `${apiUrl}/api/prescriptionControl/prescription/${prescriptionId}`
        );
        const response = await axios.get(
          `${apiUrl}/api/prescriptionControl/prescription/${prescriptionId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        const data = response.data;
        console.log("Prescription data:", data);
        if (data.success) {
          setPrescriptionData(data.data);
        } else {
          console.error("Error:", data.message);
        }
      } catch (err) {
        console.error("Failed to load prescription data", err);
      } finally {
        setLoading(false);
      }
    };

    if (prescriptionId && apiUrl && accessToken) {
      fetchPrescription();
    }
  }, [prescriptionId, apiUrl, accessToken]);

  const formatDate = (dateObj) => {
    if (!dateObj || !dateObj.$date) return "N/A";
    return new Date(dateObj.$date).toLocaleDateString("en-US", {
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
      // Only render in 'morning' slot and skip others
      if (slot !== "morning") return null;

      const groups = [];
      let currentGroup = {
        startDay: item.frequentSchedule[0].day,
        endDay: item.frequentSchedule[0].day,
        frequency: item.frequentSchedule[0].frequency,
        doses: item.frequentSchedule[0].frequentFrequency.doses,
      };

      for (let i = 1; i < item.frequentSchedule.length; i++) {
        const current = item.frequentSchedule[i];
        const prev = item.frequentSchedule[i - 1];

        if (
          current.frequency === prev.frequency &&
          current.frequentFrequency.doses === prev.frequentFrequency.doses
        ) {
          currentGroup.endDay = current.day;
        } else {
          groups.push({ ...currentGroup });
          currentGroup = {
            startDay: current.day,
            endDay: current.day,
            frequency: current.frequency,
            doses: current.frequentFrequency.doses,
          };
        }
      }

      groups.push({ ...currentGroup });

      return groups.map((group, idx) => (
        <div key={idx} className="mb-1 text-blue-700">
          <strong>
            Day{" "}
            {group.startDay === group.endDay
              ? group.startDay
              : `${group.startDay}-${group.endDay}`}
          </strong>{" "}
          - {group.doses} doses | {group.frequency}
        </div>
      ));
    }

    // If standardSchedule exists, fallback to normal logic
    return renderTimingForSlot(slot, item.standardSchedule);
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
          <div className="h-1.5 bg-[linear-gradient(to_right,_#ec4899_50%,_#1e3a8a_50%)]"></div>

          <div className="flex justify-between items-center px-4 py-3 bg-white border-b-4 border-blue-900">
            <div className="flex items-center">
              <img
                src="/src/assets/images/doctor images/homeologo.png"
                alt="Consult Homeopathy Icon"
                className="w-64 h-28 mr-3"
              />
            </div>

            <div className="text-right text-gray-700 flex items-center space-x-4">
              <div className="">
                <h2 className="text-blue-900 font-bold text-lg">
                  Dr. Katyayani Shrivastava
                </h2>
                <p className="text-sm text-gray-700">
                  BHMS, PGDEMS (TISS - Mumbai)
                </p>
                <p className="text-blue-900 font-semibold text-sm">
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
        </div>

        {/* Prescription Body */}
        <div className="relative z-10 p-8">
          <div className="mb-6 text-center">
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              PRESCRIPTION
            </h3>
            <div className="text-sm text-gray-600">
              ID: {prescriptionData._id.slice(-8)}
            </div>
          </div>

          <div className="border border-gray-300 overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border px-3 py-2 font-semibold text-gray-700 text-left">
                    S No
                  </th>
                  <th className="border px-3 py-2 font-semibold text-gray-700 text-center">
                    Label
                  </th>
                  <th className="border px-3 py-2 font-semibold text-gray-700 text-left">
                    Medicine Name
                  </th>
                  <th className="border px-3 py-2 font-semibold text-gray-700 text-left">
                    Form
                  </th>
                  <th className="border px-3 py-2 font-semibold text-gray-700 text-left">
                    Duration
                  </th>
                  <th className="border px-3 py-2 font-semibold text-gray-700 text-left">
                    Morning
                  </th>
                  <th className="border px-3 py-2 font-semibold text-gray-700 text-left">
                    Noon
                  </th>
                  <th className="border px-3 py-2 font-semibold text-gray-700 text-left">
                    Evening
                  </th>
                  <th className="border px-3 py-2 font-semibold text-gray-700 text-left">
                    Night
                  </th>
                  <th className="border px-3 py-2 font-semibold text-gray-700 text-left">
                    Consumption
                  </th>
                </tr>
              </thead>
              <tbody>
                {prescriptionData.prescriptionItems.map((item, index) => {
                  const timing = item.standardSchedule?.[0]?.timing || {};
                  return (
                    <React.Fragment key={index}>
                      <tr>
                        <td className="border px-3 py-2">{index + 1}</td>
                        <td className="border px-3 py-2 font-bold text-center">
                          {item.label}
                        </td>
                        <td className="border px-3 py-2">
                          {item.medicineName}
                        </td>
                        <td className="border px-3 py-2">{item.form}</td>
                        <td className="border px-3 py-2">
                          {item.duration}
                          {item.standardSchedule?.[0]?.day && (
                            <div className="text-blue-600 mt-1">
                              {item.standardSchedule[0].day}
                            </div>
                          )}
                        </td>
                        {item.frequentSchedule &&
                        item.frequentSchedule.length > 0 ? (
                          <td className="border px-3 py-2" colSpan={4}>
                            {renderGroupedSchedule(item, "morning")}
                          </td>
                        ) : (
                          <>
                            <td className="border px-3 py-2">
                              {renderGroupedSchedule(item, "morning")}
                            </td>
                            <td className="border px-3 py-2">
                              {renderGroupedSchedule(item, "afternoon")}
                            </td>
                            <td className="border px-3 py-2">
                              {renderGroupedSchedule(item, "evening")}
                            </td>
                            <td className="border px-3 py-2">
                              {renderGroupedSchedule(item, "night")}
                            </td>
                          </>
                        )}
                        <td className="border px-3 py-2 text-gray-700">
                          {item.medicineConsumption || "N/A"}
                        </td>
                      </tr>
                      {index <
                        prescriptionData.prescriptionItems.length - 1 && (
                        <tr>
                          <td
                            colSpan="10"
                            className="border px-3 py-1 text-gray-500 bg-gray-50 text-center"
                          >
                            ——— Next Day ———
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

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
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border">
              <h4 className="font-semibold text-green-900 mb-3">
                Billing Details
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Medicine Cost:</span>
                  <span className="font-medium">
                    ₹{prescriptionData.medicineCharges}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span className="font-medium">
                    ₹{prescriptionData.shippingCharges}
                  </span>
                </div>
                <div className="flex justify-between font-semibold border-t pt-2">
                  <span>Total:</span>
                  <span>
                    ₹
                    {(
                      prescriptionData.medicineCharges +
                      prescriptionData.shippingCharges
                    ).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Status:</span>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      prescriptionData.isPayementDone
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {prescriptionData.isPayementDone ? "Paid" : "Pending"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Signature */}
          <div className="mt-8 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Status:{" "}
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
            <div className="text-rig6ht">
              <div className="border-t border-gray-300 pt-2 mt-8 w-48">
                <div className="text-sm font-medium">
                  Dr. Katyayani Shrivastava
                </div>
                <div className="text-xs text-gray-600">BHMS, PGDEMS</div>
              </div>
            </div>
          </div>

          {/* Footer Links */}
          <div className="mt-8 text-center text-sm text-blue-900">
            <div className="font-bold text-xl">
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
                className="font-medium underline"
              >
                www.consulthomeopathyonline.com
              </a>
            </div>
            <div>#katyayanishomeopathy | #consulthomeopathy</div>
          </div>
        </div>

        <div className="h-1.5 bg-gradient-to-r from-pink-500 to-pink-600"></div>
      </div>
    </div>
  );
};

export default PrescriptionViewModal;
