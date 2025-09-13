import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import config from "../../config";

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingOrder, setUpdatingOrder] = useState(null);
  const navigate = useNavigate();
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

  const handleMarkAsReceived = async (orderId) => {
    setUpdatingOrder(orderId);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.patch(`${API_URL}/api/vendor/${orderId}/receive`, {
        orderRecieved: true
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (res.data.status === "success") {
        // Update the orders state to reflect the change
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order._id === orderId 
              ? { ...order, orderRecieved: true }
              : order
          )
        );
      } else {
        setError("Failed to mark order as received.");
      }
    } catch (error) {
      setError("Error updating order status.");
    } finally {
      setUpdatingOrder(null);
    }
  };

  const handleAddToRawMaterials = (item) => {
    // Calculate total cost (unitPrice * quantity)
    const totalCost = (parseFloat(item.unitPrice) || 0) * (parseFloat(item.quantity) || 0);
    
    // Create URL search params with the item data
    const params = new URLSearchParams({
      name: item.rawMaterialName || '',
      vendorName: item.vendorName || '',
      vendorPhone: item.vendorId?.phoneNumber || '',
      vendorEmail: item.vendorId?.email || '',
      costPerUnit: totalCost.toString(),
      quantity: item.quantity || '',
      currentQuantity: item.quantity || '', // Set current quantity same as ordered quantity initially
      prefilled: 'true' // Flag to indicate this data is pre-filled
    });

    // Navigate to the raw materials form with pre-filled data
    navigate(`/raw-materials/new?${params.toString()}`);
  };

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
              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    order.orderStatus === "Pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {order.orderStatus}
                </span>
                {!order.orderRecieved && (
                  <button
                    onClick={() => handleMarkAsReceived(order._id)}
                    disabled={updatingOrder === order._id}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      updatingOrder === order._id
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-green-100 hover:bg-green-200 text-green-700 hover:text-green-800"
                    }`}
                  >
                    {updatingOrder === order._id ? "Updating..." : "Mark as Received"}
                  </button>
                )}
              </div>
            </div>
            <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-2 text-gray-700">
              <div>
                <span className="font-semibold">Total Value:</span> ₹{order.totalOrderValue}
              </div>
              <div>
                <span className="font-semibold">Received:</span> 
                <span className={`ml-2 px-2 py-1 rounded text-xs ${
                  order.orderRecieved 
                    ? "bg-green-100 text-green-800" 
                    : "bg-red-100 text-red-800"
                }`}>
                  {order.orderRecieved ? "Yes" : "No"}
                </span>
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
                    <th className="px-4 py-2 text-center text-xs font-bold text-gray-700">Total Cost</th>
                    <th className="px-4 py-2 text-left text-xs font-bold text-gray-700">Vendor Email</th>
                    <th className="px-4 py-2 text-left text-xs font-bold text-gray-700">Vendor Phone</th>
                    <th className="px-4 py-2 text-center text-xs font-bold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {order.items.map((item) => (
                    <tr key={item._id}>
                      <td className="px-4 py-2 text-gray-800">{item.vendorName}</td>
                      <td className="px-4 py-2 text-gray-800">{item.rawMaterialName}</td>
                      <td className="px-4 py-2 text-gray-800 text-center">{item.quantity}</td>
                      <td className="px-4 py-2 text-gray-800 text-center">₹{(parseFloat(item.unitPrice) * parseFloat(item.quantity) || 0).toFixed(2)}</td>
                      <td className="px-4 py-2 text-gray-800">{item.vendorId.email}</td>
                      <td className="px-4 py-2 text-gray-800">{item.vendorId.phoneNumber}</td>
                      <td className="px-4 py-2 text-center">
                        {order.orderRecieved ? (
                          <button
                            onClick={() => handleAddToRawMaterials(item)}
                            className="inline-flex items-center justify-center w-8 h-8 bg-green-100 hover:bg-green-200 text-green-600 hover:text-green-700 rounded-full transition-colors duration-200"
                            title="Add to Raw Materials"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={2}
                              stroke="currentColor"
                              className="w-5 h-5"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 4.5v15m7.5-7.5h-15"
                              />
                            </svg>
                          </button>
                        ) : (
                          <span className="text-gray-400 text-sm">Order not received</span>
                        )}
                      </td>
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