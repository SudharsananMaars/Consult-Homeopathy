import React, { useState, useEffect, useRef } from "react";
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

// Frequency Configuration Modal Component
const FrequencyModal = ({
  isOpen,
  onClose,
  onSave,
  days,
  currentFrequencies = [],
}) => {
  const [frequencyType, setFrequencyType] = useState("standard");
  const [frequencies, setFrequencies] = useState({});
  const [selectedDays, setSelectedDays] = useState(new Set());
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const calendarRef = useRef(null);

  useEffect(() => {
    if (currentFrequencies.length > 0) {
      const freqMap = {};
      const selected = new Set();
      currentFrequencies.forEach((freq) => {
        freqMap[freq.day] = freq;
        selected.add(freq.day);
      });
      setFrequencies(freqMap);
      setSelectedDays(selected);
    }
  }, [currentFrequencies]);

  const handleFrequencyChange = (field, value) => {
    selectedDays.forEach((day) => {
      const fieldParts = field.split(".");
      setFrequencies((prev) => ({
        ...prev,
        [day]: {
          ...prev[day],
          day: day,
          frequencyType: frequencyType,
          [frequencyType === "standard"
            ? "standardFrequency"
            : "frequentFrequency"]: {
            ...prev[day]?.[
              frequencyType === "standard"
                ? "standardFrequency"
                : "frequentFrequency"
            ],
            [fieldParts[0]]: {
              ...prev[day]?.[
                frequencyType === "standard"
                  ? "standardFrequency"
                  : "frequentFrequency"
              ]?.[fieldParts[0]],
              [fieldParts[1]]: value,
            },
          },
        },
      }));
    });
  };

  const handleFrequentChange = (value) => {
    selectedDays.forEach((day) => {
      setFrequencies((prev) => ({
        ...prev,
        [day]: {
          ...prev[day],
          day: day,
          frequencyType: "frequent",
          frequentFrequency: {
            interval: value,
          },
        },
      }));
    });
  };

  const handleDayClick = (day) => {
    setSelectedDays((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(day)) {
        newSet.delete(day);
      } else {
        newSet.add(day);
      }
      return newSet;
    });
  };

  const handleMouseDown = (day) => {
    setIsDragging(true);
    setDragStart(day);
    setSelectedDays(new Set([day]));
  };

  const handleMouseEnter = (day) => {
    if (isDragging && dragStart !== null) {
      const start = Math.min(dragStart, day);
      const end = Math.max(dragStart, day);
      const newSelected = new Set();
      for (let i = start; i <= end; i++) {
        newSelected.add(i);
      }
      setSelectedDays(newSelected);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragStart(null);
  };

  const selectAllDays = () => {
    const allDays = new Set();
    for (let i = 1; i <= days; i++) {
      allDays.add(i);
    }
    setSelectedDays(allDays);
  };

  const clearSelection = () => {
    setSelectedDays(new Set());
  };

  const handleSave = () => {
    const freqArray = Object.values(frequencies).filter(
      (freq) => freq.day && selectedDays.has(freq.day)
    );
    onSave(freqArray);
    onClose();
  };

  const renderCalendar = () => {
    const weeks = [];
    let currentWeek = [];

    for (let day = 1; day <= days; day++) {
      currentWeek.push(day);
      if (currentWeek.length === 7 || day === days) {
        weeks.push([...currentWeek]);
        currentWeek = [];
      }
    }

    return weeks.map((week, weekIndex) => (
      <div key={weekIndex} className="flex">
        {week.map((day) => (
          <div
            key={day}
            className={`
              w-10 h-10 flex items-center justify-center text-sm font-medium cursor-pointer
              border border-gray-200 hover:bg-blue-50 transition-colors
              ${
                selectedDays.has(day)
                  ? "bg-blue-500 text-white border-blue-500"
                  : "bg-white text-gray-700 hover:border-blue-300"
              }
              ${day === 1 ? "rounded-tl-lg" : ""}
              ${day === 7 || day === days ? "rounded-tr-lg" : ""}
              ${
                week[week.length - 1] === day && weekIndex === weeks.length - 1
                  ? "rounded-br-lg"
                  : ""
              }
              ${
                week[0] === day && weekIndex === weeks.length - 1
                  ? "rounded-bl-lg"
                  : ""
              }
            `}
            onClick={() => handleDayClick(day)}
            onMouseDown={() => handleMouseDown(day)}
            onMouseEnter={() => handleMouseEnter(day)}
            onMouseUp={handleMouseUp}
          >
            {day}
          </div>
        ))}
        {/* Fill empty cells for incomplete weeks */}
        {week.length < 7 &&
          Array.from({ length: 7 - week.length }, (_, index) => (
            <div
              key={`empty-${index}`}
              className="w-10 h-10 border border-gray-200 bg-gray-50"
            ></div>
          ))}
      </div>
    ));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden">
        <div className="flex h-full">
          {/* Left Panel - Calendar */}
          <div className="w-1/3 bg-gray-50 p-6 border-r">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Select Days</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ✕
              </button>
            </div>

            {/* Calendar Controls */}
            <div className="mb-4 space-y-2">
              <div className="flex gap-2">
                <button
                  onClick={selectAllDays}
                  className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Select All
                </button>
                <button
                  onClick={clearSelection}
                  className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
                >
                  Clear All
                </button>
              </div>
              <div className="text-xs text-gray-600 bg-white p-2 rounded border">
                💡 Click to select individual days, or click and drag to select
                a range
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="mb-4">
              <div className="text-sm font-medium text-gray-700 mb-2">
                Days 1-{days} ({selectedDays.size} selected)
              </div>
              <div
                ref={calendarRef}
                className="select-none"
                onMouseLeave={() => setIsDragging(false)}
              >
                {renderCalendar()}
              </div>
            </div>

            {/* Selected Days Summary */}
            {selectedDays.size > 0 && (
              <div className="bg-white p-3 rounded-lg border">
                <div className="text-sm font-medium text-gray-700 mb-1">
                  Selected Days:
                </div>
                <div className="text-xs text-gray-600 max-h-20 overflow-y-auto">
                  {Array.from(selectedDays)
                    .sort((a, b) => a - b)
                    .join(", ")}
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Configuration */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Configure Frequency
              </h3>
              <p className="text-gray-600 text-sm">
                {selectedDays.size === 0
                  ? "Select days from the calendar to configure their frequency settings"
                  : `Configuring frequency for ${
                      selectedDays.size
                    } selected day${selectedDays.size === 1 ? "" : "s"}`}
              </p>
            </div>

            {selectedDays.size > 0 && (
              <div className="space-y-6">
                {/* Frequency Type Selector */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Frequency Type
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="standard"
                        checked={frequencyType === "standard"}
                        onChange={(e) => setFrequencyType(e.target.value)}
                        className="mr-2"
                      />
                      <span className="text-sm font-medium">
                        Standard (4 times/day)
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="frequent"
                        checked={frequencyType === "frequent"}
                        onChange={(e) => setFrequencyType(e.target.value)}
                        className="mr-2"
                      />
                      <span className="text-sm font-medium">
                        Frequent (Custom interval)
                      </span>
                    </label>
                  </div>
                </div>

                {/* Configuration Forms */}
                {frequencyType === "standard" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {["morning", "afternoon", "evening", "night"].map(
                      (period) => (
                        <div
                          key={period}
                          className="bg-white border rounded-lg p-4"
                        >
                          <h4 className="font-medium text-gray-800 mb-3 capitalize flex items-center">
                            <span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
                            {period}
                          </h4>
                          <div className="space-y-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                Food Type
                              </label>
                              <select
                                onChange={(e) =>
                                  handleFrequencyChange(
                                    `${period}.food`,
                                    e.target.value
                                  )
                                }
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              >
                                <option value="">Select food type</option>
                                <option value="E/S">E/S</option>
                                <option value="L/S">L/S</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                Time Range
                              </label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="time"
                                  onChange={(e) =>
                                    handleFrequencyChange(
                                      `${period}.timeStart`,
                                      e.target.value
                                    )
                                  }
                                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                                <span className="text-gray-500 text-sm font-medium">
                                  to
                                </span>
                                <input
                                  type="time"
                                  onChange={(e) =>
                                    handleFrequencyChange(
                                      `${period}.timeEnd`,
                                      e.target.value
                                    )
                                  }
                                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                Select start and end time for this period
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <div className="bg-white border rounded-lg p-6">
  <h4 className="font-medium text-gray-800 mb-3 flex items-center">
    <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
    Custom Frequency Timer
  </h4>

  <div>
    <label className="block text-sm font-medium text-gray-600 mb-2">
      Set Frequency Interval
    </label>
    <div className="flex items-center gap-4">
      <div className="flex-1">
        <input
          type="number"
          min="0"
          placeholder="Hours"
          onChange={(e) => handleFrequentChange(`hours:${e.target.value}`)}
          className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
        />
      </div>
      <div className="flex-1">
        <input
          type="number"
          min="0"
          max="59"
          placeholder="Minutes"
          onChange={(e) => handleFrequentChange(`minutes:${e.target.value}`)}
          className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
        />
      </div>
    </div>
    <p className="text-xs text-gray-500 mt-1">
      Specify how often the event should repeat (e.g., every 1 hr 30 mins)
    </p>
  </div>
</div>

                )}

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    onClick={onClose}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Save Configuration
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Duration Configuration Modal Component
const DurationModal = ({
  isOpen,
  onClose,
  onSave,
  days,
  prescriptionItems,
  consumptionType,
  currentDuration = [],
}) => {
  const [durationRanges, setDurationRanges] = useState([]);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [tempSelection, setTempSelection] = useState(new Set());
  const [showConflictDialog, setShowConflictDialog] = useState(false);
  const [conflictInfo, setConflictInfo] = useState(null);
  const calendarRef = useRef(null);

  // Color palette for different medicines
  const medicineColors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-red-500",
    "bg-yellow-500",
    "bg-indigo-500",
    "bg-pink-500",
    "bg-teal-500",
  ];

  useEffect(() => {
    if (currentDuration.length > 0) {
      setDurationRanges(currentDuration);
    } else {
      generateDefaultRanges();
    }

    // Set first medicine as selected by default
    if (prescriptionItems.length > 0 && !selectedMedicine) {
      setSelectedMedicine(0); // Use index instead of ID
    }
  }, [currentDuration, prescriptionItems, consumptionType, days]);

  const generateDefaultRanges = () => {
    if (prescriptionItems.length === 0) return;

    let ranges = [];

    if (consumptionType === "Sequential") {
      const daysPerMedicine = Math.floor(days / prescriptionItems.length);
      let currentDay = 1;

      prescriptionItems.forEach((item, index) => {
        const endDay =
          index === prescriptionItems.length - 1
            ? days
            : currentDay + daysPerMedicine - 1;
        ranges.push({
          startDay: currentDay,
          endDay: endDay,
          medicineIndex: index,
          hasGapAfter: false,
        });
        currentDay = endDay + 1;
      });
    } else if (consumptionType === "Sequential + Gap") {
      const daysPerMedicine = Math.floor(
        (days - prescriptionItems.length + 1) / prescriptionItems.length
      );
      let currentDay = 1;

      prescriptionItems.forEach((item, index) => {
        const endDay = currentDay + daysPerMedicine - 1;
        ranges.push({
          startDay: currentDay,
          endDay: Math.min(endDay, days),
          medicineIndex: index,
          hasGapAfter: index < prescriptionItems.length - 1,
        });
        currentDay = endDay + 2;
      });
    } else if (consumptionType === "Parallel") {
      prescriptionItems.forEach((item, index) => {
        ranges.push({
          startDay: 1,
          endDay: days,
          medicineIndex: index,
          hasGapAfter: false,
        });
      });
    }

    setDurationRanges(ranges);
  };

  const getMedicineName = (index) => {
    if (prescriptionItems[index] && prescriptionItems[index].rawMaterial) {
      return prescriptionItems[index].rawMaterial.name;
    }
    return `Medicine ${index + 1}`;
  };

  const getMedicineColor = (medicineIndex) => {
    return medicineColors[medicineIndex % medicineColors.length];
  };

  const getDayAssignments = (day) => {
    return durationRanges.filter(
      (range) => day >= range.startDay && day <= range.endDay
    );
  };

  const checkForConflicts = (newRange) => {
    const conflicts = [];
    for (let day = newRange.startDay; day <= newRange.endDay; day++) {
      const existing = getDayAssignments(day).filter(
        (r) => r.medicineIndex !== newRange.medicineIndex
      );
      if (existing.length > 0 && consumptionType !== "Parallel") {
        conflicts.push({ day, existing });
      }
    }
    return conflicts;
  };

  const handleMouseDown = (day) => {
    if (selectedMedicine === null) return;
    setIsDragging(true);
    setDragStart(day);
    setTempSelection(new Set([day]));
  };

  const handleMouseEnter = (day) => {
    if (isDragging && dragStart !== null) {
      const start = Math.min(dragStart, day);
      const end = Math.max(dragStart, day);
      const newSelected = new Set();
      for (let i = start; i <= end; i++) {
        newSelected.add(i);
      }
      setTempSelection(newSelected);
    }
  };

  const handleMouseUp = () => {
    if (isDragging && tempSelection.size > 0 && selectedMedicine !== null) {
      const newRange = {
        startDay: Math.min(...tempSelection),
        endDay: Math.max(...tempSelection),
        medicineIndex: selectedMedicine,
        hasGapAfter: false,
      };

      const conflicts = checkForConflicts(newRange);

      if (conflicts.length > 0 && consumptionType !== "Parallel") {
        setConflictInfo({ newRange, conflicts });
        setShowConflictDialog(true);
      } else {
        applyRange(newRange);
      }
    }

    setIsDragging(false);
    setDragStart(null);
    setTempSelection(new Set());
  };

  const applyRange = (newRange, replaceConflicts = false) => {
    setDurationRanges((prev) => {
      let updated = [...prev];

      if (replaceConflicts) {
        // Remove conflicting ranges
        updated = updated.filter((range) => {
          for (let day = newRange.startDay; day <= newRange.endDay; day++) {
            if (
              day >= range.startDay &&
              day <= range.endDay &&
              range.medicineIndex !== newRange.medicineIndex
            ) {
              return false;
            }
          }
          return true;
        });
      }

      // Add new range
      updated.push(newRange);
      return updated;
    });
  };

  const handleConflictResolve = (replace) => {
    if (conflictInfo) {
      applyRange(conflictInfo.newRange, replace);
    }
    setShowConflictDialog(false);
    setConflictInfo(null);
  };

  const clearDay = (day) => {
    setDurationRanges((prev) =>
      prev.filter((range) => !(day >= range.startDay && day <= range.endDay))
    );
  };

  const clearAllDays = () => {
    setDurationRanges([]);
  };

  const handleSave = () => {
    onSave(durationRanges);
    onClose();
  };

  const renderCalendar = () => {
    const weeks = [];
    let currentWeek = [];

    for (let day = 1; day <= days; day++) {
      currentWeek.push(day);
      if (currentWeek.length === 7 || day === days) {
        weeks.push([...currentWeek]);
        currentWeek = [];
      }
    }

    return weeks.map((week, weekIndex) => (
      <div key={weekIndex} className="flex">
        {week.map((day) => {
          const assignments = getDayAssignments(day);
          const isInTempSelection = tempSelection.has(day);
          const hasAssignment = assignments.length > 0;

          return (
            <div
              key={day}
              className={`
                w-16 h-16 border border-gray-200 cursor-pointer relative overflow-hidden
                transition-all duration-200 hover:shadow-md
                ${
                  isInTempSelection
                    ? "ring-2 ring-blue-400 ring-opacity-75"
                    : ""
                }
                ${hasAssignment ? "bg-opacity-90" : "bg-white hover:bg-gray-50"}
              `}
              onMouseDown={() => handleMouseDown(day)}
              onMouseEnter={() => handleMouseEnter(day)}
              onMouseUp={handleMouseUp}
              onContextMenu={(e) => {
                e.preventDefault();
                clearDay(day);
              }}
            >
              {/* Day number */}
              <div className="absolute top-1 left-1 text-xs font-medium text-gray-700 z-10">
                {day}
              </div>

              {/* Medicine assignments */}
              <div className="flex flex-col h-full pt-4">
                {assignments.map((assignment, idx) => (
                  <div
                    key={idx}
                    className={`
                      flex-1 ${getMedicineColor(assignment.medicineIndex)} 
                      ${
                        assignments.length === 1
                          ? "bg-opacity-40"
                          : "bg-opacity-60"
                      }
                      flex items-center justify-center
                    `}
                    title={getMedicineName(assignment.medicineIndex)}
                  >
                    <span className="text-xs text-white font-medium truncate px-1">
                      {getMedicineName(assignment.medicineIndex).substring(
                        0,
                        6
                      )}
                    </span>
                  </div>
                ))}
              </div>

              {/* Temp selection overlay */}
              {isInTempSelection && (
                <div className="absolute inset-0 bg-blue-300 bg-opacity-30 pointer-events-none"></div>
              )}
            </div>
          );
        })}
        {/* Fill empty cells for incomplete weeks */}
        {week.length < 7 &&
          Array.from({ length: 7 - week.length }, (_, index) => (
            <div
              key={`empty-${index}`}
              className="w-16 h-16 border border-gray-200 bg-gray-50"
            ></div>
          ))}
      </div>
    ));
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden">
          <div className="flex h-full">
            {/* Left Panel - Medicine Selection & Controls */}
            <div className="w-1/3 bg-gray-50 p-6 border-r overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">
                  Duration Setup
                </h3>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 text-xl"
                >
                  ✕
                </button>
              </div>

              {/* Consumption Type Info */}
              <div className="mb-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-sm font-medium text-blue-800 mb-1">
                  Mode: {consumptionType}
                </div>
                <div className="text-xs text-blue-600">
                  {consumptionType === "Parallel" &&
                    "All medicines can be taken simultaneously"}
                  {consumptionType === "Sequential" &&
                    "Medicines are taken one after another"}
                  {consumptionType === "Sequential + Gap" &&
                    "Medicines are taken sequentially with gaps"}
                </div>
              </div>

              {/* Medicine Selection */}
              <div className="mb-6">
                {/* <h4 className="font-medium text-gray-800 mb-3">Select Medicine ({prescriptionItems.length} total)</h4> */}
                <div className="space-y-2">
                  {prescriptionItems.map((item, index) => (
                    <div
                      key={index}
                      className={`
                        p-3 rounded-lg cursor-pointer transition-all border-2
                        ${
                          selectedMedicine === index
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 bg-white hover:border-gray-300"
                        }
                      `}
                      onClick={() => setSelectedMedicine(index)}
                    >
                      <div className="flex items-center">
                        <div
                          className={`w-4 h-4 rounded ${
                            medicineColors[index % medicineColors.length]
                          } mr-3`}
                        ></div>
                        <div className="flex-1">
                          <span className="font-medium text-gray-800">
                            {getMedicineName(index)}
                          </span>
                          <div className="text-xs text-gray-500">
                            Medicine #{index + 1}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Instructions */}
              <div className="mb-6 p-4 bg-white rounded-lg border">
                <h4 className="font-medium text-gray-800 mb-2">How to Use</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <div>• Select a medicine above</div>
                  <div>• Click and drag on calendar to assign days</div>
                  <div>• Right-click any day to clear it</div>
                  <div>• Different medicines have different colors</div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-3">
                <button
                  onClick={generateDefaultRanges}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Auto-Generate Ranges
                </button>
                <button
                  onClick={clearAllDays}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Clear All Days
                </button>
              </div>

              {/* Summary */}
              <div className="mt-6 p-4 bg-white rounded-lg border">
                <h4 className="font-medium text-gray-800 mb-2">
                  Assignment Summary
                </h4>
                <div className="space-y-1 text-sm">
                  {prescriptionItems.map((item, index) => {
                    const assignedDays = durationRanges
                      .filter((range) => range.medicineIndex === index)
                      .reduce(
                        (total, range) =>
                          total + (range.endDay - range.startDay + 1),
                        0
                      );

                    return (
                      <div
                        key={index}
                        className="flex justify-between items-center"
                      >
                        <div className="flex items-center">
                          <div
                            className={`w-3 h-3 rounded ${
                              medicineColors[index % medicineColors.length]
                            } mr-2`}
                          ></div>
                          <span className="text-gray-700">
                            {getMedicineName(index)}
                          </span>
                        </div>
                        <span className="text-gray-600">
                          {assignedDays} days
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Panel - Calendar */}
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Duration Calendar
                </h3>
                <p className="text-gray-600 text-sm">
                  {days} days total •{" "}
                  {selectedMedicine !== null
                    ? `Selected: ${getMedicineName(selectedMedicine)}`
                    : "Select a medicine to start"}
                </p>
              </div>

              {/* Calendar Grid */}
              <div
                ref={calendarRef}
                className="select-none"
                onMouseLeave={() => setIsDragging(false)}
              >
                {renderCalendar()}
              </div>

              {/* Legend */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-3">
                  Medicine Legend
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {prescriptionItems.map((item, index) => (
                    <div key={index} className="flex items-center">
                      <div
                        className={`w-4 h-4 rounded ${
                          medicineColors[index % medicineColors.length]
                        } mr-2`}
                      ></div>
                      <span className="text-sm text-gray-700 truncate">
                        {getMedicineName(index)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                <button
                  onClick={onClose}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Save Duration
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Conflict Resolution Dialog */}
      {showConflictDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Scheduling Conflict</h3>
            <p className="text-gray-600 mb-4">
              The selected days already have other medicines assigned. What
              would you like to do?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleConflictResolve(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleConflictResolve(true)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Replace Existing
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const PrescriptionWriting = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { patientData } = location.state || {};
  console.log("patientDatapatientData", patientData.medicalDetails.drafts);
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

  // Modal states
  const [showFrequencyModal, setShowFrequencyModal] = useState(false);
  const [showDurationModal, setShowDurationModal] = useState(false);
  const [currentItemForModal, setCurrentItemForModal] = useState(null);
  const [currentRowIndex, setCurrentRowIndex] = useState(null);

  // Prescription details
  const [prescriptionData, setPrescriptionData] = useState({
    patientId: patientData?._id || "",
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

  // Form quantity mapping based on medicine form
  const getQuantityByForm = (form) => {
    const quantityMap = {
      Tablets: { quantity: 10, uom: "Pieces" },
      Pills: { quantity: 20, uom: "Pieces" },
      "Liquid form": { quantity: 100, uom: "ML" },
      "Individual Medicine": { quantity: 1, uom: "Pieces" },
    };
    return quantityMap[form] || { quantity: 1, uom: "Pieces" };
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
      navigate("/doctor-dashboard");
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
      console.log("medicines: ", medicinesRes.data);
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
                unit: rawMaterial.unit,
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
  };

  const updatePrescriptionItem = (itemId, field, value) => {
    setPrescriptionData((prev) => ({
      ...prev,
      prescriptionItems: prev.prescriptionItems.map((item) => {
        if (item.id === itemId) {
          let updatedItem = { ...item, [field]: value };

          // Auto-update quantity based on form selection
          if (field === "form") {
            const formQuantity = getQuantityByForm(value);
            updatedItem.dispenseQuantity = formQuantity.quantity;
            updatedItem.uom = formQuantity.uom;
          }

          return updatedItem;
        }
        return item;
      }),
    }));
  };

  const addPrescriptionItem = () => {
    const newId =
      Math.max(
        ...prescriptionData.prescriptionItems.map((item) => item.id),
        0
      ) + 1;
    setPrescriptionData((prev) => ({
      ...prev,
      prescriptionItems: [
        ...prev.prescriptionItems,
        {
          id: newId,
          prescriptionType: "Only Prescription",
          medicineConsumptionType: "Sequential",
          medicineName: "",
          form: "Tablets",
          dispenseQuantity: 10,
          rawMaterials: [],
          preparationQuantity: [],
          duration: "",
          frequencies: [],
          durationRanges: [],
          price: 0,
          medicineConsumption: "",
          label: "A",
          additionalComments: "",
        },
      ],
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

  const saveFrequency = (frequencies) => {
    if (currentItemForModal) {
      updatePrescriptionItem(
        currentItemForModal.id,
        "frequencies",
        frequencies
      );
    }
  };

  const saveDuration = (durationRanges) => {
    if (currentItemForModal) {
      updatePrescriptionItem(
        currentItemForModal.id,
        "durationRanges",
        durationRanges
      );
      // Set duration summary text
      const durationText = durationRanges
        .map((range) => {
          const material = rawMaterials.find(
            (rm) => rm._id === range.rawMaterialId
          );
          return `${material?.name}: Day ${range.startDay}-${range.endDay}`;
        })
        .join(", ");
      updatePrescriptionItem(currentItemForModal.id, "duration", durationText);
    }
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

  const handleSavePrescription = async () => {
    try {
      setSaving(true);

      // Validate prescription data
      if (!prescriptionData.prescriptionItems.length) {
        toast.error("Please add at least one prescription item");
        return;
      }

      // for (const item of prescriptionData.prescriptionItems) {
      //   if (!item.medicineName.trim()) {
      //     toast.error("Please enter medicine name for all items");
      //     return;
      //   }
      //   if (!item.preparationQuantity.length) {
      //     toast.error("Please select raw materials for all medicines");
      //     return;
      //   }
      //   if (!item.frequencies.length) {
      //     toast.error("Please configure frequency for all medicines");
      //     return;
      //   }
      // }

      const authAxios = createAuthAxios();

      // Prepare data for API
      const apiData = {
        patientId: prescriptionData.patientId,
        prescriptionItems: prescriptionData.prescriptionItems.map((item) => ({
          medicineName: item.medicineName,
          rawMaterialDetails: item.preparationQuantity.map((rm) => ({
            _id: rm._id,
            name: rm.name,
            quantity: rm.quantity,
            pricePerUnit: rm.pricePerUnit,
            totalPrice: rm.totalPrice,
          })),
          form: item.form,
          dispenseQuantity: item.dispenseQuantity,
          uom: item.uom || "Pieces",
          packaging: "Bottle",
          frequencies: item.frequencies,
          durationRanges: item.durationRanges,
          price: item.price,
          additionalComments: item.additionalComments,
          duration: item.duration,
          frequencyType: "Standard",
        })),
        followUpDays: prescriptionData.followUpDays,
        medicineCharges: prescriptionData.medicineCharges,
        shippingCharges: prescriptionData.shippingCharges,
        notes: prescriptionData.notes,
        medicineCourse: prescriptionData.medicineCourse,
        prescriptionType:
          prescriptionData.prescriptionItems[0]?.prescriptionType ||
          "Only Prescription",
        consumptionType:
          prescriptionData.prescriptionItems[0]?.medicineConsumptionType ||
          "Sequential",
        label: prescriptionData.prescriptionItems[0]?.label || "A",
        action: prescriptionData.action,
        parentPrescriptionId: prescriptionData.parentPrescriptionId,
        consultingType: prescriptionData.consultingType,
        consultingFor: prescriptionData.consultingFor,
      };

      const response = await authAxios.post(
        `${API_URL}/api/prescriptionControl/create`,
        apiData
      );

      if (response.data.success) {
        toast.success("Prescription saved successfully!");
        navigate("/doctor-dashboard");
      } else {
        toast.error(response.data.message || "Failed to save prescription");
      }
    } catch (err) {
      console.error("Error saving prescription:", err);
      toast.error(err.response?.data?.message || "Failed to save prescription");
    } finally {
      setSaving(false);
    }
  };

  const filteredRawMaterials = rawMaterials.filter((material) =>
    material.name.toLowerCase().includes(searchRawTerm.toLowerCase())
  );

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
      frequency: false,
      price: true, // Always visible
      medicineConsumption: false,
      label: false,
      additionalComments: true, // Always visible
      actions: true, // Always visible
    };

    switch (prescriptionType) {
      case "Prescription + Medicine":
        return {
          ...fieldConfig,
          medicineConsumptionType: true,
          rawMaterial: true,
          preparationQuantity: true,
          duration: true,
          frequency: true,
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

      case "Only Medicine":
      case "Medicine + Kit":
      case "Prescription + Medicine kit":
      case "SOS Medicine":
        return {
          ...fieldConfig,
          rawMaterial: true,
          preparationQuantity: true,
        };

      default:
        return fieldConfig;
    }
  };

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
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            prescription.action.status === "In Progress"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {prescription.action.status}
                        </span>
                      </td>
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

                {/* Status Dropdown */}
                <select
                  value={prescriptionData.action.status}
                  onChange={(e) =>
                    setPrescriptionData((prev) => ({
                      ...prev,
                      action: { ...prev.action, status: e.target.value },
                    }))
                  }
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="In Progress">In Progress</option>
                  <option value="Close">Close</option>
                </select>

                {/* Show comment input when status is Close */}
                {prescriptionData.action.status === "Close" && (
                  <input
                    type="text"
                    placeholder="Enter close comment"
                    value={prescriptionData.action.closeComment}
                    onChange={(e) =>
                      setPrescriptionData((prev) => ({
                        ...prev,
                        action: {
                          ...prev.action,
                          closeComment: e.target.value,
                        },
                      }))
                    }
                    className="w-full border rounded mt-2 px-3 py-2 text-sm"
                  />
                )}
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
              <button
                onClick={addPrescriptionItem}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <IoIosAdd className="text-lg" />
                Add Medicine
              </button>
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
                      Price
                    </th>
                    <th className="border-b border-gray-200 px-4 py-4 text-sm font-semibold text-gray-700 text-left">
                      Medicine Consumption
                    </th>
                    <th className="border-b border-gray-200 px-4 py-4 text-sm font-semibold text-gray-700 text-left">
                      Label
                    </th>
                    <th className="border-b border-gray-200 px-4 py-4 text-sm font-semibold text-gray-700 text-left">
                      Additional Comments
                    </th>
                    <th className="border-b border-gray-200 px-4 py-4 text-sm font-semibold text-gray-700 text-left">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {prescriptionData.prescriptionItems.map((item, index) => {
                    const fieldVisibility = getFieldVisibility(
                      item.prescriptionType
                    );

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
                          </select>
                        </td>

                        {/* Medicine Name */}
                        <td className="px-4 py-4 min-w-44">
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
                        </td>

                        {/* Medicine Form */}
                        <td className="px-4 py-4 min-w-36">
                          <select
                            value={item.form}
                            onChange={(e) =>
                              updatePrescriptionItem(
                                item.id,
                                "form",
                                e.target.value
                              )
                            }
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white hover:border-gray-300 transition-colors"
                          >
                            <option value="Tablets">Tablets</option>
                            <option value="Pills">Pills</option>
                            <option value="Liquid form">Liquid form</option>
                            <option value="Individual Medicine">
                              Individual Medicine
                            </option>
                          </select>
                        </td>

                        {/* Dispense Quantity */}
                        <td className="px-4 py-4 min-w-32">
                          {item.form === "Liquid form" ? (
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
                                  {filteredRawMaterials.map((material) => (
                                    <div
                                      key={material._id}
                                      className="px-3 py-2 hover:bg-blue-50 transition-colors"
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
                                          {material.name} ({material.unit})
                                        </span>
                                      </label>
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
                                  value={prep.quantity}
                                  onChange={(e) =>
                                    updatePreparationQuantity(
                                      item.id,
                                      prep._id,
                                      e.target.value
                                    )
                                  }
                                  disabled={
                                    !fieldVisibility.preparationQuantity
                                  }
                                  className="w-20 border border-gray-200 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                                  min="0"
                                  step="0.1"
                                />
                                <span className="text-sm text-gray-500">
                                  {prep.unit}
                                </span>
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
                              {item.duration || "Set Duration"}
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
                              ></path>
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
                              ></path>
                            </svg>
                          </button>
                        </td>

                        {/* Price */}
                        <td className="px-4 py-4 text-center min-w-24">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                            ₹{item.price.toFixed(2)}
                          </span>
                        </td>

                        {/* Medicine Consumption */}
                        <td
                          className={`px-4 py-4 min-w-64 ${
                            !fieldVisibility.medicineConsumption
                              ? "opacity-30 pointer-events-none"
                              : ""
                          }`}
                        >
                          <div className="space-y-2">
                            {item.form === "Liquid form" ? (
                              <select
                                value={item.medicineConsumption}
                                onChange={(e) =>
                                  updatePrescriptionItem(
                                    item.id,
                                    "medicineConsumption",
                                    e.target.value
                                  )
                                }
                                disabled={!fieldVisibility.medicineConsumption}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white hover:border-gray-300 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                              >
                                <option value="">Select</option>
                                <option value="3 drops in 15ml of water">
                                  3 drops in 15ml of water
                                </option>
                                <option value="10 strokes (as per bottle) in 15ml">
                                  10 strokes (as per bottle) in 15ml
                                </option>
                                <option value="Additional">Additional</option>
                              </select>
                            ) : item.form === "Pills" ? (
                              <select
                                value={item.medicineConsumption}
                                onChange={(e) =>
                                  updatePrescriptionItem(
                                    item.id,
                                    "medicineConsumption",
                                    e.target.value
                                  )
                                }
                                disabled={!fieldVisibility.medicineConsumption}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white hover:border-gray-300 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                              >
                                <option value="">Select</option>
                                <option value="5 pills dissolve in one teacup of water 1 dose = 5 Full teaspoon">
                                  5 pills dissolve in one teacup of water 1 dose
                                  = 5 Full teaspoon
                                </option>
                                <option value="3 pills">3 pills</option>
                                <option value="Additional">Additional</option>
                              </select>
                            ) : item.form === "Tablets" ? (
                              <select
                                value={item.medicineConsumption}
                                onChange={(e) =>
                                  updatePrescriptionItem(
                                    item.id,
                                    "medicineConsumption",
                                    e.target.value
                                  )
                                }
                                disabled={!fieldVisibility.medicineConsumption}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white hover:border-gray-300 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                              >
                                <option value="">Select</option>
                                <option value="No of tabs (as mentioned on the bottle) - chew - drink one sip of hot water">
                                  No of tabs (as mentioned on the bottle) - chew
                                  - drink one sip of hot water
                                </option>
                                <option value="Additional">Additional</option>
                              </select>
                            ) : null}

                            {/* Show text box if 'Additional' is selected */}
                            {item.medicineConsumption === "Additional" &&
                              fieldVisibility.medicineConsumption && (
                                <input
                                  type="text"
                                  value={item.customConsumption}
                                  onChange={(e) =>
                                    updatePrescriptionItem(
                                      item.id,
                                      "customConsumption",
                                      e.target.value
                                    )
                                  }
                                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white hover:border-gray-300 transition-colors"
                                  placeholder="Enter custom instruction"
                                />
                              )}
                          </div>
                        </td>

                        {/* Label */}
                        <td
                          className={`px-4 py-4 min-w-20 ${
                            !fieldVisibility.label
                              ? "opacity-30 pointer-events-none"
                              : ""
                          }`}
                        >
                          <select
                            value={item.label}
                            onChange={(e) =>
                              updatePrescriptionItem(
                                item.id,
                                "label",
                                e.target.value
                              )
                            }
                            disabled={!fieldVisibility.label}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white hover:border-gray-300 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                          >
                            <option value="A">A</option>
                            <option value="B">B</option>
                            <option value="C">C</option>
                            <option value="D">D</option>
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                          </select>
                        </td>

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
                            placeholder="Additional notes..."
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
                  Follow Up Days
                </label>
                <input
                  type="number"
                  value={prescriptionData.followUpDays}
                  onChange={(e) =>
                    setPrescriptionData((prev) => ({
                      ...prev,
                      followUpDays: parseInt(e.target.value) || 0,
                    }))
                  }
                  className="w-full border rounded px-3 py-2"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Medicine Charges
                </label>
                <input
                  type="number"
                  value={prescriptionData.medicineCharges}
                  readOnly
                  className="w-full border rounded px-3 py-2 bg-gray-100"
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
                  step="0.01"
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
                    prescriptionData.shippingCharges
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

          {/* Action Buttons */}
          <div className="flex justify-between items-center">
            <button
              onClick={() => setShowPrescriptionTable(true)}
              className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-50"
            >
              Back to Prescriptions
            </button>
            <div className="space-x-4">
              <button
                onClick={() => navigate("/doctor-dashboard")}
                className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-50"
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
          days={prescriptionData.medicineCourse}
          currentFrequencies={currentItemForModal?.frequencies || []}
        />
      )}

      {/* Duration Modal */}
      {showDurationModal && (
        <DurationModal
          isOpen={showDurationModal}
          onClose={() => setShowDurationModal(false)}
          onSave={saveDuration}
          days={prescriptionData.medicineCourse}
          prescriptionItems={prescriptionData.prescriptionItems}
          rawMaterials={currentItemForModal?.rawMaterials || []}
          consumptionType={prescriptionData.consumptionType}
          currentDuration={currentItemForModal?.durationRanges || []}
        />
      )}
    </div>
  );
};

export default PrescriptionWriting;
