import React, { useState, useEffect } from 'react';
import config from '/src/config.js';

const API_URL = config.API_URL;

export default function PatientCare(){
    const [data, setData] = useState({
        consistentPatients: 0,
        inconsistentPatients: 0,
        nonAdherentPatients: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [tatData, setTatData] = useState(null);
    const [tatLoading, setTatLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${API_URL}/api/analytics/adherence-summary`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ filter: 'month' })
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch data');
                }

                const result = await response.json();
                
                if (result.success && result.summary) {
                    setData(result.summary);
                }
            } catch (err) {
                setError(err.message);
                console.error('Error fetching adherence summary:', err);
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
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ filter: 'month' }),
            });
    
            if (!response.ok) {
              throw new Error('Failed to fetch TAT data');
            }
    
            const result = await response.json();
            if (result.data) {
              setTatData(result.data);
            }
          } catch (err) {
            console.error('Error fetching TAT data:', err.message);
          } finally {
            setTatLoading(false);
          }
        };
    
        fetchTatData();
      }, []);

    const totalPatients = data.consistentPatients + data.inconsistentPatients + data.nonAdherentPatients;
    const careCompletionPercentage = totalPatients > 0 
        ? Math.round((data.consistentPatients / totalPatients) * 100) 
        : 0;

    // Calculate stroke dashoffset for care completion circle
    const circumference = 2 * Math.PI * 40;
    const completionOffset = circumference - (circumference * careCompletionPercentage) / 100;

    return(
        <div className="bg-white rounded-xl shadow-lg p-6 min-h-[170px]">
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="text-gray-500">Loading...</div>
                </div>
            ) : error ? (
                <div className="flex items-center justify-center h-64">
                    <div className="text-red-500">Error: {error}</div>
                </div>
            ) : (
                <div className="flex flex-col gap-6 w-full">
                    {/* Header */}
                    <div className="flex justify-between">
                        <div>
                            <div className="text-2xl font-bold text-gray-800">Patient Care</div>
                            <div className="text-lg text-gray-500 font-medium mt-1">
                                Total Patients Under Care : <span className="font-bold text-gray-600">{totalPatients}</span>
                            </div>
                        </div>
                        <div className="bg-gray-50 rounded-xl px-5 py-3 shadow-sm min-w-[230px]">
                            <div className="font-semibold text-gray-800 text-md mb-2">Avg Turnaround Time</div>
                            <div className="flex items-center justify-between gap-2 text-gray-500 text-sm">
                              <p className="text-sm text-gray-500">
            Delivery → First Dose : {' '}
            {tatLoading ? (
              <span className="text-xl font-bold text-gray-400">Loading...</span>
            ) : (
              <span className="text-2xl font-bold text-gray-700">
                {tatData?.shipmentToPatientCare?.overall?.averageFormatted || '0 minutes'}
              </span>
            )}
          </p>
                            </div>
                            <div className="mt-2 flex items-center gap-2">
                                <span className="text-xl leading-none">⚠️</span>
                                <span className="text-red-500 font-semibold text-sm">Missing Start Dates : 8</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-5 mt-1">
                        {/* Status Counts */}
                        <div className="flex flex-col gap-3">
                            <div className="bg-white rounded-xl shadow p-3 flex items-center gap-3 min-w-[128px]">
                                <div className="w-1.5 h-7 bg-green-500 rounded-full"></div>
                                <div>
                                    <div className="text-gray-700 font-semibold text-base">Consistent</div>
                                    <div className="text-green-600 font-bold text-xl">{data.consistentPatients}</div>
                                </div>
                            </div>
                            <div className="bg-white rounded-xl shadow p-3 flex items-center gap-3 min-w-[128px]">
                                <div className="w-1.5 h-7 bg-yellow-400 rounded-full"></div>
                                <div>
                                    <div className="text-gray-700 font-semibold text-base">Inconsistent</div>
                                    <div className="text-yellow-500 font-bold text-xl">{data.inconsistentPatients}</div>
                                </div>
                            </div>
                            <div className="bg-white rounded-xl shadow p-3 flex items-center gap-3 min-w-[128px]">
                                <div className="w-1.5 h-7 bg-red-500 rounded-full"></div>
                                <div>
                                    <div className="text-gray-700 font-semibold text-base">Non-Adherent</div>
                                    <div className="text-red-500 font-bold text-xl">{data.nonAdherentPatients}</div>
                                </div>
                            </div>
                        </div>

                        {/* Care Completion */}
                        <div className="bg-white rounded-xl shadow flex flex-col items-center justify-center py-6 px-7 min-w-[175px]">
                            <span className="font-semibold text-gray-700 mb-2">Care Completion</span>
                            <svg width="90" height="90" viewBox="0 0 94 94">
                                <circle cx="47" cy="47" r="40" fill="none" stroke="#ededed" strokeWidth="8"/>
                                <circle cx="47" cy="47" r="40" fill="none" stroke="#FF4FA0" strokeWidth="8"
                                    strokeDasharray={circumference} strokeDashoffset={completionOffset} strokeLinecap="round" transform="rotate(-90 47 47)"
                                />
                                <text x="47" y="55" textAnchor="middle" fontSize="28" fontWeight="bold" fill="#262626">{careCompletionPercentage}%</text>
                            </svg>
                            <span className="mt-1 font-medium text-gray-500 text-sm">Completed</span>
                        </div>

                        {/* Follow Ups */}
                        <div className="bg-white rounded-xl shadow flex flex-col items-center justify-center py-6 px-7 min-w-[175px]">
                            <span className="font-semibold text-gray-700 mb-2">Follow-Ups</span>
                            <svg width="90" height="90" viewBox="0 0 94 94">
                                <circle cx="47" cy="47" r="40" fill="none" stroke="#ededed" strokeWidth="8"/>
                                <circle cx="47" cy="47" r="40" fill="none" stroke="#F8B651" strokeWidth="8"
                                    strokeDasharray="112" strokeDashoffset="0" strokeLinecap="round" transform="rotate(-90 47 47)"
                                />
                                <circle cx="47" cy="47" r="40" fill="none" stroke="#29BF67" strokeWidth="8"
                                    strokeDasharray="139.2" strokeDashoffset="112" strokeLinecap="round" transform="rotate(-90 47 47)"
                                />
                            </svg>
                            <div className="flex gap-4 mt-1 text-xs items-center">
                                <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 bg-yellow-400 rounded-full"></span>Pending</span>
                                <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 bg-green-500 rounded-full"></span>Completed</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}