import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "./services/api";

const QualityCheck = () => {
  const [materials, setMaterials] = useState([]);
  const [filteredMaterials, setFilteredMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAmendedOnly, setShowAmendedOnly] = useState(false);
  const [usageFilter, setUsageFilter] = useState("unused"); // Default to unused
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);
  const [showBarcodeModal, setShowBarcodeModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [enteredBarcode, setEnteredBarcode] = useState("");
  const [scannedBarcode, setScannedBarcode] = useState("");
  const [validationResult, setValidationResult] = useState("");

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        setLoading(true);
        const data = await api.getRawMaterials();
        setMaterials(data);
        setFilteredMaterials(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchMaterials();
  }, []);

  useEffect(() => {
    let filtered = materials;

    // Apply amendment filter
    if (showAmendedOnly) {
      filtered = filtered.filter(material => material.IsAmendment === true);
    }

    // Apply usage filter
    if (usageFilter === "unused") {
      filtered = filtered.filter(material => material.usageStatus === "unused");
    }

    setFilteredMaterials(filtered);
  }, [showAmendedOnly, usageFilter, materials]);

  useEffect(() => {
  const triggerUsageStatusUpdate = async () => {
    try {
      await fetch("https://clinic-backend-jdob.onrender.com/api/inventory/usage-status", {
        method: "GET",
      });
    } catch (err) {
      console.error("Failed to trigger usage status update:", err);
    }
  };
  triggerUsageStatusUpdate();
}, []);


  const handleValidate = (id) => {
    setSelectedId(id);
    setEnteredBarcode("");
    setValidationResult("");
    setShowPopup(true);
  };

  const handleScanBarcode = () => {
    setScannedBarcode("");
    setShowBarcodeModal(true);
  };

  const handleBarcodeNavigation = () => {
    if (scannedBarcode.trim()) {
      // Navigate to a different page with the scanned barcode
      navigate(`/unused-details/${encodeURIComponent(scannedBarcode.trim())}`);
      setShowBarcodeModal(false);
    }
  };

  const handleBarcodeSubmit = () => {
    const material = materials.find((m) => m._id === selectedId);
    if (!material) return;

    if (material.barcode === enteredBarcode.trim()) {
      setValidationResult("Barcode matched!");
    } else {
      setValidationResult("Barcode mismatch.");
    }
  };

  const calculateStockStatus = (material) => {
    const { quantity, currentQuantity, thresholdQuantity } = material;
    if (!quantity || !thresholdQuantity) return null;
    const usedPercentage = ((quantity - currentQuantity) / quantity) * 100;
    return usedPercentage >= thresholdQuantity ? "low" : "ok";
  };

  const amendedCount = materials.filter(material => material.IsAmendment === true).length;

  if (loading)
    return (
      <div className="text-center py-10 text-lg font-medium text-gray-600">
        Loading materials for quality check...
      </div>
    );
  if (error)
    return (
      <div className="text-center py-10 text-red-600 font-semibold">
        Error: {error}
      </div>
    );

  return (
    <div className="p-6 bg-white rounded-2xl shadow-md">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">
          Stock Audit
        </h2>
        <div className="flex flex-col sm:flex-row gap-2">

          <select
            value={usageFilter}
            onChange={(e) => setUsageFilter(e.target.value)}
            className="me-3.5 bg-white border border-gray-300 hover:border-gray-400 text-gray-700 text-sm px-4 py-2 rounded-lg shadow transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="all">All</option>
            <option value="unused">Unused</option>
          </select>


          {/* Scan Barcode Button */}
          <button
            onClick={handleScanBarcode}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg shadow transition-colors"
          >
            Scan Barcode
          </button>

          <button
            onClick={() => setShowAmendedOnly(!showAmendedOnly)}
            className={`${
              showAmendedOnly
                ? "bg-orange-600 hover:bg-orange-700"
                : "bg-gray-500 hover:bg-gray-600"
            } text-white text-sm px-4 py-2 rounded-lg shadow transition-colors`}
          >
            {showAmendedOnly ? "Show All Materials" : `Amended Materials (${amendedCount})`}
          </button>
          <button 
          onClick={() => navigate("/amendmentlog")}
          className={"bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded-lg shadow"}>
            Amendment Log
          </button>
        </div>
      </div>

      {filteredMaterials.length === 0 ? (
        <div className="text-center text-gray-600 py-10">
          {showAmendedOnly 
            ? "No amended materials found."
            : usageFilter === "unused" 
              ? "No unused materials found."
              : "No materials found for quality check."
          }
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-left">Package Size</th>
                <th className="px-4 py-3 text-left">Stock</th>
                <th className="px-4 py-3 text-left">Quantity</th>
                <th className="px-4 py-3 text-left">Threshold</th>
                <th className="px-4 py-3 text-left">Cost/Unit</th>
                <th className="px-4 py-3 text-left">Barcode</th>
                <th className="px-4 py-3 text-left">Created At</th>
                <th className="px-4 py-3 text-left">Status</th>
                {/*<th className="px-4 py-3 text-left">Actions</th>*/}
              </tr>
            </thead>
            <tbody>
              {filteredMaterials.map((material) => {
                const stockStatus = calculateStockStatus(material);
                const isLow = stockStatus === "low";
                const isAmended = material.IsAmendment === true;

                return (
                  <tr
                    key={material._id}
                    className={`border-t ${
                      isLow ? "bg-red-50" : isAmended ? "bg-orange-50" : "hover:bg-gray-50"
                    }`}
                  >
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {material.name}
                      {isAmended && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          Amended
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">{material.category}</td>
                    <td className="px-4 py-3">{material.packageSize}</td>
                    <td className="px-4 py-3">
                      {material.currentQuantity} {material.uom}
                    </td>
                    <td className="px-4 py-3">
                      {material.quantity} {material.uom}
                    </td>
                    <td className="px-4 py-3">{material.thresholdQuantity}%</td>
                    <td className="px-4 py-3">{material.costPerUnit}</td>
                    <td className="px-4 py-3">{material.barcode}</td>
                    <td className="px-4 py-3">
                      {material.createdAt
                        ? new Date(material.createdAt).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {isLow ? (
                        <span className="text-red-600 font-semibold">
                          Low Stock
                        </span>
                      ) : (
                        <span className="text-green-600 font-medium">
                          Available
                        </span>
                      )}
                    </td>
                    {/*<td className="px-4 py-3">
                      <button
                        onClick={() => handleValidate(material._id)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                      >
                        Validate
                      </button>
                    </td>*/}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

    {showBarcodeModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/40">
        <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md animate-scaleFade">
          <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
            Scan Barcode
          </h3>

          <input
            type="text"
            value={scannedBarcode}
            onChange={(e) => setScannedBarcode(e.target.value)}
            placeholder="Enter or scan barcode..."
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:outline-none mb-4 text-sm"
            autoFocus
          />

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowBarcodeModal(false)}
              className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleBarcodeNavigation}
              disabled={!scannedBarcode.trim()}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-sm font-semibold shadow"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    )}

    {showPopup && (
  <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/40">
    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md animate-scaleFade">
      <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
        Enter Barcode for Validation
      </h3>

      <input
        type="text"
        value={enteredBarcode}
        onChange={(e) => setEnteredBarcode(e.target.value)}
        placeholder="Type barcode..."
        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:outline-none mb-4 text-sm"
      />

      {validationResult && (
        <div
          className={`mb-4 text-center font-semibold ${
            validationResult.includes("matched")
              ? "text-green-600"
              : "text-red-600"
          }`}
        >
          {validationResult}
        </div>
      )}

      {/* Conditional Action Buttons */}
      {validationResult && (
        <div className="flex justify-end space-x-3 mt-2">
          <button
            onClick={() => setShowPopup(false)}
            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium"
          >
            Cancel
          </button>

          {validationResult.includes("matched") ? (
            <button
              onClick={() => {
                console.log(" Verified:", selectedId);
                setShowPopup(false);
                navigate(`/raw-materials/${selectedId}/verify?verify=true`);
              }}
              className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-semibold shadow"
            >
              Verify
            </button>
          ) : (
            <button
              onClick={() => {
                console.log(" Verify and change triggered for:", selectedId);
                setShowPopup(false);
                navigate(`/raw-materials/${selectedId}/verify`);
              }}
              className="px-4 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-semibold shadow"
            >
              Verify & Change
            </button>
          )}
        </div>
      )}

      {/* Submit button stays separate */}
      {!validationResult && (
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => setShowPopup(false)}
            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleBarcodeSubmit}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow"
          >
            Submit
          </button>
        </div>
      )}
    </div>
  </div>
)}

    </div>
  );
};

export default QualityCheck;