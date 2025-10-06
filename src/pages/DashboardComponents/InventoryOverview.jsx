import React, { useState, useEffect } from 'react';
// Assuming config import is needed based on previous context
import config from '/src/config.js'; 

const API_URL = config.API_URL;

function InventoryOverview() {
    // State for inventory card data
    const [inventoryData, setInventoryData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const API_PAYLOAD = {
        "filter": "month" // Same payload as requested
    };

    // Function to fetch the stock summary data
    const fetchInventoryData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_URL}/api/analytics/stock-summary`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(API_PAYLOAD),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                setInventoryData(data.summary);
            } else {
                throw new Error('Stock Summary API reported failure.');
            }
        } catch (err) {
            console.error("Failed to fetch inventory data:", err);
            setError(err.message || "Inventory data failed to load.");
        } finally {
            setIsLoading(false);
        }
    };

    // Call the fetch function on component mount
    useEffect(() => {
        fetchInventoryData();
    }, []);

    // Helper to extract and display card values
    const getCardValue = (field) => {
        if (isLoading) return '...';
        if (error) return 'N/A';
        // The API response has 'aboveThreshold' and 'overThreshold'. 
        // We will use 'aboveThreshold' for "Above Threshold".
        // We will calculate "Below Threshold" based on 'aboveThreshold' and 'overThreshold' if necessary, 
        // or assume 'overThreshold' means "Below Threshold" until clarified.
        // For now, let's assume 'overThreshold' is the value for "Below Threshold" and use 'aboveThreshold' for "Above Threshold".
        
        // stockOut -> Stockouts
        // aboveThreshold -> Above Threshold
        // overThreshold -> Below Threshold (Assuming this is the closest fit)

        const value = inventoryData?.[field];
        return (value !== undefined && value !== null) ? value : 0;
    };
    
    // Near expiry percentage for the bottom right
    const nearExpiryPercentage = getCardValue('nearExpiryPercentage');
    
    // We'll use 'aboveThreshold' for the first card.
    // The second card label is "Below Threshold", we'll use 'overThreshold' from the API for it.
    // The third card label is "Stockouts", we'll use 'stockOut' from the API for it.
    
    // Calculate "Below Threshold" quantity (assuming it's a separate count, mapped to 'overThreshold')
    const belowThresholdCount = getCardValue('overThreshold');
    
    // Calculate Above Threshold quantity
    const aboveThresholdCount = getCardValue('aboveThreshold');

    // Calculate Stockouts quantity
    const stockoutsCount = getCardValue('stockOut');


    return (
        <div className="flex flex-row justify-between w-full gap-8">
            <div>
                <div className="text-gray-800 font-bold text-xl">Inventory</div>
                <div className="text-gray-400">Threshold Range : <span className="font-semibold">80%</span></div>
            </div>
            
            {/* Status Cards Column - Now Dynamic */}
            <div className="flex flex-col gap-3 w-[185px]">
                {/* Above Threshold */}
                <div className="relative flex items-center bg-white rounded-xl shadow px-4 py-3 min-w-[170px]">
                    <div className="absolute left-0 top-0 h-full w-1 rounded-bl-xl rounded-tl-xl bg-sky-400" />
                    <div className="pl-4 flex flex-col">
                        <span className="text-gray-500 text-[15px]">Above Threshold</span>
                        <span className="font-bold text-sky-400 text-xl leading-6">
                            {isLoading ? '...' : aboveThresholdCount}
                        </span>
                    </div>
                </div>
                
                {/* Below Threshold */}
                <div className="relative flex items-center bg-white rounded-xl shadow px-4 py-3 min-w-[170px]">
                    <div className="absolute left-0 top-0 h-full w-1 rounded-bl-xl rounded-tl-xl bg-red-500" />
                    <div className="pl-4 flex flex-col">
                        <span className="text-gray-500 text-[15px]">Below Threshold</span>
                        <span className="font-bold text-red-600 text-xl leading-6">
                            {isLoading ? '...' : belowThresholdCount}
                        </span>
                    </div>
                </div>
                
                {/* Stockouts */}
                <div className="relative flex items-center bg-white rounded-xl shadow px-4 py-3 min-w-[170px]">
                    <div className="absolute left-0 top-0 h-full w-1 rounded-bl-xl rounded-tl-xl bg-amber-400" />
                    <div className="pl-4 flex flex-col">
                        <span className="text-gray-500 text-[15px]">Stockouts</span>
                        <span className="font-bold text-amber-500 text-xl leading-6">
                            {isLoading ? '...' : stockoutsCount}
                        </span>
                    </div>
                </div>
            </div>

            {/* Middle Section (Vendor/Orders) - Unchanged */}
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

            {/* Right Section (Materials/Expiry) - Expiry Dynamic */}
            <div className="flex flex-col justify-between w-1/4 ml-4">
                <div>
                    <div className="text-gray-700 font-semibold">Raw Materials</div>
                    {/* Raw Materials Visualization (Static) */}
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
                    {/* Operational Visualization (Static) */}
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
                
                {/* Expiry Tracking - Now Dynamic */}
                <div className="mt-8">
                    <div className="text-gray-600 font-semibold">Expiry Tracking (Raw)</div>
                    <div>
                        <span className="text-red-500 font-bold text-lg">
                            {isLoading ? '...' : `${nearExpiryPercentage}%`}
                        </span>
                        <span className="text-gray-700 ml-2">near expiry</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default InventoryOverview;