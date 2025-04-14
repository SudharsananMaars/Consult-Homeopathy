import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { api } from "../services/api";

const RawMaterialsList = () => {
  const [rawMaterials, setRawMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    if (queryParams.get("filter") === "expiring") {
      setFilter("expiring");
    }
  }, [location]);

  useEffect(() => {
    const fetchRawMaterials = async () => {
      try {
        setLoading(true);
        const data = await api.getRawMaterials();
        setRawMaterials(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchRawMaterials();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this raw material?")) {
      try {
        await api.deleteRawMaterial(id);
        setRawMaterials(rawMaterials.filter((material) => material._id !== id));
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const filterMaterials = () => {
    if (filter === "expiring") {
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      return rawMaterials.filter(
        (material) => new Date(material.expiryDate) < nextMonth
      );
    }
    return rawMaterials;
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    if (newFilter === "expiring") {
      navigate("?filter=expiring");
    } else {
      navigate("");
    }
  };

  if (loading)
    return (
      <div className="text-center py-10 text-lg font-medium text-gray-600">
        Loading raw materials...
      </div>
    );
  if (error)
    return (
      <div className="text-center py-10 text-red-600 font-semibold">
        Error: {error}
      </div>
    );

  const filteredMaterials = filterMaterials();

  return (
    <div className="p-6 bg-white rounded-2xl shadow-md">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">
          Raw Materials
        </h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label
              htmlFor="filter"
              className="text-sm font-medium text-gray-700"
            >
              Filter:
            </label>
            <select
              id="filter"
              value={filter}
              onChange={(e) => handleFilterChange(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All</option>
              <option value="expiring">Expiring Soon</option>
            </select>
          </div>
          <Link
            to="/raw-materials/new"
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg shadow"
          >
            + Add Raw Material
          </Link>
        </div>
      </div>

      {filteredMaterials.length === 0 ? (
        <div className="text-center text-gray-600 py-10">
          No raw materials found.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-700 text-sm">
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Quantity</th>
                <th className="px-4 py-3 text-left">Unit</th>
                <th className="px-4 py-3 text-left">Supplier</th>
                <th className="px-4 py-3 text-left">Batch #</th>
                <th className="px-4 py-3 text-left">Expiry Date</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMaterials.map((material) => (
                <tr
                  key={material._id}
                  className="border-t hover:bg-gray-50 text-sm"
                >
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {material.name}
                  </td>
                  <td className="px-4 py-3">{material.quantity}</td>
                  <td className="px-4 py-3">{material.unit}</td>
                  <td className="px-4 py-3">{material.supplier}</td>
                  <td className="px-4 py-3">{material.batchNumber}</td>
                  <td className="px-4 py-3">
                    {new Date(material.expiryDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 flex flex-wrap gap-2">
                    <Link
                      to={`/raw-materials/${material._id}`}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                    >
                      View
                    </Link>
                    <Link
                      to={`/raw-materials/${material._id}/edit`}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(material._id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RawMaterialsList;
