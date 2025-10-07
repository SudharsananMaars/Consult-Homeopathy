import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// Mock config - replace with your actual config
const API_URL = '';

export default function TotalPatientBase() {
  const [statusData, setStatusData] = useState([]);
  const [entryData, setEntryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('Instagram');

  useEffect(() => {
    const fetchData = async () => {
      // Mock data for demonstration
      if (!API_URL) {
        setTimeout(() => {
          setStatusData([
            { status: 'Active', count: 400 },
            { status: 'Inactive', count: 350 },
            { status: 'Dormant', count: 350 },
            { status: 'Exit', count: 350 }
          ]);
          setEntryData([
            { source: 'Website', periodCount: 100, periodPercentageChange: null },
            { source: 'Instagram', periodCount: 400, periodPercentageChange: 20 },
            { source: 'Facebook', periodCount: 100, periodPercentageChange: -15 },
            { source: 'Call', periodCount: 200, periodPercentageChange: 10 },
            { source: 'Referral', periodCount: 50, periodPercentageChange: null },
            { source: 'Walk-in', periodCount: 150, periodPercentageChange: 5 }
          ]);
          setLoading(false);
        }, 500);
        return;
      }

      try {
        setLoading(true);
        
        const statusResponse = await fetch(`${API_URL}/api/analytics/status-counts`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filter: 'month' }),
        });

        if (!statusResponse.ok) throw new Error(`Failed to fetch status: ${statusResponse.status}`);
        const statusDataResult = await statusResponse.json();
        setStatusData(statusDataResult);

        const entryResponse = await fetch(`${API_URL}/api/analytics/entry-counts`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filter: 'month' }),
        });

        if (!entryResponse.ok) throw new Error(`Failed to fetch entries: ${entryResponse.status}`);
        const entryDataResult = await entryResponse.json();
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
    { name: "Website", barColor: "bg-cyan-500", icon: "🌐" },
    { name: "Instagram", barColor: "bg-pink-500", icon: "📷" },
    { name: "Facebook", barColor: "bg-blue-600", icon: "📘" },
    { name: "Call", barColor: "bg-cyan-500", icon: "📞" },
    { name: "Referral", barColor: "bg-purple-600", icon: "👥" },
    { name: "Walk-in", barColor: "bg-cyan-500", icon: "🚶" },
  ];

  const maxCount = Math.max(...entryData.map(e => e.periodCount), 1);

  // Mock engagement data
  const engagementData = [
    { week: 'Week 1', Posts: 75, Videos: 45 },
    { week: 'Week 2', Posts: 82, Videos: 55 },
    { week: 'Week 3', Posts: 88, Videos: 62 },
    { week: 'Week 4', Posts: 78, Videos: 58 },
    { week: 'Week 5', Posts: 92, Videos: 68 },
    { week: 'Week 6', Posts: 85, Videos: 60 }
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 h-full flex flex-col overflow-auto">
      {/* Header */}
      <div className="mb-4">
        <div className="text-sm text-gray-500 font-medium mb-1">Total Patient Base</div>
        <div className="text-4xl font-bold text-gray-900">
          {loading ? '...' : error ? 'Error' : totalPatients.toLocaleString()}
        </div>
        {error && (
          <div className="text-xs text-red-500 mt-1">{error}</div>
        )}
      </div>

      {/* Patient Status Bars */}
      <div className="grid grid-cols-4 gap-2 mb-6">
        {Object.entries(statusConfig).map(([status, { color, count }]) => (
          <div key={status} className={`${color} rounded-lg text-white text-center py-3 px-2`}>
            <div className="text-xs font-medium mb-1">{status}</div>
            <div className="text-lg font-bold">{loading ? '...' : count}</div>
          </div>
        ))}
      </div>

      {/* Patient Acquisition */}
      <div className="mb-6">
        <div className="text-gray-800 font-semibold mb-3 text-sm">Patient Acquisition</div>
        <div className="space-y-2.5">
          {acquisitionSources.map(({ name, barColor, icon }, idx) => {
            const count = getEntryCount(name);
            const change = getEntryChange(name);
            const barWidth = maxCount > 0 ? (count / maxCount) * 100 : 0;
            
            return (
              <div key={idx} className="flex items-center gap-2 text-xs">
                <span className="text-base">{icon}</span>
                <div className="text-gray-700 w-16 font-medium">{name}</div>
                <div className="flex-1 h-2.5 rounded-full bg-gray-100 relative overflow-hidden">
                  <div 
                    className={`${barColor} h-full rounded-full transition-all duration-500`} 
                    style={{ width: `${barWidth}%` }} 
                  />
                </div>
                <div className="w-10 text-right font-semibold text-gray-700">
                  {loading ? '...' : count}
                </div>
                {change && !loading && (
                  <div className={`flex items-center font-bold w-16 justify-end ${change.isUp ? "text-green-600" : "text-red-600"}`}>
                    {change.isUp ? "↑" : "↓"} {Math.abs(change.percentage)}%
                  </div>
                )}
                {!change && !loading && <div className="w-16"></div>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Performing Content with Tabs */}
      <div className="mb-5">
        <div className="text-gray-800 font-semibold mb-3 text-sm">Top Performing Content</div>
        <div className="flex gap-4 border-b border-gray-200 mb-3">
          {["Instagram", "Facebook", "Youtube"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-xs pb-2 px-1 border-b-2 transition-colors ${
                activeTab === tab 
                  ? 'border-blue-500 text-blue-600 font-semibold' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              type="button"
            >
              {tab}
            </button>
          ))}
        </div>
        
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="border-2 border-green-300 rounded-lg p-2 text-center bg-green-50">
            <div className="text-xs text-gray-600 mb-1">Posts</div>
            <div className="text-lg font-bold text-green-600">120</div>
          </div>
          <div className="border-2 border-red-300 rounded-lg p-2 text-center bg-red-50">
            <div className="text-xs text-gray-600 mb-1">Videos</div>
            <div className="text-lg font-bold text-red-600">35</div>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          <div className="border border-blue-200 rounded-lg p-2 text-center bg-blue-50">
            <div className="text-xs text-gray-600 mb-1">Total Views</div>
            <div className="text-sm font-bold text-blue-600">1.2M</div>
          </div>
          <div className="border border-pink-200 rounded-lg p-2 text-center bg-pink-50">
            <div className="text-xs text-gray-600 mb-1">Likes</div>
            <div className="text-sm font-bold text-pink-600">56K</div>
          </div>
          <div className="border border-yellow-200 rounded-lg p-2 text-center bg-yellow-50">
            <div className="text-xs text-gray-600 mb-1">Shares</div>
            <div className="text-sm font-bold text-yellow-600">8K</div>
          </div>
        </div>
      </div>

      {/* Engagement Trends Chart */}
      <div className="flex-1 min-h-[160px]">
        <div className="text-gray-800 font-semibold mb-2 text-sm">Engagement Trends</div>
        <div className="bg-gradient-to-b from-blue-50 to-cyan-50 rounded-lg p-3 h-40 border border-blue-100">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={engagementData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="week" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip 
                contentStyle={{ fontSize: '11px', borderRadius: '8px' }}
                cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
              />
              <Legend 
                iconType="circle" 
                iconSize={8}
                wrapperStyle={{ fontSize: '10px', paddingTop: '8px' }}
              />
              <Bar dataKey="Posts" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Videos" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}