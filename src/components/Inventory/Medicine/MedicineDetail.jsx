import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const MedicineDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [medicine, setMedicine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMedicine = async () => {
      try {
        setLoading(true);
        const data = await api.getMedicine(id);
        setMedicine(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    
    fetchMedicine();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this medicine?')) {
      try {
        await api.deleteMedicine(id);
        navigate('/medicines');
      } catch (err) {
        setError(err.message);
      }
    }
  };

  if (loading) return <div className="loading">Loading medicine details...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!medicine) return <div className="not-found">Medicine not found</div>;

  return (
    <div className="medicine-detail">
      <div className="detail-header">
        <h2>{medicine.name}</h2>
        <div className="detail-actions">
          <Link to={`/medicines/${id}/edit`} className="btn edit-btn">Edit</Link>
          <button onClick={handleDelete} className="btn delete-btn">Delete</button>
        </div>
      </div>
      
      <div className="detail-content">
        <div className="detail-section">
          <h3>Basic Information</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <span className="detail-label">Description</span>
              <span className="detail-value">{medicine.description || 'N/A'}</span>
            </div>
            
            <div className="detail-item">
              <span className="detail-label">Category</span>
              <span className="detail-value">{medicine.category}</span>
            </div>
            
            <div className="detail-item">
              <span className="detail-label">Dosage</span>
              <span className="detail-value">{medicine.dosage}</span>
            </div>
            
            <div className="detail-item">
              <span className="detail-label">Stock</span>
              <span className="detail-value">{medicine.stock}</span>
            </div>
            
            <div className="detail-item">
              <span className="detail-label">Price Per Unit</span>
              <span className="detail-value">${medicine.pricePerUnit.toFixed(2)}</span>
            </div>
            
            <div className="detail-item">
              <span className="detail-label">Total Value</span>
              <span className="detail-value">
                ${(medicine.stock * medicine.pricePerUnit).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
        
        <div className="detail-section">
          <h3>Manufacturer & Batch Information</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <span className="detail-label">Manufacturer</span>
              <span className="detail-value">{medicine.manufacturer}</span>
            </div>
            
            <div className="detail-item">
              <span className="detail-label">Batch Number</span>
              <span className="detail-value">{medicine.batchNumber}</span>
            </div>
            
            <div className="detail-item">
              <span className="detail-label">Expiry Date</span>
              <span className="detail-value">
                {new Date(medicine.expiryDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
        
        <div className="detail-section">
          <h3>System Information</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <span className="detail-label">Created</span>
              <span className="detail-value">
                {new Date(medicine.createdAt).toLocaleString()}
              </span>
            </div>
            
            <div className="detail-item">
              <span className="detail-label">Last Updated</span>
              <span className="detail-value">
                {new Date(medicine.updatedAt).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="detail-footer">
        <Link to="/medicines" className="btn">Back to Medicines</Link>
      </div>
    </div>
  );
};

export default MedicineDetail;