import React, { useState, useEffect, useMemo } from 'react';

// Mock config for demonstration
const API_URL = ''; // Empty to use mock data

const AppointmentOverview = () => {
    // --- State Management ---
    const today = useMemo(() => new Date(), []);
    const [selectedDate, setSelectedDate] = useState(today);
    const [summaryData, setSummaryData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // --- Utility Functions ---
    const formatDateForApi = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const formatDateForHeader = (date) => {
        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    };

    // --- API Fetching Logic ---
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
                    completionPercentage: 80,
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

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

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

    // --- Dynamic Card Data Mapping ---
    const CARD_DATA = [
        { label: "Booked", value: summaryData?.bookedAppointments || 0, color: 'sky-500', bar: 'bg-sky-500' },
        { label: "Due", value: summaryData?.appointmentsDue || 0, color: 'amber-500', bar: 'bg-amber-500' },
        { label: "Completed", value: summaryData?.appointmentsComplete || 0, color: 'green-500', bar: 'bg-green-500' },
        { label: "Missed", value: summaryData?.appointmentsMissed || 0, color: 'red-500', bar: 'bg-red-500' },
        { label: "Reschedule", value: summaryData?.appointmentsRescheduled || 0, color: 'orange-400', bar: 'bg-orange-400' },
    ];

    const PERCENTAGE_DATA = [
        { label: "Completion", value: summaryData?.completionPercentage || 0, color: 'green-500', borderColor: 'border-green-400' },
        { label: "No-Show", value: summaryData?.missedPercentage || 0, color: 'red-500', borderColor: 'border-red-400' },
        { label: "Reschedule", value: summaryData?.reschedulePercentage || 0, color: 'orange-400', borderColor: 'border-orange-400' },
    ];

    // --- Component Parts ---
    const StatusCard = ({ label, value, color, bar }) => (
        <div className="relative flex items-center bg-white rounded-xl shadow-md p-3 mb-2 overflow-hidden hover:shadow-lg transition">
            <div className={`absolute left-0 top-0 h-full w-1 ${bar} rounded-r-sm`} />
            <div className="pl-3 flex flex-col w-full">
                <span className="text-gray-500 text-sm">{label}</span>
                <span className={`font-bold text-${color} text-2xl leading-7`}>
                    {isLoading ? '...' : value}
                </span>
            </div>
        </div>
    );

    const PercentageCard = ({ label, value, color, borderColor }) => (
        <div className={`flex flex-col items-center justify-center rounded-xl shadow-md p-3 border-2 ${borderColor} min-w-[120px] hover:scale-[1.02] transition`}>
            <span className={`font-bold text-lg text-${color}`}>{value}%</span>
            <span className="text-gray-600 text-sm">{label}</span>
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
        
        const handleDateInput = (e) => {
            const newDate = new Date(e.target.value);
            if (!isNaN(newDate.getTime())) {
                setSelectedDate(newDate);
            }
        };

        return (
            <div className="p-4 rounded-xl bg-white flex flex-col h-full border border-gray-200 shadow-inner">
                <div className="text-gray-700 font-semibold text-lg mb-4">Calendar</div>
                
                <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-800 font-medium text-xl">{currentMonthHeader}</span>
                    <div className="flex items-center space-x-2">
                        <button onClick={() => navigateMonth(-1)} className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                <path fillRule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/>
                            </svg>
                        </button>
                        <button onClick={() => navigateMonth(1)} className="p-1 rounded-full bg-sky-500 hover:bg-sky-600 text-white transition">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
                            </svg>
                        </button>
                        <input type="date" value={dateString} onChange={handleDateInput} className="absolute opacity-0 w-0 h-0" aria-label="Select Date" />
                    </div>
                </div>
                
                <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 font-semibold mb-2">
                    {days.map(day => <span key={day}>{day}</span>)}
                </div>

                <div className="grid grid-cols-7 gap-1 text-center text-sm flex-1">
                    {monthGrid.map((day, index) => (
                        <span key={index} onClick={() => handleDayClick(day)}
                            className={`p-1 rounded-full flex items-center justify-center h-7 w-7 mx-auto transition 
                                ${day === null ? 'invisible' : 'cursor-pointer'}
                                ${day === selectedDate.getDate() && selectedDate.getMonth() === new Date().getMonth() && selectedDate.getFullYear() === new Date().getFullYear()
                                    ? 'bg-sky-500 text-white font-bold shadow-lg' 
                                    : 'text-gray-700 hover:bg-gray-100'
                                }
                            `}>
                            {day}
                        </span>
                    ))}
                </div>
            </div>
        );
    };

    // --- Main Render ---
    return (
        <div className="bg-white rounded-xl shadow-lg p-6 flex items-center justify-center" style={{ height: '100%' }}>
            <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col lg:flex-row gap-6 w-full h-full min-h-[600px] font-sans">
                <div className="flex flex-col flex-1 min-w-[300px]">
                    <div className="text-gray-800 font-extrabold text-2xl mb-4">Appointments</div>
                    
                    <div className="flex flex-wrap gap-4 mb-8 justify-start">
                        {PERCENTAGE_DATA.map(data => (
                            <PercentageCard key={data.label} {...data} />
                        ))}
                        {error && <div className="text-red-500 text-xs mt-3 p-3 bg-red-50 rounded">Error: {error}</div>}
                    </div>

                    <div className="flex-1 bg-gray-50 rounded-xl p-4 flex flex-col justify-end min-h-[250px] shadow-inner border border-gray-200">
                        <div className="h-full w-full flex items-center justify-center text-gray-400 text-sm mb-4">
                            [Line Chart: Appointments Booked vs. Consultations Completed]
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 pt-2 border-t border-gray-200">
                            <span>10 PM</span>
                            <span>12 PM</span>
                            <span>02 PM</span>
                            <span>04 PM</span>
                            <span>06 PM</span>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-6 mt-4 text-xs text-gray-600">
                        <div className="flex items-center">
                            <span className="w-2 h-2 rounded-full bg-sky-400 mr-2 shadow-md"></span>
                            Appointments Booked
                        </div>
                        <div className="flex items-center">
                            <span className="w-2 h-2 rounded-full bg-blue-700 mr-2 shadow-md"></span>
                            Consultations Completed
                        </div>
                    </div>
                </div>

                <div className="w-[1px] bg-gray-200 hidden lg:block"></div>

                <div className="flex flex-col gap-6 w-full lg:w-[350px] min-w-[300px]">
                    <div className="flex flex-col flex-shrink-0">
                        {CARD_DATA.map(data => (
                            <StatusCard key={data.label} {...data} />
                        ))}
                    </div>

                    <div className="flex-1">
                        <MockCalendar />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AppointmentOverview;