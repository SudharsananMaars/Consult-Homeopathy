// PaymentOptions.js

import React from 'react';
import { FaCreditCard, FaPaypal,FaGooglePay, FaAmazonPay } from 'react-icons/fa';
import { SiPhonepe, SiSamsungpay } from "react-icons/si";


const Pay = () => {
    return (
        <div className="p-6 bg-white rounded-lg shadow-md mt-8">
            <h3 className="text-xl font-bold mb-8">Select Payment Options</h3>
            <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-3 gap-4">
                <button className="flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                    <FaCreditCard className="mr-2" />
                    Pay with Credit Card
                </button>
                <button className="flex items-center px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600">
                    <FaPaypal className="mr-2" />
                    Pay with PayPal
                </button>
    
                <button className="flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                    <FaGooglePay className="mr-2" />
                    Pay with Google Pay
                </button>
                <button className="flex items-center px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600">
                    <SiPhonepe className="mr-2" />
                    Pay with PhonePe
                </button>
                <button className="flex items-center px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800">
                    <SiSamsungpay className="mr-2" />
                    Pay with Samsung Pay
                </button>
                <button className="flex items-center px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900">
                    <FaAmazonPay className="mr-2" />
                    Pay with Amazon Pay
                </button>
                
            </div>
        </div>
    );
};

export default Pay;
