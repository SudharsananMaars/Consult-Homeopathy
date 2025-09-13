import React, { useState, useEffect } from "react";
import axios from "axios";
import DoctorLayout from "/src/components/doctor components/DoctorLayout.jsx";
import {
  Plus,
  Save,
  AlertTriangle,
  Check,
  Loader2,
  RotateCcw,
  ChevronDown,
  ChevronRight,
  Users,
  UserCheck,
  UserX,
  Eye,
  EyeOff,
} from "lucide-react";
import AllocationSummary from "../../components/calllog components/AllocationSummary";
import config from "../../config";

const API_URL = config.API_URL;

const DEFAULT_ROLES = [
  {
    name: "1.Consultation-Chronic",
    children: ["1.1 New Patients", "1.2 Existing Patients"],
  },
  {
    name: "2.Consultation-Acute",
    children: ["2.1 New Patients", "2.2 Existing Patients"],
  },
  "3.Prescription Writing",
  "4.Medicine Preparation",
  "5.Medicine and Shipment Payment Followup",
  "5.1 Medicine and Shipment Queries",
  "6.Inventory Tracking & Coordination",
  {
    name: "7.Follow ups",
    children: [
      "7.1 Follow ups-Patient Calling",
      "7.2 Follow ups-Consultation",
      "7.3 Follow ups-Consultation Payment",
      "7.4.Calling Potential patients",
    ],
  },
  "8.Follow up Queries",
  "9.Follow up Patient Care",
  "10.Information & Knowledge",
  "11.Vendor Listing",
  "12.Marketplace Queries",
  "13.Executive",
  "14.Admin Clinic",
  "15.Admin Operations",
];

const FOLLOW_UP_MAPPING = {
  "1.1 New Patients": "Follow up-Chronic-New",
  "1.2 Existing Patients": "Follow up-Chronic-Existing",
  "2.1 New Patients": "Follow up-Acute-New",
  "2.2 Existing Patients": "Follow up-Acute-Existing",
  "3.Prescription Writing": "Follow up-P",
  "4.Medicine Preparation": "Follow up-MP",
  "5.Medicine and Shipment Payment Followup": "Follow up-Mship",
  "5.1 Medicine and Shipment Queries": "Follow up-MSQ",
  "6.Inventory Tracking & Coordination": "Follow up-ITC",
  "7.1 Follow ups-Patient Calling": "Follow up-PCall",
  "7.2 Follow ups-Consultation": "Follow up-ConsultationQuery",
  "7.3 Follow ups-Consultation Payment": "Follow up-CPayment",
  "7.4.Calling Potential patients": "Follow up-Potential",
  "8.Follow up Queries": "Follow up-Queries",
  "9.Follow up Patient Care": "Follow up-PCare",
  "10.Information & Knowledge": "Follow up-Info",
  "11.Vendor Listing": "Follow up-Vendor",
  "12.Marketplace Queries": "Follow up-Marketplace",
  "13.Executive": "Follow up-Executive",
  "14.Admin Clinic": "Follow up-adminClinic",
  "15.Admin Operations": "Follow up-adminOperations",
};

