import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from './services/api';

const InventoryDashboard = () => {
  const [stats, setStats] = useState({
    totalRawMaterials: 0,
    totalMedicines: 0,
    lowStockRawMaterials: 0,
    expiringRawMaterials: 0
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showBarcodeModal, setShowBarcodeModal] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [showAddRawMaterialModal, setShowAddRawMaterialModal] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanningError, setScanningError] = useState(null);
  
  const barcodeInputRef = useRef(null);
  const scanTimeoutRef = useRef(null);
  const lastScanRef = useRef('');

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [rawMaterials, medicines] = await Promise.all([
          api.getRawMaterials(),
          api.getMedicines()
        ]);

        const today = new Date();
        const nextMonth = new Date();
        nextMonth.setMonth(today.getMonth() + 1);

        const calculateStockStatus = (material) => {
          const { quantity, currentQuantity, thresholdQuantity } = material;
          if (!quantity || !thresholdQuantity) return null;
          const usedPercentage = ((quantity - currentQuantity) / quantity) * 100;
          return usedPercentage >= thresholdQuantity ? "low" : "ok";
        };

        const lowStockRawMaterialsCount = rawMaterials.filter(raw => calculateStockStatus(raw) === "low").length;
        const expiringCount = rawMaterials.filter(
          raw => new Date(raw.expiryDate) < nextMonth
        ).length;

        setStats({
          totalRawMaterials: rawMaterials.length,
          totalMedicines: medicines.length,
          lowStockRawMaterials: lowStockRawMaterialsCount,
          expiringRawMaterials: expiringCount
        });

        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Barcode scanner listener
  useEffect(() => {
    if (!isScanning) return;

    const handleKeyPress = (event) => {
      // Prevent default behavior for scanner input
      if (event.target === barcodeInputRef.current) return;

      // Clear any existing timeout
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }

      // If it's Enter key, process the scanned barcode
      if (event.key === 'Enter') {
        if (lastScanRef.current.trim()) {
          setBarcodeInput(lastScanRef.current.trim());
          lastScanRef.current = '';
          setScanningError(null);
          // Auto-submit after scanning
          setTimeout(() => {
            if (lastScanRef.current.trim() || barcodeInput.trim()) {
              const finalBarcode = lastScanRef.current.trim() || barcodeInput.trim();
              navigate(`/barcode-details/${encodeURIComponent(finalBarcode)}`);
              setShowBarcodeModal(false);
              setBarcodeInput('');
              setIsScanning(false);
            }
          }, 100);
        }
        return;
      }

      // Add character to scan buffer if it's a printable character
      if (event.key.length === 1) {
        lastScanRef.current += event.key;
        
        // Set timeout to clear scan buffer if no more input
        scanTimeoutRef.current = setTimeout(() => {
          lastScanRef.current = '';
        }, 100);
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }
    };
  }, [isScanning, barcodeInput, navigate]);

  const handleBarcodeSubmit = (e) => {
    e.preventDefault();
    if (barcodeInput.trim()) {
      navigate(`/barcode-details/${encodeURIComponent(barcodeInput.trim())}`);
      setShowBarcodeModal(false);
      setBarcodeInput('');
      setIsScanning(false);
    }
  };

  const closeBarcodeModal = () => {
    setShowBarcodeModal(false);
    setBarcodeInput('');
    setIsScanning(false);
    setScanningError(null);
    lastScanRef.current = '';
    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
    }
  };

  const startScanning = () => {
    setIsScanning(true);
    setScanningError(null);
    setBarcodeInput('');
    lastScanRef.current = '';
  };

  const stopScanning = () => {
    setIsScanning(false);
    lastScanRef.current = '';
    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
    }
  };

  const closeAddRawMaterialModal = () => {
    setShowAddRawMaterialModal(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case 'critical': return 'bg-red-100';
      case 'high': return 'bg-orange-100';
      case 'medium': return 'bg-yellow-100';
      case 'low': return 'bg-green-100';
      default: return 'bg-gray-100';
    }
  };

  if (loading) return <div className="text-center py-10 text-lg font-medium text-gray-600">Loading dashboard data...</div>;
  if (error) return <div className="text-center py-10 text-red-600 font-semibold">Error: {error}</div>;

  return (
    <div className="p-6 bg-gradient-to-b from-white to-gray-50 rounded-2xl shadow-md">
      <div className="flex justify-between items-center mb-6">
    <h2 className="text-3xl font-bold text-gray-800">Inventory Dashboard</h2>
    <Link 
      to="/dashboard"
      className="bg-gray-600 hover:bg-gray-700 text-white text-sm px-4 py-2 rounded-lg shadow flex items-center gap-2"
    >
      ← Back to Dashboard
    </Link>
  </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-white rounded-2xl shadow p-4 text-center hover:shadow-lg transition">
          <h3 className="text-lg font-semibold text-gray-700">Raw Materials</h3>
          <p className="text-2xl font-bold text-blue-600 my-2">{stats.totalRawMaterials}</p>
          <Link to="/raw-materials" className="text-blue-500 hover:underline text-sm">View All</Link>
        </div>

        <div className="bg-white rounded-2xl shadow p-4 text-center hover:shadow-lg transition">
          <h3 className="text-lg font-semibold text-gray-700">Place Order</h3>
          <p className="text-2xl font-bold text-green-600 my-2">{stats.totalRawMaterials}</p>
          <Link to="/order-raw-materials" className="text-green-500 hover:underline text-sm">click to order</Link>
        </div>

        <div className="bg-yellow-100 rounded-2xl shadow p-4 text-center hover:shadow-lg transition">
          <h3 className="text-lg font-semibold text-yellow-800">Low Stock Raw Materials</h3>
          <p className="text-2xl font-bold text-yellow-600 my-2">{stats.lowStockRawMaterials}</p>
          <Link to="/raw-materials?filter=lowstock" className="text-yellow-700 hover:underline text-sm">View</Link>
        </div>

        <div className="bg-red-100 rounded-2xl shadow p-4 text-center hover:shadow-lg transition">
          <h3 className="text-lg font-semibold text-red-800">Expiring Raw Materials</h3>
          <p className="text-2xl font-bold text-red-600 my-2">{stats.expiringRawMaterials}</p>
          <Link to="/raw-materials?filter=expiring" className="text-red-700 hover:underline text-sm">View</Link>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow p-6 mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h3>
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <button 
            onClick={() => setShowAddRawMaterialModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-5 py-2 rounded-lg shadow"
          >
            Add Raw Material
          </button>
          <Link to="/raw-materials/quality-check" className="bg-red-600 hover:bg-red-700 text-white text-sm px-5 py-2 rounded-lg shadow">Stock Audit</Link>
          
          <button 
            onClick={() => setShowBarcodeModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white text-sm px-5 py-2 rounded-lg shadow"
          >
            Scan Barcode
          </button>
          <Link to="/orderhistory" className="bg-yellow-600 hover:bg-yellow-700 text-white text-sm px-5 py-2 rounded-lg shadow">Order History</Link>
        </div>
      </div>

      {/* Add Raw Material Modal */}
      {showAddRawMaterialModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">Add Raw Material</h3>
              <button 
                onClick={closeAddRawMaterialModal}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            
            <div className="flex flex-col gap-3">
              <Link 
                to="/raw-materials/new"
                onClick={closeAddRawMaterialModal}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-3 rounded-lg font-medium transition"
              >
                Add New Raw Material
              </Link>
              
              <Link 
                to="/raw-materials/new"
                onClick={closeAddRawMaterialModal}
                className="w-full bg-green-600 hover:bg-green-700 text-white text-center py-3 rounded-lg font-medium transition"
              >
                Add Existing Raw Material
              </Link>
            </div>
          </div>
        </div>
      )}
      
      {/* Enhanced Barcode Modal with Scanner Support */}
      {showBarcodeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">Scan or Enter Barcode</h3>
              <button 
                onClick={closeBarcodeModal}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            {/* Scanner Controls */}
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Barcode Scanner:</span>
                  <div className="flex gap-2">
                    {!isScanning ? (
                      <button
                        onClick={startScanning}
                        className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                      >
                        Start Scanning
                      </button>
                    ) : (
                      <button
                        onClick={stopScanning}
                        className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                      >
                        Stop Scanning
                      </button>
                    )}
                  </div>
                </div>
                
                {isScanning && (
                  <div className="flex items-center gap-2 text-green-600">
                    <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                    <span className="text-xs">Scanner ready - scan barcode now</span>
                  </div>
                )}
                
                {scanningError && (
                  <div className="text-red-600 text-xs">{scanningError}</div>
                )}
              </div>
            </div>
            
            <form onSubmit={handleBarcodeSubmit}>
              <div className="mb-4">
                <label htmlFor="barcode" className="block text-sm font-medium text-gray-700 mb-2">
                  Barcode Number (Manual Entry)
                </label>
                <input
                  ref={barcodeInputRef}
                  type="text"
                  id="barcode"
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter barcode here or use scanner above..."
                  disabled={isScanning}
                />
                {isScanning && (
                  <p className="text-xs text-gray-500 mt-1">Manual input disabled while scanning</p>
                )}
              </div>
              
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={closeBarcodeModal}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!barcodeInput.trim()}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Search
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryDashboard;