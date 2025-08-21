import React, { useEffect, useState } from "react";
import axios from "axios";
import config from "../../config";

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const API_URL = config.API_URL;

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/vendor/get-all-orders`);
        if (res.data.status === "success") {
          setOrders(res.data.data.orders);
        } else {
          setError("Failed to fetch orders.");
        }
      } catch {
        setError("Error fetching orders.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <span className="text-gray-500 text-xl animate-pulse">Loading...</span>
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center h-64">
        <span className="text-red-600 text-xl">{error}</span>
      </div>
    );

  if (!orders.length)
    return (
      <div className="flex items-center justify-center h-64">
        <span className="text-gray-500 text-xl">No orders found.</span>
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-semibold mb-8 text-center text-indigo-700">Order History</h2>
      <div className="space-y-8">
        {orders.map((order) => (
          <div
            key={order._id}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-shadow"
          >
            <div className="flex flex-wrap items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-indigo-800">Order #{order.orderNumber}</h3>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  order.orderStatus === "Pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-green-100 text-green-800"
                }`}
              >
                {order.orderStatus}
              </span>
            </div>
            <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-2 text-gray-700">
              <div>
                <span className="font-semibold">Total Value:</span> ₹{order.totalOrderValue}
              </div>
              <div>
                <span className="font-semibold">Received:</span> {order.orderRecieved ? "Yes" : "No"}
              </div>
              <div>
                <span className="font-semibold">Created At:</span> {new Date(order.createdAt).toLocaleString()}
              </div>
            </div>
            <div className="overflow-x-auto border rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-bold text-gray-700">Vendor Name</th>
                    <th className="px-4 py-2 text-left text-xs font-bold text-gray-700">Raw Material</th>
                    <th className="px-4 py-2 text-center text-xs font-bold text-gray-700">Quantity</th>
                    <th className="px-4 py-2 text-center text-xs font-bold text-gray-700">Unit Price</th>
                    <th className="px-4 py-2 text-left text-xs font-bold text-gray-700">Vendor Email</th>
                    <th className="px-4 py-2 text-left text-xs font-bold text-gray-700">Vendor Phone</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {order.items.map((item) => (
                    <tr key={item._id}>
                      <td className="px-4 py-2 text-gray-800">{item.vendorName}</td>
                      <td className="px-4 py-2 text-gray-800">{item.rawMaterialName}</td>
                      <td className="px-4 py-2 text-gray-800 text-center">{item.quantity}</td>
                      <td className="px-4 py-2 text-gray-800 text-center">₹{item.unitPrice}</td>
                      <td className="px-4 py-2 text-gray-800">{item.vendorId.email}</td>
                      <td className="px-4 py-2 text-gray-800">{item.vendorId.phoneNumber}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderHistory;
