import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import Barcode from 'react-barcode';

const RawMaterialVerify = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Check if this is verify mode (edit but no barcode) vs verify-and-change mode (edit + barcode)
  const isVerifyMode = searchParams.get('verify') === 'true';

  const initialState = {
    name: '',
    type: '',
    category: '',
    packageSize: '',
    quantity: '0',
    currentQuantity: '0',
    thresholdQuantity: '80',
    expiryDate: '',
    costPerUnit: ''
  };

  const [formData, setFormData] = useState(initialState);
  const [originalData, setOriginalData] = useState(initialState); // Store original data for comparison
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  // New states for two-step process
  const [currentStep, setCurrentStep] = useState(1); // 1 = form, 2 = barcode display
  const [barcodeImageUrl, setBarcodeImageUrl] = useState(null);

  // Category options based on type
  const categoryOptions = {
    'Raw Material': ['Pills', 'Liquid', 'Tablets', 'Individual Medicine'],
    'Packaging': ['Wrapper', 'Cardboard Box']
  };

  // Fetch raw material data on component mount
  useEffect(() => {
    const fetchRawMaterial = async () => {
      if (id) {
        try {
          setLoading(true);
          const data = await api.getRawMaterial(id);
          const formatted = {
            ...data,
            expiryDate: new Date(data.expiryDate).toISOString().split('T')[0]
          };
          setFormData(formatted);
          setOriginalData(formatted); // Store original data for comparison
          console.log('Loaded raw material:', data);
          setLoading(false);
        } catch (err) {
          setError(err.message);
          setLoading(false);
        }
      }
    };
    fetchRawMaterial();
  }, [id]);

  // Function to check if data has been modified
  const hasDataChanged = () => {
    return JSON.stringify(formData) !== JSON.stringify(originalData);
  };

  // UOM mapping based on category
  const getUOMByCategory = (category) => {
    const uomMap = {
      'Liquid': 'ml',
      'Tablets': 'gram',
      'Pills': 'dram',
      'Individual Medicine': 'pieces',
      'Wrapper': 'pieces',
      'Cardboard Box': 'pieces'
    };
    return uomMap[category] || '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: value
      };
      
      // Clear category and packageSize when type changes
      if (name === 'type') {
        newData.category = '';
        newData.packageSize = '';
      }
      
      // Update packageSize with appropriate UOM when category changes
      if (name === 'category') {
        const uom = getUOMByCategory(value);
        newData.packageSize = uom ? ` ${uom}` : '';
      }
      
      return newData;
    });
  };

  const handlePackageSizeChange = (e) => {
    const { value } = e.target;
    const uom = getUOMByCategory(formData.category);
    
    // If there's a UOM for this category and the field is being cleared
    if (uom && value === '') {
      setFormData(prev => ({
        ...prev,
        packageSize: ` ${uom}`
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        packageSize: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (currentStep === 2) {
      // Step 2: Finish button clicked, navigate to raw materials
      navigate('/raw-materials/quality-check');
      return;
    }

    // In verify mode, update and go back without generating barcode
    if (isVerifyMode) {
      try {
        setSubmitting(true);
        const dataToSubmit = {
          ...formData,
          quantity: Number(formData.quantity),
          costPerUnit: Number(formData.costPerUnit),
          uom: getUOMByCategory(formData.category),
          IsAmendment: hasDataChanged() // Set amendment to true if data has changed
        };

        await api.updateRawMaterial(id, dataToSubmit);
        
        // Navigate back without going to barcode step
        navigate('/raw-materials/quality-check');
        return;
      } catch (err) {
        setError(err.message);
        setSubmitting(false);
        return;
      }
    }

    // Step 1: Generate barcode (only for verify and change mode)
    try {
      setSubmitting(true);
      const dataToSubmit = {
        ...formData,
        quantity: Number(formData.quantity),
        costPerUnit: Number(formData.costPerUnit),
        uom: getUOMByCategory(formData.category),
        IsAmendment: hasDataChanged() // Set amendment to true if data has changed
      };

      const response = await api.updateRawMaterial(id, dataToSubmit);
      
      // Set the barcode image URL from API response
      setBarcodeImageUrl(response.barcodeImageUrl);
      
      // Move to step 2
      setCurrentStep(2);
      setSubmitting(false);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  const handlePrint = () => {
    // Print functionality will be implemented later
    console.log('Print button clicked');
  };

  const generateBarcode = () => {
    const name = formData.name.replace(/\s+/g, '').toUpperCase(); // Remove spaces, uppercase
    const expiry = formData.expiryDate.replace(/-/g, '');         // Format as YYYYMMDD
  
    const uniqueId = Date.now().toString(36).toUpperCase();       // Unique timestamp
  
    return `RM-${name}-${expiry}-${uniqueId}`;
  };    

  if (loading) return <div className="text-center text-gray-600 py-10">Loading raw material data...</div>;

  // Step 2: Barcode display (only for verify and change mode)
  if (currentStep === 2 && !isVerifyMode) {
    return (
      <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded-2xl shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">
          Barcode Generated Successfully!
        </h2>
        
        <div className="text-center space-y-6">
          {/* Display the barcode image */}
          <div className="flex justify-center">
            <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
              {barcodeImageUrl ? (
                <img 
                  src={barcodeImageUrl} 
                  alt="Generated Barcode" 
                  className="max-w-full h-auto"
                />
              ) : (
                <div className="text-gray-500">Loading barcode...</div>
              )}
            </div>
          </div>
          
          {/* Raw material details */}
          <div className="bg-gray-50 rounded-lg p-4 text-left">
            <h3 className="font-semibold text-gray-800 mb-2">Raw Material Details:</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="text-gray-600">Name:</span>
              <span className="font-medium">{formData.name}</span>
              <span className="text-gray-600">Type:</span>
              <span className="font-medium">{formData.type}</span>
              <span className="text-gray-600">Category:</span>
              <span className="font-medium">{formData.category}</span>
              <span className="text-gray-600">Package Size:</span>
              <span className="font-medium">{formData.packageSize}</span>
            </div>
          </div>
          
          {/* Print button */}
          <button
            onClick={handlePrint}
            className="px-6 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition mr-4"
          >
            Print Barcode
          </button>
        </div>

        {/* Finish button */}
        <form onSubmit={handleSubmit} className="mt-8">
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
            >
              Back to Form
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
            >
              Finish
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Step 1: Form display
  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded-2xl shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        {isVerifyMode ? 'Verify Raw Material' : 'Verify Raw Material'}
      </h2>

      {/* Show info banner for verify mode */}
      {isVerifyMode && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800 text-sm">
             Make your changes and update. 
          </p>
        </div>
      )}

      {error && <div className="mb-4 text-red-600 font-medium">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block font-medium text-gray-700">Raw Material Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Type */}
        <div>
          <label htmlFor="type" className="block font-medium text-gray-700">Type</label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Type</option>
            <option value="Raw Material">Raw Material</option>
            <option value="Packaging">Packaging</option>
          </select>
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="block font-medium text-gray-700">Category</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            disabled={!formData.type}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          >
            <option value="">Select category</option>
            {formData.type && categoryOptions[formData.type]?.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

        {/* Package Size */}
        <div>
          <label htmlFor="packageSize" className="block font-medium text-gray-700">
            Package Size
          </label>
          <input
            type="text"
            id="packageSize"
            name="packageSize"
            value={formData.packageSize}
            onChange={handlePackageSizeChange}
            disabled={!formData.category}
            placeholder={formData.category ? `e.g., 50 ${getUOMByCategory(formData.category)}` : 'Select category first'}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
        </div>

        {/* Quantity, Current Quantity, and Threshold */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="quantity" className="block font-medium text-gray-700">
              Quantity
            </label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              value={formData.quantity ?? ''}
              onChange={handleChange}
              min="0"
              required
              placeholder={formData.category ? `Enter quantity in ${getUOMByCategory(formData.category)}` : 'Enter quantity'}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="currentQuantity" className="block font-medium text-gray-700">
              Current Quantity
            </label>
            <input
              type="number"
              id="currentQuantity"
              name="currentQuantity"
              value={formData.currentQuantity}
              onChange={handleChange}
              min="0"
              required
              placeholder={formData.category ? `Enter current quantity in ${getUOMByCategory(formData.category)}` : 'Enter current quantity'}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="thresholdQuantity" className="block font-medium text-gray-700">Threshold Quantity %</label>
            <input
              type="number"
              id="thresholdQuantity"
              name="thresholdQuantity"
              value={formData.thresholdQuantity}
              onChange={handleChange}
              min="0"
              max="100"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Expiry Date */}
        <div>
          <label htmlFor="expiryDate" className="block font-medium text-gray-700">Expiry Date</label>
          <input
            type="date"
            id="expiryDate"
            name="expiryDate"
            value={formData.expiryDate}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Cost Per Unit */}
        <div>
          <label htmlFor="costPerUnit" className="block font-medium text-gray-700">Cost Per Unit</label>
          <input
            type="number"
            id="costPerUnit"
            name="costPerUnit"
            value={formData.costPerUnit}
            onChange={handleChange}
            min="0"
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-4 mt-6">
          <button
            type="button"
            onClick={() => navigate('/raw-materials/quality-check')}
            className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
          >
            {isVerifyMode ? 'Back' : 'Cancel'}
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            {isVerifyMode 
              ? submitting ? 'Updating...' : 'Update'
              : submitting 
                ? 'Updating...' 
                : 'Update & Generate Barcode'
            }
          </button>
        </div>
      </form>
    </div>
  );
};

export default RawMaterialVerify;