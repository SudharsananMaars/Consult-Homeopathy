import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import config from "/src/config.js";

const API_URL = config.API_URL;

const TotalEarningsComponent = ({ filter = 'month' }) => {
  const [data, setData] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [pendingData, setPendingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch debit-credit summary
        const summaryResponse = await fetch(
          `${API_URL}/api/analytics/debit-credit-summary`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              filter: filter,
            }),
          }
        );

        if (!summaryResponse.ok) {
          throw new Error("Failed to fetch summary data");
        }

        const summaryResult = await summaryResponse.json();

        if (!summaryResult.success) {
          throw new Error("API returned unsuccessful response for summary");
        }

        setData(summaryResult.data);

        // Fetch chart data
        const chartResponse = await fetch(
          `${API_URL}/api/analytics/dc-chart-data`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              filter: filter,
            }),
          }
        );

        if (!chartResponse.ok) {
          throw new Error("Failed to fetch chart data");
        }

        const chartResult = await chartResponse.json();

        if (!chartResult.success) {
          throw new Error("API returned unsuccessful response for chart data");
        }

        setChartData(chartResult.data);

        // Fetch pending payments data
        const pendingResponse = await fetch(
          `${API_URL}/api/analytics/pending-payments`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!pendingResponse.ok) {
          throw new Error("Failed to fetch pending payments data");
        }

        const pendingResult = await pendingResponse.json();

        if (!pendingResult.success) {
          throw new Error("API returned unsuccessful response for pending payments");
        }

        setPendingData(pendingResult.data);
      } catch (err) {
        setError(err.message);
        console.error("API Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filter]);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
          Error: {error}
        </div>
      </div>
    );
  }

  const netEarnings = data
    ? (data.totalReceivables - data.totalPayables).toFixed(2)
    : 0;

  // Transform API data for receivables chart
  const receivableData =
    chartData?.receivablesByCategory?.map((item) => ({
      category: item.x,
      amount: item.y,
    })) || [];

  // Transform API data for payables chart
  const payableData =
    chartData?.payablesByCategory?.map((item) => ({
      category: item.x,
      amount: item.y,
    })) || [];

  return (
    <div className="w-full h-full flex flex-col overflow-auto pb-0">
      {/* Header - Fixed height */}
      <div className="mb-2 flex-shrink-0">
        <h2 className="text-lg font-semibold text-black-500">Total Earnings</h2>
        <p className="text-xs text-gray-600">Net Earnings : ₹{netEarnings}</p>
      </div>

      {/* Cards Row - Fixed height */}
      <div className="grid grid-cols-2 gap-2 mb-2 flex-shrink-0">
        {/* Total Receivables Card */}
        <div className="bg-white rounded-lg border-2 border-green-200 p-2 text-center">
          <h3 className="text-green-500 font-medium text-xs">
            Total Receivables
          </h3>
          <p className="text-lg font-bold text-green-500">
            ₹
            {data?.totalReceivables?.toLocaleString("en-IN", {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}
          </p>
        </div>

        {/* Total Payables Card */}
        <div className="bg-white rounded-lg border-2 border-red-200 p-2 text-center">
          <h3 className="text-red-400 font-medium text-xs">Total Payables</h3>
          <p className="text-lg font-bold text-red-400">
            ₹
            {data?.totalPayables?.toLocaleString("en-IN", {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}
          </p>
        </div>
      </div>

      {/* Charts Row - Flexible height */}
      <div
        className="grid grid-cols-2 gap-2 mb-2 flex-shrink-0"
        style={{ height: "125px" }}
      >
        {/* Receivable Categories */}
        <div className="bg-white rounded-lg border border-gray-200 p-2 overflow-hidden">
          <h4 className="text-black-500 font-semibold text-[12px] mb-1">
            Receivable Categories
          </h4>
          <ResponsiveContainer width="100%" height="85%">
            <AreaChart
              data={receivableData}
              margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient
                  id="colorReceivable"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#86efac" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#86efac" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#d1d5db"
                vertical={false}
              />
              <XAxis
                dataKey="category"
                tick={{ fontSize: 7 }}
                tickLine={false}
                axisLine={false}
                interval={0}
              />
              <YAxis tick={{ fontSize: 7 }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ fontSize: 9, padding: "4px 8px" }}
                formatter={(value) => `₹${value}`}
              />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="#22c55e"
                strokeWidth={2}
                fill="url(#colorReceivable)"
                dot={{ r: 3, fill: "#22c55e" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Payables Categories */}
        <div className="bg-white rounded-lg border border-gray-200 p-2 overflow-hidden">
          <h4 className="text-black-500 font-semibold text-[12px] mb-1">
            Payables Categories
          </h4>
          <ResponsiveContainer width="100%" height="85%">
            <AreaChart
              data={payableData}
              margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorPayable" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#fca5a5" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#fca5a5" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#d1d5db"
                vertical={false}
              />
              <XAxis
                dataKey="category"
                tick={{ fontSize: 7 }}
                tickLine={false}
                axisLine={false}
                interval={0}
              />
              <YAxis tick={{ fontSize: 7 }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ fontSize: 9, padding: "4px 8px" }}
                formatter={(value) => `₹${value}`}
              />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="#f87171"
                strokeWidth={2}
                fill="url(#colorPayable)"
                dot={{ r: 3, fill: "#f87171" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Stats - Fixed height */}
      <div className="rounded-lg p-2 border-2 border-orange-200 flex-shrink-0">
        <div className="flex items-center gap-60">
          {/* Pending */}
          <div className="flex items-center gap-1">
           <span className="text-gray-700 font-semibold text-[12px]">
              Pending
            </span>
            <span>:</span>
            <span className="text-sm font-bold text-gray-800">
              ₹{pendingData?.totalPendingCost?.toLocaleString("en-IN", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }) || 0}
            </span>
          </div>

          {/* Consultation Box */}
          <div className="flex items-center gap-1 border-2 border-purple-200 rounded px-2 py-1">
            <span className="text-purple-700 font-semibold text-[12px]">
              Consultation
            </span>
            <span>:</span>
            <span className="text-sm font-bold text-purple-700">
              ₹{pendingData?.totalUnpaidAppointments?.toLocaleString("en-IN", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }) || 0}
            </span>
          </div>

          {/* Medicine Prep Box */}
          <div className="inline-flex items-center gap-1 border-2 border-teal-200 rounded px-3 py-1 w-40">
            <span className="text-teal-700 font-semibold text-[12px]">
              Medicine Prep
            </span>
            <span>:</span>
            <span className="text-sm font-bold text-teal-700">
              ₹{pendingData?.totalUnpaidPrescriptions?.toLocaleString("en-IN", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }) || 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TotalEarningsComponent;