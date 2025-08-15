import React, { useState, useEffect } from "react";
import DoctorLayout from "/src/components/doctor components/DoctorLayout.jsx";
import { RefreshCw, Search, ChevronDown, Plus } from "lucide-react";
import axios from "axios";
import config from "/src/config.js";

const API_URL = config.API_URL;
const doctorId = localStorage.getItem("userId");
const token = localStorage.getItem("token");

const LeakageDetection = () => {
  const [leakageData, setLeakageData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("materialName");
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const fetchLeakageData = async () => {
    setLoading(true);
    try {
      // Check if token exists before making the request
      if (!token) {
        console.error("No authentication token found");
        setLoading(false);
        return;
      }

      const response = await axios.get(
        `${API_URL}/api/medicine-summary/leakages/detected`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Handle the API response structure
      let processedData = [];
      if (
        response.data &&
        response.data.leakages &&
        Array.isArray(response.data.leakages)
      ) {
        processedData = response.data.leakages;
      } else if (Array.isArray(response.data)) {
        processedData = response.data;
      } else if (
        response.data &&
        response.data.data &&
        Array.isArray(response.data.data)
      ) {
        processedData = response.data.data;
      } else {
        console.warn("Unexpected data format:", response.data);
        processedData = [];
      }

      setLeakageData(processedData);
    } catch (error) {
      console.error("Error fetching leakage data:", error);
      setLeakageData([]);

      // Handle specific error cases
      if (error.response) {
        console.error(
          "Response error:",
          error.response.status,
          error.response.data
        );
      } else if (error.request) {
        console.error("Request error:", error.request);
      } else {
        console.error("Error:", error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Function to get unit display
  const getUnitDisplay = (uom) => {
    if (!uom) return "";
    const lowerUom = uom.toLowerCase();
    if (lowerUom === "dram" || lowerUom === "gram") return "ml";
    if (lowerUom === "ml") return "ml";
    return uom;
  };

  // Function to calculate cost (implement based on your business logic)
  const calculateCost = (item) => {
    // This is a placeholder - implement your actual cost calculation
    if (!item || !item.quantityLeaked) return 0;
    return (item.quantityLeaked * 100).toFixed(0); // Example: ₹100 per unit leaked
  };

  useEffect(() => {
    fetchLeakageData();
  }, []);

  // Process data for display
  const processedData = leakageData.map((item) => ({
    ...item,
    leakagePercent:
      item.prescribedQuantity > 0
        ? ((item.quantityLeaked / item.prescribedQuantity) * 100).toFixed(0)
        : 0,
    unitDisplay: getUnitDisplay(item.uom),
    cost: calculateCost(item),
  }));

  // Filter and search logic
  const filteredData = processedData.filter((item) => {
    const matchesSearch =
      item.materialName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.barcode?.toLowerCase().includes(searchTerm.toLowerCase());

    if (typeFilter === "all") return matchesSearch;
    if (typeFilter === "medicine")
      return (
        matchesSearch && item.materialName?.toLowerCase().includes("medicine")
      );

    return matchesSearch;
  });

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    switch (sortBy) {
      case "materialName":
        return (a.materialName || "").localeCompare(b.materialName || "");
      case "totalWeight":
        return (b.totalWeight || 0) - (a.totalWeight || 0);
      case "currentQuantity":
        return (b.currentQuantity || 0) - (a.currentQuantity || 0);
      case "quantityLeaked":
        return (b.quantityLeaked || 0) - (a.quantityLeaked || 0);
      case "leakagePercent":
        return (b.leakagePercent || 0) - (a.leakagePercent || 0);
      default:
        return 0;
    }
  });

  // Calculate stats from API data with proper logic
  const stats = {
    totalMaterials: processedData.length,
    leakageByUsage: processedData.filter(
      (item) => (item.quantityUsed || 0) > 0 && (item.quantityLeaked || 0) > 0
    ).length,
    leakageByStorage: processedData.filter(
      (item) => (item.quantityUsed || 0) === 0 && (item.quantityLeaked || 0) > 0
    ).length,
    totalPriceChange: processedData.reduce(
      (sum, item) => sum + (parseInt(item.cost) || 0),
      0
    ),
  };

  const formatDate = (dateString) => {
    if (!dateString) return "14-08-25\n04:15 PM";
    try {
      const date = new Date(dateString);
      return (
        date.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "2-digit",
        }) +
        "\n" +
        date.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      );
    } catch (error) {
      console.error("Date formatting error:", error);
      return "14-08-25\n04:15 PM";
    }
  };

  if (loading) {
    return (
      <DoctorLayout>
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-600">
              Loading leakage data...
            </p>
          </div>
        </div>
      </DoctorLayout>
    );
  }

  return (
    <DoctorLayout>
      <div className="min-h-screen bg-gray-100 p-6">
        {/* Main Card Container */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">
                Leakage Detection
              </h1>
            </div>

            {/* Stats Cards - Updated styling */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5 pt-6">
              <div className="bg-blue-100 rounded-lg p-5 text-center">
                <h3 className="text-blue-700 text-base font-semibold mb-1">
                  Total Materials
                </h3>
                <p className="text-2xl font-bold text-blue-800">
                  {stats.totalMaterials}
                </p>
              </div>

              <div className="bg-yellow-100 rounded-lg p-5 text-center">
                <h3 className="text-orange-600 text-base font-semibold mb-1">
                  Leakage by Usage
                </h3>
                <p className="text-2xl font-bold text-orange-700">
                  {stats.leakageByUsage}
                </p>
              </div>

              <div className="bg-red-100 rounded-lg p-5 text-center">
                <h3 className="text-red-600 text-base font-semibold mb-1">
                  Leakage by Storage
                </h3>
                <p className="text-2xl font-bold text-red-700">
                  {stats.leakageByUsage}
                </p>
              </div>

              <div className="bg-green-100 rounded-lg p-5 text-center">
                <h3 className="text-green-600 text-base font-semibold mb-1">
                  Total Price Change
                </h3>
                <p className="text-2xl font-bold text-green-700">
                  ₹{stats.totalPriceChange.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Controls - Updated layout */}
            {/* Controls - Updated layout */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center mt-24 pt-16">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                />
              </div>

              <div className="flex gap-4 items-center">
                {/* Type Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                    className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-2 bg-white min-w-20"
                  >
                    Type
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  {showTypeDropdown && (
                    <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                      <button
                        onClick={() => {
                          setTypeFilter("all");
                          setShowTypeDropdown(false);
                        }}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                      >
                        All Types
                      </button>
                      <button
                        onClick={() => {
                          setTypeFilter("medicine");
                          setShowTypeDropdown(false);
                        }}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                      >
                        Medicine
                      </button>
                    </div>
                  )}
                </div>

                {/* Sort Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowSortDropdown(!showSortDropdown)}
                    className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-2 bg-white min-w-20"
                  >
                    Sort
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  {showSortDropdown && (
                    <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                      <button
                        onClick={() => {
                          setSortBy("materialName");
                          setShowSortDropdown(false);
                        }}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                      >
                        Name
                      </button>
                      <button
                        onClick={() => {
                          setSortBy("quantityLeaked");
                          setShowSortDropdown(false);
                        }}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                      >
                        Quantity Leaked
                      </button>
                      <button
                        onClick={() => {
                          setSortBy("leakagePercent");
                          setShowSortDropdown(false);
                        }}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                      >
                        Leakage %
                      </button>
                    </div>
                  )}
                </div>

                {/* Refresh Button */}
                <button
                  onClick={fetchLeakageData}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh Data
                </button>
              </div>
            </div>

            {/* Data Table - Updated with alternating colors and blue separators */}
            <div className="overflow-x-auto rounded-lg shadow pt-5">
              <table className="w-full overflow-hidden rounded-lg">
                <thead>
                  <tr className="border-b border-blue-200">
                    <th className="bg-gray-100 text-center p-4 font-bold text-gray-700 text-sm">
                      Raw Material Name
                    </th>
                    <th className="bg-white text-center p-4 font-bold text-gray-700 text-sm">
                      Type
                    </th>
                    <th className="bg-gray-100 text-center p-4 font-bold text-gray-700 text-sm">
                      Total Quality
                    </th>
                    <th className="bg-white text-center p-4 font-bold text-gray-700 text-sm">
                      Current Quality
                    </th>
                    <th className="bg-gray-100 text-center p-4 font-bold text-gray-700 text-sm">
                      Barcode
                    </th>
                    <th className="bg-white text-center p-4 font-bold text-gray-700 text-sm">
                      Last Used
                    </th>
                    <th className="bg-gray-100 text-center p-4 font-bold text-gray-700 text-sm">
                      Prescribed Qty
                    </th>
                    <th className="bg-white text-center p-4 font-bold text-gray-700 text-sm">
                      Quality Used
                    </th>
                    <th className="bg-gray-100 text-center p-4 font-bold text-gray-700 text-sm">
                      Quality Leaked
                    </th>
                    <th className="bg-white text-center p-4 font-bold text-gray-700 text-sm">
                      Leaked %
                    </th>
                    <th className="bg-gray-100 text-center p-4 font-bold text-gray-700 text-sm">
                      Cost(₹)
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {sortedData.map((item, rowIndex) => (
                    <tr
                      key={item.prescriptionId || item._id || rowIndex}
                      className="border-b border-blue-200"
                    >
                      <td className="bg-gray-100 p-4 font-medium text-gray-900 text-center">
                        {item.materialName || "W1"}
                      </td>
                      <td className="bg-white p-4 text-gray-600 text-center">
                        Medicine
                      </td>
                      <td className="bg-gray-100 p-4 text-gray-600 text-center">
                        {item.totalWeight || "600"}ml
                      </td>
                      <td className="bg-white p-4 text-gray-600 text-center">
                        {item.currentQuantity || "598"}ml
                      </td>
                      <td className="bg-gray-100 p-4 text-center">
                        <span className="bg-gray-200 text-gray-800 px-3 py-1 rounded-md text-xs font-mono">
                          {item.barcode || "RM-PIS011"}
                        </span>
                      </td>
                      <td className="bg-white p-4 text-gray-600 text-sm whitespace-pre-line text-center">
                        {formatDate(item.createdAt)}
                      </td>
                      <td className="bg-gray-100 p-4 text-gray-600 text-center">
                        {item.prescribedQuantity || "10"}ml
                      </td>
                      <td className="bg-white p-4 text-gray-600 text-center">
                        {item.quantityUsed || "10"}ml
                      </td>
                      <td className="bg-gray-100 p-4 text-gray-600 text-center">
                        {item.quantityLeaked || "6"}ml
                      </td>
                      <td className="bg-white p-4 text-center">
                        <span
                          className={`font-bold text-sm ${
                            (item.leakagePercent || 60) > 50
                              ? "text-gray-600"
                              : (item.leakagePercent || 60) > 25
                              ? "text-gray-600"
                              : "text-gray-600"
                          }`}
                        >
                          {item.leakagePercent || "60"}%
                        </span>
                      </td>
                      <td className="bg-gray-100 p-4 text-gray-600 font-medium text-center">
                        ₹{item.cost || "500"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {sortedData.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No materials found</p>
                <p className="text-sm text-gray-400 mt-2">
                  Try adjusting your search criteria
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DoctorLayout>
  );
};

export default LeakageDetection;
