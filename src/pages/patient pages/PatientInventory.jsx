import React, { useState, useEffect, useRef } from 'react';
import { Eye, AlertTriangle, CheckCircle, Clock, Plus } from 'lucide-react';
import Layout from "/src/components/patient components/Layout.jsx";
import config from "../../config";

const PatientInventory = () => {  
  const API_URL = config.API_URL;
  const [medicineData, setMedicineData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedMedicines, setSelectedMedicines] = useState([]);
  const popupRef = useRef(null);

  // Calculate dashboard stats from medicine data
  const calculateDashboardStats = (medicines) => {
    const totalMedicines = medicines.length;
    const solidMedicines = medicines.filter(med => med.form === 'Tablets' || med.form === 'Capsules').length;
    const liquidMedicines = medicines.filter(med => med.form === 'Liquid' || med.form === 'Syrup').length;
    const pendingMedicines = medicines.filter(med => med.medicineStatus === 'Pending' || med.quantityRemaining === 0).length;
    const consumedMedicines = medicines.reduce((total, med) => total + med.totalQuantityConsumed, 0);

    return [
      {
        title: "Total Medicines",
        value: totalMedicines.toString(),
        color: "blue",
        action: "View All"
      },
      {
        title: "Solid",
        value: solidMedicines.toString(),
        color: "orange",
        action: "View"
      },
      {
        title: "Liquid",
        value: liquidMedicines.toString(),
        color: "red",
        action: "View"
      },
      {
        title: "Pending Medicines",
        value: pendingMedicines.toString(),
        color: "red",
        action: "Click to Order"
      },
      {
        title: "Total Consumed",
        value: consumedMedicines.toString(),
        color: "green",
        action: "View"
      }
    ];
  };

  const [dashboardStats, setDashboardStats] = useState([]);

  useEffect(() => {
    const fetchMedicineData = async () => {
      try {
        const userId = localStorage.getItem('userId');
        if (!userId) {
          setError('User ID not found in local storage');
          setLoading(false);
          return;
        }

        const response = await fetch(`${API_URL}/api/medication-stock/${userId}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setMedicineData(data);
        setDashboardStats(calculateDashboardStats(data));
        setLoading(false);
      } catch (err) {
        setError(`Failed to fetch medicine data: ${err.message}`);
        setLoading(false);
      }
    };

    fetchMedicineData();
  }, []);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setShowPopup(false);
      }
    };

    if (showPopup) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPopup]);

  const handleEllipsisClick = () => {
    // Filter medicines that need refill (low stock or out of stock)
    const medicinesNeedingRefill = medicineData.filter(med => 
      med.medicineStatus === 'Low Stock' || 
      med.medicineStatus === 'Out of Stock' || 
      med.quantityRemaining <= 0
    );
    setSelectedMedicines(medicinesNeedingRefill);
    setShowPopup(true);
  };

  const handleMedicineSelect = (medicineIndex, isSelected) => {
    setSelectedMedicines(prev => {
      if (isSelected) {
        const medicineToAdd = medicineData.find((_, index) => index === medicineIndex);
        return [...prev, medicineToAdd];
      } else {
        return prev.filter(med => med !== medicineData[medicineIndex]);
      }
    });
  };

  const handleOrder = (medicine) => {
    // Handle individual order logic here
    console.log('Ordering:', medicine);
  };

  const getStatCardStyles = (color) => {
    const styles = {
      blue: "border-l-4 border-blue-500 bg-blue-50",
      orange: "border-l-4 border-orange-500 bg-orange-50",
      red: "border-l-4 border-red-500 bg-red-50",
      green: "border-l-4 border-green-500 bg-green-50"
    };
    return styles[color] || styles.blue;
  };

  const getStatusStyles = (status) => {
    const statusMap = {
      'Available': 'green',
      'Low Stock': 'orange',
      'Out of Stock': 'red',
      'Pending': 'blue'
    };
    
    const color = statusMap[status] || 'blue';
    const styles = {
      green: "text-green-600 bg-green-100",
      orange: "text-orange-600 bg-orange-100",
      red: "text-red-600 bg-red-100",
      blue: "text-blue-600 bg-blue-100"
    };
    return styles[color];
  };

  if (loading) {
    return (
      <Layout>
        <div className="p-6 max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-gray-600">Loading medicine inventory...</div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="p-6 max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto relative">
        {/* Header */}
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Inventory</h1>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {dashboardStats.map((stat, index) => (
            <div
              key={index}
              className={`${getStatCardStyles(stat.color)} p-4 rounded-lg shadow-sm bg-white`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">{stat.title}</h3>
                {stat.icon && <span className="text-lg">{stat.icon}</span>}
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-2">{stat.value}</div>
              <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                {stat.action}
              </button>
            </div>
          ))}
        </div>

        {/* Patient-level medicine tracking */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Patient-level medicine tracking</h2>
              <button 
                className="text-gray-400 hover:text-gray-600"
                onClick={handleEllipsisClick}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Medicine Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Form
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity Prescribed
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity Consumed
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity Remaining
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {medicineData.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      No medicines found
                    </td>
                  </tr>
                ) : (
                  medicineData.map((medicine, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">{medicine.medicineName}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {medicine.form}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {medicine.dispenseQuantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {medicine.totalQuantityConsumed}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {medicine.quantityRemaining}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyles(medicine.medicineStatus)}`}
                        >
                          {medicine.medicineStatus}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Refill Popup */}
        {showPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div 
              ref={popupRef}
              className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Medicine Refill Orders</h3>
                  <button
                    onClick={() => setShowPopup(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="overflow-y-auto max-h-[60vh]">
                <table className="w-full">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Medicine Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity Pending
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Refill Quantity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Place Order
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedMedicines.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                          No medicines need refilling at this time
                        </td>
                      </tr>
                    ) : (
                      selectedMedicines.map((medicine, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-medium text-gray-900">{medicine.medicineName}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {medicine.form}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {medicine.quantityRemaining > 0 ? `${medicine.quantityRemaining} left` : 'Out of stock'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            Qty: {medicine.dispenseQuantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => handleOrder(medicine)}
                              className="inline-flex items-center px-3 py-1 bg-blue-500 text-white text-sm font-medium rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            >
                              Order
                              <Plus className="w-4 h-4 ml-1" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default PatientInventory;