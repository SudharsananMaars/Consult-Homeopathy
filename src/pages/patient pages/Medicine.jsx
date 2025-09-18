import React, { useState, useEffect } from "react";
import { EyeIcon, XMarkIcon } from "@heroicons/react/24/outline";
import Layout from "../../components/patient components/Layout";
import axios from "axios";
import config from "../../config";

const API_URL = config.API_URL;
const userId = localStorage.getItem("userId");

const Medicine = () => {
  const [shippedData, setShippedData] = useState([]);
  const [receivedData, setReceivedData] = useState([]);
  const [activeTab, setActiveTab] = useState("shipped");
  const [showModal, setShowModal] = useState(false);
  const [modalItems, setModalItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const handleTabSwitch = (tab) => setActiveTab(tab);

  const openItemsModal = (items) => {
    setModalItems(items);
    setShowModal(true);
  };

  const closeItemsModal = () => {
    setShowModal(false);
    setModalItems([]);
  };

  const markAsReceived = async (prescriptionId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.patch(
        `${API_URL}/api/patient/prescriptions/${prescriptionId}/receive`,
        { isProductReceived: true },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchDeliveryStatus();
    } catch (error) {
      console.error("Failed to mark product as received:", error);
      throw error;
    }
  };

  const fetchDeliveryStatus = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        `${API_URL}/api/doctor/prescriptions/delivery-status/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const shipped = response.data.filter(
        (item) => item.isProductReceived === false || item.isProductReceived === null 
      );
      console.log(shipped);
      const received = response.data.filter(
        (item) => item.isProductReceived === true
      );

      setShippedData(shipped);
      setReceivedData(received);
    } catch (error) {
      console.error("Error fetching delivery status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveryStatus();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-300"></div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        <h1 className="font-bold text-2xl sm: pt-4">Medicine Shipments</h1>

        <div className="flex space-x-6 border-b border-gray-300 my-6">
          {[
            { key: "shipped", label: "Shipped Medicines" },
            { key: "received", label: "Received Medicines" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => handleTabSwitch(key)}
              className={`pb-2 transition font-medium border-b-2 text-[0.9rem] ${
                activeTab === key
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-blue-600 hover:border-blue-300"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          {activeTab === "shipped" && (
            <ShipmentTable
              data={shippedData}
              showActions
              onMarkReceived={markAsReceived}
              onOpenItems={openItemsModal}
            />
          )}

          {activeTab === "received" && (
            <ShipmentTable
              data={receivedData}
              showActions={false}
              onOpenItems={openItemsModal}
            />
          )}
        </div>
      </div>

      {showModal && <ItemsModal items={modalItems} onClose={closeItemsModal} />}
    </Layout>
  );
};

// Update the ShipmentTable component - replace the existing one with this:

