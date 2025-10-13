import React, { useState, useEffect, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import config from "/src/config.js";

const API_URL = config.API_URL;

const AppointmentOverview = () => {
  // --- State Management ---
  const today = useMemo(() => new Date(), []);
  const [selectedDate, setSelectedDate] = useState(today);
  const [summaryData, setSummaryData] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Mock chart data for demonstration
  const mockChartData = [
    { time: "10 PM", booked: 50, completed: 40 },
    { time: "12 PM", booked: 120, completed: 100 },
    { time: "02 PM", booked: 180, completed: 150 },
    { time: "04 PM", booked: 220, completed: 180 },
    { time: "06 PM", booked: 250, completed: 200 },
  ];

  // --- Utility Functions ---
  const formatDateForApi = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatDateForHeader = (date) => {
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  // --- API Fetching Logic ---
  const fetchAppointmentData = async () => {
    const dateString = formatDateForApi(selectedDate);

    setIsLoading(true);
    setError(null);

    try {
      // Fetch summary data
      const summaryResponse = await fetch(
        `${API_URL}/api/analytics/appointment-summary-by-date?appointmentDate=${dateString}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        }
      );

      if (!summaryResponse.ok) {
        throw new Error(`HTTP error! status: ${summaryResponse.status}`);
      }

      const summaryResult = await summaryResponse.json();

      if (summaryResult.success) {
        setSummaryData(summaryResult.summary);
      } else {
        throw new Error(
          "API reported failure: " + (summaryResult.message || "Unknown error")
        );
      }

      // Fetch chart data
      const chartResponse = await fetch(
        `${API_URL}/api/analytics/appointment-chart?date=${dateString}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        }
      );

      if (chartResponse.ok) {
        const chartResult = await chartResponse.json();
        if (chartResult.success && chartResult.data?.bookedAppointments) {
          // Transform API data to chart format
          const transformedData = chartResult.data.bookedAppointments.map(
            (item, index) => ({
              time: item.x,
              booked: item.y,
              completed:
                chartResult.data.completedAppointments?.[index]?.y || 0,
            })
          );
          setChartData(transformedData);
        } else {
          setChartData(mockChartData);
        }
      } else {
        setChartData(mockChartData);
      }
    } catch (err) {
      console.error("Failed to fetch appointment data:", err);
      setError(err.message || "Failed to load appointment data.");
      // Use mock data on error
      setSummaryData({
        bookedAppointments: 25,
        appointmentsComplete: 20,
        appointmentsMissed: 2,
        appointmentsRescheduled: 3,
        appointmentsDue: 25,
        completionPercentage: 80,
        missedPercentage: 8,
        reschedulePercentage: 12,
      });
      setChartData(mockChartData);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointmentData();
  }, [selectedDate]);

  // --- Dynamic Card Data Mapping ---
  const CARD_DATA = [
    {
      label: "Booked",
      value: summaryData?.bookedAppointments || 0,
      color: "text-blue-500",
      border: "border-blue-500",
    },
    {
      label: "Due",
      value: summaryData?.appointmentsDue || 0,
      color: "text-orange-500",
      border: "border-orange-500",
    },
    {
      label: "Completed",
      value: summaryData?.appointmentsComplete || 0,
      color: "text-green-500",
      border: "border-green-500",
    },
    {
      label: "Missed",
      value: summaryData?.appointmentsMissed || 0,
      color: "text-red-500",
      border: "border-red-500",
    },
    {
      label: "Reschedule",
      value: summaryData?.appointmentsRescheduled || 0,
      color: "text-orange-400",
      border: "border-orange-400",
    },
  ];

  const PERCENTAGE_DATA = [
    {
      label: "Completion",
      value: summaryData?.completionPercentage || 0,
      color: "text-green-500",
      borderColor: "border-green-400",
    },
    {
      label: "No-Show",
      value: summaryData?.missedPercentage || 0,
      color: "text-red-500",
      borderColor: "border-red-400",
    },
    {
      label: "Reschedule",
      value: summaryData?.reschedulePercentage || 0,
      color: "text-orange-400",
      borderColor: "border-orange-400",
    },
  ];

  // --- Component Parts ---
  const StatusCard = ({ label, value, color, border }) => (
    <div
      className={`flex items-center justify-between rounded-lg border-l-4 ${border} p-2.5 mb-2 bg-gray-50 shadow-md`}
    >
      <span className="text-gray-600 text-sm font-medium">{label}</span>
      <span className={`font-bold ${color} text-xl`}>
        {isLoading ? "..." : value}
      </span>
    </div>
  );

  const PercentageCard = ({ label, value, color, borderColor }) => (
    <div
      className={`flex flex-col items-center justify-center rounded-lg p-2.5 border-2 ${borderColor} min-w-[85px]`}
    >
      <span className={`font-medium text-xs ${color}`}>{label}</span>
      <span className={`font-bold text-lg ${color}`}>{value}%</span>
    </div>
  );

  const MockCalendar = () => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const currentMonthHeader = formatDateForHeader(selectedDate);

    const getFirstDayOfMonth = (date) => {
      const tempDate = new Date(date);
      tempDate.setDate(1);
      return (tempDate.getDay() + 6) % 7;
    };

    const getDaysInMonth = (date) =>
      new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

    const getPrevMonthDays = (date) => {
      const prevMonth = new Date(date.getFullYear(), date.getMonth(), 0);
      return prevMonth.getDate();
    };

    const firstDay = getFirstDayOfMonth(selectedDate);
    const daysInMonth = getDaysInMonth(selectedDate);
    const prevMonthDays = getPrevMonthDays(selectedDate);

    const monthGrid = [];

    // Add previous month's trailing days
    for (let i = firstDay - 1; i >= 0; i--) {
      monthGrid.push({ day: prevMonthDays - i, isCurrentMonth: false });
    }

    // Add current month's days
    for (let i = 1; i <= daysInMonth; i++) {
      monthGrid.push({ day: i, isCurrentMonth: true });
    }

    // Add next month's days to complete the grid
    const remainingCells = 42 - monthGrid.length;
    for (let i = 1; i <= remainingCells; i++) {
      monthGrid.push({ day: i, isCurrentMonth: false });
    }

    const navigateMonth = (direction) => {
      const newDate = new Date(selectedDate);
      newDate.setMonth(newDate.getMonth() + direction);
      setSelectedDate(newDate);
    };

    const handleDayClick = (dayObj) => {
      if (dayObj.isCurrentMonth) {
        const newDate = new Date(selectedDate);
        newDate.setDate(dayObj.day);
        setSelectedDate(newDate);
      }
    };

    return (
      <div className="h-full flex flex-col">
        <div className="text-gray-800 font-bold text-base mb-3">Calendar</div>

        <div className="flex justify-between items-center mb-3">
          <span className="text-gray-800 font-medium text-sm">
            {currentMonthHeader}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path
                  fillRule="evenodd"
                  d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"
                />
              </svg>
            </button>
            <button
              onClick={() => navigateMonth(1)}
              className="p-1 rounded-full bg-blue-500 hover:bg-blue-600 text-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path
                  fillRule="evenodd"
                  d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1.5 text-center text-[11px] text-blue-600 font-medium mb-2">
          {days.map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1.5 text-center text-sm flex-1">
          {monthGrid.map((dayObj, index) => (
            <span
              key={index}
              onClick={() => handleDayClick(dayObj)}
              className={`rounded-full flex items-center justify-center h-7 w-7 mx-auto transition cursor-pointer
                ${!dayObj.isCurrentMonth ? "text-gray-300" : ""}
                ${
                  dayObj.isCurrentMonth &&
                  dayObj.day === selectedDate.getDate() &&
                  selectedDate.getMonth() ===
                    new Date(selectedDate).getMonth() &&
                  selectedDate.getFullYear() ===
                    new Date(selectedDate).getFullYear()
                    ? "bg-blue-500 text-white font-bold"
                    : dayObj.isCurrentMonth
                    ? "text-gray-700 hover:bg-gray-100"
                    : ""
                }
              `}
            >
              {dayObj.day}
            </span>
          ))}
        </div>
      </div>
    );
  };

  // --- Main Render ---
  return (
    <div className="w-full h-full flex gap-6 overflow-hidden p-1">
      {/* Left Section */}
      <div className="flex flex-col flex-1">
        <div className="text-black-500 font-bold text-lg mb-3">
          Appointments
        </div>

        {/* Percentage Cards */}
        <div className="flex gap-6 mb-4">
          {PERCENTAGE_DATA.map((data) => (
            <PercentageCard key={data.label} {...data} />
          ))}
        </div>

        {/* Chart */}
        <div className="flex-1 mb-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e5e7eb"
                vertical={false}
              />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 10 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 10 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip contentStyle={{ fontSize: 11, padding: "6px 10px" }} />
              <Line
                type="monotone"
                dataKey="booked"
                stroke="#38bdf8"
                strokeWidth={2}
                dot={{ r: 3, fill: "#38bdf8" }}
                name="Appointments Booked"
              />
              <Line
                type="monotone"
                dataKey="completed"
                stroke="#1e40af"
                strokeWidth={2}
                dot={{ r: 3, fill: "#1e40af" }}
                name="Consultations Completed"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex gap-6 text-[10px] text-gray-600 mb-2 justify-center">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400"></span>
            Appointments Booked
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-700"></span>
            Consultations Completed
          </div>
        </div>

        {error && (
          <div className="text-red-500 text-xs p-2 bg-red-50 rounded">
            Error: {error}
          </div>
        )}
      </div>

      {/* Vertical Divider */}

      {/* Right Section */}
      <div className="flex flex-row gap-4">
        {/* Status Cards */}
        <div className="flex flex-col w-[240px]">
          {CARD_DATA.map((data) => (
            <StatusCard key={data.label} {...data} />
          ))}
        </div>

        <div className="w-px bg-gray-400"></div>

        {/* Calendar */}
        <div className="flex-1">
          <MockCalendar />
        </div>
      </div>
    </div>
  );
};

export default AppointmentOverview;
