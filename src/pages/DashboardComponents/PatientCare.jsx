import React, { useState, useEffect } from "react";

export default function PatientCare() {
  const [data, setData] = useState({
    consistentPatients: 40,
    inconsistentPatients: 25,
    nonAdherentPatients: 3,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tatData, setTatData] = useState({
    shipmentToPatientCare: {
      overall: {
        averageFormatted: "4d",
      },
    },
  });
  const [tatLoading, setTatLoading] = useState(false);

  const totalPatients =
    data.consistentPatients +
    data.inconsistentPatients +
    data.nonAdherentPatients;
  const careCompletionPercentage =
    totalPatients > 0
      ? Math.round((data.consistentPatients / totalPatients) * 100)
      : 0;

  const circumference = 2 * Math.PI * 30;
  const completionOffset =
    circumference - (circumference * careCompletionPercentage) / 100;

  return (
    <div className="h-full flex flex-col">
      {loading ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-gray-500">Loading...</div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-red-500">Error: {error}</div>
        </div>
      ) : (
        <div className="flex flex-col h-full">
          {/* Header Row */}
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="text-xl font-bold text-gray-800">
                Patient Care
              </div>
              <div className="text-sm text-gray-500 mt-0.5">
                Total Patients Under Care :{" "}
                <span className="font-semibold text-gray-700">
                  {totalPatients}
                </span>
              </div>
              <div className="mt-1 flex items-center gap-1">
                <span className="text-sm">⚠️</span>
                <span className="text-red-500 font-semibold text-xs text-center">
                  Missing Start Dates: 8
                </span>
              </div>
            </div>
            <div className="border border-gray-200 rounded-lg p-3 shadow-md flex flex-col items-center">
              <p className="text-xs font-semibold text-gray-700 mb-1 text-center">
                Avg Turnaround Time
              </p>
              <p className="text-xs text-gray-600 text-center">
                Delivery → First Dose:{" "}
                {tatLoading ? (
                  <span className="font-bold text-gray-400">...</span>
                ) : (
                  <span className="font-bold text-gray-800">
                    {tatData?.shipmentToPatientCare?.overall
                      ?.averageFormatted || "0m"}
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Content Row */}
          <div className="flex gap-4 items-center">
            {/* Status Counts */}
           <div className="flex flex-col gap-2">
  {/* Consistent */}
  <div className="bg-white rounded-lg shadow-sm border border-gray-100 flex">
    {/* Left color block */}
    <div className="w-1 bg-green-500 rounded-l-lg"></div>
    {/* Content */}
    <div className="flex flex-col justify-center px-2 py-1">
      <div className="text-gray-700 font-medium text-xs">Consistent</div>
      <div className="text-green-600 font-bold text-base leading-tight">
        {data.consistentPatients}
      </div>
    </div>
  </div>

  {/* Inconsistent */}
  <div className="bg-white rounded-lg shadow-sm border border-gray-100 flex">
    <div className="w-1 bg-yellow-400 rounded-l-lg"></div>
    <div className="flex flex-col justify-center px-2 py-1">
      <div className="text-gray-700 font-medium text-xs">Inconsistent</div>
      <div className="text-yellow-500 font-bold text-base leading-tight">
        {data.inconsistentPatients}
      </div>
    </div>
  </div>

  {/* Non-Adherent */}
  <div className="bg-white rounded-lg shadow-sm border border-gray-100 flex">
    <div className="w-1 bg-red-500 rounded-l-lg"></div>
    <div className="flex flex-col justify-center px-2 py-1">
      <div className="text-gray-700 font-medium text-xs">Non-Adherent</div>
      <div className="text-red-500 font-bold text-base leading-tight">
        {data.nonAdherentPatients}
      </div>
    </div>
  </div>
</div>


            {/* Care Completion */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 flex flex-col items-center justify-center py-3 px-4">
              <span className="font-semibold text-gray-700 text-xs mb-1">
                Care Completion
              </span>
              <svg width="70" height="70" viewBox="0 0 70 70">
                <circle
                  cx="35"
                  cy="35"
                  r="30"
                  fill="none"
                  stroke="#ededed"
                  strokeWidth="6"
                />
                <circle
                  cx="35"
                  cy="35"
                  r="30"
                  fill="none"
                  stroke="#FF4FA0"
                  strokeWidth="6"
                  strokeDasharray={circumference}
                  strokeDashoffset={completionOffset}
                  strokeLinecap="round"
                  transform="rotate(-90 35 35)"
                />
                <text
                  x="35"
                  y="40"
                  textAnchor="middle"
                  fontSize="20"
                  fontWeight="bold"
                  fill="#262626"
                >
                  {careCompletionPercentage}%
                </text>
              </svg>
              <span className="mt-1 font-medium text-gray-500 text-xs">
                Completed
              </span>
            </div>

            {/* Follow Ups */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 flex flex-col items-center justify-center py-3 px-4">
              <span className="font-semibold text-gray-700 text-xs mb-1">
                Follow-Ups
              </span>
              <svg width="70" height="70" viewBox="0 0 70 70">
                <circle
                  cx="35"
                  cy="35"
                  r="30"
                  fill="none"
                  stroke="#ededed"
                  strokeWidth="6"
                />
                <circle
                  cx="35"
                  cy="35"
                  r="30"
                  fill="none"
                  stroke="#F8B651"
                  strokeWidth="6"
                  strokeDasharray="112"
                  strokeDashoffset="0"
                  strokeLinecap="round"
                  transform="rotate(-90 35 35)"
                />
                <circle
                  cx="35"
                  cy="35"
                  r="30"
                  fill="none"
                  stroke="#29BF67"
                  strokeWidth="6"
                  strokeDasharray="139.2"
                  strokeDashoffset="112"
                  strokeLinecap="round"
                  transform="rotate(-90 35 35)"
                />
              </svg>
              <div className="flex gap-2 mt-1 text-xs items-center">
                <span className="flex items-center gap-1">
                  <span className="inline-block w-2 h-2 bg-yellow-400 rounded-full"></span>
                  <span className="text-gray-600">Pending</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="text-gray-600">Done</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
