import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const MedicinesList = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    if (queryParams.get('filter') === 'low-stock') {
      setFilter('low-stock');
    }
  }, [location]);

  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        setLoading(true);
        const data = await api.getMedicines();
        setMedicines(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    
    fetchMedicines();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this medicine?')) {
      try {
        await api.deleteMedicine(id);
        setMedicines(medicines.filter(medicine => medicine._id !== id));
      } catch (err) {
        setError(err.message);
      }
    }
  };
  
  const filterMedicines = () => {
    let filtered = medicines;
    
    // Apply stock filter
    if (filter === 'low-stock') {
      filtered = filtered.filter(medicine => medicine.stock < 10);
    }
    
    // Apply search filter
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(medicine => 
        medicine.name.toLowerCase().includes(term) ||
        medicine.category.toLowerCase().includes(term) ||
        medicine.manufacturer.toLowerCase().includes(term) ||
        medicine.batchNumber.toLowerCase().includes(term)
      );
    }
    
    return filtered;
  };
  
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    if (newFilter === 'low-stock') {
      navigate('?filter=low-stock');
    } else {
      navigate('');
    }
  };

  if (loading) return <div className="loading">Loading medicines...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  const filteredMedicines = filterMedicines();

  return (
    <div className="medicines-list">
      <div className="list-header">
        <h2>Medicines</h2>
        <div className="actions">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search medicines..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="filter-controls">
            <label>Filter: </label>
            <select value={filter} onChange={(e) => handleFilterChange(e.target.value)}>
              <option value="all">All</option>
              <option value="low-stock">Low Stock</option>
            </select>
          </div>
          
          <Link to="/medicines/new" className="btn add-btn">Add Medicine</Link>
        </div>
      </div>
      
      {filteredMedicines.length === 0 ? (
        <p>No medicines found.</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Stock</th>
              <th>Price per Unit</th>
              <th>Manufacturer</th>
              <th>Expiry Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredMedicines.map(medicine => (
              <tr 
                key={medicine._id}
                className={medicine.stock < 10 ? 'low-stock' : ''}
              >
                <td>{medicine.name}</td>
                <td>{medicine.category}</td>
                <td>{medicine.stock}</td>
                <td>${medicine.pricePerUnit.toFixed(2)}</td>
                <td>{medicine.manufacturer}</td>
                <td>{new Date(medicine.expiryDate).toLocaleDateString()}</td>
                <td className="actions-cell">
                  <Link to={`/medicines/${medicine._id}`} className="btn view-btn">View</Link>
                  <Link to={`/medicines/${medicine._id}/edit`} className="btn edit-btn">Edit</Link>
                  <button 
                    onClick={() => handleDelete(medicine._id)} 
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

export default MedicinesList;