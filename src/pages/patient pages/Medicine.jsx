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
        `https://clinic-backend-jdob.onrender.com/api/patient/prescriptions/${prescriptionId}/receive`,
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
  <table className="min-w-full text-sm border-collapse overflow-hidden rounded-lg shadow">
    <thead className="bg-gray-100">
      <tr>
        <Th className="text-center">S.No</Th>
        <Th className="text-center">Tracking ID</Th>
        <Th className="text-center">Shipping Partner</Th>
        <Th className="text-center">Shipped Date</Th>
        <Th className="text-center">Arrival Date</Th>
        <Th className="text-center">Status</Th>
        <Th className="text-center">Items</Th>
        {showActions && <Th>Actions</Th>}
      </tr>
    </thead>
    <tbody>
      {data.length === 0 && (
        <tr>
          <td
            colSpan={showActions ? 8 : 7}
            className="text-center py-6 text-gray-500"
          >
            No records found.
          </td>
        </tr>
      )}

      {data.map((c, idx) => (
        <tr
          key={c.id}
          className="even:bg-gray-50 hover:bg-blue-50 transition-colors"
        >
          <Td className="text-center">{idx + 1}</Td>
          <Td className="font-semibold text-center">{c.trackingId}</Td>
          <Td className="font-semibold text-center">
            {c.packagingDetails && c.packagingDetails.length > 0 
              ? c.packagingDetails[0].deliveryPartner 
              : 'N/A'}
          </Td>
          <Td className="text-center">{formatDate(c.shippedDate)}</Td>
          <Td className="font-semibold text-center">
            {c.packagingDetails && c.packagingDetails.length > 0 
              ? formatDate(c.packagingDetails[0].arrivalDate) 
              : 'N/A'}
          </Td>
          <Td className="text-center">
            <span
              className={`px-2 py-1 rounded-md text-xs font-medium ${
                c.isProductReceived === true
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {c.isProductReceived === true ? "Received" : "Shipped"}
            </span>
          </Td>

          <Td className="text-center">
            <button
              onClick={() => onOpenItems(c.items)}
              className="py-1 px-2 rounded text-xs font-medium bg-blue-600 text-white hover:bg-blue-500 transition"
              title="View items"
            >
              View
            </button>
          </Td>
          {showActions && (
            <Td className="text-center">
              <button
                onClick={() => onMarkReceived && onMarkReceived(c.id)}
                className="px-3 py-1 rounded bg-emerald-600 text-white text-xs hover:bg-emerald-500"
                title="Mark as Received"
              >
                Mark Received
              </button>
            </Td>
          )}
        </tr>
      ))}
    </tbody>
  </table>
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

        <table className="min-w-full text-sm border-collapse rounded">
          <thead className="bg-gray-100">
            <tr>
              <Th>S.No.</Th>
              <Th>Name</Th>
              <Th>Qty</Th>
              <Th>UoM</Th>
            </tr>
          </thead>
          <tbody>
            {items.map((m, idx) => (
              <tr key={idx} className="even:bg-gray-50">
                <Td>{idx + 1}</Td>
                <Td>{m.name}</Td>
                <Td>{m.qty}</Td>
                <Td>{m.uom}</Td>
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
