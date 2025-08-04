import React, { useState, useEffect } from 'react';
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

  const handleBarcodeSubmit = (e) => {
    e.preventDefault();
    if (barcodeInput.trim()) {
      // Navigate to barcode details page with the barcode as a parameter
      navigate(`/barcode-details/${encodeURIComponent(barcodeInput.trim())}`);
      setShowBarcodeModal(false);
      setBarcodeInput('');
    }
  };

  const closeBarcodeModal = () => {
    setShowBarcodeModal(false);
    setBarcodeInput('');
  };

  if (loading) return <div className="text-center py-10 text-lg font-medium text-gray-600">Loading dashboard data...</div>;
  if (error) return <div className="text-center py-10 text-red-600 font-semibold">Error: {error}</div>;

  return (
    <div className="p-6 bg-gradient-to-b from-white to-gray-50 rounded-2xl shadow-md">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Inventory Dashboard</h2>

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

      <div className="bg-white rounded-2xl shadow p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h3>
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <Link to="/raw-materials/new" className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-5 py-2 rounded-lg shadow">Add Raw Material</Link>
          {/*<Link to="/medicines/new" className="bg-green-600 hover:bg-green-700 text-white text-sm px-5 py-2 rounded-lg shadow">Add Medicine</Link>*/}
          {/*<Link to="/medicines/calculate-price" className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-5 py-2 rounded-lg shadow">Calculate Price</Link>*/}
          <Link to="/raw-materials/quality-check" className="bg-red-600 hover:bg-red-700 text-white text-sm px-5 py-2 rounded-lg shadow">Stock Audit</Link>
          <button 
            onClick={() => setShowBarcodeModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white text-sm px-5 py-2 rounded-lg shadow"
          >
            Scan Barcode
          </button>
        </div>
      </div>

      {/* Barcode Modal */}
      {showBarcodeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">Enter Barcode</h3>
              <button 
                onClick={closeBarcodeModal}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleBarcodeSubmit}>
              <div className="mb-4">
                <label htmlFor="barcode" className="block text-sm font-medium text-gray-700 mb-2">
                  Barcode Number
                </label>
                <input
                  type="text"
                  id="barcode"
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter barcode here..."
                  autoFocus
                />
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
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
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