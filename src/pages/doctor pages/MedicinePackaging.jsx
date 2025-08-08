import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import config from "../../config";

const MedicinePackaging = () => {
  const [rawMaterials, setRawMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState({}); // Track input values per material
  const [updating, setUpdating] = useState({}); // Track which items are being updated
  const API_URL = config.API_URL;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRawMaterials = async () => {
      try {
        const response = await fetch(`${API_URL}/api/medicine-summary/non-bottle-packing`);
        if (!response.ok) {
          throw new Error("Failed to fetch raw materials");
        }
        const data = await response.json();

        const transformed = data.map((item) => ({
          id: item._id, // Assuming there's an ID to uniquely identify
          name: item.name,
          category: item.category,
          stock: `${item.currentQuantity}/${item.quantity} ${item.uom || ""}`.trim(),
        }));

        setRawMaterials(transformed);

        // Initialize quantities to 0
        const initialQuantities = {};
        transformed.forEach((item) => {
          initialQuantities[item.id] = 0;
        });
        setQuantities(initialQuantities);

      } catch (error) {
        console.error("Error fetching raw materials:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRawMaterials();
  }, []);

  const handleQuantityChange = (id, value) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: value >= 0 ? value : 0,
    }));
  };

  const incrementQuantity = (id) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));
  };

  const decrementQuantity = (id) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: prev[id] > 0 ? prev[id] - 1 : 0,
    }));
  };

  const handleUpdate = async (id) => {
    try {
      // Set updating state for this specific item
      setUpdating((prev) => ({
        ...prev,
        [id]: true,
      }));

      const payload = {
        rawMaterialId: id,
        packageAmount: quantities[id] || 0,
      };

      const response = await fetch(`${API_URL}/api/medicine-summary/non-bottle-packing-amount`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Failed to update: ${response.statusText}`);
      }

      const result = await response.json();
      console.log(`Successfully updated quantity for ${id}:`, result);
      
      // Optional: Show success message or update UI
      // You might want to show a toast notification here
      
    } catch (error) {
      console.error(`Error updating quantity for ${id}:`, error);
      // Optional: Show error message to user
      // You might want to show an error toast notification here
    } finally {
      // Remove updating state for this item
      setUpdating((prev) => ({
        ...prev,
        [id]: false,
      }));
    }
  };

  const handleReturnToCRM = () => {
    navigate('/doctor-dashboard/myAllocation');
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-center">
          Medicine Packaging
        </h1>
      </div>

      <div className="bg-white border border-gray-300 rounded-lg shadow-md p-6 min-h-[80vh] flex flex-col justify-start">
        {loading ? (
          <p className="text-center text-gray-600">Loading...</p>
        ) : (
          <>
            {rawMaterials.length === 0 ? (
              <p className="text-center text-gray-500">No raw materials found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-100 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Category
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Stock
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Quantity to be Used
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rawMaterials.map((material, idx) => (
                      <tr key={idx} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-800">{material.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-800">{material.category}</td>
                        <td className="px-4 py-3 text-sm text-gray-800">{material.stock}</td>

                        {/* Quantity field with +/- */}
                        <td className="px-4 py-3 text-sm text-gray-800">
                          <div className="flex items-center space-x-2">
                            <button
                              type="button"
                              onClick={() => decrementQuantity(material.id)}
                              className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                              disabled={updating[material.id]}
                            >
                              -
                            </button>
                            <input
                              type="number"
                              className="w-16 border border-gray-300 rounded px-2 py-1 text-center"
                              value={quantities[material.id] || 0}
                              onChange={(e) =>
                                handleQuantityChange(material.id, parseInt(e.target.value, 10) || 0)
                              }
                              disabled={updating[material.id]}
                            />
                            <button
                              type="button"
                              onClick={() => incrementQuantity(material.id)}
                              className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                              disabled={updating[material.id]}
                            >
                              +
                            </button>
                          </div>
                        </td>

                        {/* Update button in its own <td> */}
                        <td className="px-4 py-3 text-sm text-gray-800">
                          <button
                            type="button"
                            onClick={() => handleUpdate(material.id)}
                            disabled={updating[material.id]}
                            className={`px-3 py-1 text-white rounded ${
                              updating[material.id]
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-blue-500 hover:bg-blue-600'
                            }`}
                          >
                            {updating[material.id] ? 'Updating...' : 'Update'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {/* Return to CRM button moved below the table */}
      <div className="mt-6 flex justify-center">
        <button
          type="button"
          onClick={handleReturnToCRM}
          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
        >
          Return to CRM
        </button>
      </div>
    </div>
  );
};

export default MedicinePackaging;