import React, { useState, useEffect } from "react";
import config from "/src/config.js";

const API_URL = config.API_URL;

const MedicineDashboardComponent = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tatData, setTatData] = useState(null);
  const [tatLoading, setTatLoading] = useState(true);

  // Mock data for the bar graph
  const mockGraphData = [
    { label: "Preparation Shortfall", value: 25, color: "#3b82f6" },
    { label: "Inventory Short", value: 45, color: "#3b82f6" },
    { label: "Staff Allocation", value: 55, color: "#3b82f6" },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${API_URL}/api/analytics/preparation-status`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ filter: "month" }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }

        const result = await response.json();
        if (result.success) {
          setData(result.data);
        } else {
          throw new Error("API returned unsuccessful response");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchTatData = async () => {
      try {
        setTatLoading(true);
        const response = await fetch(`${API_URL}/api/analytics/TAT`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ filter: "month" }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch TAT data");
        }

        const result = await response.json();
        if (result.data) {
          setTatData(result.data);
        }
      } catch (err) {
        console.error("Error fetching TAT data:", err.message);
      } finally {
        setTatLoading(false);
      }
    };

    fetchTatData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-lg text-gray-500">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-lg text-red-500">Error: {error}</p>
      </div>
    );
  }

  const maxValue = Math.max(...mockGraphData.map((d) => d.value));

  function formatTime(timeStr) {
    if (!timeStr) return "";
    return timeStr
      .replace(/minutes?/i, "m")
      .replace(/minute/i, "m")
      .replace(/hours?/i, "hr")
      .replace(/hour/i, "hr");
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header Row */}
      <div className="flex justify-between items-start mb-4">
        {/* Left: Title and Total */}
        <div>
          <h2 className="text-lg font-bold text-black-500">
            Medicine Preparation
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Total Medicines : {data?.totalInitializedMedicines || 4000}
          </p>
        </div>

        {/* Right: Avg Turnaround Time */}
        <div className="border border-gray-200 rounded-lg p-3 shadow-md flex flex-col items-center">
          <p className="text-xs font-semibold text-gray-700 mb-1 text-center">
            Avg Turnaround Time
          </p>
          <p className="text-xs text-gray-600 text-center">
            Payment → Med Preparation :{" "}
            {tatLoading ? (
              <span className="font-bold text-gray-400">Loading...</span>
            ) : (
              <span className="font-bold text-gray-800">
                {formatTime(
                  tatData?.paymentToPreparation?.overall?.averageFormatted ||
                    "4h"
                )}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Main Content Row */}
      <div className="flex gap-4 flex-1">
        {/* Left: Completed and Pending */}
        <div className="flex flex-col gap-2 w-32">
          {/* Completed */}
          <div className="border-l-4 border-green-500 bg-white rounded-lg p-2 shadow-md">
            <p className="text-xs text-gray-600">Completed</p>
            <p className="text-xl font-bold text-green-600">
              {data?.completedMedicines || 40}
            </p>
          </div>

          {/* Pending */}
          <div className="border-l-4 border-orange-400 bg-white rounded-lg p-2 shadow-md">
            <p className="text-xs text-gray-600">Pending</p>
            <p className="text-xl font-bold text-orange-400">
              {data?.pendingMedicines || 25}
            </p>
          </div>
        </div>

        {/* Center: Pending by Cause Graph */}
        {/* Pending by Cause */}
        <div className="h-[150px] w-[220px]">
          <p className="text-center text-[13px] font-semibold text-gray-800 mb-2">
            Pending by Cause
          </p>

          {/* Graph container */}
          <div className="relative flex flex-col space-y-1.5">
            {/* Bars */}
            {mockGraphData.map((item, index) => (
              <div key={index} className="flex items-center">
                {/* Label */}
                <span className="text-[10px] text-gray-700 w-[90px] text-right pr-2">
                  {item.label}
                </span>

                {/* Chart area (grid + bar) */}
                <div className="relative flex-1 h-[10px]">
                  {/* Grid lines */}
                  <div className="absolute inset-0 flex justify-between">
                    {[0, 10, 20, 30, 40, 50, 60].map((val) => (
                      <div
                        key={val}
                        className="h-full border-l border-dotted border-gray-300"
                      ></div>
                    ))}
                  </div>

                  {/* Y-axis line */}
                  <div className="absolute left-0 h-full border-l border-gray-600"></div>

                  {/* Bar */}
                  <div className="relative bg-transparent rounded-full h-[10px] ml-[1px]">
                    <div
                      className="h-[10px] rounded-full transition-all duration-300"
                      style={{
                        width: `${(item.value / maxValue) * 100}%`,
                        backgroundColor: item.color,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* X-axis labels */}
          <div className="flex justify-between text-[9px] text-gray-500 mt-2 ml-[92px]">
            {[0, 10, 20, 30, 40, 50, 60].map((val) => (
              <span key={val}>{val}</span>
            ))}
          </div>
        </div>

        {/* Right: Leakage and Accuracy Issues */}
        <div className="border border-gray-200 rounded-lg p-2 bg-white w-32 flex flex-col gap-2">
          {/* Leakage */}
          <div>
            <p className="text-xs font-semibold text-red-500 mb-1">Leakage</p>
            {data?.leakageDetails && data.leakageDetails.length > 0 ? (
              <div className="text-xs text-gray-700 space-y-1">
                {data.leakageDetails.slice(0, 2).map((item, index) => (
                  <p key={index}>{item}</p>
                ))}
              </div>
            ) : (
              <div className="text-xs text-gray-700 space-y-1">
                <p>5 ml</p>
                <p>4 dr</p>
              </div>
            )}
          </div>

          {/* Horizontal line separator */}
          <hr className="border-t border-gray-200" />

          {/* Accuracy Issues */}
          <div>
            <p className="text-xs font-semibold text-gray-800 mb-1">
              Accuracy Issues
            </p>
            <div className="text-xs text-gray-700 space-y-1">
              <p>
                Flagged: <span className="font-bold">5</span>
              </p>
              <p>
                Resolved: <span className="font-bold">4</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicineDashboardComponent;
