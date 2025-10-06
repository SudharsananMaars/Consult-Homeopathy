import React, { useState, useEffect } from "react";
import config from '/src/config.js';
  
const API_URL = config.API_URL;

// The StatCard component remains the same
function StatCard({ label, value, barColor, valueColor }) {
  return (
    <div className="relative flex items-center bg-white rounded-2xl shadow-md h-24 w-64 mb-4">
      {/* Colored left bar */}
      <div className={`absolute left-0 top-3 bottom-3 w-2 rounded-full ${barColor}`}></div>
      <div className="pl-6 flex flex-col items-start">
        <span className="text-gray-700 text-lg font-semibold">{label}</span>
        <span className={`mt-1 text-3xl font-bold ${valueColor}`}>{value}</span>
      </div>
    </div>
  );
}

// Function to calculate the percentage for the attendance bar
const calculatePercentage = (value, total) => {
    return total > 0 ? ((value / total) * 100).toFixed(0) : 0;
};

function WorkforceOverview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAttendanceSummary = async () => {
      // The API route is: /api/analytics/attendance-summary
      const API_ROUTE = `${API_URL}/api/analytics/attendance-summary`;

      try {
        const response = await fetch(API_ROUTE);
        
        // Throw an error if the response is not ok (e.g., 404, 500)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        // Check if the API response indicates success
        if (result.success) {
          setData(result);
        } else {
          // Handle case where API responds with success: false
          setError("Failed to fetch attendance data.");
        }
      } catch (e) {
        console.error("Error fetching data: ", e);
        setError("Could not connect to the server.");
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceSummary();
  }, []); // The empty dependency array ensures this effect runs only once after the initial render.

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
  
  // Destructure the necessary data after ensuring it's loaded and successful
  const { summary, totalDoctors } = data;
  const { present, absent, late } = summary;
  
  // Calculate the total number of doctors *in attendance-summary*
  // The API response shows 'totalDoctors', which we will use as the total population for attendance calculations.
  const totalAttendance = totalDoctors; 

  // Calculate percentages for the bar graphs
  const presentPct = calculatePercentage(present, totalAttendance);
  const absentPct = calculatePercentage(absent, totalAttendance);
  const latePct = calculatePercentage(late, totalAttendance);
  
  // The original component had 'Total Employees' and 'Active Employees' which might be from a different API.
  // We'll update 'Total Employees' with 'Total Doctors' from the fetched data.
  // Note: For 'Active Employees', you would need another API or logic, but we'll keep the static value for now.

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Workforce Overview</h3>
      <div className="mb-8 flex flex-col items-center gap-2">
        <StatCard
          label="Total Doctors" // Updated label
          value={totalDoctors} // Dynamic value from API
          barColor="bg-blue-500"
          valueColor="text-blue-500"
        />
        <StatCard
          label="Active Doctors" // Keeping this static as no data is provided for it
          value={present} 
          barColor="bg-cyan-400"
          valueColor="text-cyan-400"
        />
      </div>
      <div>
        <div className="font-semibold mb-2">Attendance Summary (Today: {data.date})</div>
        <div className="text-xs text-gray-500 mb-4">
          Avg. Working Hours ( Today ) : 8h {/* This might also need an API call */}
        </div>
        <div className="space-y-4">
          
          {/* Present */}
          <div className="flex items-center space-x-4">
            <div className="text-sm font-medium w-16">Present</div>
            <div className="flex-1 bg-gray-200 h-2 rounded-full relative">
              <div
                className="absolute top-0 left-0 h-2 rounded-full bg-green-400"
                style={{ width: `${presentPct}%` }} // Dynamic width
              ></div>
            </div>
            <div className="w-8 font-medium text-green-600 select-none">{present}</div> {/* Dynamic value */}
          </div>
          
          {/* Absent */}
          <div className="flex items-center space-x-4">
            <div className="text-sm font-medium w-16">Absent</div>
            <div className="flex-1 bg-gray-200 h-2 rounded-full relative">
              <div
                className="absolute top-0 left-0 h-2 rounded-full bg-red-500"
                style={{ width: `${absentPct}%` }} // Dynamic width
              ></div>
            </div>
            <div className="w-8 font-medium text-red-600 select-none">{absent}</div> {/* Dynamic value */}
          </div>
          
          {/* Late */}
          <div className="flex items-center space-x-4">
            <div className="text-sm font-medium w-16">Late</div>
            <div className="flex-1 bg-gray-200 h-2 rounded-full relative">
              <div
                className="absolute top-0 left-0 h-2 rounded-full bg-yellow-400"
                style={{ width: `${latePct}%` }} // Dynamic width
              ></div>
            </div>
            <div className="w-8 font-medium text-yellow-500 select-none">{late}</div> {/* Dynamic value */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default WorkforceOverview;