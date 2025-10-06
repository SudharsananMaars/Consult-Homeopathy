import React, { useState, useEffect } from 'react';
import config from '/src/config.js';

const API_URL = config.API_URL;

function ShipmentOverview() {
  const [shipmentData, setShipmentData] = useState({
    total: 0,
    avgTurnaround: '4h',
    ackReceived: 0,
    awaitingDispatch: 0,
    ackMissing: 0,
    shipmentLost: 0,
    onTimePercentage: 75,
    slaMet: 10,
    slaNotMet: 10
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchShipmentData = async () => {
      try {
        setLoading(true);
        
        // Fetch shipment summary
        const summaryResponse = await fetch(`${API_URL}/api/analytics/shipment-summary`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ filter: 'month' }),
        });

        if (!summaryResponse.ok) {
          throw new Error('Failed to fetch shipment data');
        }

        const summaryData = await summaryResponse.json();
        
        // Fetch TAT data
        const tatResponse = await fetch(`${API_URL}/api/analytics/TAT`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ filter: 'month' }),
        });

        let avgTurnaround = '4h'; // Default value
        if (tatResponse.ok) {
          const tatData = await tatResponse.json();
          if (tatData.data && tatData.data.preparationToShipment && tatData.data.preparationToShipment.overall) {
            avgTurnaround = tatData.data.preparationToShipment.overall.averageFormatted || '4h';
          }
        }
        
        if (summaryData.success && summaryData.summary) {
          setShipmentData(prev => ({
            ...prev,
            ackReceived: summaryData.summary.productsReceived || 0,
            awaitingDispatch: summaryData.summary.awaitingDispatch || 0,
            shipmentLost: summaryData.summary.shipmentsLost || 0,
            ackMissing: 0, // Not provided in API response yet
            avgTurnaround: avgTurnaround,
            total: (summaryData.summary.productsShipped || 0) + 
                   (summaryData.summary.productsReceived || 0) + 
                   (summaryData.summary.shipmentsLost || 0) + 
                   (summaryData.summary.awaitingDispatch || 0)
          }));
        }
      } catch (err) {
        setError(err.message);
        console.error('Error fetching shipment data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchShipmentData();
  }, []);

  // Calculate percentages for shipment status donut
  const total = shipmentData.ackReceived + shipmentData.awaitingDispatch + 
                shipmentData.ackMissing + shipmentData.shipmentLost;
  const ackReceivedPct = total > 0 ? (shipmentData.ackReceived / total * 100).toFixed(0) : 0;
  const awaitingDispatchPct = total > 0 ? (shipmentData.awaitingDispatch / total * 100).toFixed(0) : 0;

  return (
    <div className="h-full flex flex-col">
      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-600">Loading shipment data...</div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-800 text-sm">Error: {error}</p>
        </div>
      )}

      {/* Main Content */}
      {!loading && !error && (
        <>
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Shipment</h2>
              <p className="text-sm text-gray-500">Total Shipment : {shipmentData.total.toLocaleString()}</p>
            </div>
            <div className="bg-gray-50 rounded-lg px-4 py-2">
              <p className="text-xs text-gray-600 font-medium">Avg Turnaround Time</p>
              <p className="text-sm text-gray-700">Med Completion → Delivery : <span className="font-semibold">{shipmentData.avgTurnaround}</span></p>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex gap-4 flex-1">
            {/* Left Side - Status Cards */}
            <div className="flex-1 grid grid-cols-2 gap-3">
              <div className="bg-white border-l-4 border-green-500 rounded-lg p-3 shadow-sm">
                <p className="text-xs text-gray-600 mb-1">Ack Received</p>
                <p className="text-2xl font-bold text-gray-800">{shipmentData.ackReceived}</p>
              </div>
              <div className="bg-white border-l-4 border-orange-500 rounded-lg p-3 shadow-sm">
                <p className="text-xs text-gray-600 mb-1">Awaiting Dispatch</p>
                <p className="text-2xl font-bold text-gray-800">{shipmentData.awaitingDispatch}</p>
              </div>
              <div className="bg-white border-l-4 border-yellow-500 rounded-lg p-3 shadow-sm">
                <p className="text-xs text-gray-600 mb-1">Ack Missing</p>
                <p className="text-2xl font-bold text-gray-800">{shipmentData.ackMissing}</p>
              </div>
              <div className="bg-white border-l-4 border-red-500 rounded-lg p-3 shadow-sm">
                <p className="text-xs text-gray-600 mb-1">Shipment Lost</p>
                <p className="text-2xl font-bold text-gray-800">{shipmentData.shipmentLost}</p>
              </div>
            </div>

            {/* Right Side - Charts */}
            <div className="flex-1 grid grid-cols-2 gap-4">
              {/* Shipment Status Donut */}
              <div className="flex flex-col">
                <p className="text-xs font-semibold text-gray-700 mb-2">Shipment Status</p>
                <div className="relative flex-1 flex items-center justify-center">
                  <svg width="100" height="100" viewBox="0 0 100 100" className="transform -rotate-90">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#22d3ee" strokeWidth="20" 
                            strokeDasharray={`${ackReceivedPct * 2.513} 251.3`} strokeDashoffset="0"/>
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#f97316" strokeWidth="20" 
                            strokeDasharray={`${awaitingDispatchPct * 2.513} 251.3`} 
                            strokeDashoffset={`-${ackReceivedPct * 2.513}`}/>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-gray-800">100%</span>
                  </div>
                </div>
                <div className="flex gap-3 text-xs mt-2">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                    <span className="text-gray-600">{ackReceivedPct}% Received</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                    <span className="text-gray-600">{awaitingDispatchPct}% Pending</span>
                  </div>
                </div>
              </div>

              {/* On-Time Shipping */}
              <div className="flex flex-col">
                <p className="text-xs font-semibold text-gray-700 mb-2">On-Time Shipping</p>
                <div className="relative flex-1 flex items-center justify-center">
                  <svg width="100" height="100" viewBox="0 0 100 100" className="transform -rotate-90">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="12"/>
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#3b82f6" strokeWidth="12" 
                            strokeDasharray={`${shipmentData.onTimePercentage * 2.513} 251.3`}
                            strokeLinecap="round"/>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-blue-600">{shipmentData.onTimePercentage}%</span>
                  </div>
                </div>
                <p className="text-xs text-center text-gray-600 mt-2">SLA Adherence</p>
                <div className="flex justify-center gap-4 text-xs mt-1">
                  <div>
                    <span className="text-green-600 font-semibold">SLA Met : </span>
                    <span className="text-gray-700">{shipmentData.slaMet}</span>
                  </div>
                  <div>
                    <span className="text-red-600 font-semibold">SLA Not-Met : </span>
                    <span className="text-gray-700">{shipmentData.slaNotMet}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default ShipmentOverview;