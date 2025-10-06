import React, { useState, useEffect } from 'react';
import config from '/src/config.js';
  
const API_URL = config.API_URL;

const TotalEarningsComponent = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/api/analytics/debit-credit-summary`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            filter: 'month'
          })
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

  if (loading) {
    return (
      <div className="p-6 w-full flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 w-full">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
          Error: {error}
        </div>
      </div>
    );
  }

  const netEarnings = data ? (data.totalReceivables - data.totalPayables).toFixed(2) : 0;

  return (
    <div className="p-6 w-full">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-1">Total Earnings</h2>
        <p className="text-gray-600">Net Earnings : ₹{netEarnings}</p>
      </div>

      {/* Cards Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Total Receivables Card */}
        <div className="bg-white rounded-xl border-2 border-green-200 p-4">
          <div className="text-center mb-4">
            <h3 className="text-green-500 font-medium mb-1">Total Receivables</h3>
            <p className="text-2xl font-bold text-green-500">
              ₹{data?.totalReceivables?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Total Payables Card */}
        <div className="bg-white rounded-xl border-2 border-red-200 p-4">
          <div className="text-center mb-4">
            <h3 className="text-red-400 font-medium mb-1">Total Payables</h3>
            <p className="text-2xl font-bold text-red-400">
              ₹{data?.totalPayables?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Receivable Categories */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h4 className="text-gray-700 font-medium mb-4">Receivable Categories</h4>
          <div className="h-32 bg-gradient-to-t from-green-50 to-green-100 rounded-lg flex items-center justify-center">
            <span className="text-green-400 text-sm">Graph Placeholder</span>
          </div>
        </div>

        {/* Payables Categories */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h4 className="text-gray-700 font-medium mb-4">Payables Categories</h4>
          <div className="h-32 bg-gradient-to-t from-red-50 to-red-100 rounded-lg flex items-center justify-center">
            <span className="text-red-400 text-sm">Graph Placeholder</span>
          </div>
        </div>
      </div>

      {/* Bottom Stats */}
      <div className="rounded-xl p-4 border-2 border-orange-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-700 font-medium">Pending</span>
            <span className="text-xl font-bold text-gray-800">₹1000</span>
          </div>
          
          <div className="bg-purple-100 rounded-lg px-4 py-2 flex items-center justify-between">
            <span className="text-purple-700 font-medium">Consultation</span>
            <span className="text-xl font-bold text-purple-700">₹500</span>
          </div>
          
          <div className="bg-teal-100 rounded-lg px-4 py-2 flex items-center justify-between">
            <span className="text-teal-700 font-medium">Medicine Prep</span>
            <span className="text-xl font-bold text-teal-700">₹500</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TotalEarningsComponent;