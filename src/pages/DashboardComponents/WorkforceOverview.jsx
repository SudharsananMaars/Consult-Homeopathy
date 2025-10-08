import React, { useState, useEffect } from "react";
import config from '/src/config.js';

const API_URL = config.API_URL;

// Function to calculate the percentage for the attendance bar
const calculatePercentage = (value, total) => {
    return total > 0 ? ((value / total) * 100).toFixed(0) : 0;
};

function WorkforceOverview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/api/analytics/attendance-summary`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch attendance data');
        }
        
        const result = await response.json();
        
        if (result.success) {
          setData(result);
        } else {
          throw new Error('Invalid response from server');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceData();
  }, []);

  // --- Conditional Rendering for Loading/Error States ---
  if (loading) {
    return (
      <div className="p-4 text-center text-gray-500">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
        Loading attendance data...
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">Error: {error}</div>;
  }

  if (!data) {
    return null;
  }
  
  // Destructure the necessary data after ensuring it's loaded and successful
  const { summary, totalDoctors } = data;
  const { present, absent, late } = summary;
  
  const totalAttendance = totalDoctors; 

  // Calculate percentages for the bar graphs
  const presentPct = calculatePercentage(present, totalAttendance);
  const absentPct = calculatePercentage(absent, totalAttendance);
  const latePct = calculatePercentage(late, totalAttendance);

  return (
    <div className="h-full flex flex-col">
      <h3 className="text-lg font-semibold text-black-500 mb-3">Workforce Overview</h3>
      
      <div className="flex gap-4 items-start">
        {/* Left: Stats Cards */}
        <div className="flex flex-col gap-2.5">
          {/* Total Employees Card */}
          <div className="relative bg-white rounded-lg shadow-sm border border-gray-100 pl-4 pr-4 py-3 w-40">
            <div className="absolute left-0 top-2 bottom-2 w-1 bg-blue-500 rounded-full"></div>
            <div className="text-xs text-gray-600 mb-0.5">Total Employees</div>
            <div className="text-2xl font-bold text-blue-500">{totalDoctors}</div>
          </div>
          
          {/* Active Employees Card */}
          <div className="relative bg-white rounded-lg shadow-sm border border-gray-100 pl-4 pr-4 py-3 w-40">
            <div className="absolute left-0 top-2 bottom-2 w-1 bg-cyan-400 rounded-full"></div>
            <div className="text-xs text-gray-600 mb-0.5">Active Employees</div>
            <div className="text-2xl font-bold text-cyan-400">{present}</div>
          </div>
        </div>

        {/* Right: Attendance Section */}
        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-bold text-gray-800">Attendance</div>
          </div>
          
          <div className="text-xs text-gray-500 mb-3">
            Avg. Working Hours ( Today ) : 8h
          </div>
          
          <div className="space-y-3">
            {/* Present */}
            <div className="flex items-center gap-3">
              <div className="text-xs text-gray-600 w-12">Present</div>
              <div className="flex-1 bg-gray-100 h-2.5 rounded-full relative overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full rounded-full bg-green-500"
                  style={{ width: `${presentPct}%` }}
                ></div>
              </div>
              <div className="w-8 text-sm font-bold text-green-600 text-right">{present}</div>
            </div>
            
            {/* Absent */}
            <div className="flex items-center gap-3">
              <div className="text-xs text-gray-600 w-12">Absent</div>
              <div className="flex-1 bg-gray-100 h-2.5 rounded-full relative overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full rounded-full bg-red-500"
                  style={{ width: `${absentPct}%` }}
                ></div>
              </div>
              <div className="w-8 text-sm font-bold text-red-600 text-right">{absent}</div>
            </div>
            
            {/* Late */}
            <div className="flex items-center gap-3">
              <div className="text-xs text-gray-600 w-12">Late</div>
              <div className="flex-1 bg-gray-100 h-2.5 rounded-full relative overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full rounded-full bg-yellow-400"
                  style={{ width: `${latePct}%` }}
                ></div>
              </div>
              <div className="w-8 text-sm font-bold text-yellow-500 text-right">{late}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WorkforceOverview;