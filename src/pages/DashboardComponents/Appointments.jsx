import React, { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// Mock config for demonstration
const API_URL = '';

const AppointmentOverview = () => {
  const today = useMemo(() => new Date(), []);
  const [selectedDate, setSelectedDate] = useState(today);
  const [summaryData, setSummaryData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const formatDateForApi = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDateForHeader = (date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const fetchAppointmentData = async () => {
    const dateString = formatDateForApi(selectedDate);
    const endpoint = `${API_URL}/api/analytics/appointment-summary-by-date?appointmentDate=${dateString}`;

    setIsLoading(true);
    setError(null);
    setSummaryData(null);
    
    if (!API_URL) {
      setTimeout(() => {
        setSummaryData({
          bookedAppointments: 25,
          appointmentsComplete: 20,
          appointmentsMissed: 2,
          appointmentsRescheduled: 3,
          appointmentsDue: 25,
          completionPercentage: 86,
          missedPercentage: 8,
          reschedulePercentage: 12
        });
        setIsLoading(false);
      }, 500);
      return;
    }
    
    try {
      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();

      if (data.success) {
        setSummaryData(data.summary);
      } else {
        throw new Error('API reported failure: ' + (data.message || 'Unknown error'));
      }
    } catch (err) {
      console.error("Failed to fetch appointment data:", err);
      setError(err.message || "Failed to load appointment data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointmentData();
  }, [selectedDate]);

  // Mock chart data
  const chartData = [
    { time: '10 AM', booked: 50, completed: 45 },
    { time: '12 PM', booked: 80, completed: 70 },
    { time: '02 PM', booked: 120, completed: 110 },
    { time: '04 PM', booked: 150, completed: 130 },
    { time: '06 PM', booked: 180, completed: 160 },
    { time: '08 PM', booked: 200, completed: 180 }
  ];

  const PERCENTAGE_DATA = [
    { label: "Completion", value: summaryData?.completionPercentage || 0, color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-300' },
    { label: "No-Show", value: summaryData?.missedPercentage || 0, color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-300' },
    { label: "Reschedule", value: summaryData?.reschedulePercentage || 0, color: 'text-orange-500', bgColor: 'bg-orange-50', borderColor: 'border-orange-300' },
  ];

  const STATUS_CARDS = [
    { label: "Booked", value: summaryData?.bookedAppointments || 0, bgColor: 'bg-sky-500' },
    { label: "Due", value: summaryData?.appointmentsDue || 0, bgColor: 'bg-yellow-500' },
    { label: "Completed", value: summaryData?.appointmentsComplete || 0, bgColor: 'bg-green-500' },
    { label: "Missed", value: summaryData?.appointmentsMissed || 0, bgColor: 'bg-red-500' },
    { label: "Reschedule", value: summaryData?.appointmentsRescheduled || 0, bgColor: 'bg-orange-400' },
  ];

  const PercentageCard = ({ label, value, color, bgColor, borderColor }) => (
    <div className={`flex flex-col items-center justify-center rounded-lg p-3 border-2 ${borderColor} ${bgColor} min-w-[100px]`}>
      <span className={`font-bold text-lg ${color}`}>{value}%</span>
      <span className="text-gray-700 text-xs font-medium">{label}</span>
    </div>
  );

  const StatusCard = ({ label, value, bgColor }) => (
    <div className="bg-white rounded-lg shadow-md p-3 border-l-4 border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${bgColor}`}></div>
          <span className="text-gray-600 text-sm font-medium">{label}</span>
        </div>
        <span className="text-2xl font-bold text-gray-800">
          {isLoading ? '...' : value}
        </span>
      </div>
    </div>
  );

  const MockCalendar = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dateString = formatDateForApi(selectedDate);
    const currentMonthHeader = formatDateForHeader(selectedDate);
    
    const getFirstDayOfMonth = (date) => {
      const tempDate = new Date(date);
      tempDate.setDate(1);
      return (tempDate.getDay() + 6) % 7;
    };

    const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

    const firstDay = getFirstDayOfMonth(selectedDate);
    const daysInMonth = getDaysInMonth(selectedDate);
    
    const monthGrid = [];
    for (let i = 0; i < firstDay; i++) {
      monthGrid.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      monthGrid.push(i);
    }

    const navigateMonth = (direction) => {
      const newDate = new Date(selectedDate);
      newDate.setMonth(newDate.getMonth() + direction);
      setSelectedDate(newDate);
    };

    const handleDayClick = (day) => {
      if (day !== null) {
        const newDate = new Date(selectedDate);
        newDate.setDate(day);
        setSelectedDate(newDate);
      }
    };

    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <div className="text-gray-800 font-semibold text-base mb-4">Calendar</div>
        
        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-900 font-semibold text-sm">{currentMonthHeader}</span>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => navigateMonth(-1)} 
              className="p-1.5 rounded-full hover:bg-gray-100 text-gray-600 transition"
              aria-label="Previous month"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/>
              </svg>
            </button>
            <button 
              onClick={() => navigateMonth(1)} 
              className="p-1.5 rounded-full bg-sky-500 hover:bg-sky-600 text-white transition"
              aria-label="Next month"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
              </svg>
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 font-semibold mb-2">
          {days.map(day => <span key={day}>{day}</span>)}
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-sm">
          {monthGrid.map((day, index) => (
            <button
              key={index}
              onClick={() => handleDayClick(day)}
              disabled={day === null}
              className={`p-1 rounded-full flex items-center justify-center h-8 w-8 mx-auto transition 
                ${day === null ? 'invisible' : 'cursor-pointer'}
                ${day === selectedDate.getDate() && selectedDate.getMonth() === today.getMonth() && selectedDate.getFullYear() === today.getFullYear()
                  ? 'bg-sky-500 text-white font-bold shadow-md' 
                  : 'text-gray-700 hover:bg-gray-100'
                }
              `}
            >
              {day}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 h-full flex flex-col lg:flex-row gap-6">
      {/* Left Section - Charts */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="text-gray-900 font-bold text-xl mb-4">Appointments</div>
        
        {/* Percentage Cards */}
        <div className="flex flex-wrap gap-3 mb-6">
          {PERCENTAGE_DATA.map(data => (
            <PercentageCard key={data.label} {...data} />
          ))}
        </div>

        {error && (
          <div className="text-red-500 text-xs p-3 bg-red-50 rounded-lg mb-4 border border-red-200">
            Error: {error}
          </div>
        )}

        {/* Line Chart */}
        <div className="flex-1 bg-gradient-to-b from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-100 min-h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 11 }}
                label={{ value: 'Time', position: 'bottom', fontSize: 11, offset: 10 }}
              />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip 
                contentStyle={{ fontSize: '11px', borderRadius: '8px', border: '1px solid #e5e7eb' }}
              />
              <Legend 
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: '11px', paddingTop: '15px' }}
              />
              <Line 
                type="monotone" 
                dataKey="booked" 
                name="Appointments Booked"
                stroke="#38bdf8" 
                strokeWidth={3}
                dot={{ r: 4, fill: '#38bdf8' }}
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="completed" 
                name="Consultations Completed"
                stroke="#1e3a8a" 
                strokeWidth={3}
                dot={{ r: 4, fill: '#1e3a8a' }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Vertical Divider */}
      <div className="w-px bg-gray-200 hidden lg:block"></div>

      {/* Right Section - Status Cards & Calendar */}
      <div className="flex flex-col gap-4 w-full lg:w-80">
        {/* Status Cards */}
        <div className="space-y-2">
          {STATUS_CARDS.map(card => (
            <StatusCard key={card.label} {...card} />
          ))}
        </div>

        {/* Calendar */}
        <div className="flex-1">
          <MockCalendar />
        </div>
      </div>
    </div>
  );
};

export default AppointmentOverview;