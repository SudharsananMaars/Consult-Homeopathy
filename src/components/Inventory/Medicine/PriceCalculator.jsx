import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const PriceCalculator = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    medicineName: '',
    rawMaterials: [{ materialId: '', quantity: '' }],
    laborCost: '',
    packagingCost: '',
    overheadPercentage: ''
  });
  
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rawMaterials, setRawMaterials] = useState([]);
  
  React.useEffect(() => {
    const fetchRawMaterials = async () => {
      try {
        const data = await api.getRawMaterials();
        setRawMaterials(data);
      } catch (err) {
        setError('Failed to load raw materials: ' + err.message);
      }
    };
    
    fetchRawMaterials();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleRawMaterialChange = (index, field, value) => {
    const updatedMaterials = [...formData.rawMaterials];
    updatedMaterials[index][field] = value;
    
    setFormData(prev => ({
      ...prev,
      rawMaterials: updatedMaterials
    }));
  };
  
  const addRawMaterial = () => {
    setFormData(prev => ({
      ...prev,
      rawMaterials: [...prev.rawMaterials, { materialId: '', quantity: '' }]
    }));
  };
  
  const removeRawMaterial = (index) => {
    if (formData.rawMaterials.length === 1) return;
    
    const updatedMaterials = [...formData.rawMaterials];
    updatedMaterials.splice(index, 1);
    
    setFormData(prev => ({
      ...prev,
      rawMaterials: updatedMaterials
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      // Format data for API
      const dataToSubmit = {
        ...formData,
        laborCost: Number(formData.laborCost),
        packagingCost: Number(formData.packagingCost),
        overheadPercentage: Number(formData.overheadPercentage),
        rawMaterials: formData.rawMaterials.map(item => ({
          materialId: item.materialId,
          quantity: Number(item.quantity)
        }))
      };
      
      const data = await api.calculateMedicinePrice(dataToSubmit);
      setResult(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="price-calculator">
      <h2>Medicine Price Calculator</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="medicineName">Medicine Name</label>
          <input
            type="text"
            id="medicineName"
            name="medicineName"
            value={formData.medicineName}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="calculator-section">
          <h3>Raw Materials</h3>
          
          {formData.rawMaterials.map((material, index) => (
            <div key={index} className="raw-material-row">
              <div className="form-row">
                <div className="form-group">
                  <label>Raw Material</label>
                  <select
                    value={material.materialId}
                    onChange={(e) => handleRawMaterialChange(index, 'materialId', e.target.value)}
                    required
                  >
                    <option value="">Select Raw Material</option>
                    {rawMaterials.map(rm => (
                      <option key={rm._id} value={rm._id}>
                        {rm.name} (${rm.costPerUnit}/{rm.unit})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Quantity</label>
                  <input
                    type="number"
                    value={material.quantity}
                    onChange={(e) => handleRawMaterialChange(index, 'quantity', e.target.value)}
                    min="0.01"
                    step="0.01"
                    required
                  />
                </div>
                
                <div className="form-group action-buttons">
                  <button 
                    type="button" 
                    className="btn remove-btn"
                    onClick={() => removeRawMaterial(index)}
                    disabled={formData.rawMaterials.length === 1}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          <button 
            type="button" 
            className="btn add-more-btn"
            onClick={addRawMaterial}
          >
            Add Another Raw Material
          </button>
        </div>
        
        <div className="calculator-section">
          <h3>Additional Costs</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="laborCost">Labor Cost ($)</label>
              <input
                type="number"
                id="laborCost"
                name="laborCost"
                value={formData.laborCost}
                onChange={handleChange}
                min="0"
                step="0.01"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="packagingCost">Packaging Cost ($)</label>
              <input
                type="number"
                id="packagingCost"
                name="packagingCost"
                value={formData.packagingCost}
                onChange={handleChange}
                min="0"
                step="0.01"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="overheadPercentage">Overhead Percentage (%)</label>
              <input
                type="number"
                id="overheadPercentage"
                name="overheadPercentage"
                value={formData.overheadPercentage}
                onChange={handleChange}
                min="0"
                max="100"
                required
              />
            </div>
          </div>
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
            className="btn calculate-btn"
            disabled={loading}
          >
            {loading ? 'Calculating...' : 'Calculate Price'}
          </button>
        </div>
      </form>
      
      {result && (
        <div className="calculation-result">
          <h3>Price Calculation Results</h3>
          
          <div className="result-details">
            <div className="result-item">
              <span className="result-label">Raw Materials Cost:</span>
              <span className="result-value">${result.rawMaterialsCost.toFixed(2)}</span>
            </div>
            
            <div className="result-item">
              <span className="result-label">Labor Cost:</span>
              <span className="result-value">${result.laborCost.toFixed(2)}</span>
            </div>
            
            <div className="result-item">
              <span className="result-label">Packaging Cost:</span>
              <span className="result-value">${result.packagingCost.toFixed(2)}</span>
            </div>
            
            <div className="result-item">
              <span className="result-label">Overhead Cost:</span>
              <span className="result-value">${result.overheadCost.toFixed(2)}</span>
            </div>
            
            <div className="result-item total">
              <span className="result-label">Total Manufacturing Cost:</span>
              <span className="result-value">${result.totalCost.toFixed(2)}</span>
            </div>
            
            <div className="result-item total">
              <span className="result-label">Recommended Price Per Unit:</span>
              <span className="result-value">${result.recommendedPrice.toFixed(2)}</span>
            </div>
          </div>
          
          <div className="result-actions">
            <button 
              className="btn"
              onClick={() => {
                // Logic to use this price for creating a new medicine
                navigate('/medicines/new', { 
                  state: { 
                    initialPrice: result.recommendedPrice,
                    medicineName: formData.medicineName
                  } 
                });
              }}
            >
              Use This Price for New Medicine
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PriceCalculator;