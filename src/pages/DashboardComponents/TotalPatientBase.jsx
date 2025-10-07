import React, { useState, useEffect } from 'react';
import config from '/src/config.js';
  
const API_URL = config.API_URL;

export default function TotalPatient() {
  const [statusData, setStatusData] = useState([]);
  const [entryData, setEntryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('Instagram');

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
    Active: { color: 'bg-green-500', count: getStatusCount('Active') },
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

  // Mock data for top performing content
  const mockContentData = {
    Instagram: { posts: 120, videos: 35, totalViews: '1.2M', likes: '56K', shares: '8K' },
    Facebook: { posts: 85, videos: 22, totalViews: '890K', likes: '42K', shares: '5K' },
    Youtube: { posts: 45, videos: 67, totalViews: '2.1M', likes: '98K', shares: '12K' }
  };

  const contentData = mockContentData[activeTab];

  // Mock data for engagement trends chart
  const engagementData = [
    { week: 'Week 1', posts: 65, videos: 45 },
    { week: 'Week 2', posts: 59, videos: 52 },
    { week: 'Week 3', posts: 80, videos: 68 },
    { week: 'Week 4', posts: 61, videos: 58 },
    { week: 'Week 5', posts: 76, videos: 72 },
    { week: 'Week 6', posts: 72, videos: 65 }
  ];

  const maxEngagement = 100;

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="mb-3">
        <div className="text-lg text-black-500 font-semibold">Total Patient Base</div>
        <div className="text-3xl font-bold text-gray-900">
          {loading ? '...' : error ? 'Error' : totalPatients.toLocaleString()}
        </div>
        {error && (
          <div className="text-xs text-red-500 mt-1">
            {error}
          </div>
        )}
      </div>

      {/* Patient Status Bars */}
      <div className="grid grid-cols-4 gap-1.5 mb-3">
        {Object.entries(statusConfig).map(([status, { color, count }]) => (
          <div key={status} className={`${color} rounded-lg text-white text-center py-2 px-0.5`}>
            <div className="text-xs font-medium">{status}</div>
            <div className="text-base font-bold">
              {loading ? '...' : count.toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      {/* Patient Acquisition */}
      <div className="mb-3">
        <div className="text-gray-800 font-semibold mb-2 text-lg">Patient Acquisition</div>
        <div className="space-y-1.5">
          {acquisitionSources.map(({ name, barColor, icon }, idx) => {
            const count = getEntryCount(name);
            const change = getEntryChange(name);
            const barWidth = maxCount > 0 ? (count / maxCount) * 100 : 0;
            
            return (
              <div key={idx} className="flex items-center gap-1.5">
                <span className="text-sm">{icon}</span>
                <div className="text-gray-700 w-14 text-xs font-medium ml-2 mr-2">{name}</div>
                <div className="flex-1 h-2 rounded-full bg-gray-200 relative overflow-hidden">
                  <div 
                    className={`${barColor} h-2 rounded-full transition-all duration-300`} 
                    style={{ width: `${barWidth}%` }} 
                  />
                </div>
                <div className="text-xs w-7 text-right font-semibold text-gray-700 ml-2">
                  {loading ? '...' : count}
                </div>
                {change && !loading && (
                  <div className={`flex items-center text-xs font-bold w-12 ${change.isUp ? "text-green-600" : "text-red-600"}`}>
                    {change.isUp ? "↑" : "↓"}{Math.abs(change.percentage).toFixed(0)}%
                  </div>
                )}
                {!change && !loading && (
                  <div className="w-12 text-xs text-gray-400 text-center">--</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabs */}
 <div className="flex justify-center">
  <div className="flex gap-3 mb-2 bg-gray-200 p-1 rounded-full w-max">
    {["Instagram", "Facebook", "Youtube"].map((tab) => (
      <button
        key={tab}
        onClick={() => setActiveTab(tab)}
        className={`text-xs font-medium px-3 py-1 rounded-full transition-colors ${
          activeTab === tab
            ? "bg-white text-gray-900"
            : "text-gray-500 hover:text-gray-700"
        }`}
        type="button"
      >
        {tab}
      </button>
    ))}
  </div>
</div>



      {/* Top Performing Content */}
      <div className="mb-3">
        <div className="text-lg font-semibold text-black-500 mb-2">Top Performing Content</div>
        
        <div className="flex gap-1.5 mb-2">
          <div className="flex-1 border-2 border-green-300 rounded-lg p-1.5 text-center">
            <div className="text-green-600 font-semibold text-xs">Posts</div>
            <div className="text-green-600 font-bold text-base">{contentData.posts}</div>
          </div>
          <div className="flex-1 border-2 border-red-300 rounded-lg p-1.5 text-center">
            <div className="text-red-500 font-semibold text-xs">Videos</div>
            <div className="text-red-500 font-bold text-base">{contentData.videos}</div>
          </div>
        </div>
        
        <div className="flex gap-1.5">
          <div className="flex-1 border-2 border-blue-300 rounded-lg p-1 text-center">
            <div className="text-blue-600 font-semibold text-xs">Total Views</div>
            <div className="text-blue-600 font-bold text-xs">{contentData.totalViews}</div>
          </div>
          <div className="flex-1 border-2 border-pink-300 rounded-lg p-1 text-center">
            <div className="text-pink-600 font-semibold text-xs">Likes</div>
            <div className="text-pink-600 font-bold text-xs">{contentData.likes}</div>
          </div>
          <div className="flex-1 border-2 border-yellow-300 rounded-lg p-1 text-center">
            <div className="text-yellow-600 font-semibold text-xs">Shares</div>
            <div className="text-yellow-600 font-bold text-xs">{contentData.shares}</div>
          </div>
        </div>
      </div>

      {/* Engagement Trends Chart */}
<div className="flex-1 min-h-0 px-6">
  <div className="text-gray-800 text-sm font-semibold mb-1.5">Engagement Trends</div>
  <div className="relative w-full h-28 p-2">
    
    {/* Y-axis labels and dotted lines */}
    <div className="absolute left-0 top-0 bottom-5 flex flex-col justify-between text-xs text-gray-400 pr-2 w-full">
      {[100, 80, 60, 40, 20, 0].map((val) => (
        <div key={val} className="relative w-full">
          <span className="absolute -left-6">{val}%</span>
          <div className="border-t border-dotted border-gray-300 w-full absolute top-1/2 transform -translate-y-1/2"></div>
        </div>
      ))}
    </div>
    
    {/* Chart area */}
    <div className="ml-7 h-full pb-5 flex items-end justify-around gap-0.5">
      {engagementData.map((data, idx) => {
        const postsHeight = (data.posts / maxEngagement) * 100;
        const videosHeight = (data.videos / maxEngagement) * 100;

        return (
          <div key={idx} className="flex flex-col items-center flex-1 h-full justify-end">
            <div className="flex gap-0.5 items-end mb-1">
              <div 
                className="w-1.5 bg-cyan-400" // Removed rounded-t
                style={{ height: `${postsHeight}%` }}
              />
              <div 
                className="w-1.5 bg-orange-400" // Removed rounded-t
                style={{ height: `${videosHeight}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
    
    {/* X-axis labels */}
    <div className="absolute bottom-0 left-7 right-0 flex justify-around text-xs text-gray-400">
      {engagementData.map((data, idx) => (
        <span key={idx} className="flex-1 text-center text-xs">{data.week.replace('Week ', 'W')}</span>
      ))}
    </div>
  </div>

  {/* Legend */}
  <div className="flex justify-center gap-3 mt-1.5 text-xs">
    <div className="flex items-center gap-1">
      <div className="w-2.5 h-2.5 rounded-full bg-cyan-400"></div>
      <span className="text-gray-600 text-xs">Posts</span>
    </div>
    <div className="flex items-center gap-1">
      <div className="w-2.5 h-2.5 rounded-full bg-orange-400"></div>
      <span className="text-gray-600 text-xs">Videos</span>
    </div>
  </div>
</div>

    </div>
  );
}