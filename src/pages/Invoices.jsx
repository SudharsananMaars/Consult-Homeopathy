import React, { useState } from "react";
import Layout from "../components/Layout";
import { useNavigate } from 'react-router-dom';
import { FiDownload } from "react-icons/fi";


const Invoices = () => {
    const navigate = useNavigate();

    const [searchQuery, setSearchQuery] = useState("");

    const confirm = () => {
        // Handle the booking confirmation logic here
        navigate('/pay'); // Redirect to the Pay.jsx page
    };

    // Sample data for the table
    const transactions = [
        { id: 1, patientName: "Rita", dateTime: "14 Aug 10:00 AM", paymentId: "id1", service: "Workshop", amount: "Rs.400", method: "GPay", status: "Unpaid", coupons: "no", invoice: "" },
        { id: 2, patientName: "Rita", dateTime: "14 Aug 10:00 AM", paymentId: "id2", service: "Medicine", amount: "Rs.400", method: "GPay", status: "Unpaid", coupons: "no", invoice: "" },
        { id: 3, patientName: "Rita", dateTime: "17 july 11:00 AM", paymentId: "id3", service: "Consultation", amount: "Rs.600", method: "Debit Card", status: "Success", coupons: "no", invoice: "" },
        { id: 4, patientName: "Riya", dateTime: "17 june 6:00 PM", paymentId: "id4", service: "Consultation", amount: "Rs.700", method: "GPay", status: "Success", coupons: "yes", invoice: "" },
       
    ];

    const getStatusColorClass = (status) => {
      switch (status) {
          case "Unpaid":
              return "text-red-400"; // Red for Unpaid
          case "Success":
              return "text-green-400"; // Green for Paid
          default:
              return "text-gray-600"; // Default color
      }
  };

  const getServiceColorClass = (service) => {
    switch (service) {
        case "Consultation":
            return "text-blue-400"; 
        case "Medicine":
            return "text-green-400"; 
        case "Workshop":
            return "text-purple-400";
        default:
            return "text-gray-600"; 
    }
};

    // Filter the transactions based on the search query
    const filteredTransactions = transactions.filter(transaction =>
        transaction.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.dateTime.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.paymentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.amount.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.method.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.status.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div>
            <Layout>
                <div>
                    <p className="font-bold mt-7 mb-7 text-xl px-5">Invoices</p>
                </div>

                {/* Search Input */}
                <div className="mb-4 rounded-md p-4 ">
                    <input
                        type="text"
                        placeholder="Search..."
                        className="sm:w-3/4 md:w-1/2 lg:w-1/4 p-2 border-2 border-gray-400 rounded-md"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="relative overflow-x-auto pt-2 pl-3 shadow-lg">
                    <table className="w-full text-md text-left rtl:text-right text-white-500 dark:text-gray-100">
                        <thead className="text-md text-gray-600 bg-blue-100 dark:bg-blue-200 dark:text-gray-700">
                            <tr>
                                <th scope="col" className="px-3 py-3">S.No</th>
                                <th scope="col" className="px-3 py-3">Patient Name</th>
                                <th scope="col" className="px-3 py-3">Date & Time</th>
                                <th scope="col" className="px-3 py-3">Payment ID</th>
                                <th scope="col" className="px-3 py-3">Service</th>
                                <th scope="col" className="px-3 py-3">Amount</th>
                                <th scope="col" className="px-3 py-3">Method</th>
                                <th scope="col" className="px-3 py-3">Status</th>
                                <th scope="col" className="px-3 py-3">Coupons</th>
                                <th scope="col" className="px-3 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                          {filteredTransactions.length > 0 ? (
                            filteredTransactions.map((transaction, index) => (
                                <tr key={transaction.id} className="bg-white border-b dark:bg-white-200 dark:border-gray-100">
                                    <th scope="row" className="px-6 py-4 font-medium text-gray-600 whitespace-nowrap dark:text-gray-600">
                                        {index + 1}
                                    </th>
                                    <td className="px-4 py-4 text-gray-600 whitespace-nowrap dark:text-gray-600">{transaction.patientName}</td>
                                    <td className="px-4 py-4 text-gray-600 whitespace-nowrap dark:text-gray-600">{transaction.dateTime}</td>
                                    <td className="px-4 py-4 text-gray-600 whitespace-nowrap dark:text-gray-600">{transaction.paymentId}</td>
                                    <td className={`px-4 py-4 whitespace-nowrap ${getServiceColorClass(transaction.service)}`}>{transaction.service}</td>
                                    <td className="px-4 py-4 text-gray-600 whitespace-nowrap dark:text-gray-600">{transaction.amount}</td>
                                    <td className="px-4 py-4 text-gray-600 whitespace-nowrap dark:text-gray-600">{transaction.method}</td>
                                    <td className={`px-4 py-4 whitespace-nowrap ${getStatusColorClass(transaction.status)}`}>{transaction.status}</td>
                                    <td className="px-4 py-4 text-gray-600 whitespace-nowrap dark:text-gray-600">{transaction.coupons}</td>
                                    <td className="px-4 py-4 text-blue-600 whitespace-nowrap dark:text-gray-600">{transaction.invoice}
                                    {transaction.status === "Unpaid" ? (
                                    <button
                                    onClick={confirm}
                                    className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-5 ml-4 rounded-md"
                                    >
                                    Pay
                                    </button>
                                    ) : (
                                        <a href="#" className="flex items-center space-x-1">
                                        <FiDownload className="mr-2" />
                                        <span>Download</span>
                                        </a>
                                    )}
                                    </td>
                                </tr>
                            )) 
                          ) : (
                            <tr>
                              <td colSpan="10" className="px-6 py-4 text-center text-gray-600">No matching Transactions found</td>
                            </tr>
                          )
                        }
                        </tbody>
                    </table>
                </div>
            </Layout>
        </div>
    );
};

export default Invoices;
