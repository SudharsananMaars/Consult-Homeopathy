import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Mock config - replace with your actual config
const API_URL = '';

const TotalEarningsComponent = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      // Mock data for demonstration
      if (!API_URL) {
        setTimeout(() => {
          setData({
            totalReceivables: 20000,
            totalPayables: 10000
          });
          setLoading(false);
        }, 500);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/api/analytics/debit-credit-summary`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filter: 'month' })
        });

        if (!response.ok) throw new Error('Failed to fetch data');
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

  // Mock data for charts
  const receivablesData = [
    { category: 'Booking fee', value: 2000 },
    { category: 'Consultation fee', value: 3500 },
    { category: 'medicine prep', value: 2800 },
    { category: 'Shipment fee', value: 1800 },
    { category: 'Miscellaneous', value: 900 }
  ];

  const payablesData = [
    { category: 'Vendor', value: 3200 },
    { category: 'Staff', value: 3800 },
    { category: 'Logistics', value: 2200 },
    { category: 'Miscellaneous', value: 800 }
  ];

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 h-full flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 h-full">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600 text-sm">
          Error: {error}
        </div>
      </div>
    );
  }

  const netEarnings = data ? (data.totalReceivables - data.totalPayables) : 0;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 h-full flex flex-col">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-1">Total Earnings</h2>
        <p className="text-sm text-gray-600">
          Net Earnings : <span className="font-semibold text-gray-800">₹{netEarnings.toLocaleString('en-IN')}</span>
        </p>
      </div>

      <div className="flex-1 flex flex-col gap-4">
        {/* Cards Row */}
        <div className="grid grid-cols-2 gap-4">
          {/* Total Receivables Card */}
          <div className="border-2 border-green-200 rounded-xl p-4 bg-green-50">
            <div className="text-center">
              <h3 className="text-green-600 font-medium text-sm mb-1">Total Receivables</h3>
              <p className="text-2xl font-bold text-green-600">
                ₹{data?.totalReceivables?.toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          {/* Total Payables Card */}
          <div className="border-2 border-red-200 rounded-xl p-4 bg-red-50">
            <div className="text-center">
              <h3 className="text-red-500 font-medium text-sm mb-1">Total Payables</h3>
              <p className="text-2xl font-bold text-red-500">
                ₹{data?.totalPayables?.toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-2 gap-4 flex-1">
          {/* Receivable Categories */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h4 className="text-gray-700 font-medium mb-3 text-sm">Receivable Categories</h4>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={receivablesData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorReceivables" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.05}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="category" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 9 }} />
                  <Tooltip 
                    contentStyle={{ fontSize: '11px', borderRadius: '6px' }}
                    formatter={(value) => `₹${value}`}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    fill="url(#colorReceivables)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Payables Categories */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h4 className="text-gray-700 font-medium mb-3 text-sm">Payables Categories</h4>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={payablesData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorPayables" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0.05}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="category" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 9 }} />
                  <Tooltip 
                    contentStyle={{ fontSize: '11px', borderRadius: '6px' }}
                    formatter={(value) => `₹${value}`}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#ef4444" 
                    strokeWidth={2}
                    fill="url(#colorPayables)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="rounded-xl p-4 border-2 border-orange-200 bg-orange-50">
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-700 font-medium text-sm">Pending</span>
              <span className="text-xl font-bold text-gray-800">₹1000</span>
            </div>
            
            <div className="bg-purple-100 rounded-lg px-4 py-2 flex items-center justify-between border border-purple-200">
              <span className="text-purple-700 font-medium text-sm">Consultation</span>
              <span className="text-xl font-bold text-purple-700">₹500</span>
            </div>
            
            <div className="bg-teal-100 rounded-lg px-4 py-2 flex items-center justify-between border border-teal-200">
              <span className="text-teal-700 font-medium text-sm">Medicine Prep</span>
              <span className="text-xl font-bold text-teal-700">₹500</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TotalEarningsComponent;