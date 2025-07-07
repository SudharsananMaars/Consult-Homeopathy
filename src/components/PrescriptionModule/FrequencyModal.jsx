import React, { useState, useEffect, useRef } from "react";

const FrequencyModal = ({
  isOpen,
  onClose,
  onSave,
  selectedDurationDays = [],
  currentFrequencies = [],
  frequencyType = "standard",
  consumptionType,
  medicineName = "",
  itemIndex = 0,
  totalMedicines = 1,
  allMedicines = [],
}) => {
  console.log("FrequencyModal props:", {
    isOpen,
    onClose,
    onSave,
    selectedDurationDays,
    currentFrequencies,
    frequencyType,
    consumptionType,
    medicineName,
    itemIndex,
    totalMedicines,
    allMedicines,
  });

  const [dayRanges, setDayRanges] = useState([]);
  const [selectedRange, setSelectedRange] = useState(null);
  const [rangeConfigurations, setRangeConfigurations] = useState({});
  const [clickStart, setClickStart] = useState(null);
  const [startTime, setStartTime] = useState("08:00");
  const [parallelConsumptionType, setParallelConsumptionType] = useState("sequential");
  const [parallelSchedule, setParallelSchedule] = useState([]);

  const calendarRef = useRef(null);
  const medicineConsumptionType = consumptionType || "Sequential";
  const availableDays = selectedDurationDays.length > 0 ? selectedDurationDays : [];
  const totalDays = availableDays.length;

  // Check if we need to show parallel consumption options
  const showParallelOptions = 
    medicineConsumptionType === "Parallel" && 
    totalMedicines >= 2 && 
    frequencyType === "frequent" &&
    allMedicines.filter(med => med.medicineConsumptionType === "Parallel").length >= 2;

  // Time validation ranges
  const timeRanges = {
    morning: { start: "04:00", end: "11:59" },
    afternoon: { start: "12:00", end: "16:59" },
    evening: { start: "17:00", end: "20:59" },
    night: { start: "21:00", end: "03:59" },
  };

  // Helper function to find overlapping days between medicines
  const findOverlappingDays = () => {
    const overlappingDays = new Set();
    const parallelMedicines = allMedicines.filter(med => med.medicineConsumptionType === "Parallel");
    
    if (parallelMedicines.length < 2) return [];

    for (let i = 0; i < parallelMedicines.length; i++) {
      for (let j = i + 1; j < parallelMedicines.length; j++) {
        const med1Days = parallelMedicines[i].selectedDurationDays || [];
        const med2Days = parallelMedicines[j].selectedDurationDays || [];
        
        med1Days.forEach(day => {
          if (med2Days.includes(day)) {
            overlappingDays.add(day);
          }
        });
      }
    }
    
    return Array.from(overlappingDays).sort((a, b) => a - b);
  };

  // Helper function to calculate timings for a day
  const calculateTimingsForDay = (day, hours, minutes, doses, startTime, isOverlapping = false) => {
    const timings = [];
    const intervalMinutes = hours * 60 + minutes;
    
    const baseTime = new Date();
    const [startH, startM] = startTime.split(":").map(Number);
    baseTime.setHours(startH, startM, 0, 0);

    if (!isOverlapping) {
      // Non-overlapping day - simple sequential timing
      for (let i = 0; i < doses; i++) {
        const doseTime = new Date(baseTime.getTime() + (intervalMinutes * i * 60000));
        timings.push(doseTime.toTimeString().slice(0, 5));
      }
    } else {
      // Overlapping day - need to coordinate with other parallel medicines
      const overlappingMedicines = allMedicines.filter(med => 
        med.medicineConsumptionType === "Parallel" && 
        med.selectedDurationDays.includes(day)
      );
      
      const currentMedicineIndex = overlappingMedicines.findIndex(med => med.medicineName === medicineName);
      const parallelGap = 30; // 30 minutes between parallel medicines
      
      if (parallelConsumptionType === "sequential") {
        // Sequential: Complete this medicine's all doses first
        const totalPreviousDoses = overlappingMedicines.slice(0, currentMedicineIndex).reduce((sum, med) => {
          const config = med.frequencies?.[0] || {};
          return sum + (config.doses || 0);
        }, 0);
        
        const baseOffset = totalPreviousDoses * intervalMinutes;
        
        for (let i = 0; i < doses; i++) {
          const doseTime = new Date(baseTime.getTime() + ((baseOffset + intervalMinutes * i) * 60000));
          timings.push(doseTime.toTimeString().slice(0, 5));
        }
      } else {
        // Parallel: Interleave doses with other medicines
        for (let i = 0; i < doses; i++) {
          const cycleTime = intervalMinutes * overlappingMedicines.length;
          const medicineOffset = currentMedicineIndex * parallelGap;
          const doseTime = new Date(baseTime.getTime() + ((cycleTime * i + medicineOffset) * 60000));
          timings.push(doseTime.toTimeString().slice(0, 5));
        }
      }
    }
    
    return timings;
  };

  // useEffect for loading existing frequencies (unedited)
  useEffect(() => {
    if (currentFrequencies.length > 0) {
      console.log("Loading existing frequencies:", currentFrequencies);

      const existingParallelData = currentFrequencies.find(
        (f) => f.parallelConsumption
      );
      if (existingParallelData) {
        setParallelConsumptionType(
          existingParallelData.parallelConsumption.type || "sequential"
        );
        setParallelSchedule(
          existingParallelData.parallelConsumption.schedule || []
        );
      }

      const ranges = [];
      const configs = {};
      const dayToRangeMap = new Map();

      currentFrequencies.forEach((freq) => {
        if (availableDays.includes(freq.day)) {
          const key = freq.duration || `Day ${freq.day}`;

          if (!dayToRangeMap.has(key)) {
            dayToRangeMap.set(key, []);
          }
          dayToRangeMap.get(key).push(freq.day);
        }
      });

      dayToRangeMap.forEach((days, key) => {
        const sortedDays = [...new Set(days)].sort((a, b) => a - b);
        ranges.push(sortedDays);

        const rangeKey = `${Math.min(...sortedDays)}-${Math.max(...sortedDays)}`;
        const firstFreq = currentFrequencies.find((f) => sortedDays.includes(f.day));

        if (firstFreq) {
          configs[rangeKey] = {
            days: sortedDays,
            frequencyType: firstFreq.frequencyType || frequencyType,
            standardFrequency: firstFreq.standardFrequency || {},
            frequentFrequency: firstFreq.frequentFrequency || {},
            parallelConsumption: firstFreq.parallelConsumption || null,
          };
        }
      });

      setDayRanges(ranges);
      setRangeConfigurations(configs);
    }
  }, [currentFrequencies, availableDays, frequencyType]);

  // clearAutoGenerated function (unedited)
  const clearAutoGenerated = () => {
    setParallelSchedule([]);
    setStartTime("08:00");

    const rangeKey = `${Math.min(...dayRanges[selectedRange])}-${Math.max(...dayRanges[selectedRange])}`;
    setRangeConfigurations((prev) => ({
      ...prev,
      [rangeKey]: {
        ...prev[rangeKey],
        parallelConsumption: null,
      },
    }));
  };

  // updateRangeConfiguration function (unedited)
  const updateRangeConfiguration = (rangeKey, updates) => {
    setRangeConfigurations((prev) => ({
      ...prev,
      [rangeKey]: {
        ...prev[rangeKey],
        ...updates,
      },
    }));
  };

  // Updated generateParallelSchedule function
  const generateParallelSchedule = () => {
    if (!startTime) {
      alert("Please select the first dose time.");
      return;
    }
    const currentRange = dayRanges[selectedRange];
    const rangeKey = `${Math.min(...currentRange)}-${Math.max(...currentRange)}`;
    const config = rangeConfigurations[rangeKey];
    if(!config.frequentFrequency.hours) {
      alert("Please select hour.");
      return;
    }
    if(!config.frequentFrequency.doses) {
      alert("Please select dose.");
      return;
    }
    const { hours = 0, minutes = 0, doses = 0 } = config.frequentFrequency || {};

    const overlappingDays = findOverlappingDays();
    const schedule = [];

    currentRange.forEach(day => {
      const isOverlapping = overlappingDays.includes(day);
      const timings = calculateTimingsForDay(day, hours, minutes, doses, startTime, isOverlapping);
      
      timings.forEach((time, index) => {
        schedule.push({
          day: day,
          doseNumber: index + 1,
          time: time,
          medicineName: medicineName,
          type: parallelConsumptionType,
          isOverlapping: isOverlapping,
          sequentialOrder: index + 1,
        });
      });
    });

    setParallelSchedule(schedule);

    // Save back into config
    setRangeConfigurations((prev) => ({
      ...prev,
      [rangeKey]: {
        ...prev[rangeKey],
        parallelConsumption: {
          type: parallelConsumptionType,
          schedule,
        },
      },
    }));
  };

  // Time validation functions (unedited)
  const validateTime = (time, period) => {
    if (!time) return true;
    const timeMinutes = timeToMinutes(time);
    const range = timeRanges[period];
    const startMinutes = timeToMinutes(range.start);
    const endMinutes = timeToMinutes(range.end);
    if (period === "night") {
      return timeMinutes >= startMinutes || timeMinutes <= endMinutes;
    }
    return timeMinutes >= startMinutes && timeMinutes <= endMinutes;
  };

  const timeToMinutes = (time) => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const getTimeRangeLabel = (period) => {
    const range = timeRanges[period];
    return `${range.start} - ${range.end}`;
  };

  // Calendar interaction functions (unedited)
  const handleDayClick = (day) => {
    if (clickStart === null) {
      setClickStart(day);
    } else {
      const sortedDays = availableDays.sort((a, b) => a - b);
      const startIndex = sortedDays.indexOf(clickStart);
      const endIndex = sortedDays.indexOf(day);
      const minIndex = Math.min(startIndex, endIndex);
      const maxIndex = Math.max(startIndex, endIndex);
      const newRange = [];
      for (let i = minIndex; i <= maxIndex; i++) {
        newRange.push(sortedDays[i]);
      }
      const overlapping = dayRanges.some((range) =>
        range.some((d) => newRange.includes(d))
      );
      if (!overlapping) {
        const updatedRanges = [...dayRanges, newRange];
        setDayRanges(updatedRanges);
        setSelectedRange(updatedRanges.length - 1);
        const rangeKey = `${Math.min(...newRange)}-${Math.max(...newRange)}`;
        setRangeConfigurations((prev) => ({
          ...prev,
          [rangeKey]: {
            days: newRange,
            frequencyType: frequencyType,
            standardFrequency: {},
            frequentFrequency: {},
          },
        }));
      } else {
        alert("This range overlaps with an existing range. Please select non-overlapping days.");
      }
      setClickStart(null);
    }
  };

  const handleRangeSelect = (rangeIndex) => {
    setSelectedRange(rangeIndex);
  };

  const handleRangeDelete = (rangeIndex) => {
    const newRanges = dayRanges.filter((_, index) => index !== rangeIndex);
    const rangeToDelete = dayRanges[rangeIndex];
    const rangeKey = `${Math.min(...rangeToDelete)}-${Math.max(...rangeToDelete)}`;
    const newConfigs = { ...rangeConfigurations };
    delete newConfigs[rangeKey];
    setDayRanges(newRanges);
    setRangeConfigurations(newConfigs);
    setSelectedRange(null);
  };

  // Frequency change handlers (unedited)
  const handleFrequencyChange = (field, value) => {
    if (selectedRange === null) return;
    const currentRange = dayRanges[selectedRange];
    const rangeKey = `${Math.min(...currentRange)}-${Math.max(...currentRange)}`;
    const fieldParts = field.split(".");
    setRangeConfigurations((prev) => {
      const frequencyKey = frequencyType === "standard" ? "standardFrequency" : "frequentFrequency";
      return {
        ...prev,
        [rangeKey]: {
          ...prev[rangeKey],
          days: currentRange,
          frequencyType: frequencyType,
          [frequencyKey]: {
            ...prev[rangeKey]?.[frequencyKey],
            [fieldParts[0]]: {
              ...prev[rangeKey]?.[frequencyKey]?.[fieldParts[0]],
              [fieldParts[1]]: value,
            },
          },
        },
      };
    });
  };

  const handleFrequentChange = (field, value) => {
    if (selectedRange === null) return;
    const currentRange = dayRanges[selectedRange];
    const rangeKey = `${Math.min(...currentRange)}-${Math.max(...currentRange)}`;
    setRangeConfigurations((prev) => ({
      ...prev,
      [rangeKey]: {
        ...prev[rangeKey],
        days: currentRange,
        frequencyType: "frequent",
        frequentFrequency: {
          ...prev[rangeKey]?.frequentFrequency,
          [field]: value,
        },
      },
    }));
  };

  // Clear selection function (unedited)
  const clearSelection = () => {
    setDayRanges([]);
    setRangeConfigurations({});
    setSelectedRange(null);
    setClickStart(null);
  };

  // Updated handleSave function
  const handleSave = () => {
    const freqArray = [];
    const overlappingDays = findOverlappingDays();

    console.log("Saving frequency configuration:", {
      dayRanges,
      rangeConfigurations,
      showParallelOptions,
      parallelConsumptionType,
      parallelSchedule,
      overlappingDays,
    });

    dayRanges.forEach((range) => {
      const rangeKey = `${Math.min(...range)}-${Math.max(...range)}`;
      const config = rangeConfigurations[rangeKey];

      if (config) {
        range.forEach((day) => {
          const baseFreqObj = {
            day: day,
            duration: `Day ${Math.min(...range)}-${Math.max(...range)}`,
            frequencyType: config.frequencyType,
          };

          if (showParallelOptions && config.parallelConsumption) {
            baseFreqObj.parallelConsumption = config.parallelConsumption;
          }

          if (config.frequencyType === "standard") {
            const standardFrequency = {};
            ["morning", "afternoon", "evening", "night"].forEach((period) => {
              const periodConfig = config.standardFrequency?.[period] || {};
              standardFrequency[period] = {
                foodType: periodConfig.foodType || "",
                from: periodConfig.from || "",
                to: periodConfig.to || "",
              };
            });

            freqArray.push({
              ...baseFreqObj,
              standardFrequency: standardFrequency,
              timing: {
                morning: { food: standardFrequency.morning.foodType, time: standardFrequency.morning.from },
                afternoon: { food: standardFrequency.afternoon.foodType, time: standardFrequency.afternoon.from },
                evening: { food: standardFrequency.evening.foodType, time: standardFrequency.evening.from },
                night: { food: standardFrequency.night.foodType, time: standardFrequency.night.from },
              },
            });
          } else {
            // Frequent frequency with detailed timings
            const frequentFrequency = config.frequentFrequency || {};
            const { hours = 0, minutes = 0, doses = 0 } = frequentFrequency;
            
            // Calculate timings for this specific day
            const isOverlapping = overlappingDays.includes(day);
            const timings = calculateTimingsForDay(day, hours, minutes, doses, startTime, isOverlapping);
            
            freqArray.push({
              ...baseFreqObj,
              frequentFrequency: frequentFrequency,
              frequency: `${hours}hr ${minutes}mins`,
              timings: timings, // Add detailed timings array
              isOverlapping: isOverlapping,
              consumptionPattern: isOverlapping ? parallelConsumptionType : 'single',
            });
          }
        });
      }
    });

    console.log("Final frequency array to save:", freqArray);
    onSave(freqArray);
    onClose();
  };

  // Helper functions (unedited)
  const getDayRangeForDay = (day) => {
    return dayRanges.findIndex((range) => range.includes(day));
  };

  // Render functions (unedited)
  const renderCalendar = () => {
    if (availableDays.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <p>No duration days selected.</p>
          <p className="text-sm">Please set duration first.</p>
        </div>
      );
    }

    const weeks = [];
    let currentWeek = [];
    availableDays.forEach((day, index) => {
      currentWeek.push(day);
      if (currentWeek.length === 7 || index === availableDays.length - 1) {
        weeks.push([...currentWeek]);
        currentWeek = [];
      }
    });

    return weeks.map((week, weekIndex) => (
      <div key={weekIndex} className="flex gap-1 mb-1">
        {week.map((day) => {
          const rangeIndex = getDayRangeForDay(day);
          const isInRange = rangeIndex !== -1;
          const isClickStart = clickStart === day;
          const isSelectedRange = selectedRange === rangeIndex;
          const showPreviewRange = clickStart !== null && day !== clickStart;
          const sortedDays = availableDays.sort((a, b) => a - b);
          const startIndex = sortedDays.indexOf(clickStart);
          const currentIndex = sortedDays.indexOf(day);
          const isInPreviewRange = showPreviewRange && currentIndex >= Math.min(startIndex, currentIndex) && currentIndex <= Math.max(startIndex, currentIndex);
          const rangeColors = ["bg-blue-500 border-blue-500", "bg-green-500 border-green-500", "bg-purple-500 border-purple-500", "bg-orange-500 border-orange-500", "bg-pink-500 border-pink-500", "bg-indigo-500 border-indigo-500"];
          const selectedRangeColors = ["bg-blue-600 border-blue-600", "bg-green-600 border-green-600", "bg-purple-600 border-purple-600", "bg-orange-600 border-orange-600", "bg-pink-600 border-pink-600", "bg-indigo-600 border-indigo-600"];

          return (
            <div
              key={day}
              className={`
                w-12 h-12 flex items-center justify-center text-sm font-medium cursor-pointer
                border-2 rounded-lg transition-all duration-200 hover:shadow-md
                ${isClickStart ? "border-blue-500 bg-blue-100 text-blue-800" : ""}
                ${isInRange && !isClickStart ? `${isSelectedRange ? selectedRangeColors[rangeIndex % selectedRangeColors.length] : rangeColors[rangeIndex % rangeColors.length]} text-white` : ""}
                ${!isInRange && !isClickStart ? "bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50" : ""}
                ${isInPreviewRange && !isInRange ? "bg-blue-100 border-blue-300 text-blue-700" : ""}
              `}
              onClick={() => handleDayClick(day)}
              title={`Day ${day}${isInRange ? ` (Range ${rangeIndex + 1})` : ""}`}
            >
              {day}
            </div>
          );
        })}
        {week.length < 7 && Array.from({ length: 7 - week.length }, (_, index) => (
          <div key={`empty-${index}`} className="w-12 h-12"></div>
        ))}
      </div>
    ));
  };

  const renderRangeSummary = () => {
    if (dayRanges.length === 0) {
      return (
        <div className="text-center py-4 text-gray-500">
          <p className="text-sm">No day ranges selected</p>
          <p className="text-xs">Click on calendar to select day ranges</p>
        </div>
      );
    }

    const rangeColors = ["bg-blue-100 border-blue-300 text-blue-800", "bg-green-100 border-green-300 text-green-800", "bg-purple-100 border-purple-300 text-purple-800", "bg-orange-100 border-orange-300 text-orange-800", "bg-pink-100 border-pink-300 text-pink-800", "bg-indigo-100 border-indigo-300 text-indigo-800"];

    return (
      <div className="space-y-2">
        <h4 className="font-medium text-gray-700 mb-3">Day Ranges Summary</h4>
        {dayRanges.map((range, index) => {
          const rangeKey = `${Math.min(...range)}-${Math.max(...range)}`;
          const config = rangeConfigurations[rangeKey];
          const isSelected = selectedRange === index;

          return (
            <div
              key={index}
              className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${isSelected ? "border-blue-500 bg-blue-50" : rangeColors[index % rangeColors.length]} hover:shadow-md`}
              onClick={() => handleRangeSelect(index)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="font-medium text-sm">Days {Math.min(...range)} - {Math.max(...range)}</div>
                  <div className="text-xs text-gray-600 mt-1">{range.length} day{range.length > 1 ? "s" : ""} selected</div>
                  {config && (
                    <div className="text-xs text-gray-500 mt-1">
                      {config.frequencyType === "standard" ? "Standard (4x/day)" : "Custom Interval"}
                    </div>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRangeDelete(index);
                  }}
                  className="text-red-500 hover:text-red-700 text-sm font-bold ml-2"
                >
                  ✕
                </button>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Updated renderParallelConsumptionControls function
const renderParallelConsumptionControls = () => {
  if (!showParallelOptions) return null;

  const currentRange = dayRanges[selectedRange] || [];
  const rangeKey = `${Math.min(...currentRange)}-${Math.max(...currentRange)}`;
  const config = rangeConfigurations[rangeKey] || {};
  const frequentConfig = config.frequentFrequency || {};
  const overlappingDays = findOverlappingDays?.() || [];
  const overlappingInRange = currentRange.filter((day) =>
    overlappingDays.includes(day)
  );

  return (
    <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
      <h5 className="font-semibold text-purple-800 mb-4">
        Parallel Consumption Settings
      </h5>

      {/* Overlapping Days Info */}
      {overlappingInRange.length > 0 && (
        <div className="mb-4 p-3 bg-orange-50 rounded border border-orange-200">
          <h6 className="font-medium text-orange-800 mb-2">
            Overlapping Days Detected
          </h6>
          <p className="text-sm text-orange-700">
            Days {overlappingInRange.join(", ")} overlap with other parallel
            medicines. Special timing coordination will be applied.
          </p>
        </div>
      )}

      {/* Consumption Type Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Consumption Pattern
        </label>
        <select
          value={parallelConsumptionType}
          onChange={(e) => setParallelConsumptionType(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
        >
          <option value="sequential">
            Sequential (Complete this medicine first)
          </option>
          <option value="parallel">
            Parallel (Interleave with other medicines)
          </option>
        </select>
      </div>

      {/* Start Time Picker */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          First Dose Start Time
        </label>
        <input
          type="time"
          value={startTime || ""}
          onChange={(e) => setStartTime(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
        />
      </div>

      {/* Enhanced Description */}
      <div className="mb-4 p-3 bg-white rounded border border-purple-200">
        <p className="text-sm text-gray-700">
          {parallelConsumptionType === "sequential"
            ? `Sequential: ${medicineName} will complete all ${frequentConfig.doses || 0} doses (every ${frequentConfig.hours || 0}h ${frequentConfig.minutes || 0}m) before other parallel medicines start on overlapping days.`
            : `Parallel: ${medicineName} doses will be interleaved with other parallel medicines on overlapping days, with coordinated timing to avoid conflicts.`}
        </p>
        {overlappingInRange.length > 0 && (
          <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
            <p className="text-xs text-blue-700">
              <strong>Timing Coordination:</strong> On overlapping days (
              {overlappingInRange.join(", ")}), this medicine will be scheduled
              with{" "}
              {parallelConsumptionType === "sequential"
                ? "sequential"
                : "parallel"}{" "}
              timing relative to other medicines to ensure proper intervals.
            </p>
          </div>
        )}
      </div>

      {/* Auto-generation Controls */}
      <div className="flex gap-3">
        <button
          onClick={generateParallelSchedule}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
        >
          Generate Coordinated Schedule
        </button>
        <button
          onClick={clearAutoGenerated}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium"
        >
          Clear Generated Schedule
        </button>
      </div>

      {/* Enhanced Generated Schedule Display */}
      {parallelSchedule?.length > 0 && (
        <div className="mt-4">
          <h6 className="font-medium text-gray-700 mb-2">
            Generated Schedule for {medicineName}:
          </h6>
          <div className="bg-white p-3 rounded border border-gray-200 max-h-40 overflow-y-auto">
            {parallelSchedule.map((dose, index) => (
              <div
                key={index}
                className="text-sm mb-2 p-2 bg-gray-50 rounded"
              >
                <div className="font-medium text-gray-800">
                  Day {dose.day}, Dose {dose.doseNumber}: {dose.time}
                </div>
                <div className="text-xs text-gray-600 mt-1 flex flex-wrap gap-2">
                  {dose.isOverlapping && (
                    <span className="inline-block bg-orange-100 text-orange-700 px-2 py-1 rounded">
                      Overlapping Day
                    </span>
                  )}
                  <span className="inline-block bg-purple-100 text-purple-700 px-2 py-1 rounded">
                    {dose.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

  const renderFrequencyControls = () => {
    if (selectedRange === null) {
      return (
        <div className="text-center py-8 text-gray-500">
          <p>Select a day range to configure frequency</p>
          <p className="text-sm mt-2">Choose from the day ranges on the left</p>
        </div>
      );
    }

    const currentRange = dayRanges[selectedRange];
    const rangeKey = `${Math.min(...currentRange)}-${Math.max(...currentRange)}`;
    const config = rangeConfigurations[rangeKey] || {};
    const rangeText = `Days ${Math.min(...currentRange)} - ${Math.max(...currentRange)}`;

    if (frequencyType === "standard") {
      return (
        <div className="space-y-4">
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-800">
              Standard Frequency for {rangeText}
            </h4>
            <p className="text-sm text-blue-600">4 times per day</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {["morning", "afternoon", "evening", "night"].map((period) => {
              const periodConfig = config.standardFrequency?.[period] || {};
              return (
                <div
                  key={period}
                  className="bg-white p-4 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-semibold text-gray-700 capitalize">
                      {period}
                    </label>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {getTimeRangeLabel(period)}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {/* Time Range */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Start Time
                        </label>
                        <input
                          type="time"
                          value={periodConfig.from || ""}
                          onChange={(e) =>
                            handleFrequencyChange(
                              `${period}.from`,
                              e.target.value
                            )
                          }
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          End Time
                        </label>
                        <input
                          type="time"
                          value={periodConfig.to || ""}
                          onChange={(e) =>
                            handleFrequencyChange(
                              `${period}.to`,
                              e.target.value
                            )
                          }
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    {/* Food Type */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Food Type
                      </label>
                      <select
                        value={periodConfig.foodType || ""}
                        onChange={(e) =>
                          handleFrequencyChange(
                            `${period}.foodType`,
                            e.target.value
                          )
                        }
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select</option>
                        <option value="E/S">E/S (Empty Stomach)</option>
                        <option value="L/S">L/S (Light Stomach)</option>
                      </select>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    } else {
      const frequentConfig = config.frequentFrequency || {};
      return (
        <div className="space-y-4">
          <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
            <h4 className="font-semibold text-purple-800">
              Custom Interval for {rangeText}
            </h4>
            <p className="text-sm text-purple-600">
              Set custom timing interval
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hours
                </label>
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={frequentConfig.hours || ""}
                  onChange={(e) =>
                    handleFrequentChange("hours", parseInt(e.target.value) || 0)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minutes
                </label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={frequentConfig.minutes || ""}
                  onChange={(e) =>
                    handleFrequentChange(
                      "minutes",
                      parseInt(e.target.value) || 0
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Doses
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={frequentConfig.doses || ""}
                  onChange={(e) =>
                    handleFrequentChange("doses", parseInt(e.target.value) || 0)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="1"
                />
              </div>
            </div>
          </div>

          {/* Parallel Consumption Controls */}
          {renderParallelConsumptionControls()}
        </div>
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden">
        <div className="flex flex-col lg:flex-row h-full max-h-[90vh]">
          {/* Left Panel - Calendar & Ranges */}
          <div className="w-full lg:w-1/3 bg-gray-50 p-6 border-r overflow-y-auto max-h-[calc(95vh-3rem)]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">
                Select Day Ranges
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                ✕
              </button>
            </div>

            {/* Info Panel */}
            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-sm font-medium text-blue-800 mb-1">
                Frequency Type:{" "}
                {frequencyType === "standard"
                  ? "Standard (4 times/day)"
                  : "Custom Interval"}
              </div>
              <div className="text-xs text-blue-600">
                Available Days: {availableDays.join(", ") || "None selected"}
              </div>
              {showParallelOptions && (
                <div className="text-xs text-purple-600 mt-1">
                  Parallel Consumption: {medicineName}
                </div>
              )}
            </div>

            {/* Calendar Controls */}
            <div className="mb-4 space-y-2">
              <button
                onClick={clearSelection}
                className="w-full px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
              >
                Clear All Ranges
              </button>
              <div className="text-xs text-gray-600 bg-white p-2 rounded border">
                Click two days to select range. Ranges cannot overlap.
              </div>
            </div>

            {/* Calendar */}
            <div className="space-y-2 mb-6" ref={calendarRef}>
              {renderCalendar()}
            </div>

            {/* Range Summary */}
            {renderRangeSummary()}
          </div>

          {/* Right Panel - Frequency Configuration */}
          <div className="flex-1 p-6 overflow-y-auto max-h-[calc(95vh-3rem)]">
            <h3 className="text-xl font-bold text-gray-800 mb-6">
              Configure Frequency
            </h3>

            {renderFrequencyControls()}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={onClose}
                className="px-6 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={dayRanges.length === 0}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
              >
                Save Configuration
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FrequencyModal;