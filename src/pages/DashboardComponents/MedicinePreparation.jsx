import React, { useState, useEffect } from 'react';
import config from '/src/config.js';

const API_URL = config.API_URL;

const MedicineDashboardComponent = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tatData, setTatData] = useState(null);
  const [tatLoading, setTatLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/api/analytics/preparation-status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ filter: 'month' }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }

        const result = await response.json();
        if (result.success) {
          setData(result.data);
        } else {
          throw new Error('API returned unsuccessful response');
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

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-xl shadow-lg w-full max-w-4xl font-sans">
        <div className="flex items-center justify-center h-64">
          <p className="text-xl text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
    
        <div className="flex items-center justify-center h-64">
          <p className="text-xl text-red-500">Error: {error}</p>
        </div>
     
    );
  }

  return (
    // Outer container with a subtle shadow and rounded corners
    <div className="p-6 bg-white rounded-xl shadow-lg w-full max-w-4xl font-sans">
      <div className="grid grid-cols-3 gap-6">

        {/* --- Left Section: Medicine Preparation & Status --- */}
        <div className="col-span-2 space-y-4">
          <h2 className="text-3xl font-bold text-gray-800">Medicine Preparation</h2>
          <p className="text-xl text-gray-600">Total Medicines : {data?.totalInitializedMedicines || 0}</p>
          
          <div className="flex space-x-6 mt-6">
            {/* Completed Box - With Left Border */}
            <div className="p-5 bg-gray-50 rounded-lg shadow-sm flex-1 border-l-4 border-green-500">
              <p className="text-base text-gray-600">Completed</p>
              <p className="text-4xl font-bold text-green-600 mt-1">{data?.completedMedicines || 0}</p>
            </div>
            
            {/* Pending Box - With Left Border */}
            <div className="p-5 bg-gray-50 rounded-lg shadow-sm flex-1 border-l-4 border-yellow-500">
              <p className="text-base text-gray-600">Pending</p>
              <p className="text-4xl font-bold text-yellow-600 mt-1">{data?.pendingMedicines || 0}</p>
            </div>
          </div>
        </div>

        {/* --- Right Top Section: Avg Turnaround Time --- */}
        <div className="col-span-1 p-5 bg-white rounded-lg border border-gray-200 shadow-sm">
          <p className="text-lg font-semibold text-gray-800 mb-2">Avg Turnaround Time</p>
          <p className="text-sm text-gray-500">
            Payment → Med Preparation : {' '}
            {tatLoading ? (
              <span className="text-xl font-bold text-gray-400">Loading...</span>
            ) : (
              <span className="text-2xl font-bold text-gray-700">
                {tatData?.paymentToPreparation?.overall?.averageFormatted || '0 minutes'}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* --- Main Content Row --- */}
      <div className="flex mt-6 gap-6">

        {/* --- Center Section: Pending by Cause (Placeholder) --- */}
        <div className="flex-grow p-4 bg-white rounded-lg shadow-inner border border-gray-100 min-h-[250px] flex flex-col justify-between">
          <p className="text-lg font-semibold text-gray-800 mb-4">Pending by Cause</p>
          {/* Placeholder for the Bar Graph */}
          <div className="flex-grow flex items-center justify-center text-gray-400 border border-dashed border-gray-300 rounded p-4">
            [ Bar Graph Placeholder ]
          </div>
          {/* Placeholder for the x-axis numbers - added to mimic the original layout */}
          <div className="flex justify-between text-sm text-gray-500 mt-2">
            <span>0</span>
            <span>10</span>
            <span>20</span>
            <span>30</span>
            <span>40</span>
            <span>50</span>
            <span>60</span>
          </div>
        </div>

        {/* --- Right Bottom Section: Leakage & Accuracy --- */}
        <div className="w-64 space-y-6">
          
          {/* Leakage */}
          <div className="p-5 bg-white rounded-lg border border-gray-200 shadow-sm">
            <p className="text-lg font-semibold text-red-500 mb-3">Leakage</p>
            {data?.leakageDetails && data.leakageDetails.length > 0 ? (
              <ul className="list-none space-y-1 text-gray-700">
                {data.leakageDetails.map((item, index) => (
                  <li key={index} className="text-sm">{item}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm">No leakage reported</p>
            )}
          </div>
          
          {/* Accuracy Issues */}
          <div className="p-5 bg-white rounded-lg border border-gray-200 shadow-sm">
            <p className="text-lg font-semibold text-gray-800 mb-3">Accuracy Issues</p>
            <div className="text-gray-700 space-y-1">
                <p className="text-sm">Flagged: <span className="font-bold">5</span></p>
                <p className="text-sm">Resolved: <span className="font-bold">4</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicineDashboardComponent;