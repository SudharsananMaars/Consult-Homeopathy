import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';


const MedicineForm = ({ isEdit = false }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const initialState = {
    name: '',
    description: '',
    category: '',
    stock: '',
    batchNumber: '',
    expiryDate: '',
    manufacturer: '',
    pricePerUnit: '',
    dosage: ''
  };
  const [formData, setFormData] = useState(initialState);
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [categories] = useState([
    'Antibiotics', 'Analgesics', 'Antidepressants', 'Antidiabetics',
    'Antihistamines', 'Antihypertensives', 'Antipyretics', 'Vitamins'
  ]);

  useEffect(() => {
    const fetchMedicine = async () => {
      if (isEdit && id) {
        try {
          setLoading(true);
          const data = await api.getMedicine(id);
          
          // Format dates for input fields
          const formatted = {
            ...data,
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
    
    fetchMedicine();
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
        stock: Number(formData.stock),
        pricePerUnit: Number(formData.pricePerUnit)
      };
      
      if (isEdit) {
        await api.updateMedicine(id, dataToSubmit);
      } else {
        await api.createMedicine(dataToSubmit);
      }
      
      navigate('/medicines');
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading">Loading medicine data...</div>;

  return (
    <div className="medicine-form">
      <h2>{isEdit ? 'Edit Medicine' : 'Add New Medicine'}</h2>
      
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
            <label htmlFor="category">Category</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="">Select Category</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="dosage">Dosage</label>
            <input
              type="text"
              id="dosage"
              name="dosage"
              value={formData.dosage}
              onChange={handleChange}
              required
              placeholder="e.g., 500mg"
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="stock">Stock</label>
            <input
              type="number"
              id="stock"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              min="0"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="pricePerUnit">Price Per Unit</label>
            <input
              type="number"
              id="pricePerUnit"
              name="pricePerUnit"
              value={formData.pricePerUnit}
              onChange={handleChange}
              min="0"
              step="0.01"
              required
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="manufacturer">Manufacturer</label>
            <input
              type="text"
              id="manufacturer"
              name="manufacturer"
              value={formData.manufacturer}
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
        
        <div className="form-actions">
          <button 
            type="button" 
            className="btn cancel-btn"
            onClick={() => navigate('/medicines')}
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

export default MedicineForm;