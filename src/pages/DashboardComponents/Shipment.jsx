import React, { useState, useEffect } from "react";
import config from '/src/config.js';

const API_URL = config.API_URL;

function ShipmentOverview() {
  const [shipmentData, setShipmentData] = useState({
    total: 0,
    avgTurnaround: "4h",
    ackReceived: 0,
    awaitingDispatch: 0,
    ackMissing: 0,
    shipmentLost: 0,
    onTimePercentage: 75,
    slaMet: 10,
    slaNotMet: 10,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState("month");

  // Fetch shipment data from API
  useEffect(() => {
    const fetchShipmentData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`${API_URL}/api/analytics/shipment-summary`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            filter: selectedMonth
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.success && data.summary) {
          const summary = data.summary;
          const total = (summary.productsShipped || 0) + 
                       (summary.productsReceived || 0) + 
                       (summary.shipmentsLost || 0) + 
                       (summary.awaitingDispatch || 0);
          
          setShipmentData({
            total: total,
            avgTurnaround: "4h",
            ackReceived: summary.productsReceived || 0,
            awaitingDispatch: summary.awaitingDispatch || 0,
            ackMissing: summary.productsShipped || 0,
            shipmentLost: summary.shipmentsLost || 0,
            onTimePercentage: 75,
            slaMet: 10,
            slaNotMet: 10,
          });
        }
      } catch (err) {
        setError(err.message);
        console.error('Error fetching shipment data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchShipmentData();
  }, [selectedMonth]);

  // Calculate percentages for shipment status donut
  const total =
    shipmentData.ackReceived +
    shipmentData.awaitingDispatch +
    shipmentData.ackMissing +
    shipmentData.shipmentLost;
  const ackReceivedPct =
    total > 0 ? ((shipmentData.ackReceived / total) * 100).toFixed(0) : 0;
  const awaitingDispatchPct =
    total > 0 ? ((shipmentData.awaitingDispatch / total) * 100).toFixed(0) : 0;

  return (
    <div className="h-full flex flex-col">
      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center h-full">
          <div className="text-gray-600 text-sm">Loading shipment data...</div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-800 text-xs">Error: {error}</p>
        </div>
      )}

      {/* Main Content */}
      {!loading && !error && (
        <div className="flex flex-col h-full">
          {/* Header Section */}
          <div className="flex justify-between items-start mb-2">
            <div>
              <h2 className="text-lg font-semibold text-black-500">Shipment</h2>
              <p className="text-xs text-gray-500">
                Total Shipment : {shipmentData.total.toLocaleString()}
              </p>
            </div>
            <div className="border border-gray-200 rounded-lg p-3 shadow-md flex flex-col items-center">
              <p className="text-xs font-semibold text-gray-700 mb-1 text-center">
                Avg Turnaround Time
              </p>
              <p className="text-xs text-gray-600 text-center">
                Med Completion → Delivery:{" "}
                <span className="font-bold text-gray-800">
                  {shipmentData.avgTurnaround || "N/A"}
                </span>
              </p>
            </div>
          </div>

          {/* Main Content Section */}
          <div className="flex gap-4 flex-1">
            {/* Left Side - Status Cards (2x2 Grid) */}
            <div className="flex-1 grid grid-cols-2 gap-2">
              {/* Ack Received */}
              <div className="bg-white border-l-4 border-green-500 rounded-lg p-1 shadow-sm h-[55px] flex flex-col justify-center">
                <p className="text-[12px] text-sm text-gray-600 mb-0">
                  Ack Received
                </p>
                <p className="text-sm font-bold text-gray-800">
                  {shipmentData.ackReceived}
                </p>
              </div>

              {/* Awaiting Dispatch */}
              <div className="bg-white border-l-4 border-orange-500 rounded-lg p-1 shadow-sm h-[55px] flex flex-col justify-center">
                <p className="text-[12px] text-sm text-gray-600 mb-0">
                  Awaiting Dispatch
                </p>
                <p className="text-sm font-bold text-gray-800">
                  {shipmentData.awaitingDispatch}
                </p>
              </div>

              {/* Ack Missing */}
              <div className="bg-white border-l-4 border-yellow-500 rounded-lg p-1 shadow-sm h-[55px] flex flex-col justify-center">
                <p className="text-[12px] text-sm text-gray-600 mb-0">
                  Ack Missing
                </p>
                <p className="text-sm font-bold text-gray-800">
                  {shipmentData.ackMissing}
                </p>
              </div>

              {/* Shipment Lost */}
              <div className="bg-white border-l-4 border-red-500 rounded-lg p-1 shadow-sm h-[55px] flex flex-col justify-center">
                <p className="text-[12px] text-sm text-gray-600 mb-0">
                  Shipment Lost
                </p>
                <p className="text-sm font-bold text-gray-800">
                  {shipmentData.shipmentLost}
                </p>
              </div>
            </div>

            {/* Right Side - Charts Section */}
            <div className="flex-1 flex flex-col">
              {/* Chart Headers */}
              <div className="grid grid-cols-2 gap-4 mb-2">
                <p className="text-[11px] font-semibold text-gray-700 text-center">
                  Shipment Status
                </p>
                <p className="text-[11px] font-semibold text-gray-700 text-center">
                  On-Time Shipping
                </p>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-2 gap-4 flex-1">
                {/* Shipment Status Donut */}
                <div className="flex flex-col items-center group relative">
                  <div className="relative flex items-center justify-center">
                    <svg
                      width="85"
                      height="85"
                      viewBox="0 0 100 100"
                      className="transform -rotate-90"
                    >
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="#22d3ee"
                        strokeWidth="20"
                        strokeDasharray={`${ackReceivedPct * 2.513} 251.3`}
                        strokeDashoffset="0"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="#f97316"
                        strokeWidth="20"
                        strokeDasharray={`${awaitingDispatchPct * 2.513} 251.3`}
                        strokeDashoffset={`-${ackReceivedPct * 2.513}`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-base font-bold text-gray-800">100%</span>
                    </div>
                  </div>

                  {/* Labels shown on hover */}
                  <div className="absolute bottom-[-40px] flex flex-col gap-1 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity duration-200">
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
                <div className="flex flex-col items-center relative">
                  <div className="relative flex items-center justify-center">
                    <svg
                      width="85"
                      height="85"
                      viewBox="0 0 100 100"
                      className="transform -rotate-90"
                    >
                      <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="12" />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="12"
                        strokeDasharray={`${shipmentData.onTimePercentage * 2.513} 251.3`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-base font-bold text-blue-600">{shipmentData.onTimePercentage}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* SLA info row below both graphs */}
              <div className="flex justify-between mt-2 text-[12px] w-full">
                <div className="text-center">
                  <span className="text-green-600 font-semibold">SLA Met: </span>
                  <span className="text-gray-700">{shipmentData.slaMet}</span>
                </div>
                <div className="text-center">
                  <span className="text-red-600 font-semibold">SLA Not-Met: </span>
                  <span className="text-gray-700">{shipmentData.slaNotMet}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ShipmentOverview;