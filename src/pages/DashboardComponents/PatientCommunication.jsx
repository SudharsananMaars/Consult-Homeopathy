import React, { useState, useEffect } from 'react';

const PatientCommunicationCard = () => {
    // --- State for Quality Assurance Data ---
    const [qualityData, setQualityData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // --- New State for Messenger Data ---
    const [messengerData, setMessengerData] = useState(null);
    const [isMessengerLoading, setIsMessengerLoading] = useState(false);
    const [messengerError, setMessengerError] = useState(null);

    // Mock data for demonstration
    useState(() => {
        setMessengerData({
            patientsWithMessage: 40,
            patientsWithUnreadMessages: 40,
            doctorToPatientResponses: 25,
            outstandingMessages: 3
        });
        setQualityData({
            averageTimeToFirstLogin: '15 min',
            prescriptionRevisionRatePercentage: 4,
            averageCallsPerPatient: 1.2,
            averageCommunicationScore: 4.5
        });
    });

    const API_PAYLOAD = {
        "filter": "month"
    };

    // --- Helper Render Functions ---

    const renderMessengerContent = () => {
        if (isMessengerLoading) {
            return (
                <div className="grid grid-cols-2 gap-2">
                    <div className="text-xs text-gray-500">Loading...</div>
                </div>
            );
        }

        if (messengerError) {
            return <div className="text-red-500 text-xs">Error loading data.</div>;
        }

        const summary = messengerData || {};

        return (
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
  {/* Patients in Communication */}
  <div className="bg-white rounded-lg shadow-sm border border-gray-100 flex">
    <div className="w-1 bg-cyan-500 rounded-l-lg"></div>
    <div className="flex flex-col justify-center px-3 py-2">
      <div className="text-xs text-cyan-700 mb-0.5">Patients in Communication</div>
      <div className="text-2xl font-bold text-cyan-600">
        {summary.patientsWithMessage || 0}
      </div>
    </div>
  </div>

  {/* Responses Sent */}
  <div className="bg-white rounded-lg shadow-sm border border-gray-100 flex">
    <div className="w-1 bg-yellow-500 rounded-l-lg"></div>
    <div className="flex flex-col justify-center px-3 py-2">
      <div className="text-xs text-yellow-700 mb-0.5">Responses Sent</div>
      <div className="text-2xl font-bold text-yellow-600">
        {summary.doctorToPatientResponses || 0}
      </div>
    </div>
  </div>

  {/* Responses Pending */}
  <div className="bg-white rounded-lg shadow-sm border border-gray-100 flex">
    <div className="w-1 bg-blue-500 rounded-l-lg"></div>
    <div className="flex flex-col justify-center px-3 py-2">
      <div className="text-xs text-blue-700 mb-0.5">Responses Pending</div>
      <div className="text-2xl font-bold text-blue-600">
        {summary.patientsWithUnreadMessages || 0}
      </div>
    </div>
  </div>

  {/* Outstanding Messages */}
  <div className="bg-white rounded-lg shadow-sm border border-gray-100 flex">
    <div className="w-1 bg-gray-500 rounded-l-lg"></div>
    <div className="flex flex-col justify-center px-3 py-2">
      <div className="text-xs text-gray-600 mb-0.5">Outstanding Messages</div>
      <div className="text-2xl font-bold text-gray-700">
        {summary.outstandingMessages || 0}
      </div>
    </div>
  </div>
</div>

        );
    };

    const renderQualityAssuranceContent = () => {
        if (isLoading) {
            return <div className="text-gray-500 text-xs">Loading...</div>;
        }

        if (error) {
            return <div className="text-red-500 text-xs">Error loading data.</div>;
        }

        const summary = qualityData || {};

        const firstResponseTime = summary.averageTimeToFirstLogin || "N/A";
        
        const prescriptionAccuracy = (
            summary.prescriptionRevisionRatePercentage !== undefined && summary.prescriptionRevisionRatePercentage !== null
                ? (100 - summary.prescriptionRevisionRatePercentage).toFixed(0)
                : "N/A"
        );

        const averageResponses = (
            summary.averageCallsPerPatient !== undefined && summary.averageCallsPerPatient !== null
                ? summary.averageCallsPerPatient.toFixed(1)
                : "N/A"
        );

        const communicationScore = (
            summary.averageCommunicationScore !== undefined && summary.averageCommunicationScore !== null
                ? `${summary.averageCommunicationScore.toFixed(1)}/5`
                : "N/A"
        );

        return (
            <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">
                <div>
                    <div className="text-xs text-gray-500 mb-0.5">First Response Time</div>
                    <div className="text-sm font-bold text-green-600">{firstResponseTime}</div>
                </div>
                <div>
                    <div className="text-xs text-gray-500 mb-0.5">Patient Onboarding</div>
                    <div className="text-sm font-bold text-green-600">20 min</div>
                </div>
                <div>
                    <div className="text-xs text-gray-500 mb-0.5">Prescription Prep Accuracy</div>
                    <div className="text-sm font-bold text-green-600">{prescriptionAccuracy}%</div>
                </div>
                <div>
                    <div className="text-xs text-gray-500 mb-0.5">Avg. Responses per Patient</div>
                    <div className="text-sm font-bold text-gray-800">{averageResponses}</div>
                </div>
                <div className="col-span-2 text-center pt-1">
                    <div className="text-xs text-gray-500 mb-0.5">Communication Quality Score</div>
                    <div className="text-sm font-bold text-green-600">{communicationScore}</div>
                </div>
            </div>
        );
    };

   const renderChannelSplit = () => {
  const data = [
    { channel: "Messenger", responded: 35, pending: 10, missed: 5 },
    { channel: "Calls", responded: 10, pending: 8, missed: 20 },
  ];

  const maxValue = 50;

  return (
    <div className="p-3 h-[160px] w-[260px]">
      {/* Title */}
      <p className="text-[13px] font-semibold text-gray-800 mb-3 text-center">
        Channel Split
      </p>

      {/* Graph container */}
      <div className="relative flex flex-col space-y-3 pl-[80px]">
        {/* Grid lines */}
        <div className="absolute inset-0 flex justify-between z-0">
          {[0, 10, 20, 30, 40, 50].map((val) => (
            <div
              key={val}
              className="h-full border-l border-dotted border-gray-300"
            ></div>
          ))}
        </div>

        {/* Bars */}
        {data.map((item, index) => {
          const respondedWidth = (item.responded / maxValue) * 100;
          const pendingWidth = (item.pending / maxValue) * 100;
          const missedWidth = (item.missed / maxValue) * 100;

          return (
            <div key={index} className="flex items-center relative z-10 h-[14px]">
              {/* Label */}
              <span className="absolute left-0 text-[11px] text-gray-700 w-[70px] text-right">
                {item.channel}
              </span>

              {/* Separator Line (Y-axis) */}
              <div className="absolute left-[75px] h-full border-l border-gray-600"></div>

              {/* Bar container */}
              <div className="flex flex-row h-full ml-[8px] rounded-full overflow-hidden">
                <div
                  className="bg-blue-400"
                  style={{ width: `${respondedWidth}%` }}
                ></div>
                <div
                  className="bg-orange-300"
                  style={{ width: `${pendingWidth}%` }}
                ></div>
                <div
                  className="bg-red-400"
                  style={{ width: `${missedWidth}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* X-axis labels */}
      <div className="flex justify-between text-[10px] text-gray-500 mt-3 pl-[82px]">
        {[0, 10, 20, 30, 40, 50].map((val) => (
          <span key={val}>{val}</span>
        ))}
      </div>

      {/* Legend */}
      <div className="flex gap-3 text-[10px] justify-center pt-2 mt-1">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-sm bg-blue-400"></div>
          <span className="text-gray-600">Responded</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-sm bg-orange-300"></div>
          <span className="text-gray-600">Pending</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-sm bg-red-400"></div>
          <span className="text-gray-600">Missed</span>
        </div>
      </div>
    </div>
  );
};


    const renderFeedback = () => {
        const categories = [
            { name: 'Consultation', value: 4, color: 'bg-purple-400' },
            { name: 'Medicine/Delivery', value: 5, color: 'bg-blue-400' },
            { name: 'Communication', value: 3, color: 'bg-indigo-400' },
            { name: 'Overall', value: 4.3, color: 'bg-purple-500' },
        ];

        const maxStars = 5;

        return (
            <div className="space-y-2">
                {categories.map((cat, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-2">
                        <span className="text-xs text-gray-600 w-24">{cat.name}</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                            <div 
                                className={`${cat.color} h-full transition-all`}
                                style={{ width: `${(cat.value / maxStars) * 100}%` }}
                            ></div>
                        </div>
                        <div className="flex items-center gap-0.5">
                            {[...Array(maxStars)].map((_, i) => (
                                <span key={i} className={`text-xs ${i < Math.floor(cat.value) ? 'text-yellow-400' : 'text-gray-300'}`}>
                                    ★
                                </span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    // --- Main Component Render ---
    return (
        <div className="h-full flex flex-col">
            <div className="flex items-start justify-between gap-6 h-full">
                
                {/* Left section: Patient Communication Stats */}
                <div className="flex flex-col gap-3" style={{ minWidth: '240px' }}>
                    <h2 className="text-lg font-bold text-black-500">Patient Communication & Feedback</h2>
                    {renderMessengerContent()}
                </div>

                {/* Channel Split Graph - Placed next to stats */}
                <div className="flex-shrink-0" style={{ width: '240px' }}>
                    {renderChannelSplit()}
                </div>

                {/* Center section: Quality Assurance */}
                <div className="flex flex-col bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl px-5 py-4 border border-blue-100 shadow-sm" style={{ minWidth: '280px' }}>
                    <div className="text-sm font-bold text-gray-800 mb-3 text-center">Quality Assurance</div>
                    {renderQualityAssuranceContent()}
                </div>

                {/* Right section: Feedback */}
                <div className="flex flex-col gap-2 flex-1">
                    <div className="flex items-center justify-between">
                        <div className="text-xs font-semibold text-gray-700">Feedback</div>
                        <button className="text-xs bg-white rounded-md px-2 py-1 border border-gray-300 hover:bg-gray-50 transition-colors flex items-center gap-1">
                            <span>Manage Questions</span>
                            <span className="text-gray-400">⚙</span>
                        </button>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-gray-100 shadow-sm">
                        {renderFeedback()}
                        <div className="flex items-center justify-center mt-3 gap-2 pt-2 border-t border-gray-100">
                            <span className="bg-yellow-100 rounded-full px-3 py-1 text-xs font-bold text-yellow-700">Avg Score 4.3</span>
                            <span className="text-yellow-400 text-xl">★</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientCommunicationCard;