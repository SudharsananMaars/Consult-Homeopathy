import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../services/api'

const RawMaterialsList = () => {
  const [rawMaterials, setRawMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    if (queryParams.get('filter') === 'expiring') {
      setFilter('expiring');
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
    if (window.confirm('Are you sure you want to delete this raw material?')) {
      try {
        await api.deleteRawMaterial(id);
        setRawMaterials(rawMaterials.filter(material => material._id !== id));
      } catch (err) {
        setError(err.message);
      }
    }
  };
  
  const filterMaterials = () => {
    if (filter === 'expiring') {
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      return rawMaterials.filter(material => new Date(material.expiryDate) < nextMonth);
    }
    return rawMaterials;
  };
  
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    if (newFilter === 'expiring') {
      navigate('?filter=expiring');
    } else {
      navigate('');
    }
  };

  if (loading) return <div className="loading">Loading raw materials...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  const filteredMaterials = filterMaterials();

  return (
    <div className="raw-materials-list">
      <div className="list-header">
        <h2>Raw Materials</h2>
        <div className="actions">
          <div className="filter-controls">
            <label>Filter: </label>
            <select value={filter} onChange={(e) => handleFilterChange(e.target.value)}>
              <option value="all">All</option>
              <option value="expiring">Expiring Soon</option>
            </select>
          </div>
          <Link to="/raw-materials/new" className="btn add-btn">Add Raw Material</Link>
        </div>
      </div>
      
      {filteredMaterials.length === 0 ? (
        <p>No raw materials found.</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Quantity</th>
              <th>Unit</th>
              <th>Supplier</th>
              <th>Batch #</th>
              <th>Expiry Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredMaterials.map(material => (
              <tr key={material._id}>
                <td>{material.name}</td>
                <td>{material.quantity}</td>
                <td>{material.unit}</td>
                <td>{material.supplier}</td>
                <td>{material.batchNumber}</td>
                <td>{new Date(material.expiryDate).toLocaleDateString()}</td>
                <td className="actions-cell">
                  <Link to={`/raw-materials/${material._id}`} className="btn view-btn">View</Link>
                  <Link to={`/raw-materials/${material._id}/edit`} className="btn edit-btn">Edit</Link>
                  <button 
                    onClick={() => handleDelete(material._id)} 
                    className="btn delete-btn"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default RawMaterialsList;
