import React, { useState, useEffect, useRef } from "react";

// Duration Configuration Modal Component
const DurationModal = ({
  isOpen,
  onClose,
  onSave,
  days,
  prescriptionItems,
  rawMaterials,
  consumptionType,
  currentDuration = [],
  currentRowIndex,
  allDurationRanges = [],
  allGapRanges = [],
  onUpdateMedicineCourse,
}) => {
  const [durationRanges, setDurationRanges] = useState([]);
  const [currentGapRanges, setCurrentGapRanges] = useState([]);
  const [clickStart, setClickStart] = useState(null);
  const [selectedDays, setSelectedDays] = useState(new Set());
  const [showConflictDialog, setShowConflictDialog] = useState(false);
  const [conflictInfo, setConflictInfo] = useState(null);
  const [showGapDialog, setShowGapDialog] = useState(false);
  const [gapInfo, setGapInfo] = useState(null);
  const calendarRef = useRef(null);
  const [gapDuration, setGapDuration] = useState(1);
  const [currentMedicineCourse, setCurrentMedicineCourse] = useState(days);

  // Color palette for different medicines
  const medicineColors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-red-500",
    "bg-yellow-500",
    "bg-blue-500",
    "bg-pink-500",
    "bg-teal-500",
  ];

  useEffect(() => {
    if (currentDuration.length > 0) {
      setDurationRanges(currentDuration);
    } else {
      setDurationRanges([]);
    }

    // Initialize current gaps for this medicine
    if (allGapRanges && allGapRanges[currentRowIndex]) {
      setCurrentGapRanges(allGapRanges[currentRowIndex] || []);
    } else {
      setCurrentGapRanges([]);
    }

    // Calculate current medicine course including gaps
    setCurrentMedicineCourse(calculateTotalCourseDaysForDisplay());
  }, [currentDuration, currentRowIndex, allDurationRanges, allGapRanges, days]);

  // UPDATED: Calculate total course days for display - this is the key fix
  const calculateTotalCourseDaysForDisplay = () => {
    let maxDay = days; // Start with original course days
    let totalGapDaysAdded = 0;

    // Calculate gaps from all medicines including current one
    const allGaps = [];

    // Add gaps from other medicines
    if (allGapRanges && allGapRanges.length > 0) {
      allGapRanges.forEach((gaps, medicineIndex) => {
        if (gaps && gaps.length > 0) {
          gaps.forEach((gap) => {
            allGaps.push({ ...gap, medicineIndex });
          });
        }
      });
    }

    // Add current medicine's gaps
    currentGapRanges.forEach((gap) => {
      allGaps.push({ ...gap, medicineIndex: currentRowIndex });
    });

    // Count unique gap days to extend the course
    const uniqueGapDays = new Set();
    allGaps.forEach((gap) => {
      for (let day = gap.startDay; day <= gap.endDay; day++) {
        uniqueGapDays.add(day);
      }
    });

    // For Sequential modes, gaps extend the total course
    if (consumptionType === "Sequential + Gap") {
      totalGapDaysAdded = uniqueGapDays.size;
      maxDay = days + totalGapDaysAdded;
    } else if (consumptionType === "Parallel + Gap") {
      // For parallel mode, we still need to show all days including gaps
      // Find the maximum day that has any assignment or gap
      let maxAssignedDay = days;

      // Check all duration ranges
      allDurationRanges.forEach((ranges, medicineIndex) => {
        if (ranges && ranges.length > 0) {
          ranges.forEach((range) => {
            maxAssignedDay = Math.max(maxAssignedDay, range.endDay);
          });
        }
      });

      // Check current duration ranges
      durationRanges.forEach((range) => {
        maxAssignedDay = Math.max(maxAssignedDay, range.endDay);
      });

      // Check all gaps
      allGaps.forEach((gap) => {
        maxAssignedDay = Math.max(maxAssignedDay, gap.endDay);
      });

      maxDay = Math.max(days, maxAssignedDay);
    }

    return maxDay;
  };

  // UPDATED: Get gap assignments function
  const getGapAssignments = (day) => {
    const gaps = [];

    // Check gaps from all other medicines
    if (allGapRanges && allGapRanges.length > 0) {
      allGapRanges.forEach((gapRanges, medicineIndex) => {
        if (gapRanges && gapRanges.length > 0) {
          gapRanges.forEach((gap) => {
            if (day >= gap.startDay && day <= gap.endDay) {
              gaps.push({
                ...gap,
                medicineIndex,
                medicineName:
                  prescriptionItems[medicineIndex]?.medicineName ||
                  prescriptionItems[medicineIndex]?.rawMaterial?.name ||
                  `Medicine ${medicineIndex + 1}`,
              });
            }
          });
        }
      });
    }

    // Check gaps from current medicine
    currentGapRanges.forEach((gap) => {
      if (day >= gap.startDay && day <= gap.endDay) {
        gaps.push({
          ...gap,
          medicineIndex: currentRowIndex,
          medicineName: getCurrentMedicineName(),
        });
      }
    });

    return gaps;
  };

  // UPDATED: Handle gap dialog resolve - this is crucial for proper gap handling
  const handleGapDialogResolve = (addGap) => {
    if (gapInfo) {
      const newRange = { ...gapInfo.newRange, hasGapAfter: addGap };
      applyRange(newRange);

      if (addGap) {
        // Create gap range immediately after the medicine range
        const gapStartDay = newRange.endDay + 1;
        const gapEndDay = gapStartDay + gapDuration - 1;

        const newGapRange = {
          startDay: gapStartDay,
          endDay: gapEndDay,
          medicineIndex: currentRowIndex,
          isGap: true,
        };

        // Add gap to current gaps
        setCurrentGapRanges((prev) => [...prev, newGapRange]);

        // IMPORTANT: Calculate new course days INCLUDING the gap extension
        const newCourseDays = calculateNewCourseDaysWithGap(gapEndDay);
        setCurrentMedicineCourse(newCourseDays);

        // Notify parent component to update medicine course globally
        if (onUpdateMedicineCourse) {
          onUpdateMedicineCourse(newCourseDays);
        }
      }
    }
    setShowGapDialog(false);
    setGapInfo(null);
  };

  // NEW: Calculate new course days when gap is added
  const calculateNewCourseDaysWithGap = (gapEndDay) => {
    // For Sequential + Gap: extend the course by the gap days
    if (consumptionType === "Sequential + Gap") {
      return Math.max(days, gapEndDay);
    }

    // For Parallel + Gap: ensure we accommodate the gap
    if (consumptionType === "Parallel + Gap") {
      return Math.max(days, gapEndDay);
    }

    return days;
  };

  // UPDATED: Get next available day logic
  const getNextAvailableDay = () => {
    if (
      consumptionType === "Parallel" ||
      consumptionType === "Parallel + Gap"
    ) {
      return 1; // In parallel mode, can start from day 1
    }

    // For sequential modes, find the next available day after all other medicines AND gaps
    let maxEndDay = 0;

    allDurationRanges.forEach((ranges, medicineIndex) => {
      if (medicineIndex !== currentRowIndex && ranges && ranges.length > 0) {
        ranges.forEach((range) => {
          maxEndDay = Math.max(maxEndDay, range.endDay);
        });
      }
    });

    // IMPORTANT: Also consider gaps from all medicines
    if (allGapRanges && allGapRanges.length > 0) {
      allGapRanges.forEach((gaps, medicineIndex) => {
        if (gaps && gaps.length > 0) {
          gaps.forEach((gap) => {
            maxEndDay = Math.max(maxEndDay, gap.endDay);
          });
        }
      });
    }

    return maxEndDay + 1;
  };

  // UPDATED: Handle day click with improved gap logic
  const handleDayClick = (day) => {
    // Check if this day has read-only assignments
    const dayAssignments = getDayAssignments(day);
    const gapAssignments = getGapAssignments(day);
    const hasReadOnlyAssignment = dayAssignments.some(
      (assignment) => assignment.isReadOnly
    );

    // In Sequential + Gap mode, can't select gap days
    if (gapAssignments.length > 0 && consumptionType === "Sequential + Gap") {
      alert(`Day ${day} is a gap day and cannot be selected for medicine.`);
      return;
    }

    // In Parallel + Gap mode, can't select gap days either
    if (gapAssignments.length > 0 && consumptionType === "Parallel + Gap") {
      alert(`Day ${day} is a gap day and cannot be selected for medicine.`);
      return;
    }

    if (
      hasReadOnlyAssignment &&
      consumptionType !== "Parallel" &&
      consumptionType !== "Parallel + Gap"
    ) {
      alert(
        `Day ${day} is already assigned to another medicine and cannot be modified.`
      );
      return;
    }

    if (clickStart === null) {
      // First click - set start
      setClickStart(day);
      setSelectedDays(new Set([day]));
    } else {
      // Second click - create range and apply
      const start = Math.min(clickStart, day);
      const end = Math.max(clickStart, day);

      // Check if any day in the range has conflicts
      let hasConflictInRange = false;
      for (let d = start; d <= end; d++) {
        const assignments = getDayAssignments(d);
        const gaps = getGapAssignments(d);

        if (
          gaps.length > 0 &&
          (consumptionType === "Sequential + Gap" ||
            consumptionType === "Parallel + Gap")
        ) {
          hasConflictInRange = true;
          break;
        }

        if (
          assignments.some((assignment) => assignment.isReadOnly) &&
          consumptionType !== "Parallel" &&
          consumptionType !== "Parallel + Gap"
        ) {
          hasConflictInRange = true;
          break;
        }
      }

      if (hasConflictInRange) {
        alert(
          `Some days in the selected range are already assigned or are gap days.`
        );
        setClickStart(null);
        setSelectedDays(new Set());
        return;
      }

      const newRange = {
        startDay: start,
        endDay: end,
        medicineIndex: currentRowIndex,
        hasGapAfter: false,
      };

      const conflicts = checkForConflicts(newRange);
      const isValidSequential = validateSequentialOrder(newRange);

      if (conflicts.length > 0) {
        setConflictInfo({ newRange, conflicts });
        setShowConflictDialog(true);
      } else if (!isValidSequential && consumptionType === "Sequential") {
        alert(
          "In Sequential mode, medicines must be scheduled without gaps between them."
        );
      } else {
        // For gap modes, show gap options after successful range selection
        if (
          consumptionType === "Sequential + Gap" ||
          consumptionType === "Parallel + Gap"
        ) {
          setGapInfo({ newRange });
          setShowGapDialog(true);
        } else {
          applyRange(newRange);
        }
      }

      // Reset selection
      setClickStart(null);
      setSelectedDays(new Set());
    }
  };

  // UPDATED: Handle save with proper gap handling
  const handleSave = () => {
    const summary = getDurationSummary();

    // Combine current gaps with any existing gaps for this medicine
    const allGapsForMedicine = [...currentGapRanges];

    // Add gaps from ranges that have hasGapAfter flag
    durationRanges.forEach((range) => {
      if (range.hasGapAfter) {
        const gapStartDay = range.endDay + 1;
        const gapEndDay = gapStartDay + gapDuration - 1;
        allGapsForMedicine.push({
          startDay: gapStartDay,
          endDay: gapEndDay,
          medicineIndex: currentRowIndex,
          isGap: true,
        });
      }
    });

    // Calculate final course days
    const finalCourseDays = calculateFinalCourseDays(allGapsForMedicine);

    onSave(durationRanges, summary, allGapsForMedicine, finalCourseDays);
    onClose();
  };

  // NEW: Calculate final course days for saving
  const calculateFinalCourseDays = (gapsForMedicine) => {
    let maxDay = days;

    // Include all medicine ranges
    allDurationRanges.forEach((ranges, medicineIndex) => {
      if (ranges && ranges.length > 0) {
        ranges.forEach((range) => {
          maxDay = Math.max(maxDay, range.endDay);
        });
      }
    });

    // Include current medicine ranges
    durationRanges.forEach((range) => {
      maxDay = Math.max(maxDay, range.endDay);
    });

    // Include all gaps
    if (allGapRanges && allGapRanges.length > 0) {
      allGapRanges.forEach((gaps, medicineIndex) => {
        if (gaps && gaps.length > 0) {
          gaps.forEach((gap) => {
            maxDay = Math.max(maxDay, gap.endDay);
          });
        }
      });
    }

    // Include current medicine gaps
    gapsForMedicine.forEach((gap) => {
      maxDay = Math.max(maxDay, gap.endDay);
    });

    return maxDay;
  };

  // Keep all other functions the same...
  const getCurrentMedicineName = () => {
    if (currentRowIndex !== null && prescriptionItems[currentRowIndex]) {
      const item = prescriptionItems[currentRowIndex];
      if (item.rawMaterial) {
        return item.rawMaterial.name;
      }
      if (item.medicineName) {
        return item.medicineName;
      }
      return `Medicine ${currentRowIndex + 1}`;
    }
    return "Unknown Medicine";
  };

  const getMedicineColor = (medicineIndex) => {
    return medicineColors[medicineIndex % medicineColors.length];
  };

  const getDayAssignments = (day) => {
    const assignments = [];

    // Add read-only assignments from other medicines
    allDurationRanges.forEach((ranges, medicineIndex) => {
      if (medicineIndex !== currentRowIndex && ranges && ranges.length > 0) {
        ranges.forEach((range) => {
          if (day >= range.startDay && day <= range.endDay) {
            assignments.push({
              ...range,
              medicineIndex,
              isReadOnly: true,
              medicineName:
                prescriptionItems[medicineIndex]?.medicineName ||
                prescriptionItems[medicineIndex]?.rawMaterial?.name ||
                `Medicine ${medicineIndex + 1}`,
            });
          }
        });
      }
    });

    // Add current medicine's assignments (editable)
    durationRanges.forEach((range) => {
      if (day >= range.startDay && day <= range.endDay) {
        assignments.push({
          ...range,
          medicineIndex: currentRowIndex,
          isReadOnly: false,
          medicineName: getCurrentMedicineName(),
        });
      }
    });

    return assignments;
  };

  const checkForConflicts = (newRange) => {
    const conflicts = [];

    // In parallel mode, check if gap days are being selected for medicine
    if (
      consumptionType === "Parallel" ||
      consumptionType === "Parallel + Gap"
    ) {
      for (let day = newRange.startDay; day <= newRange.endDay; day++) {
        const gapAssignments = getGapAssignments(day);
        if (gapAssignments.length > 0) {
          // In Parallel + Gap, you can't place medicine on gap days
          if (consumptionType === "Parallel + Gap") {
            conflicts.push({
              day,
              existing: gapAssignments,
              type: "gap_conflict",
            });
          }
        }
      }
      return conflicts;
    }

    // In sequential modes, overlaps are not allowed
    if (
      consumptionType === "Sequential" ||
      consumptionType === "Sequential + Gap"
    ) {
      for (let day = newRange.startDay; day <= newRange.endDay; day++) {
        const existing = getDayAssignments(day).filter(
          (assignment) =>
            assignment.medicineIndex !== currentRowIndex &&
            assignment.isReadOnly
        );
        const gapAssignments = getGapAssignments(day);

        if (existing.length > 0) {
          conflicts.push({ day, existing, type: "medicine_conflict" });
        }
        if (gapAssignments.length > 0) {
          conflicts.push({
            day,
            existing: gapAssignments,
            type: "gap_conflict",
          });
        }
      }
    }

    return conflicts;
  };

  const validateSequentialOrder = (newRange) => {
    if (consumptionType !== "Sequential") return true;

    // Get all ranges from all medicines
    const allRanges = [];

    // Add ranges from other medicines
    allDurationRanges.forEach((ranges, medicineIndex) => {
      if (medicineIndex !== currentRowIndex && ranges && ranges.length > 0) {
        ranges.forEach((range) => {
          allRanges.push({ ...range, medicineIndex });
        });
      }
    });

    // Add current medicine's new range
    allRanges.push({ ...newRange, medicineIndex: currentRowIndex });

    // Sort by start day
    allRanges.sort((a, b) => a.startDay - b.startDay);

    // Check for gaps
    for (let i = 1; i < allRanges.length; i++) {
      const prevRange = allRanges[i - 1];
      const currentRange = allRanges[i];

      if (currentRange.startDay > prevRange.endDay + 1) {
        return false;
      }
    }

    return true;
  };

  const applyRange = (newRange) => {
    setDurationRanges((prev) => {
      // Remove any existing range for the current medicine that overlaps
      const updated = prev.filter(
        (range) =>
          !(
            newRange.startDay <= range.endDay &&
            newRange.endDay >= range.startDay
          )
      );

      // Add new range
      updated.push(newRange);
      return updated;
    });
  };

  const handleConflictResolve = (replace) => {
    if (conflictInfo) {
      if (replace) {
        if (
          consumptionType === "Sequential + Gap" ||
          consumptionType === "Parallel + Gap"
        ) {
          setGapInfo({ newRange: conflictInfo.newRange });
          setShowGapDialog(true);
        } else {
          applyRange(conflictInfo.newRange);
        }
      }
    }
    setShowConflictDialog(false);
    setConflictInfo(null);
  };

  const clearDay = (day) => {
    // Only allow clearing if it's not read-only
    const dayAssignments = getDayAssignments(day);
    const hasReadOnlyAssignment = dayAssignments.some(
      (assignment) => assignment.isReadOnly
    );

    if (
      hasReadOnlyAssignment &&
      dayAssignments.every((assignment) => assignment.isReadOnly)
    ) {
      alert("This day is assigned to another medicine and cannot be cleared.");
      return;
    }

    setDurationRanges((prev) =>
      prev.filter((range) => !(day >= range.startDay && day <= range.endDay))
    );
  };

  const clearAllDays = () => {
    setDurationRanges([]);
    setClickStart(null);
    setSelectedDays(new Set());
  };

  const selectAllDays = () => {
    // Find available days (not assigned to other medicines or gaps)
    const availableDays = [];
    for (let day = 1; day <= currentMedicineCourse; day++) {
      const assignments = getDayAssignments(day);
      const gapAssignments = getGapAssignments(day);
      const hasReadOnlyAssignment = assignments.some(
        (assignment) => assignment.isReadOnly
      );

      if (!hasReadOnlyAssignment && gapAssignments.length === 0) {
        availableDays.push(day);
      }
    }

    if (availableDays.length === 0) {
      alert("No available days to assign.");
      return;
    }

    const newRange = {
      startDay: Math.min(...availableDays),
      endDay: Math.max(...availableDays),
      medicineIndex: currentRowIndex,
      hasGapAfter: false,
    };

    const conflicts = checkForConflicts(newRange);

    if (
      conflicts.length > 0 &&
      consumptionType !== "Parallel" &&
      consumptionType !== "Parallel + Gap"
    ) {
      setConflictInfo({ newRange, conflicts });
      setShowConflictDialog(true);
    } else {
      if (
        consumptionType === "Sequential + Gap" ||
        consumptionType === "Parallel + Gap"
      ) {
        setGapInfo({ newRange });
        setShowGapDialog(true);
      } else {
        applyRange(newRange);
      }
    }
  };

  const getDurationSummary = () => {
    if (durationRanges.length === 0) return "No duration set";

    const totalDays = durationRanges.reduce(
      (sum, range) => sum + (range.endDay - range.startDay + 1),
      0
    );

    return `${totalDays} days (${getCurrentMedicineName()})`;
  };

  const getConsumptionTypeDescription = () => {
    switch (consumptionType) {
      case "Sequential":
        return "Medicines must be taken one after another without any gaps between them.";
      case "Sequential + Gap":
        return "Medicines are taken one after another, with optional gaps between medicines. Gaps extend the total treatment duration.";
      case "Parallel":
        return "All medicines can be taken simultaneously with overlapping schedules.";
      case "Parallel + Gap":
        return "Medicines can overlap, but gap periods block all medicine scheduling during those days.";
      default:
        return "";
    }
  };

  const getTotalAssignedDays = () => {
    let total = 0;

    // Count from other medicines
    allDurationRanges.forEach((ranges, medicineIndex) => {
      if (medicineIndex !== currentRowIndex && ranges && ranges.length > 0) {
        ranges.forEach((range) => {
          total += range.endDay - range.startDay + 1;
        });
      }
    });

    // Count from current medicine
    durationRanges.forEach((range) => {
      total += range.endDay - range.startDay + 1;
    });

    return total;
  };

  const renderCalendar = () => {
    const weeks = [];
    let currentWeek = [];
    const totalDays = currentMedicineCourse;

    for (let day = 1; day <= totalDays; day++) {
      currentWeek.push(day);
      if (currentWeek.length === 7 || day === totalDays) {
        weeks.push([...currentWeek]);
        currentWeek = [];
      }
    }

    return weeks.map((week, weekIndex) => (
      <div key={weekIndex} className="flex">
        {week.map((day) => {
          const assignments = getDayAssignments(day);
          const gapAssignments = getGapAssignments(day);
          const isSelected = selectedDays.has(day);
          const isClickStart = clickStart === day;
          const hasAssignment = assignments.length > 0;
          const hasReadOnlyAssignment = assignments.some(
            (assignment) => assignment.isReadOnly
          );
          const hasEditableAssignment = assignments.some(
            (assignment) => !assignment.isReadOnly
          );
          const isGapDay = gapAssignments.length > 0;
          const isOriginalCoursePeriod = day <= days;

          // Show preview range when clickStart is set
          const showPreviewRange = clickStart !== null && day !== clickStart;
          const isInPreviewRange =
            showPreviewRange &&
            day >= Math.min(clickStart, day) &&
            day <= Math.max(clickStart, day);

          return (
            <div
              key={day}
              className={`
                w-16 h-16 border border-gray-200 cursor-pointer relative overflow-hidden
                transition-all duration-200 hover:shadow-md
                ${isClickStart ? "ring-2 ring-blue-500 bg-blue-100" : ""}
                ${isSelected ? "ring-2 ring-blue-400 ring-opacity-75" : ""}
                ${hasAssignment ? "bg-opacity-90" : "bg-white hover:bg-gray-50"}
                ${isInPreviewRange ? "bg-blue-50 border-blue-300" : ""}
                ${isGapDay ? "bg-gray-100 border-gray-300 border-dashed" : ""}
                ${
                  !isOriginalCoursePeriod
                    ? "bg-yellow-50 border-yellow-300"
                    : ""
                }
                ${
                  hasReadOnlyAssignment && !hasEditableAssignment
                    ? "opacity-60"
                    : ""
                }
              `}
              onClick={() => handleDayClick(day)}
              onContextMenu={(e) => {
                e.preventDefault();
                clearDay(day);
              }}
              title={
                isGapDay
                  ? `Gap Day (Medicine ${gapAssignments[0].medicineIndex + 1})`
                  : !isOriginalCoursePeriod
                  ? "Extended day due to gaps"
                  : ""
              }
            >
              {/* Day number */}
              <div className="absolute top-1 left-1 text-xs font-medium text-gray-700 z-10">
                {day}
                {!isOriginalCoursePeriod && (
                  <span className="block text-[8px] text-yellow-600">EXT</span>
                )}
              </div>

              {/* Gap indicator */}
              {isGapDay && !hasAssignment && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-xs text-gray-500 font-medium">GAP</div>
                </div>
              )}

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
                      ${
                        assignment.isReadOnly
                          ? "bg-opacity-30 border-2 border-dashed border-gray-400"
                          : ""
                      }
                      flex items-center justify-center
                      ${
                        (consumptionType === "Parallel" ||
                          consumptionType === "Parallel + Gap") &&
                        assignments.length > 1
                          ? "border-t border-white border-opacity-30"
                          : ""
                      }
                    `}
                    title={`${assignment.medicineName}${
                      assignment.isReadOnly ? " (Read-only)" : ""
                    }`}
                  >
                    <span
                      className={`text-xs font-medium truncate px-1 ${
                        assignment.isReadOnly ? "text-gray-600" : "text-white"
                      }`}
                    >
                      {assignment.medicineName.substring(0, 6)}
                      {assignment.isReadOnly && (
                        <span className="block text-[8px]">R/O</span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
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
    <div className="max-h-96 overflow-y-auto border rounded p-4">
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden">
          <div className="flex h-full">
            {/* Left Panel - Medicine Info & Controls */}
            <div className="w-1/3 bg-gray-50 p-6 border-r overflow-y-auto max-h-[calc(95vh-3rem)]">
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
                  {getConsumptionTypeDescription()}
                </div>
              </div>

              {/* Treatment Period Info */}
              <div className="mb-6 p-3 bg-amber-50 rounded-lg border border-amber-200">
                <div className="text-sm font-medium text-amber-800 mb-1">
                  Original Course: {days} days
                </div>
                {currentMedicineCourse > days && (
                  <div className="text-sm font-medium text-amber-800 mb-1">
                    Extended Course: {currentMedicineCourse} days
                  </div>
                )}
                <div className="text-xs text-amber-600">
                  Assigned: {getTotalAssignedDays()} days
                  {(consumptionType === "Sequential + Gap" ||
                    consumptionType === "Parallel + Gap") && (
                    <span> • Extended due to gaps</span>
                  )}
                </div>
                <div className="w-full bg-amber-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-amber-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(
                        (getTotalAssignedDays() / currentMedicineCourse) * 100,
                        100
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* Current Medicine Info */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-800 mb-3">
                  Setting Duration For:
                </h4>
                <div className="p-3 rounded-lg bg-blue-50 border-2 border-blue-500">
                  <div className="flex items-center">
                    <div
                      className={`w-4 h-4 rounded ${
                        medicineColors[currentRowIndex % medicineColors.length]
                      } mr-3`}
                    ></div>
                    <div className="flex-1">
                      <span className="font-medium text-gray-800">
                        {getCurrentMedicineName()}
                      </span>
                      <div className="text-xs text-gray-500">
                        Row #{currentRowIndex + 1}
                      </div>
                      <div className="text-xs text-blue-600">
                        Next available: Day {getNextAvailableDay()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="mb-6 p-4 bg-white rounded-lg border">
                <h4 className="font-medium text-gray-800 mb-2">How to Use</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <div>• Click first day, then click end day</div>
                  <div>• All days between will be selected</div>
                  <div>• Right-click any day to clear it</div>
                  <div>• Dashed boxes are other medicines (read-only)</div>
                  <div>• Gray dashed boxes are gap days</div>
                  <div>• Yellow background = extended days from gaps</div>
                  {(consumptionType === "Parallel" ||
                    consumptionType === "Parallel + Gap") && (
                    <div className="text-blue-600">
                      • Medicines can overlap{" "}
                      {consumptionType === "Parallel + Gap"
                        ? "except gap days"
                        : ""}
                    </div>
                  )}
                  {consumptionType === "Sequential" && (
                    <div className="text-orange-600">
                      • No gaps allowed between medicines
                    </div>
                  )}
                  {(consumptionType === "Sequential + Gap" ||
                    consumptionType === "Parallel + Gap") && (
                    <div className="text-purple-600">
                      • Gaps extend total treatment duration
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-800 mb-3">
                  Quick Actions
                </h4>
                <div className="space-y-2">
                  <button
                    onClick={selectAllDays}
                    className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    Select All Available Days
                  </button>
                  <button
                    onClick={clearAllDays}
                    className="w-full px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                  >
                    Clear All Days
                  </button>
                </div>
              </div>

              {/* Current Selection Summary */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-800 mb-3">
                  Current Selection
                </h4>
                <div className="p-3 bg-white rounded-lg border">
                  <div className="text-sm text-gray-600 mb-2">
                    {getDurationSummary()}
                  </div>
                  {durationRanges.length > 0 && (
                    <div className="space-y-1">
                      {durationRanges.map((range, index) => (
                        <div key={index} className="text-xs text-gray-500">
                          Days {range.startDay}-{range.endDay}
                          {range.hasGapAfter && (
                            <span className="text-purple-600 ml-2">
                              + {gapDuration} day gap
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Gap Settings for Gap Modes */}
              {(consumptionType === "Sequential + Gap" ||
                consumptionType === "Parallel + Gap") && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-800 mb-3">
                    Gap Settings
                  </h4>
                  <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <label className="block text-sm font-medium text-purple-800 mb-2">
                      Gap Duration (days)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={gapDuration}
                      onChange={(e) =>
                        setGapDuration(
                          Math.max(1, parseInt(e.target.value) || 1)
                        )
                      }
                      className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                    <div className="text-xs text-purple-600 mt-1">
                      This gap will be added after each selected medicine range
                    </div>
                  </div>
                </div>
              )}

              {/* Legend */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-800 mb-3">Legend</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-blue-500 bg-opacity-40 rounded mr-2"></div>
                    <span>Current Medicine (Editable)</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-green-500 bg-opacity-30 border-2 border-dashed border-gray-400 rounded mr-2"></div>
                    <span>Other Medicine (Read-only)</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-gray-100 border border-gray-300 border-dashed rounded mr-2"></div>
                    <span>Gap Day</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-yellow-50 border border-yellow-300 rounded mr-2"></div>
                    <span>Extended Day</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 ring-2 ring-blue-500 bg-blue-100 rounded mr-2"></div>
                    <span>Selection Start</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={handleSave}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Save Duration
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>

            {/* Right Panel - Calendar */}
            <div className="flex-1 p-6 overflow-y-auto max-h-[calc(95vh-3rem)]">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Treatment Calendar
                </h3>
                <div className="text-sm text-gray-600">
                  {clickStart !== null
                    ? `Select end day (started from day ${clickStart})`
                    : "Click to select start day"}
                </div>
              </div>

              {/* Calendar Grid */}
              <div
                className="border rounded-lg overflow-hidden bg-white"
                ref={calendarRef}
              >
                {/* Week Headers */}
                <div className="flex bg-gray-100 border-b">
                  {["Day", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                    (day, index) => (
                      <div
                        key={day}
                        className="w-16 h-8 flex items-center justify-center text-xs font-medium text-gray-600 border-r"
                      >
                        {day}
                      </div>
                    )
                  )}
                </div>

                {/* Calendar Days */}
                <div className="bg-white">{renderCalendar()}</div>
              </div>

              {/* Status Messages */}
              {clickStart !== null && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-sm text-blue-800">
                    Selection started from day {clickStart}. Click another day
                    to complete the range.
                  </div>
                </div>
              )}

              {/* Treatment Summary */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-2">
                  Treatment Summary
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Original Course:</span>
                    <span className="font-medium ml-2">{days} days</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Extended Course:</span>
                    <span className="font-medium ml-2">
                      {currentMedicineCourse} days
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Total Assigned:</span>
                    <span className="font-medium ml-2">
                      {getTotalAssignedDays()} days
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Mode:</span>
                    <span className="font-medium ml-2">{consumptionType}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Conflict Resolution Dialog */}
        {showConflictDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-red-600 mb-4">
                Conflict Detected
              </h3>
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  The selected range conflicts with existing assignments:
                </p>
                <div className="space-y-1">
                  {conflictInfo?.conflicts.map((conflict, index) => (
                    <div key={index} className="text-xs text-red-600">
                      Day {conflict.day}:{" "}
                      {conflict.type === "gap_conflict"
                        ? "Gap day"
                        : "Medicine conflict"}{" "}
                      -{" "}
                      {conflict.existing
                        .map((e) => e.medicineName || "Gap")
                        .join(", ")}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => handleConflictResolve(true)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Replace Existing
                </button>
                <button
                  onClick={() => handleConflictResolve(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Gap Dialog */}
        {showGapDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-purple-600 mb-4">
                Add Gap After Medicine?
              </h3>
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-3">
                  Do you want to add a {gapDuration}-day gap after this medicine
                  range?
                </p>
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="text-sm text-purple-800">
                    Medicine: Days {gapInfo?.newRange.startDay}-
                    {gapInfo?.newRange.endDay}
                  </div>
                  <div className="text-sm text-purple-600">
                    Gap: Days {gapInfo?.newRange.endDay + 1}-
                    {gapInfo?.newRange.endDay + gapDuration}
                  </div>
                  <div className="text-xs text-purple-500 mt-1">
                    This will extend the treatment course to{" "}
                    {Math.max(
                      currentMedicineCourse,
                      gapInfo?.newRange.endDay + gapDuration
                    )}{" "}
                    days
                  </div>
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => handleGapDialogResolve(true)}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Yes, Add Gap
                </button>
                <button
                  onClick={() => handleGapDialogResolve(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  No Gap
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DurationModal;