const ShipmentTable = ({
  data,
  showActions = false,
  onMarkReceived,
  onOpenItems,
}) => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden">
    <table className="w-full overflow-hidden rounded-lg">
      <thead>
        <tr className="border-b border-blue-200">
          <th className="bg-gray-100 text-center p-4 font-bold text-gray-700 text-sm">S.No</th>
          <th className="bg-white text-center p-4 font-bold text-gray-700 text-sm">Tracking ID</th>
          <th className="bg-gray-100 text-center p-4 font-bold text-gray-700 text-sm">Shipping Partner</th>
          <th className="bg-white text-center p-4 font-bold text-gray-700 text-sm">Shipped Date</th>
          <th className="bg-gray-100 text-center p-4 font-bold text-gray-700 text-sm">Arrival Date</th>
          <th className="bg-white text-center p-4 font-bold text-gray-700 text-sm">Status</th>
          <th className="bg-gray-100 text-center p-4 font-bold text-gray-700 text-sm">Items</th>
          {showActions && <th className="bg-white text-center p-4 font-bold text-gray-700 text-sm">Actions</th>}
        </tr>
      </thead>
      <tbody>
        {data.length === 0 && (
          <tr>
            <td
              colSpan={showActions ? 8 : 7}
              className="bg-white text-center text-gray-500 py-6"
            >
              No records found.
            </td>
          </tr>
        )}

        {data.map((c, idx) => (
          <tr
            key={c.id}
            className="border-b border-blue-200"
          >
            <td className="bg-gray-100 p-4 font-medium text-gray-900 text-center">{idx + 1}</td>
            <td className="bg-white p-4 text-gray-600 text-center font-semibold">{c.trackingId}</td>
            <td className="bg-gray-100 p-4 text-gray-600 text-center font-semibold">
              {c.packagingDetails && c.packagingDetails.length > 0 
                ? c.packagingDetails[0].deliveryPartner 
                : 'N/A'}
            </td>
            <td className="bg-white p-4 text-gray-600 text-center">{formatDate(c.shippedDate)}</td>
            <td className="bg-gray-100 p-4 text-gray-600 text-center font-semibold">
              {c.packagingDetails && c.packagingDetails.length > 0 
                ? formatDate(c.packagingDetails[0].arrivalDate) 
                : 'N/A'}
            </td>
            <td className="bg-white p-4 text-center">
              <span
                className={`px-2 py-1 rounded-md text-xs font-medium ${
                  c.isProductReceived === true
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {c.isProductReceived === true ? "Received" : "Shipped"}
              </span>
            </td>

            <td className="bg-gray-100 p-4 text-center">
              <button
                onClick={() => onOpenItems(c.items)}
                className="py-1 px-2 rounded text-xs font-medium bg-blue-600 text-white hover:bg-blue-500 transition"
                title="View items"
              >
                View
              </button>
            </td>
            {showActions && (
              <td className="bg-white p-4 text-center">
                <button
                  onClick={() => onMarkReceived && onMarkReceived(c.id)}
                  className="px-3 py-1 rounded bg-emerald-600 text-white text-xs hover:bg-emerald-500"
                  title="Mark as Received"
                >
                  Mark Received
                </button>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);



const ItemsModal = ({ items, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
    <div className="bg-white w-[90vw] max-w-md rounded-lg shadow-lg relative">
      <button
        onClick={onClose}
        className="absolute top-2 right-2 p-1 rounded hover:bg-gray-100"
        aria-label="Close"
      >
        <XMarkIcon className="w-6 h-6 text-gray-600" />
      </button>

      <div className="p-6">
        <h2 className="text-lg font-semibold mb-4">Medicines in this Parcel</h2>

        <table className="w-full overflow-hidden rounded-lg">
          <thead>
            <tr className="border-b border-blue-200">
              <th className="bg-gray-100 text-center p-4 font-bold text-gray-700 text-sm">S.No.</th>
              <th className="bg-white text-center p-4 font-bold text-gray-700 text-sm">Name</th>
              <th className="bg-gray-100 text-center p-4 font-bold text-gray-700 text-sm">Qty</th>
              <th className="bg-white text-center p-4 font-bold text-gray-700 text-sm">UoM</th>
            </tr>
          </thead>
          <tbody>
            {items.map((m, idx) => (
              <tr key={idx} className="border-b border-blue-200">
                <td className="bg-gray-100 p-4 font-medium text-gray-900 text-center">{idx + 1}</td>
                <td className="bg-white p-4 text-gray-600 text-center">{m.name}</td>
                <td className="bg-gray-100 p-4 text-gray-600 text-center">{m.qty}</td>
                <td className="bg-white p-4 text-gray-600 text-center">{m.uom}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

const Th = ({ children }) => (
  <th className="text-left px-3 py-2 font-semibold text-gray-700 whitespace-nowrap text-center">
    {children}
  </th>
);
const Td = ({ children, className = "" }) => (
  <td className={`px-3 py-2 whitespace-nowrap text-center ${className}`}>
    {children}
  </td>
);
const formatDate = (iso) => new Date(iso).toLocaleDateString();

export default Medicine;