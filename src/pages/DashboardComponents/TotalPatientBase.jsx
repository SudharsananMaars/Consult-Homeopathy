import React, { useState, useEffect } from 'react';
import config from '/src/config.js';
  
const API_URL = config.API_URL;

export default function TotalPatient() {
  const [statusData, setStatusData] = useState([]);
  const [entryData, setEntryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      console.log('Fetching data...');
      console.log('API URL:', API_URL);
      
      try {
        setLoading(true);
        
        // Fetch status counts
        const statusUrl = `${API_URL}/api/analytics/status-counts`;
        console.log('Status URL:', statusUrl);
        
        const statusResponse = await fetch(statusUrl, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ filter: 'month' }),
        });

        console.log('Status response status:', statusResponse.status);

        if (!statusResponse.ok) {
          throw new Error(`Failed to fetch status: ${statusResponse.status}`);
        }

        const statusDataResult = await statusResponse.json();
        console.log('Status data:', statusDataResult);
        setStatusData(statusDataResult);

        // Fetch entry counts
        const entryUrl = `${API_URL}/api/analytics/entry-counts`;
        console.log('Entry URL:', entryUrl);
        
        const entryResponse = await fetch(entryUrl, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ filter: 'month' }),
        });

        console.log('Entry response status:', entryResponse.status);

        if (!entryResponse.ok) {
          throw new Error(`Failed to fetch entries: ${entryResponse.status}`);
        }

        const entryDataResult = await entryResponse.json();
        console.log('Entry data:', entryDataResult);
        setEntryData(entryDataResult.entryCounts || []);

        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStatusCount = (status) => {
    const item = statusData.find((s) => s.status === status);
    return item ? item.count : 0;
  };

  const totalPatients = statusData.reduce((sum, item) => sum + item.count, 0);

  const statusConfig = {
    Active: { color: 'bg-green-600', count: getStatusCount('Active') },
    Inactive: { color: 'bg-blue-500', count: getStatusCount('Inactive') },
    Dormant: { color: 'bg-orange-400', count: getStatusCount('Dormant') },
    Exit: { color: 'bg-red-500', count: getStatusCount('Exit') },
  };

  const getEntryCount = (sourceName) => {
    const entry = entryData.find((e) => e.source.toLowerCase() === sourceName.toLowerCase());
    return entry ? entry.periodCount : 0;
  };

  const getEntryChange = (sourceName) => {
    const entry = entryData.find((e) => e.source.toLowerCase() === sourceName.toLowerCase());
    if (!entry || entry.periodPercentageChange === null) return null;
    return {
      percentage: entry.periodPercentageChange,
      isUp: entry.periodPercentageChange > 0
    };
  };

  const acquisitionSources = [
    { name: "Website", barColor: "bg-cyan-600" },
    { name: "Instagram", barColor: "bg-pink-600" },
    { name: "Facebook", barColor: "bg-blue-600" },
    { name: "Call", barColor: "bg-cyan-600" },
    { name: "Referral", barColor: "bg-purple-700" },
    { name: "Walk-in", barColor: "bg-cyan-600" },
  ];

  const maxCount = Math.max(...entryData.map(e => e.periodCount), 1);

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <div className="text-sm text-gray-600 font-normal">Total Patient Base</div>
        <div className="text-4xl font-extrabold">
          {loading ? '...' : error ? 'Error' : totalPatients.toLocaleString()}
        </div>
        {error && (
          <div className="text-xs text-red-500 mt-1">
            {error}
          </div>
        )}
      </div>

      {/* Patient Status Bars */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {Object.entries(statusConfig).map(([status, { color, count }]) => (
          <div key={status} className={`${color} rounded-lg text-white text-center py-2 font-semibold`}>
            {status}<br />{loading ? '...' : count.toLocaleString()}
          </div>
        ))}
      </div>

      {/* Patient Acquisition */}
      <div className="mb-6">
        <div className="text-gray-700 font-semibold mb-2">Patient Acquisition</div>
        <div className="space-y-2">
          {acquisitionSources.map(({ name, barColor }, idx) => {
            const count = getEntryCount(name);
            const change = getEntryChange(name);
            const barWidth = maxCount > 0 ? (count / maxCount) * 100 : 0;
            
            return (
              <div key={idx} className="flex items-center space-x-3">
                <div className="text-gray-600 w-16 text-xs">{name}</div>
                <div className="flex-1 h-3 rounded-full bg-gray-200 relative">
                  <div 
                    className={`${barColor} h-3 rounded-full transition-all duration-300`} 
                    style={{ width: `${barWidth}%` }} 
                  />
                </div>
                <div className="text-xs w-8 text-right">
                  {loading ? '...' : count}
                </div>
                {change && !loading && (
                  <div className={`flex items-center text-xs font-semibold ml-2 ${change.isUp ? "text-green-600" : "text-red-600"}`}>
                    {change.isUp ? "↑" : "↓"} {Math.abs(change.percentage)}%
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Performing Content with Tabs */}
      <div className="mb-4">
        <div className="flex space-x-6 border-b border-gray-200 mb-4">
          {["Instagram", "Facebook", "Youtube"].map((tab) => (
            <button
              key={tab}
              className="text-xs text-gray-600 pb-2 border-b-2 border-transparent hover:border-gray-400"
              type="button"
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="flex justify-between mb-2">
          <div className="text-green-600 font-semibold">Posts 120</div>
          <div className="text-red-600 font-semibold">Videos 35</div>
        </div>
        <div className="flex justify-between text-xs font-semibold">
          <div className="text-blue-600">Total Views 1.2M</div>
          <div className="text-pink-600">Likes 56K</div>
          <div className="text-yellow-600">Shares 8K</div>
        </div>
      </div>

      {/* Engagement Trends Chart - Placeholder */}
      <div>
        <div className="text-gray-600 text-sm font-semibold mb-2">Engagement Trends</div>
        <div className="relative w-full h-28 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="text-gray-400 text-sm font-medium">Bargraph</div>
          </div>
        </div>
      </div>
    </div>
  );
}