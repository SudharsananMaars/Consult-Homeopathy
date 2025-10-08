import React, { useState, useEffect } from 'react';
import config from '/src/config.js';

const API_URL = config.API_URL;

const PatientCommunicationCard = () => {
    const [qualityData, setQualityData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const [messengerData, setMessengerData] = useState(null);
    const [isMessengerLoading, setIsMessengerLoading] = useState(false);
    const [messengerError, setMessengerError] = useState(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [questions, setQuestions] = useState([]);
    const [isQuestionsLoading, setIsQuestionsLoading] = useState(false);
    const [questionsError, setQuestionsError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [feedbackData, setFeedbackData] = useState(null);
const [isFeedbackLoading, setIsFeedbackLoading] = useState(false);
const [feedbackError, setFeedbackError] = useState(null);

    // Fetch questions when modal opens
    useEffect(() => {
        if (isModalOpen) {
            fetchQuestions();
        }
    }, [isModalOpen]);

    const fetchQuestions = async () => {
        setIsQuestionsLoading(true);
        setQuestionsError(null);
        
        try {
            const token = localStorage.getItem('token');
            
            if (!token) {
                throw new Error('Authentication token not found');
            }

            const response = await fetch(`${API_URL}/api/analytics/display-questions`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.success && data.data) {
                setQuestions(data.data);
            } else {
                throw new Error('Invalid response format');
            }
        } catch (err) {
            console.error('Error fetching questions:', err);
            setQuestionsError(err.message);
        } finally {
            setIsQuestionsLoading(false);
        }
    };

    const handleSaveQuestions = async () => {
        setIsSaving(true);
        
        try {
            const token = localStorage.getItem('token');
            
            if (!token) {
                throw new Error('Authentication token not found');
            }

            // Prepare payload: existing questions with _id, new questions without _id
            const payload = questions.map(q => {
                const item = {
                    question: q.question,
                    category: q.category
                };
                
                // Only include _id if it exists (existing questions)
                if (q._id) {
                    item._id = q._id;
                }
                
                return item;
            }).filter(q => q.question && q.question.trim() !== ''); // Filter out empty questions

            const response = await fetch(`${API_URL}/api/analytics/questions/bulk-update`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.success) {
                alert('Questions saved successfully!');
                setIsModalOpen(false);
                // Refresh the questions list
                fetchQuestions();
            } else {
                throw new Error(data.message || 'Failed to save questions');
            }
        } catch (err) {
            console.error('Error saving questions:', err);
            alert(`Error saving questions: ${err.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddNewQuestion = () => {
        const newQuestion = {
            question: '',
            category: 'Select Category',
            isActive: true
        };
        setQuestions([...questions, newQuestion]);
    };

    const handleDeleteQuestion = (index) => {
        const updatedQuestions = questions.filter((_, i) => i !== index);
        setQuestions(updatedQuestions);
    };

    const handleUpdateQuestion = (index, field, value) => {
        const updatedQuestions = [...questions];
        updatedQuestions[index][field] = value;
        setQuestions(updatedQuestions);
    };

    // Fetch messenger data from API
    useEffect(() => {
        const fetchMessengerData = async () => {
            setIsMessengerLoading(true);
            setMessengerError(null);
            
            try {
                const response = await fetch(`${API_URL}/api/analytics/messenger-summary`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ filter: 'month' })
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                
                if (data.success && data.summary) {
                    setMessengerData(data.summary);
                } else {
                    throw new Error('Invalid response format');
                }
            } catch (err) {
                console.error('Error fetching messenger data:', err);
                setMessengerError(err.message);
                // Fallback to mock data on error
                setMessengerData({
                    patientsWithMessage: 40,
                    patientsWithUnreadMessages: 40,
                    doctorToPatientResponses: 25,
                    outstandingMessages: 3
                });
            } finally {
                setIsMessengerLoading(false);
            }
        };

        fetchMessengerData();
    }, []);

    useEffect(() => {
    const fetchFeedbackData = async () => {
        setIsFeedbackLoading(true);
        setFeedbackError(null);
        
        try {
            const response = await fetch(`${API_URL}/api/analytics/rate-summary`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ filter: 'month' })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.success && data.data) {
                setFeedbackData(data.data);
            } else {
                throw new Error('Invalid response format');
            }
        } catch (err) {
            console.error('Error fetching feedback data:', err);
            setFeedbackError(err.message);
        } finally {
            setIsFeedbackLoading(false);
        }
    };

    fetchFeedbackData();
}, []);

    // Fetch quality assurance data from API
    useEffect(() => {
        const fetchQualityData = async () => {
            setIsLoading(true);
            setError(null);
            
            try {
                const response = await fetch(`${API_URL}/api/analytics/overall-summary`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ filter: 'month' })
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                
                if (data.success && data.summary) {
                    setQualityData(data.summary);
                } else {
                    throw new Error('Invalid response format');
                }
            } catch (err) {
                console.error('Error fetching quality data:', err);
                setError(err.message);
                // Fallback to mock data on error
                setQualityData({
                    averageTimeToFirstLogin: '15 min',
                    prescriptionRevisionRatePercentage: 4,
                    averageCallsPerPatient: 1.2,
                    averageCommunicationScore: 4.5
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchQualityData();
    }, []);

    const renderMessengerContent = () => {
        if (isMessengerLoading) {
            return (
                <div className="grid grid-cols-2 gap-2">
                    <div className="text-xs text-gray-500 col-span-2 text-center py-4">
                        Loading messenger data...
                    </div>
                </div>
            );
        }

        if (messengerError) {
            return (
                <div className="text-xs col-span-2">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700">
                        <p className="font-semibold mb-1">Error loading data</p>
                        <p className="text-xs">{messengerError}</p>
                        <p className="text-xs mt-1 text-gray-600">Showing demo data</p>
                    </div>
                </div>
            );
        }

        const summary = messengerData || {};

        return (
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 flex">
                    <div className="w-1 bg-cyan-500 rounded-l-lg"></div>
                    <div className="flex flex-col justify-center px-3 py-2">
                        <div className="text-xs font-semibold text-cyan-700 mb-0.5">Patients in Communication</div>
                        <div className="text-2xl font-bold text-cyan-600">
                            {summary.patientsWithMessage || 0}
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-100 flex">
                    <div className="w-1 bg-yellow-500 rounded-l-lg"></div>
                    <div className="flex flex-col justify-center px-3 py-2">
                        <div className="text-xs font-semibold text-yellow-700 mb-0.5">Responses Sent</div>
                        <div className="text-2xl font-bold text-yellow-600">
                            {summary.doctorToPatientResponses || 0}
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-100 flex">
                    <div className="w-1 bg-blue-500 rounded-l-lg"></div>
                    <div className="flex flex-col justify-center px-3 py-2">
                        <div className="text-xs font-semibold text-blue-700 mb-0.5">Responses Pending</div>
                        <div className="text-2xl font-bold text-blue-600">
                            {summary.patientsWithUnreadMessages || 0}
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-100 flex">
                    <div className="w-1 bg-gray-500 rounded-l-lg"></div>
                    <div className="flex flex-col justify-center px-3 py-2">
                        <div className="text-xs font-semibold text-gray-600 mb-0.5">Outstanding Messages</div>
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
            return (
                <div className="text-gray-500 text-xs text-center py-4">
                    Loading quality data...
                </div>
            );
        }

        if (error) {
            return (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700">
                    <p className="font-semibold mb-1 text-xs">Error loading data</p>
                    <p className="text-xs">{error}</p>
                    <p className="text-xs mt-1 text-gray-600">Showing demo data</p>
                </div>
            );
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
                    <div className="text-sm font-bold text-green-600">{averageResponses}</div>
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
        <div className="p-3 w-[260px]">
            <p className="text-[13px] font-semibold text-gray-800 mb-3 text-center">
                Channel Split
            </p>

            <div className="flex flex-col space-y-4">
                {data.map((item, index) => (
                    <div key={index} className="flex items-start space-x-2">
                        {/* Channel Label */}
                        <span className="text-[11px] text-gray-700 w-[70px] text-right pt-[2px]">
                            {item.channel}
                        </span>

                        {/* Vertical Separator Line */}
                        <div className="w-[1px] bg-gray-500 h-[42px]" />

                        {/* Bars stacked vertically */}
                        <div className="flex flex-col space-y-1 w-full">
                            <div
                                className="h-[10px] rounded-full bg-blue-400"
                                style={{ width: `${(item.responded / maxValue) * 100}%` }}
                            ></div>
                            <div
                                className="h-[10px] rounded-full bg-orange-300"
                                style={{ width: `${(item.pending / maxValue) * 100}%` }}
                            ></div>
                            <div
                                className="h-[10px] rounded-full bg-red-400"
                                style={{ width: `${(item.missed / maxValue) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Scale Labels */}
            <div className="flex justify-between text-[10px] text-gray-500 mt-3 ml-[72px]">
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
    if (isFeedbackLoading) {
        return (
            <div className="text-center py-4 text-xs text-gray-500">
                Loading feedback data...
            </div>
        );
    }

    if (feedbackError) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700">
                <p className="font-semibold mb-1 text-xs">Error loading feedback</p>
                <p className="text-xs">{feedbackError}</p>
            </div>
        );
    }

    // Default categories structure
    const defaultCategories = [
        { name: 'Consultation', value: 0, color: 'bg-purple-400' },
        { name: 'Medicine Delivery', value: 0, color: 'bg-blue-400' },
        { name: 'Communication', value: 0, color: 'bg-indigo-400' },
        { name: 'Overall', value: 0, color: 'bg-purple-500' },
    ];

    // Map API data to categories
    const categories = defaultCategories.map(cat => {
        const apiCategory = feedbackData?.categories?.find(
            c => c.category.toLowerCase() === cat.name.toLowerCase()
        );
        return {
            ...cat,
            value: apiCategory ? apiCategory.averageRating : 0
        };
    });

    const overallScore = feedbackData?.overallAverageScore || 0;
    const maxStars = 5;

    return (
        <>
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
            <div className="flex items-center justify-center mt-3 gap-2 pt-2 border-t border-gray-100">
                <span className="bg-yellow-100 rounded-full px-3 py-1 text-xs font-bold text-yellow-700">
                    Avg Score {overallScore.toFixed(1)}
                </span>
                <span className="text-yellow-400 text-xl">★</span>
            </div>
        </>
    );
};

    const renderModal = () => {
        if (!isModalOpen) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl shadow-2xl w-[800px] max-h-[600px] flex flex-col">
                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-800">Manage Feedback Questions</h2>
                        <button 
                            onClick={() => setIsModalOpen(false)}
                            className="text-blue-500 hover:text-blue-700 text-2xl font-light"
                        >
                            ×
                        </button>
                    </div>

                    <div className="overflow-auto flex-1">
                        {isQuestionsLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="text-gray-500">Loading questions...</div>
                            </div>
                        ) : questionsError ? (
                            <div className="p-6">
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                                    <p className="font-semibold mb-1">Error loading questions</p>
                                    <p className="text-sm">{questionsError}</p>
                                </div>
                            </div>
                        ) : (
                            <>
                                <table className="w-full">
                                    <thead className="bg-indigo-500 text-white sticky top-0">
                                        <tr>
                                            <th className="py-3 px-4 text-left text-sm font-medium w-16">#</th>
                                            <th className="py-3 px-4 text-left text-sm font-medium w-48">Category</th>
                                            <th className="py-3 px-4 text-left text-sm font-medium flex-1">Feedback Questions</th>
                                            <th className="py-3 px-4 text-center text-sm font-medium w-32">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {questions.length === 0 ? (
                                            <tr>
                                                <td colSpan="4" className="py-8 text-center text-gray-500">
                                                    No questions available. Click "Add New Questions" to create one.
                                                </td>
                                            </tr>
                                        ) : (
                                            questions.map((q, idx) => (
                                                <tr key={q._id || idx} className="border-b border-gray-200 hover:bg-gray-50">
                                                    <td className="py-4 px-4">
                                                        <span className="text-sm font-medium text-gray-600">Q{idx + 1}</span>
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <select 
                                                            value={q.category}
                                                            onChange={(e) => handleUpdateQuestion(idx, 'category', e.target.value)}
                                                            className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                        >
                                                            <option value="Select Category">Select Category</option>
                                                            <option value="Consultation">Consultation</option>
                                                            <option value="Medicine Delivery">Medicine Delivery</option>
                                                            <option value="Communication">Communication</option>
                                                            <option value="Overall">Overall</option>
                                                        </select>
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <input
                                                            type="text"
                                                            value={q.question}
                                                            onChange={(e) => handleUpdateQuestion(idx, 'question', e.target.value)}
                                                            placeholder="Enter question here..."
                                                            className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                        />
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <div className="flex items-center justify-center gap-3">
                                                            <button 
                                                                onClick={() => handleDeleteQuestion(idx)}
                                                                className="text-gray-600 hover:text-red-600 transition-colors"
                                                                title="Delete question"
                                                            >
                                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                    <polyline points="3 6 5 6 21 6"/>
                                                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>

                                <div className="p-4 border-t border-gray-200">
                                    <button 
                                        onClick={handleAddNewQuestion}
                                        className="text-indigo-600 hover:text-indigo-700 flex items-center gap-2 text-sm font-medium transition-colors"
                                    >
                                        <span className="text-lg">+</span>
                                        Add New Questions
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
                        <button 
                            onClick={() => setIsModalOpen(false)}
                            className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                            disabled={isSaving}
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleSaveQuestions}
                            disabled={isSaving || isQuestionsLoading}
                            className="px-6 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isSaving && (
                                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            )}
                            {isSaving ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="h-full flex flex-col p-4 ">
            <div className="flex items-start justify-between gap-6 h-full">
                
                <div className="flex flex-col gap-3" style={{ minWidth: '240px' }}>
                    <h2 className="text-lg font-bold text-black-500">Patient Communication & Feedback</h2>
                    {renderMessengerContent()}
                </div>

                <div className="flex-shrink-0" style={{ width: '240px' }}>
                    {renderChannelSplit()}
                </div>

                <div className="flex flex-col bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl px-5 py-4 border border-blue-100 shadow-sm" style={{ minWidth: '280px' }}>
                    <div className="text-sm font-bold text-gray-800 mb-3 text-center">Quality Assurance</div>
                    {renderQualityAssuranceContent()}
                </div>

                <div className="flex flex-col gap-2 flex-1">
    <div className="flex items-center justify-between">
        <div className="text-xs font-semibold text-gray-700">Feedback</div>
        <button 
            onClick={() => setIsModalOpen(true)}
            className="text-xs bg-white rounded-md px-2 py-1 border border-gray-300 hover:bg-gray-50 transition-colors flex items-center gap-1"
        >
            <span>Manage Questions</span>
            <span className="text-gray-400">⚙</span>
        </button>
    </div>
    <div className="bg-white rounded-lg p-3 border border-gray-100 shadow-sm">
        {renderFeedback()}
    </div>
</div>
            </div>

            {renderModal()}
        </div>
    );
};

export default PatientCommunicationCard;