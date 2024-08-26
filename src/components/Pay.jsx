// PaymentOptions.js

import React from 'react';


const Pay = () => {
    return (
        <div className="p-4 max-w-screen-lg mx-auto">
            <h1 className="text-2xl font-bold text-center mb-6">Select Your Payment Method</h1>
            <div className="flex flex-col lg:flex-row lg:justify-around gap-4">
                <div className="flex-1 bg-white border rounded-lg shadow-md p-4 flex flex-col items-center">
                    <h2 className="text-xl font-semibold mb-2">Credit/Debit Card</h2>
                    <img src="/path/to/credit-card-icon.png" alt="Credit Card" className="w-16 h-16 mb-4" />
                    <p className="text-gray-600 mb-4">Pay securely with your credit or debit card.</p>
                    <button className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700">
                        Choose
                    </button>
                </div>
                <div className="flex-1 bg-white border rounded-lg shadow-md p-4 flex flex-col items-center">
                    <h2 className="text-xl font-semibold mb-2">PayPal</h2>
                    <img src="/path/to/paypal-icon.png" alt="PayPal" className="w-16 h-16 mb-4" />
                    <p className="text-gray-600 mb-4">Use your PayPal account for a quick and easy payment.</p>
                    <button className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700">
                        Choose
                    </button>
                </div>
                <div className="flex-1 bg-white border rounded-lg shadow-md p-4 flex flex-col items-center">
                    <h2 className="text-xl font-semibold mb-2">Bank Transfer</h2>
                    <img src="/path/to/bank-transfer-icon.png" alt="Bank Transfer" className="w-16 h-16 mb-4" />
                    <p className="text-gray-600 mb-4">Transfer funds directly from your bank account.</p>
                    <button className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700">
                        Choose
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Pay;
