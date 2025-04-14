import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api'

const RawMaterialForm = ({ isEdit = false }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const initialState = {
    name: '',
    description: '',
    quantity: '',
    unit: '',
    supplier: '',
    batchNumber: '',
    purchaseDate: '',
    expiryDate: '',
    costPerUnit: ''
  };
  
  const [formData, setFormData] = useState(initialState);
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchRawMaterial = async () => {
      if (isEdit && id) {
        try {
          setLoading(true);
          const data = await api.getRawMaterial(id);
          
          // Format dates for input fields
          const formatted = {
            ...data,
            purchaseDate: new Date(data.purchaseDate).toISOString().split('T')[0],
            expiryDate: new Date(data.expiryDate).toISOString().split('T')[0]
          };
          
          setFormData(formatted);
          setLoading(false);
        } catch (err) {
          setError(err.message);
          setLoading(false);
        }
      }
    };
    
    fetchRawMaterial();
  }, [isEdit, id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      
      // Convert string values to numbers where needed
      const dataToSubmit = {
        ...formData,
        quantity: Number(formData.quantity),
        costPerUnit: Number(formData.costPerUnit)
      };
      
      if (isEdit) {
        await api.updateRawMaterial(id, dataToSubmit);
      } else {
        await api.createRawMaterial(dataToSubmit);
      }
      
      navigate('/raw-materials');
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading">Loading raw material data...</div>;

  return (
    <div className="material-form">
      <h2>{isEdit ? 'Edit Raw Material' : 'Add New Raw Material'}</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
          />
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="quantity">Quantity</label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              min="0"
              step="0.01"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="unit">Unit</label>
            <input
              type="text"
              id="unit"
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="supplier">Supplier</label>
            <input
              type="text"
              id="supplier"
              name="supplier"
              value={formData.supplier}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="batchNumber">Batch Number</label>
            <input
              type="text"
              id="batchNumber"
              name="batchNumber"
              value={formData.batchNumber}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="purchaseDate">Purchase Date</label>
            <input
              type="date"
              id="purchaseDate"
              name="purchaseDate"
              value={formData.purchaseDate}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="expiryDate">Expiry Date</label>
            <input
              type="date"
              id="expiryDate"
              name="expiryDate"
              value={formData.expiryDate}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="costPerUnit">Cost Per Unit</label>
          <input
            type="number"
            id="costPerUnit"
            name="costPerUnit"
            value={formData.costPerUnit}
            onChange={handleChange}
            min="0"
            step="0.01"
            required
          />
        </div>
        
        <div className="form-actions">
          <button 
            type="button" 
            className="btn cancel-btn"
            onClick={() => navigate('/raw-materials')}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn submit-btn"
            disabled={submitting}
          >
            {submitting ? 'Saving...' : (isEdit ? 'Update' : 'Create')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RawMaterialForm;