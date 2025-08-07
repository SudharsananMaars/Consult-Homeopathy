import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, User, Calendar, TrendingUp, RefreshCw, X, Search, Filter, Play, ExternalLink } from 'lucide-react';
import config from "../../config";

const LeakageDetection = () => {
  const [leakageData, setLeakageData] = useState([]);
  const [alertsData, setAlertsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alertsLoading, setAlertsLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('quantityLeaked');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showAlertsModal, setShowAlertsModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const API_URL = config.API_URL; 

  const fetchLeakageData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      console.log(
        "Leakage detection api:",
        `${API_URL}/api/medicine-summary/leakages/detected`
      );

      if (!token) {
        console.error('No access token found');
        throw new Error('No access token found');
      }

      const response = await fetch(`${API_URL}/api/medicine-summary/leakages/detected`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      console.log('API Response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Leakage data received:', data);
      
      const dataArray = Array.isArray(data) ? data : (data.data ? data.data : [data]);
      setLeakageData(dataArray);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching leakage data:', error);
      setLoading(false);
      setLeakageData([]);
    }
  };

  const fetchAlertsData = async () => {
    setAlertsLoading(true);
    try {
      const token = localStorage.getItem('token');
      console.log(
        "Alerts API URL:",
        `${API_URL}/api/medicine-summary/leakages/above-threshold`
      );

      if (!token) {
        console.error('No access token found');
        throw new Error('No access token found');
      }

      const response = await fetch(`${API_URL}/api/medicine-summary/leakages/above-threshold`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Alerts API Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      console.log('Alerts data received:', data);
      
      // Handle the alerts data structure based on your API response
      const alertsArray = Array.isArray(data) ? data : 
                         (data.leakages ? data.leakages : 
                         (data.data ? data.data : [data]));
      
      setAlertsData(alertsArray);
      setAlertsLoading(false);
    } catch (error) {
      console.error('Error fetching alerts data:', error);
      setAlertsLoading(false);
      setAlertsData([]);
    }
  };

  // Fetch both APIs on page load
  useEffect(() => {
    fetchLeakageData();
    fetchAlertsData(); // Added this to fetch alerts data on page load
  }, []);

  // Function to get unit display based on UOM
  const getUnitDisplay = (uom) => {
    if (!uom) return 'g'; // default fallback
    const lowerUom = uom.toLowerCase();
    if (lowerUom === 'dram' || lowerUom === 'gram') return 'g';
    if (lowerUom === 'ml') return 'ml';
    return uom; // fallback to original if not matched
  };

  // Calculate leakage percentage for each item
  const processedData = leakageData.map(item => ({
    ...item,
    // Updated calculation: quantity leaked / prescribed quantity * 100
    leakagePercent: item.prescribedQuantity > 0 ? ((item.quantityLeaked / item.prescribedQuantity) * 100).toFixed(1) : 0,
    lastUsed: new Date(item.createdAt).toLocaleDateString(),
    unitDisplay: getUnitDisplay(item.uom)
  }));

  // Filter and search logic
  const filteredData = processedData.filter(item => {
    const matchesSearch = item.medicineName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.materialName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.barcode?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    if (filter === 'high-leakage') return matchesSearch && item.quantityLeaked > 100;
    if (filter === 'medium-leakage') return matchesSearch && item.quantityLeaked > 50 && item.quantityLeaked <= 100;
    if (filter === 'low-leakage') return matchesSearch && item.quantityLeaked <= 50;
    return matchesSearch;
  });

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    const multiplier = sortOrder === 'desc' ? -1 : 1;
    if (sortBy === 'medicineName') return multiplier * a.medicineName.localeCompare(b.medicineName);
    return multiplier * (a[sortBy] - b[sortBy]);
  });

  // Calculate stats
  const stats = {
    total: processedData.length,
    highLeakage: processedData.filter(item => item.quantityLeaked > 100).length,
    mediumLeakage: processedData.filter(item => item.quantityLeaked > 50 && item.quantityLeaked <= 100).length,
    lowLeakage: processedData.filter(item => item.quantityLeaked <= 50).length,
    totalLeaked: processedData.reduce((sum, item) => sum + item.quantityLeaked, 0),
    totalUsed: processedData.reduce((sum, item) => sum + item.quantityUsed, 0),
    alerts: alertsData.length || processedData.filter(item => item.quantityLeaked > 100).length
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Function to handle video playback
  const handleVideoPlay = (videoUrl) => {
    if (videoUrl) {
      window.open(videoUrl, '_blank');
    }
  };

  const handleAlertsModalOpen = () => {
    setShowAlertsModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-600">Loading leakage data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-b from-white to-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Leakage Detection </h1>
            
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleAlertsModalOpen}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow text-sm flex items-center gap-2"
              disabled={stats.alerts === 0}
            >
              <AlertTriangle className="w-4 h-4" />
              {stats.alerts > 0 ? `${stats.alerts} Alerts` : 'No Alerts'}
            </button>
            <button 
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow text-sm"
              onClick={() => window.history.back()}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
 <div className="flex justify-center">
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-5xl">
    <div className="bg-white rounded-xl shadow p-6 text-center">
      <h3 className="text-sm font-medium text-gray-600">Total Materials</h3>
      <p className="text-2xl font-bold text-gray-800 mt-1">{stats.total}</p>
    </div>
    <div className="bg-red-50 rounded-xl shadow p-6 text-center">
      <h3 className="text-sm font-medium text-red-800">High Leakage</h3>
      <p className="text-2xl font-bold text-red-600 mt-1">{stats.highLeakage}</p>
    </div>
    <div className="bg-green-50 rounded-xl shadow p-6 text-center">
      <h3 className="text-sm font-medium text-green-800">Low Leakage</h3>
      <p className="text-2xl font-bold text-green-600 mt-1">{stats.lowLeakage}</p>
    </div>
  </div>
</div>


      {/* Controls */}
      <div className="bg-white rounded-xl shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex gap-4 flex-wrap">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search materials, barcode..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
              />
            </div>
            
            <div>
              <select 
                value={sortOrder} 
                onChange={(e) => setSortOrder(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="desc">Highest First</option>
                <option value="asc">Lowest First</option>
              </select>
            </div>
          </div>
          <button 
            onClick={() => {
              fetchLeakageData();
              fetchAlertsData();
            }}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow text-sm flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh Data
          </button>
        </div>
      </div>

      {/* Material Leakage Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left p-4 font-semibold text-gray-700">Raw Material Name</th>
                <th className="text-left p-4 font-semibold text-gray-700">Total Quantity </th>
                <th className="text-left p-4 font-semibold text-gray-700">Current Quantity </th>
                <th className="text-left p-4 font-semibold text-gray-700">Barcode</th>
                <th className="text-left p-4 font-semibold text-gray-700">Last Used</th>
                <th className="text-left p-4 font-semibold text-gray-700">Prescribed Qty </th>
                <th className="text-left p-4 font-semibold text-gray-700">Quantity Used </th>
                <th className="text-left p-4 font-semibold text-gray-700">Quantity Leaked </th>
                <th className="text-left p-4 font-semibold text-gray-700">Leakage %</th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map((item, index) => (
                <tr key={item.prescriptionId} className={`border-b border-gray-100 hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                  <td className="p-4">
                    <div>
                      <div className="font-medium text-gray-900">{item.materialName}</div>
                    </div>
                  </td>
                  <td className="p-4 font-medium text-gray-900">{item.totalWeight}{item.unitDisplay}</td>
                  <td className="p-4 font-medium text-gray-900">{item.currentQuantity}{item.unitDisplay}</td>
                  <td className="p-4">
                    <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm font-mono">
                      {item.barcode}
                    </span>
                  </td>
                  <td className="p-4 text-gray-600">{formatDate(item.createdAt)}</td>
                  <td className="p-4 font-medium text-blue-600">{item.prescribedQuantity}{item.unitDisplay}</td>
                  <td className="p-4 font-medium text-green-600">{item.quantityUsed}{item.unitDisplay}</td>
                  <td className="p-4">
                    <span className={`font-bold ${
                      item.quantityLeaked > 100 ? 'text-red-600' :
                      item.quantityLeaked > 50 ? 'text-orange-600' :
                      'text-green-600'
                    }`}>
                      {item.quantityLeaked}{item.unitDisplay}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${
                        item.quantityLeaked > 100 ? 'text-red-600' :
                        item.quantityLeaked > 50 ? 'text-orange-600' :
                        'text-green-600'
                      }`}>
                        {item.leakagePercent}%
                      </span>
                      {item.quantityLeaked > 100 && (
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {sortedData.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl shadow mt-6">
          <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No materials found for the selected filter</p>
          <p className="text-sm text-gray-400 mt-2">Try adjusting your search criteria</p>
        </div>
      )}

      {/* Alerts Modal */}
      {showAlertsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-red-600" />
                <h2 className="text-2xl font-bold text-gray-800">High Leakage Alerts</h2>
                <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm font-medium">
                  {alertsLoading ? 'Loading...' : `${alertsData.length} Items`}
                </span>
              </div>
              <button 
                onClick={() => setShowAlertsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
              {alertsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-600 ml-4">Loading alerts data...</p>
                </div>
              ) : alertsData.length > 0 ? (
                <div className="space-y-4">
                  {alertsData.map((item, index) => (
                    <div key={item.prescriptionId || index} className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-red-800">{item.materialName}</h3>
                          <p className="text-sm text-red-600">{item.barcode} • {item.medicineName || 'Medicine Name'}</p>
                          
                          {/* Video URL Section */}
                          {item.preparationVideoUrl && (
                            <div className="mt-2 flex items-center gap-2">
                              <button
                                onClick={() => handleVideoPlay(item.preparationVideoUrl)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                              >
                                <Play className="w-3 h-3" />
                                Watch Video
                              </button>
                              
                            </div>
                          )}
                        </div>
                        <div className="text-right ml-4">
                          <span className="bg-red-200 text-red-800 px-3 py-1 rounded-full text-sm font-bold">
                            {item.quantityLeaked}{getUnitDisplay(item.uom)} leaked
                          </span>
                          <p className="text-xs text-red-600 mt-1">
                            {item.leakagePercentage || ((item.quantityLeaked / item.prescribedQuantity) * 100).toFixed(1)}% Leakage
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                        <div>
                          <p className="text-xs text-red-600">Medicine prepared by</p>
                          <p className="font-bold text-red-800">{item.doctorName || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-red-600">Total Weight</p>
                          <p className="font-bold text-red-800">{item.totalWeight}{getUnitDisplay(item.uom)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-red-600">Current Quantity</p>
                          <p className="font-bold text-red-800">{item.currentQuantity}{getUnitDisplay(item.uom)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-red-600">Used</p>
                          <p className="font-bold text-red-800">{item.quantityUsed}{getUnitDisplay(item.uom)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-red-600">Prescribed Qty</p>
                          <p className="font-bold text-red-800">{item.prescriptionQuantity || item.prescribedQuantity}{getUnitDisplay(item.uom)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-red-600">Last Used</p>
                          <p className="font-bold text-red-800">{formatDate(item.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No high leakage alerts</p>
                  <p className="text-sm text-gray-400 mt-2">All materials have acceptable leakage levels</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Floating Alert Notification */}
      {stats.alerts > 0 && (
        <div className="fixed bottom-6 right-6">
          <div className="bg-red-600 text-white px-4 py-3 rounded-lg shadow-lg cursor-pointer hover:bg-red-700 transition-colors animate-pulse"
               onClick={handleAlertsModalOpen}>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              <div>
                <div className="font-semibold">{stats.alerts} High Leakage Alert{stats.alerts > 1 ? 's' : ''}</div>
                <div className="text-xs opacity-90">Materials with leakage above threshold</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeakageDetection;