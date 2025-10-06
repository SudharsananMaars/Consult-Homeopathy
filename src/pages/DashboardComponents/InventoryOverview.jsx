import React from 'react';

function InventoryOverview() {
  return (
    <div className="flex flex-row justify-between w-full gap-8">
         <div>
          <div className="text-gray-800 font-bold text-xl">Inventory</div>
          <div className="text-gray-400">Threshold Range : <span className="font-semibold">80%</span></div>
        </div>
      {/* Status Cards Column */}
      <div className="flex flex-col gap-3 w-[185px]">
        {/* Above Threshold */}
        <div className="relative flex items-center bg-white rounded-xl shadow px-4 py-3 min-w-[170px]">
          <div className="absolute left-0 top-0 h-full w-1 rounded-bl-xl rounded-tl-xl bg-sky-400" />
          <div className="pl-4 flex flex-col">
            <span className="text-gray-500 text-[15px]">Above Threshold</span>
            <span className="font-bold text-sky-400 text-xl leading-6">120</span>
          </div>
        </div>
        {/* Below Threshold */}
        <div className="relative flex items-center bg-white rounded-xl shadow px-4 py-3 min-w-[170px]">
          <div className="absolute left-0 top-0 h-full w-1 rounded-bl-xl rounded-tl-xl bg-red-500" />
          <div className="pl-4 flex flex-col">
            <span className="text-gray-500 text-[15px]">Below Threshold</span>
            <span className="font-bold text-red-600 text-xl leading-6">18</span>
          </div>
        </div>
        {/* Stockouts */}
        <div className="relative flex items-center bg-white rounded-xl shadow px-4 py-3 min-w-[170px]">
          <div className="absolute left-0 top-0 h-full w-1 rounded-bl-xl rounded-tl-xl bg-amber-400" />
          <div className="pl-4 flex flex-col">
            <span className="text-gray-500 text-[15px]">Stockouts</span>
            <span className="font-bold text-amber-500 text-xl leading-6">5</span>
          </div>
        </div>
      </div>

      {/* Middle Section (Vendor/Orders) */}
      <div className="flex flex-col justify-between flex-1 gap-6">
        <div>
          <div className="text-gray-600 font-semibold mb-1">Vendor Performance</div>
          <div className="h-36 flex items-center justify-center bg-gray-50 rounded-lg text-gray-300">
            [Bar Chart]
          </div>
        </div>
        <div>
          <div className="text-gray-600 font-semibold mb-1">Order Frequency Chart</div>
          <div className="h-36 flex items-center justify-center bg-gray-50 rounded-lg text-gray-300">
            [Area Chart]
          </div>
        </div>
      </div>

      {/* Right Section (Materials/Expiry) */}
      <div className="flex flex-col justify-between w-1/4 ml-4">
        <div>
          <div className="text-gray-700 font-semibold">Raw Materials</div>
          <div className="flex items-center mb-2">
            <div className="flex">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="w-4 h-4 rounded bg-blue-700 mr-1" />
              ))}
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-4 h-4 rounded bg-blue-200 mr-1" />
              ))}
            </div>
            <span className="ml-3 text-gray-600 text-lg font-semibold">60%</span>
          </div>
          <div className="text-gray-700 font-semibold mt-2">Operational</div>
          <div className="flex items-center">
            <div className="flex">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="w-4 h-4 rounded bg-pink-500 mr-1" />
              ))}
              {[...Array(2)].map((_, i) => (
                <div key={i} className="w-4 h-4 rounded bg-pink-200 mr-1" />
              ))}
            </div>
            <span className="ml-3 text-gray-600 text-lg font-semibold">30%</span>
          </div>
        </div>
        <div className="mt-8">
          <div className="text-gray-600 font-semibold">Expiry Tracking (Raw)</div>
          <div>
            <span className="text-red-500 font-bold text-lg">12%</span>
            <span className="text-gray-700 ml-2">near expiry</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InventoryOverview;