const Allocation = () => {
  const [doctors, setDoctors] = useState([]);
  const [roles, setRoles] = useState(DEFAULT_ROLES);
  const [allocations, setAllocations] = useState({});
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [expandedRoles, setExpandedRoles] = useState({});
  const [allocationSummary, setAllocationSummary] = useState([]);
  const [showAllocationSummary, setShowAllocationSummary] = useState(true);
  const [detailedAllocations, setDetailedAllocations] = useState([]);
  const [debug, setDebug] = useState({});

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [doctorsResponse, allocationsResponse] = await Promise.all([
        axios.get(`${API_URL}/api/assign/doctors`),
        axios.get(`${API_URL}/api/assign/allocations`),
      ]);
      const fetchedDoctors = doctorsResponse.data.map((doctor) => ({
        ...doctor,
        _id: doctor._id.$oid || doctor._id, // Handle both object and string IDs
      }));
      setDoctors(fetchedDoctors);
      console.log("Fetched doctors:", fetchedDoctors);

      // Store detailed allocations for the table
      setDetailedAllocations(allocationsResponse.data);

      const allocationsMap = allocationsResponse.data.reduce(
        (acc, allocation) => {
          if (allocation.doctorId) {
            const doctorId =
              typeof allocation.doctorId === "object"
                ? allocation.doctorId._id
                : allocation.doctorId;
            if (!acc[doctorId]) {
              acc[doctorId] = [];
            }
            acc[doctorId].push(allocation.role);
          }
          return acc;
        },
        {}
      );
      setAllocations(allocationsMap);
      console.log("Initial allocations:", allocationsMap);

      updateAllocationSummary(fetchedDoctors, allocationsMap);
      setError(null);
    } catch (error) {
      console.error("Error fetching initial data:", error);
      setError("Failed to load data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const saveAllocations = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);
    setDebug({});
    try {
      const allocationData = Object.entries(allocations).flatMap(
        ([doctorId, roles]) =>
          roles
            .filter((role) => role !== "7.Follow ups")
            .map((role) => {
              const doctor = doctors.find((d) => d._id === doctorId);
              if (!doctor) {
                console.error(`Doctor not found for id: ${doctorId}`);
                setDebug((prev) => ({ ...prev, notFoundDoctor: doctorId }));
                return null;
              }
              return {
                role,
                doctorId: doctorId,
                followUpType: FOLLOW_UP_MAPPING[role] || null,
                patientType: role.includes("New Patients")
                  ? "New"
                  : role.includes("Existing Patients")
                  ? "Existing"
                  : null,
              };
            })
            .filter(Boolean)
      );

      console.log("Allocation data to be sent:", allocationData);
      setDebug((prev) => ({ ...prev, allocationData }));

      const response = await axios.post(`${API_URL}/api/assign/allocations`, {
        allocations: allocationData,
      });
      console.log("Server response:", response.data);
      setDebug((prev) => ({ ...prev, serverResponse: response.data }));

      // Update detailed allocations with the response
      setDetailedAllocations(response.data.allocations || []);

      setSuccess(true);
      setHasChanges(false);
      const updatedAllocationsMap = response.data.allocations.reduce(
        (acc, allocation) => {
          const doctorId =
            typeof allocation.doctorId === "object"
              ? allocation.doctorId._id
              : allocation.doctorId;
          if (!acc[doctorId]) {
            acc[doctorId] = [];
          }
          acc[doctorId].push(allocation.role);
          return acc;
        },
        {}
      );
      setAllocations(updatedAllocationsMap);
      updateAllocationSummary(doctors, updatedAllocationsMap);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving allocations:", error);
      setError("Failed to save allocations. Please try again.");
      setSuccess(false);
      if (error.response) {
        console.log("Error response:", error.response.data);
        setDebug((prev) => ({ ...prev, errorResponse: error.response.data }));
      }
    } finally {
      setSaving(false);
    }
  };

  const handleAllocationChange = (role, doctorId) => {
    setAllocations((prev) => {
      const newAllocations = { ...prev };
      Object.keys(newAllocations).forEach((key) => {
        newAllocations[key] = newAllocations[key].filter((r) => r !== role);
      });
      if (doctorId) {
        if (!newAllocations[doctorId]) {
          newAllocations[doctorId] = [];
        }
        if (!newAllocations[doctorId].includes(role)) {
          newAllocations[doctorId].push(role);
        }
        if (role === "7.Follow ups") {
          assignChildRoles(newAllocations, doctorId);
        }
      }
      console.log("Updated allocations:", newAllocations);
      return newAllocations;
    });
    setHasChanges(true);
  };

  const updateAllocationSummary = (doctors, allocationsMap) => {
    const summary = doctors.map((doctor) => {
      const allocatedRoles = allocationsMap[doctor._id] || [];
      return {
        doctor: doctor.name,
        roles:
          allocatedRoles.length > 0
            ? allocatedRoles.join(", ")
            : "No roles allocated",
        follow: doctor.follow || "No follows",
        role: doctor.role || "No role specified",
      };
    });
    setAllocationSummary(summary);
  };

  const assignChildRoles = (allocations, doctorId) => {
    const childRoles = [
      "7.1 Follow ups-Patient Calling",
      "7.2 Follow ups-Consultation",
      "7.3 Follow ups-Consultation Payment",
      "7.4.Calling Potential patients",
    ];

    childRoles.forEach((childRole) => {
      // Remove the child role from any other doctor
      Object.keys(allocations).forEach((key) => {
        allocations[key] = allocations[key].filter((r) => r !== childRole);
      });

      // Assign the child role to the selected doctor
      if (!allocations[doctorId].includes(childRole)) {
        allocations[doctorId].push(childRole);
      }
    });
  };

  const handleAddRole = () => {
    const newRoleNumber = roles.length + 1;
    setRoles([...roles, `${newRoleNumber}.New Role`]);
  };

  const resetAllocations = async () => {
    try {
      await axios.delete(`${API_URL}/api/assign/allocations`);
      setAllocations({});
      setDetailedAllocations([]);
      setHasChanges(true);
      setShowResetConfirm(false);
      updateAllocationSummary(doctors, {});
    } catch (error) {
      setError("Failed to reset allocations. Please try again.");
    }
  };

  const toggleRoleExpansion = (role) => {
    setExpandedRoles((prev) => ({
      ...prev,
      [role]: !prev[role],
    }));
  };

  const renderRoleSelect = (role) => {
    let filteredDoctors = doctors;

    if (
      role === "1.Consultation-Chronic" ||
      role === "1.1 New Patients" ||
      role === "1.2 Existing Patients" ||
      role === "2.Consultation-Acute" ||
      role === "2.1 New Patients" ||
      role === "2.2 Existing Patients" ||
      role === "3.Prescription Writing"
    ) {
      filteredDoctors = doctors.filter((doctor) => {
        return (
          doctor.role === "admin-doctor" || doctor.role === "assistant-doctor"
        );
      });
    }

    const selectedDoctorId =
      Object.entries(allocations).find(([_, roles]) =>
        roles.includes(role)
      )?.[0] || "";

    const isParentRole = role === "7.Follow ups";
    const isChildRole = role.startsWith("7.") && role !== "7.Follow ups";

    return (
      <select
        className={`w-full border border-gray-200 px-3 py-2 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm ${
          isChildRole ? "bg-gray-50" : "bg-white"
        }`}
        value={selectedDoctorId}
        onChange={(e) => handleAllocationChange(role, e.target.value)}
        disabled={isChildRole}
      >
        <option value="">Select a doctor</option>
        {filteredDoctors.map((doctor) => (
          <option key={doctor._id} value={doctor._id}>
            {doctor.name}{" "}
            {doctor.follow !== "No follows" && `(${doctor.follow})`}{" "}
            {doctor.role && `[${doctor.role}]`}
          </option>
        ))}
      </select>
    );
  };

  const calculateAllocationStats = () => {
    const total = doctors.length;
    const allocatedDoctorIds = new Set();
    Object.values(allocations).forEach((roles) => {
      if (roles && roles.length > 0) {
        Object.entries(allocations).forEach(([doctorId, doctorRoles]) => {
          if (doctorRoles.some((role) => roles.includes(role))) {
            allocatedDoctorIds.add(doctorId);
          }
        });
      }
    });
    const allocated = allocatedDoctorIds.size;
    const unallocated = total - allocated;

    const adminDoctors = doctors.filter((d) => d.role === "admin-doctor");
    const assistantDoctors = doctors.filter(
      (d) => d.role === "assistant-doctor"
    );
    const otherDoctors = doctors.filter(
      (d) => d.role !== "admin-doctor" && d.role !== "assistant-doctor"
    );

    const adminAllocated = adminDoctors.filter((d) =>
      allocatedDoctorIds.has(d._id)
    ).length;
    const assistantAllocated = assistantDoctors.filter((d) =>
      allocatedDoctorIds.has(d._id)
    ).length;
    const otherAllocated = otherDoctors.filter((d) =>
      allocatedDoctorIds.has(d._id)
    ).length;

    // Count total roles
    const totalRoles = roles.reduce((count, role) => {
      if (typeof role === "object" && role.children) {
        return count + role.children.length + 1;
      }
      return count + 1;
    }, 0);

    const allocatedRoles = Object.values(allocations).reduce(
      (count, doctorRoles) => count + doctorRoles.length,
      0
    );
    const unallocatedRoles = totalRoles - allocatedRoles;

    return {
      total,
      allocated,
      unallocated,
      adminTotal: adminDoctors.length,
      adminAllocated,
      assistantTotal: assistantDoctors.length,
      assistantAllocated,
      otherTotal: otherDoctors.length,
      otherAllocated,
      totalRoles,
      allocatedRoles,
      unallocatedRoles,
    };
  };

  // Group detailed allocations by doctor
  const groupedDetailedAllocations = () => {
    const grouped = {};
    detailedAllocations.forEach((allocation) => {
      const doctorInfo = allocation.doctorId;
      const doctorId =
        typeof doctorInfo === "object" ? doctorInfo._id : doctorInfo;
      const doctorName =
        typeof doctorInfo === "object" ? doctorInfo.name : "Unknown Doctor";
      const doctorRole =
        typeof doctorInfo === "object"
          ? doctors.find((d) => d._id === doctorId)?.role || "No role specified"
          : "No role specified";
      const doctorFollow =
        typeof doctorInfo === "object"
          ? doctorInfo.follow || "No follows"
          : "No follows";

      if (!grouped[doctorId]) {
        grouped[doctorId] = {
          doctor: doctorName,
          role: doctorRole,
          follows: doctorFollow,
          allocatedRoles: [],
        };
      }
      grouped[doctorId].allocatedRoles.push(allocation.role);
    });

    return Object.values(grouped);
  };

  const stats = calculateAllocationStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <DoctorLayout>
      <div className="p-6 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">
              Doctor Role Allocation
            </h2>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetConfirm(true)}
                className="px-4 py-2 rounded-lg flex items-center gap-2 bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                Reset All
              </button>
              <button
                onClick={saveAllocations}
                disabled={!hasChanges || saving}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                  hasChanges
                    ? "bg-blue-500 text-white hover:bg-blue-600"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Changes
              </button>
            </div>
          </div>
        </div>

        {/* Allocation Summary Cards */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Allocation Summary
            </h3>
            <button
              onClick={() => setShowAllocationSummary(!showAllocationSummary)}
              className="ml-auto text-blue-500 hover:text-blue-600 text-sm font-medium flex items-center gap-1"
            >
              {showAllocationSummary ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
              {showAllocationSummary ? "Hide Details" : "Show Details"}
            </button>
          </div>

          {showAllocationSummary && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-6 border-l-4 border-blue-400 min-h-[140px] flex flex-col items-center justify-center text-center">
                  <div className="text-xl text-blue-600 font-bold mb-2">
                    Organization Count
                  </div>
                  <div className="text-3xl font-extrabold text-blue-700">
                    {stats.total}
                  </div>
                </div>

                <div className="bg-orange-50 rounded-lg p-6 border-l-4 border-orange-400 min-h-[140px] flex flex-col items-center justify-center text-center">
                  <div className="text-xl text-orange-600 font-bold mb-2">
                    No of Resources
                  </div>
                  <div className="text-3xl font-extrabold text-orange-700">
                    {stats.allocated}
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-6 border-l-4 border-green-400 min-h-[140px] flex flex-col items-center justify-center text-center">
                  <div className="text-xl text-green-600 font-bold mb-2">
                    Roles
                  </div>
                  <div className="text-3xl font-extrabold text-green-700">
                    {stats.allocatedRoles}
                  </div>
                </div>

                <div className="bg-red-50 rounded-lg p-6 border-l-4 border-red-400 min-h-[140px] flex flex-col items-center justify-center text-center">
                  <div className="text-xl text-red-600 font-bold mb-2">
                    No of Resources Allocated
                  </div>
                  <div className="text-3xl font-extrabold text-red-700">
                    {stats.unallocatedRoles}
                  </div>
                </div>
              </div>

              {/* Employee Breakdown Cards */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <UserCheck className="w-5 h-5 text-gray-600" />
                  <h4 className="text-lg font-semibold text-gray-700">
                    Employee Breakdown
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-blue-50 rounded-lg p-6 border-l-4 border-blue-400 min-h-[140px] flex flex-col items-center justify-center text-center">
                    <div className="text-xl text-blue-600 font-bold mb-3">
                      No of Employees
                    </div>
                    <div className="text-3xl font-extrabold text-blue-700">
                      {stats.total}
                    </div>
                  </div>

                  <div className="bg-orange-50 rounded-lg p-6 border-l-4 border-orange-400 min-h-[140px] flex flex-col items-center justify-center text-center">
                    <div className="text-xl text-orange-600 font-bold mb-2">
                      Main Doctor
                    </div>
                    <div className="text-3xl font-extrabold text-orange-700">
                      {stats.adminAllocated}/{stats.adminTotal}
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-lg p-6 border-l-4 border-green-400 min-h-[140px] flex flex-col items-center justify-center text-center">
                    <div className="text-xl text-green-600 font-bold mb-2">
                      Assistant Doctor
                    </div>
                    <div className="text-3xl font-extrabold text-green-700">
                      {stats.assistantAllocated}/{stats.assistantTotal}
                    </div>
                  </div>

                  <div className="bg-red-50 rounded-lg p-6 border-l-4 border-red-400 min-h-[140px] flex flex-col items-center justify-center text-center">
                    <div className="text-xl text-red-600 font-bold mb-2">
                      Other Staff
                    </div>
                    <div className="text-3xl font-extrabold text-red-700">
                      {stats.otherAllocated}/{stats.otherTotal}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Detailed Allocation Table */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Detailed Allocation Table
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full overflow-hidden rounded-lg">
              <thead>
                <tr className="border-b border-blue-200">
                  <th className="bg-gray-100 text-center p-4 font-bold text-gray-700 text-sm">
                    Doctor
                  </th>
                  <th className="bg-white text-center p-4 font-bold text-gray-700 text-sm">
                    Role
                  </th>
                  <th className="bg-gray-100 text-center p-4 font-bold text-gray-700 text-sm">
                    Follows
                  </th>
                  <th className="bg-white text-center p-4 font-bold text-gray-700 text-sm">
                    Allocated Roles
                  </th>
                </tr>
              </thead>
              <tbody>
                {groupedDetailedAllocations().length > 0 ? (
                  groupedDetailedAllocations().map((item, index) => (
                    <tr key={index} className="border-b border-blue-200">
                      {/* Doctor */}
                      <td className="bg-gray-100 p-4 font-medium text-gray-900 text-center">
                        {item.doctor}
                      </td>

                      {/* Role */}
                      <td className="bg-white p-4 text-gray-600 text-center">
                        {item.role}
                      </td>

                      {/* Follows (comma → numbered list, centered) */}
                      <td className="bg-gray-100 p-4 text-gray-600 text-center">
                        {item.follows ? (
                          <ol className="list-decimal list-inside inline-block text-left space-y-1">
                            {item.follows.split(",").map((follow, idx) => (
                              <li key={idx} className="text-sm">
                                {follow.trim()}
                              </li>
                            ))}
                          </ol>
                        ) : (
                          <span className="text-gray-400">No follows</span>
                        )}
                      </td>

                      {/* Allocated Roles (no numbering) */}
                      <td className="bg-white p-4 text-gray-600 text-center">
                        {item.allocatedRoles.length > 0 ? (
                          <div className="space-y-1 text-left inline-block">
                            {item.allocatedRoles.map((role, roleIndex) => (
                              <div key={roleIndex} className="text-sm">
                                {role}
                              </div>
                            ))}
                          </div>
                        ) : (
                          "No roles allocated"
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="bg-white text-center text-gray-500 py-6"
                    >
                      No allocations found. Start by assigning roles to doctors
                      below.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Allocation Rules */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
              <Check className="w-5 h-5 flex-shrink-0" />
              <p>Allocations saved successfully!</p>
            </div>
          )}

          <div className="space-y-3">
            {roles.map((role, index) => (
              <div key={index}>
                {typeof role === "object" ? (
                  <div className="bg-gray-50 rounded-lg border border-gray-200">
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        {/* Role name and optional select box */}
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-gray-900">
                            {role.name}
                          </span>
                          {role.name === "7.Follow ups" &&
                            role.children?.length === 0 && (
                              <div className="w-80">
                                {renderRoleSelect(role.name)}
                              </div>
                            )}
                        </div>

                        {/* Chevron button moved to the right */}
                        <button
                          onClick={() => toggleRoleExpansion(role.name)}
                          className="text-gray-500 hover:text-gray-700 transition-colors"
                        >
                          {expandedRoles[role.name] ? (
                            <ChevronDown className="w-5 h-5" />
                          ) : (
                            <ChevronRight className="w-5 h-5" />
                          )}
                        </button>
                      </div>

                      {expandedRoles[role.name] && (
                        <div className="mt-4 space-y-2">
                          {role.children.map((childRole, childIndex) => (
                            <div
                              key={childIndex}
                              className="bg-white rounded-lg p-3 border border-gray-100 ml-8"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-gray-700 text-sm">
                                  {childRole}
                                </span>
                                <div className="w-80">
                                  {renderRoleSelect(childRole)}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-900">
                        {role}
                      </span>
                      <div className="w-80">{renderRoleSelect(role)}</div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            <button
              onClick={handleAddRole}
              className="w-full mt-4 p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors flex items-center justify-center gap-2 bg-gray-50 hover:bg-blue-50"
            >
              <Plus className="w-5 h-5" />
              Add New Role
            </button>
          </div>
        </div>

        {hasChanges && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center justify-between">
            <span className="text-yellow-700 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              You have unsaved changes
            </span>
            <button
              onClick={saveAllocations}
              disabled={saving}
              className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors"
            >
              {saving ? "Saving..." : "Save Now"}
            </button>
          </div>
        )}

        {showResetConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full">
              <h3 className="text-xl font-bold mb-4 text-gray-900">
                Reset All Allocations?
              </h3>
              <p className="text-gray-600 mb-6">
                This will remove all doctor allocations. This action cannot be
                undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={resetAllocations}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Reset All
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DoctorLayout>
  );
};

export default Allocation;
