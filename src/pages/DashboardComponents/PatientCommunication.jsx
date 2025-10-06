import React, { useState, useEffect } from 'react';
import config from '/src/config.js';

const API_URL = config.API_URL;

const PatientCommunicationCard = () => {
    // --- State for Quality Assurance Data ---
    const [qualityData, setQualityData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- New State for Messenger Data ---
    const [messengerData, setMessengerData] = useState(null);
    const [isMessengerLoading, setIsMessengerLoading] = useState(true);
    const [messengerError, setMessengerError] = useState(null);

    const API_PAYLOAD = {
        "filter": "month"
    };

    // --- API Fetching Functions ---

    const fetchQualityAssuranceData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_URL}/api/analytics/overall-summary`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(API_PAYLOAD),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                setQualityData(data.summary);
            } else {
                throw new Error('Overall Summary API reported failure.');
            }
        } catch (err) {
            console.error("Failed to fetch quality assurance data:", err);
            setError(err.message || "Quality Assurance data failed to load.");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchMessengerData = async () => {
        setIsMessengerLoading(true);
        setMessengerError(null);
        try {
            const response = await fetch(`${API_URL}/api/analytics/messenger-summary`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(API_PAYLOAD),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                setMessengerData(data.summary);
            } else {
                throw new Error('Messenger Summary API reported failure.');
            }
        } catch (err) {
            console.error("Failed to fetch messenger data:", err);
            setMessengerError(err.message || "Messenger data failed to load.");
        } finally {
            setIsMessengerLoading(false);
        }
    };

    // --- useEffect to call both fetches on mount ---
    useEffect(() => {
        fetchQualityAssuranceData();
        fetchMessengerData();
    }, []);

    // --- Helper Render Functions ---

    const renderMessengerContent = () => {
        if (isMessengerLoading) {
            return (
                <div className="flex flex-col gap-2">
                    <div className="flex justify-center items-center h-8 bg-[#f7fafd] rounded-lg text-sm text-gray-500">Loading...</div>
                    <div className="flex justify-center items-center h-8 bg-[#f7fafd] rounded-lg text-sm text-gray-500">Loading...</div>
                    <div className="flex justify-center items-center h-8 bg-[#f7fafd] rounded-lg text-sm text-gray-500">Loading...</div>
                    <div className="flex justify-center items-center h-8 bg-[#f7fafd] rounded-lg text-sm text-gray-500">Loading...</div>
                </div>
            );
        }

        if (messengerError) {
            return <div className="text-red-500 text-sm p-4">Error loading communication data.</div>;
        }

        const summary = messengerData || {};

        // Mapping to UI fields:
        // Patients in Communication -> patientsWithMessage
        // Responses Pending       -> patientsWithUnreadMessages (Assuming these patients require a pending response)
        // Responses Sent          -> doctorToPatientResponses
        // Outstanding Messages    -> outstandingMessages

        return (
            <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center bg-[#f7fafd] rounded-lg px-3 py-2 text-sm">
                    <span className="text-blue-600">Patients in Communication</span>
                    <span className="font-semibold text-gray-800">{summary.patientsWithMessage || 0}</span>
                </div>
                <div className="flex justify-between items-center bg-[#f7fafd] rounded-lg px-3 py-2 text-sm">
                    <span className="text-blue-600">Responses Pending</span>
                    <span className="font-semibold text-gray-800">{summary.patientsWithUnreadMessages || 0}</span>
                </div>
                <div className="flex justify-between items-center bg-[#f7fafd] rounded-lg px-3 py-2 text-sm">
                    <span className="text-yellow-600">Responses Sent</span>
                    <span className="font-semibold text-yellow-600">{summary.doctorToPatientResponses || 0}</span>
                </div>
                <div className="flex justify-between items-center bg-[#f7fafd] rounded-lg px-3 py-2 text-sm">
                    <span className="text-gray-500">Outstanding Messages</span>
                    <span className="font-semibold text-gray-800">{summary.outstandingMessages || 0}</span>
                </div>
            </div>
        );
    };

    const renderQualityAssuranceContent = () => {
        if (isLoading) {
            return <div className="text-gray-500 text-sm">Loading...</div>;
        }

        if (error) {
            return <div className="text-red-500 text-sm">Error: Failed to load data.</div>;
        }

        const summary = qualityData || {};

        const firstResponseTime = summary.averageTimeToFirstLogin || "N/A";
        
        // Calculated as 100 - revision rate
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
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-xs">
                <div className="text-gray-500">First Response Time</div>
                <div className="text-green-600 font-semibold">{firstResponseTime}</div>

                <div className="text-gray-500">Patient Onboarding</div>
                <div className="text-green-600 font-semibold">20 min</div> 

                <div className="text-gray-500">Prescription Prep Accuracy</div>
                <div className="text-green-600 font-semibold">{prescriptionAccuracy}%</div>

                <div className="text-gray-500">Avg. Responses per Patient</div>
                <div className="font-semibold text-gray-800">{averageResponses}</div>

                <div className="text-gray-500 col-span-1">Communication Quality Score</div>
                <div className="text-green-600 font-semibold col-span-1">{communicationScore}</div>
            </div>
        );
    };

    // --- Main Component Render ---
    return (
        <div className="bg-white rounded-xl shadow-lg p-6 mt-6 min-h-[150px] flex items-center justify-center">
            <div className="flex w-full gap-8 justify-between">
                
                {/* Left section: Patient Communication & Stats - Now dynamic */}
                <div className="flex flex-col gap-4 min-w-[180px]">
                    <h2 className="text-base font-semibold text-gray-700 mb-1">Patient Communication & Feedback</h2>
                    {renderMessengerContent()}
                    
                    <div className="mt-2">
                        <div className="text-xs text-gray-500 mb-1">Channel Split</div>
                        <div className="bg-gray-100 h-20 rounded flex items-center justify-center text-gray-400 text-xs">
                            [Channel Split Graph Placeholder]
                        </div>
                    </div>
                </div>

                {/* Center section: Quality Assurance - Dynamic */}
                <div className="flex flex-col items-center justify-center bg-[#f3f8fb] rounded-xl min-w-[240px] py-3 px-7">
                    <div className="text-gray-700 font-semibold mb-1 text-sm">Quality Assurance</div>
                    {renderQualityAssuranceContent()}
                </div>

                {/* Right section: Feedback (Static) */}
                <div className="flex flex-col justify-between min-w-[170px]">
                    <div className="flex justify-end mb-2">
                        <button className="text-xs bg-gray-100 rounded px-2 py-0.5 border border-gray-300">Manage Questions</button>
                    </div>
                    <div className="mt-1">
                        <div className="text-xs text-gray-500 mb-1">Feedback</div>
                        <div className="bg-gray-100 h-20 rounded flex items-center justify-center text-gray-400 text-xs">
                            [Feedback Graph Placeholder]
                        </div>
                    </div>
                    <div className="flex items-center mt-3 justify-end gap-2">
                        <span className="bg-yellow-200 rounded px-2 py-1 text-xs font-semibold">Avg Score 4.3</span>
                        <span className="text-yellow-500 text-lg">★</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientCommunicationCard;