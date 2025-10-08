import React, { useState, useEffect } from "react";
import config from "/src/config.js";

const API_URL = config.API_URL;

function InventoryOverview() {
  // State for inventory card data
  const [inventoryData, setInventoryData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for vendor performance data
  const [vendorData, setVendorData] = useState(null);
  const [vendorLoading, setVendorLoading] = useState(true);

  // State for order frequency data
  const [orderData, setOrderData] = useState(null);
  const [orderLoading, setOrderLoading] = useState(true);

  const API_PAYLOAD = {
    filter: "month",
  };

  // Fetch inventory data
  const fetchInventoryData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/analytics/stock-summary`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(API_PAYLOAD),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setInventoryData(data.summary);
      } else {
        throw new Error("Stock Summary API reported failure.");
      }
    } catch (err) {
      console.error("Failed to fetch inventory data:", err);
      setError(err.message || "Inventory data failed to load.");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch vendor performance data
  const fetchVendorData = async () => {
    setVendorLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/analytics/vendor-summary`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(API_PAYLOAD),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setVendorData(data);
      }
    } catch (err) {
      console.error("Failed to fetch vendor data:", err);
    } finally {
      setVendorLoading(false);
    }
  };

  // Fetch order frequency data
  const fetchOrderData = async () => {
    setOrderLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/api/analytics/order-frequency-chart`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filter: "day" }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setOrderData(data);
      }
    } catch (err) {
      console.error("Failed to fetch order data:", err);
    } finally {
      setOrderLoading(false);
    }
  };

  // Call all fetch functions on component mount
  useEffect(() => {
    fetchInventoryData();
    fetchVendorData();
    fetchOrderData();
  }, []);

  // Helper to extract and display card values
  const getCardValue = (field) => {
    if (isLoading) return "...";
    if (error) return "N/A";
    const value = inventoryData?.[field];
    return value !== undefined && value !== null ? value : 0;
  };

  const nearExpiryPercentage = getCardValue("nearExpiryPercentage");
  const belowThresholdCount = getCardValue("overThreshold");
  const aboveThresholdCount = getCardValue("aboveThreshold");
  const stockoutsCount = getCardValue("stockOut");

  // Vendor Performance Chart
  const renderVendorChart = () => {
    if (vendorLoading)
      return <div className="text-xs text-gray-400">Loading...</div>;
    if (!vendorData?.data)
      return <div className="text-xs text-gray-400">No data</div>;

    const maxValue = 100;
    return (
      <div className="flex items-end justify-around h-24 gap-2 px-2">
        {vendorData.data.map((vendor, idx) => {
          const priceHeight = (vendor.priceIndex / maxValue) * 100;
          const reliabilityHeight = (vendor.reliabilityScore / maxValue) * 100;

          return (
           <div key={idx} className="flex flex-col items-center flex-1">
  {/* Bar container */}
  <div
    className="w-full flex gap-1 items-end"
    style={{ height: "80px" }}
  >
    <div
      className="flex-1 bg-green-500 rounded-t"
      style={{ height: `${priceHeight}%` }}
    ></div>
    <div
      className="flex-1 bg-blue-500 rounded-t"
      style={{ height: `${reliabilityHeight}%` }}
    ></div>
  </div>

  {/* X-axis / Vendor name */}
  <div className="text-xs text-gray-600 mt-2 text-center">
    {vendor.vendorName}
  </div>
</div>

          );
        })}
      </div>
    );
  };

  // Order Frequency Chart
  const renderOrderChart = () => {
    if (orderLoading)
      return <div className="text-xs text-gray-400">Loading...</div>;
    if (!orderData?.data)
      return <div className="text-xs text-gray-400">No data</div>;

    const maxValue = Math.max(...orderData.data.map((d) => d.y), 500);
    const points = orderData.data
      .map((point, idx) => {
        const x = (idx / (orderData.data.length - 1)) * 100;
        const y = 100 - (point.y / maxValue) * 100;
        return `${x},${y}`;
      })
      .join(" ");

    // Create area path
    const areaPoints = `0,100 ${points} 100,100`;

    return (
      <div className="relative h-24 bg-white rounded">
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          {/* Area fill */}
          <polygon
            points={areaPoints}
            fill="url(#orangeGradient)"
            opacity="0.6"
          />
          {/* Line */}
          <polyline
            points={points}
            fill="none"
            stroke="#fb923c"
            strokeWidth="2"
          />
          {/* Gradient definition */}
          <defs>
            <linearGradient
              id="orangeGradient"
              x1="0%"
              y1="0%"
              x2="0%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#fb923c" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.3" />
            </linearGradient>
          </defs>
        </svg>
        {/* X-axis labels */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-400 px-1">
          <span>8 AM</span>
          <span>4 PM</span>
          <span>12 AM</span>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-start justify-between gap-4 h-full">
        {/* Left Section: Title + Status Cards */}
        <div className="flex flex-col gap-2" style={{ minWidth: "160px" }}>
          <div>
            <div className="text-semibold text-lg font-bold text-black-500">
              Inventory
            </div>
            <div className="text-xs text-gray-500">
              Threshold Range :{" "}
              <span className="font-semibold text-gray-700">80%</span>
            </div>
          </div>

          {/* Status Cards - Compact */}
          <div className="flex flex-col gap-1.5">
            {/* Above Threshold */}
            <div className="relative bg-white rounded-md shadow-sm border border-gray-100 pl-2.5 pr-2.5 py-1.5">
              <div className="absolute left-0 top-0 h-full w-1 rounded-l-md bg-sky-400" />
              <div className="text-[12px] font-semibold text-gray-600">Above Threshold</div>
              <div className="text-lg font-bold text-sky-400 leading-snug">
                {isLoading ? "..." : aboveThresholdCount}
              </div>
            </div>

            {/* Below Threshold */}
            <div className="relative bg-white rounded-md shadow-sm border border-gray-100 pl-2.5 pr-2.5 py-1.5">
              <div className="absolute left-0 top-0 h-full w-1 rounded-l-md bg-red-500" />
              <div className="text-[12px] font-semibold text-gray-600">Below Threshold</div>
              <div className="text-lg font-bold text-red-600 leading-snug">
                {isLoading ? "..." : belowThresholdCount}
              </div>
            </div>

            {/* Stockouts */}
            <div className="relative bg-white rounded-md shadow-sm border border-gray-100 pl-2.5 pr-2.5 py-1.5">
              <div className="absolute left-0 top-0 h-full w-1 rounded-l-md bg-amber-400" />
              <div className="text-[12px] font-semibold text-gray-600">Stockouts</div>
              <div className="text-lg font-bold text-amber-500 leading-snug">
                {isLoading ? "..." : stockoutsCount}
              </div>
            </div>
          </div>
        </div>

        {/* Vendor Performance Chart */}
        <div className="flex-1 flex flex-col mt-2">
          <div className="text-xs font-semibold text-gray-700 mb-1 mt-1.5">
            Vendor Performance
          </div>
          <div className="rounded-lg p-2 pt-3 flex-1 flex flex-col">
            {/* Y-axis labels */}
            <div className="flex text-xs text-gray-400 mb-1">
              <div className="w-8 text-right">100%</div>
            </div>

            <div className="flex-1">{renderVendorChart()}</div>

       

            {/* Legend */}
            <div className="flex gap-3 text-xs justify-center mt-1">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-sm bg-green-500"></div>
                <span className="text-gray-600">Price Index (%)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-sm bg-blue-500"></div>
                <span className="text-gray-600">Reliability (%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Order Frequency Chart */}
      <div className="flex-1 flex flex-col mt-2">
  <div className="text-xs font-semibold text-gray-700 mb-1">
    Order Frequency Chart
  </div>

  <div className="rounded-lg p-2 pt-3 flex-1 flex flex-col">
    {/* Y-axis top label */}
    <div className="text-xs text-gray-400 mb-1">500</div>

    {/* Chart container */}
    <div className="flex-1">
      {renderOrderChart()}
    </div>

    {/* Y-axis bottom label */}
  
  </div>
</div>


        {/* Right Section: Materials & Expiry */}
        <div className="flex flex-col gap-3" style={{ minWidth: "140px" }}>
          <div>
            <div className="text-xs font-semibold text-gray-700 mb-1">
              Raw Materials
            </div>
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="w-2.5 h-3 rounded bg-blue-600 mr-0.5"
                  />
                ))}
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="w-2.5 h-3 rounded bg-blue-200 mr-0.5"
                  />
                ))}
              </div>
              <span className="text-sm font-bold text-gray-700">60%</span>
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-gray-700 mb-1">
              Operational
            </div>
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="w-2.5 h-3 rounded bg-pink-500 mr-0.5"
                  />
                ))}
                {[...Array(2)].map((_, i) => (
                  <div
                    key={i}
                    className="w-2.5 h-3 rounded bg-pink-200 mr-0.5"
                  />
                ))}
              </div>
              <span className="text-sm font-bold text-gray-700">30%</span>
            </div>
          </div>

          <div className="mt-2">
            <div className="text-xs font-semibold text-gray-700 mb-1">
              Expiry Tracking (Raw)
            </div>
            <div>
              <span className="text-red-500 font-bold text-lg">
                {isLoading ? "..." : `${nearExpiryPercentage}%`}
              </span>
              <span className="text-gray-600 text-xs ml-1">near expiry</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InventoryOverview;
