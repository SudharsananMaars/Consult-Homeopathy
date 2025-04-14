import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api'

const RawMaterialDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [rawMaterial, setRawMaterial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRawMaterial = async () => {
      try {
        setLoading(true);
        const data = await api.getRawMaterial(id);
        setRawMaterial(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    
    fetchRawMaterial();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this raw material?')) {
      try {
        await api.deleteRawMaterial(id);
        navigate('/raw-materials');
      } catch (err) {
        setError(err.message);
      }
    }
  };

  if (loading) return <div className="loading">Loading raw material details...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!rawMaterial) return <div className="not-found">Raw material not found</div>;

  return (
    <div className="raw-material-detail">
      <div className="detail-header">
        <h2>{rawMaterial.name}</h2>
        <div className="detail-actions">
          <Link to={`/raw-materials/${id}/edit`} className="btn edit-btn">Edit</Link>
          <button onClick={handleDelete} className="btn delete-btn">Delete</button>
        </div>
      </div>
      
      <div className="detail-content">
        <div className="detail-section">
          <h3>Basic Information</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <span className="detail-label">Description</span>
              <span className="detail-value">{rawMaterial.description || 'N/A'}</span>
            </div>
            
            <div className="detail-item">
              <span className="detail-label">Quantity</span>
              <span className="detail-value">{rawMaterial.quantity} {rawMaterial.unit}</span>
            </div>
            
            <div className="detail-item">
              <span className="detail-label">Cost Per Unit</span>
              <span className="detail-value">${rawMaterial.costPerUnit.toFixed(2)}</span>
            </div>
            
            <div className="detail-item">
              <span className="detail-label">Total Value</span>
              <span className="detail-value">
                ${(rawMaterial.quantity * rawMaterial.costPerUnit).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
        
        <div className="detail-section">
          <h3>Supplier & Batch Information</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <span className="detail-label">Supplier</span>
              <span className="detail-value">{rawMaterial.supplier}</span>
            </div>
            
            <div className="detail-item">
              <span className="detail-label">Batch Number</span>
              <span className="detail-value">{rawMaterial.batchNumber}</span>
            </div>
            
            <div className="detail-item">
              <span className="detail-label">Purchase Date</span>
              <span className="detail-value">
                {new Date(rawMaterial.purchaseDate).toLocaleDateString()}
              </span>
            </div>
            
            <div className="detail-item">
              <span className="detail-label">Expiry Date</span>
              <span className="detail-value">
                {new Date(rawMaterial.expiryDate).toLocaleDateString()}
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
                {new Date(rawMaterial.createdAt).toLocaleString()}
              </span>
            </div>
            
            <div className="detail-item">
              <span className="detail-label">Last Updated</span>
              <span className="detail-value">
                {new Date(rawMaterial.updatedAt).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="detail-footer">
        <Link to="/raw-materials" className="btn">Back to Raw Materials</Link>
      </div>
    </div>
  );
};

export default RawMaterialDetail;