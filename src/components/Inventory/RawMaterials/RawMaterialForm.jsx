import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { api } from '../services/api';
import Barcode from 'react-barcode';

const RawMaterialForm = ({ isEdit = false }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const initialState = {
    name: '',
    type: '',
    category: '',
    packageSize: '',
    quantity: '',
    currentQuantity: '',
    thresholdQuantity: '80',
    expiryDate: '',
    costPerUnit: '',
    isAlcohol: false,
    vendorName: '',
    vendorLocation: '',
    vendorPhone: '',
    qrSize: 'Medium'
  };

  const [formData, setFormData] = useState(initialState);
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [preview, setPreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  
  // New states for two-step process
  const [currentStep, setCurrentStep] = useState(1); // 1 = form, 2 = barcode display
  const [barcodeImageUrl, setBarcodeImageUrl] = useState(null);
  const [barcode, setBarcode] = useState(null);

  // Category options based on type
  const categoryOptions = {
    'Raw Material': ['Pills', 'Liquid', 'Tablets', 'Individual Medicine'],
    'Packaging': ['Wrapper', 'Cardboard Box', 'Bottle', 'Container']
  };

  // UOM mapping based on category
  const getUOMByCategory = (category) => {
    const uomMap = {
      'Liquid': 'ml',
      'Tablets': 'gms',
      'Pills': 'gms',
      'Individual Medicine': 'pieces',
      'Wrapper': 'pieces',
      'Cardboard Box': 'pieces',
      'Bottle': 'pieces',
      'Container': 'pieces'
    };
    return uomMap[category] || '';
  };

  useEffect(() => {
    const fetchRawMaterial = async () => {
      if (isEdit && id) {
        try {
          setLoading(true);
          const data = await api.getRawMaterial(id);
          const formatted = {
            ...data,
            expiryDate: new Date(data.expiryDate).toISOString().split('T')[0]
          };
          setFormData(formatted);
          console.log('Loaded raw material:', data);
          setLoading(false);
        } catch (err) {
          setError(err.message);
          setLoading(false);
        }
      }
    };
    fetchRawMaterial();
  }, [isEdit, id]);

  // New useEffect to handle URL parameters for pre-filling form
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const isPrefilled = searchParams.get('prefilled');
    
    if (isPrefilled === 'true' && !isEdit) {
      const prefilledData = {
        ...initialState,
        name: searchParams.get('name') || '',
        vendorName: searchParams.get('vendorName') || '',
        vendorPhone: searchParams.get('vendorPhone') || '',
        costPerUnit: searchParams.get('costPerUnit') || '',
        quantity: searchParams.get('quantity') || '',
        currentQuantity: searchParams.get('currentQuantity') || '',
        // Note: vendorEmail is available but not used in form, could be used for vendorLocation or other fields
      };
      
      setFormData(prefilledData);
      
      // Show a notification that form is pre-filled
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded z-50';
      notification.innerHTML = '✓ Form pre-filled with order data';
      document.body.appendChild(notification);
      
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 3000);
    }
  }, [location.search, isEdit]);

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
  // Step 2: Upload image if exists, then navigate
  if (imageFile && barcode) {
    try {
      setSubmitting(true);
      const imageFormData = new FormData();
      imageFormData.append('image', imageFile);
      
      const response = await fetch(`${API_URL}/api/inventory/product-image/${barcode}`, {
        method: 'PATCH',
        body: imageFormData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload product image');
      }
      
      setSubmitting(false);
    } catch (err) {
      setError(`Failed to upload image: ${err.message}`);
      setSubmitting(false);
      return;
    }
  }
  navigate('/raw-materials');
  return;
}

    // Step 1: Generate barcode
    try {
      setSubmitting(true);
      
      // Create FormData instead of regular object when there's an image
      const formDataToSubmit = new FormData();
      
      // Append all form fields
      formDataToSubmit.append('name', formData.name);
      formDataToSubmit.append('type', formData.type);
      formDataToSubmit.append('category', formData.category);
      formDataToSubmit.append('packageSize', formData.packageSize);
      formDataToSubmit.append('quantity', Number(formData.quantity));
      formDataToSubmit.append('currentQuantity', Number(formData.currentQuantity));
      formDataToSubmit.append('thresholdQuantity', Number(formData.thresholdQuantity));
      formDataToSubmit.append('totalWeight', Number(formData.totalWeight));
      formDataToSubmit.append('expiryDate', formData.expiryDate);
      formDataToSubmit.append('costPerUnit', Number(formData.costPerUnit));
      formDataToSubmit.append('uom', getUOMByCategory(formData.category));
      formDataToSubmit.append('isAlcohol', formData.isAlcohol);
      formDataToSubmit.append('vendorName', formData.vendorName);
      formDataToSubmit.append('vendorPhone', formData.vendorPhone);
      formDataToSubmit.append('vendorLocation', formData.vendorLocation);
      formDataToSubmit.append('qrSize', formData.qrSize);
      
      // Append the image file if it exists
      if (imageFile) {
        formDataToSubmit.append('productImage', imageFile);
      }

      let response;
      if (isEdit) {
        response = await api.updateRawMaterial(id, formDataToSubmit);
      } else {
        response = await api.createRawMaterial(formDataToSubmit);
      }
      
      // Set the barcode image URL from API response
      setBarcodeImageUrl(response.barcodeImageUrl);
      setBarcode(response.barcode);
      
      // Move to step 2
      setCurrentStep(2);
      setSubmitting(false);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  const handlePrint = () => {
  if (!barcodeImageUrl) {
    console.error('No barcode image to print');
    return;
  }

  // Create a new window for printing
  const printWindow = window.open('', '_blank');
  
  // Write HTML content for 6x4 inch thermal printer
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Print Barcode</title>
        <style>
          @page {
            size: 6in 4in;
            margin: 0;
          }
          
          body {
            margin: 0;
            padding: 0;
            width: 6in;
            height: 4in;
            display: flex;
            justify-content: center;
            align-items: center;
            box-sizing: border-box;
            background: white;
          }
          
          .barcode-image {
            max-width: 5.5in;
            max-height: 3.5in;
            width: auto;
            height: auto;
            object-fit: contain;
          }
          
          @media print {
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
        </style>
      </head>
      <body>
        <img src="${barcodeImageUrl}" alt="Barcode" class="barcode-image" />
      </body>
    </html>
  `);
  
  printWindow.document.close();
  
  // Wait for image to load before printing
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };
};

  const generateBarcode = () => {
    const name = formData.name.replace(/\s+/g, '').toUpperCase(); // Remove spaces, uppercase
    const expiry = formData.expiryDate.replace(/-/g, '');         // Format as YYYYMMDD
  
    const uniqueId = Date.now().toString(36).toUpperCase();       // Unique timestamp
  
    return `RM-${name}-${expiry}-${uniqueId}`;
  };    

  if (loading) return <div className="text-center text-gray-600 py-10">Loading raw material data...</div>;

  // Step 2: Barcode display
  if (currentStep === 2) {
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
              <span className="text-gray-600">Vendor Name:</span>
              <span className="font-medium">{formData.vendorName}</span>
              <span className="text-gray-600">Vendor Location:</span>
              <span className="font-medium">{formData.vendorLocation}</span>
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

        {/* Product Image Upload */}
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Product Image:
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                  setPreview(reader.result);
                  setImageFile(file);
                };
                reader.readAsDataURL(file);
              }
            }}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
            file:rounded-lg file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
          />
          {preview && (
            <div className="mt-4">
              <img
                src={preview}
                alt="Product preview"
                className="w-full max-w-xs rounded-lg shadow-md"
              />
            </div>
          )}
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
        {isEdit ? 'Edit Raw Material' : 'Add Raw Material'}
      </h2>

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

        {/* Alcohol checkbox - only shows when category is "Liquid" */}
        {formData.category === 'Liquid' && (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isAlcohol"
              name="isAlcohol"
              checked={!formData.isAlcohol}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                isAlcohol: !e.target.checked
              }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isAlcohol" className="font-medium text-gray-700">
              Is your liquid alcohol based?
            </label>
          </div>
        )}

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

        {/* Total Weight */}
{formData.type === 'Raw Material' && (
  <div>
    <label htmlFor="totalWeight" className="block font-medium text-gray-700">Total Weight</label>
    <input
    type="number"
    id="totalWeight"
    name="totalWeight"
    value={formData.totalWeight}
    onChange={handleChange}
    required
    placeholder="Enter Total Weight"
    className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>
)}

        {/* Expiry Date */}
{formData.type === 'Raw Material' && (
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
)}

        {/* Cost Per Unit */}
        <div>
          <label htmlFor="costPerUnit" className="block font-medium text-gray-700">Total Cost</label>
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

        {/* QR Size */}
<div>
  <label htmlFor="qrSize" className="block font-medium text-gray-700">QR Code Size</label>
  <select
    id="qrSize"
    name="qrSize"
    value={formData.qrSize}
    onChange={handleChange}
    required
    className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
  >
    <option value="Very Small">Very Small</option>
    <option value="Small">Small</option>
    <option value="Medium">Medium</option>
    <option value="Large">Large</option>
  </select>
</div>

        {/* Vendor Information Section */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Vendor Information</h3>
          
          {/* Vendor Name */}
          <div className="mb-4">
            <label htmlFor="vendorName" className="block font-medium text-gray-700">Vendor Name</label>
            <input
              type="text"
              id="vendorName"
              name="vendorName"
              value={formData.vendorName}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Vendor Location */}
          <div className="mb-4">
            <label htmlFor="vendorLocation" className="block font-medium text-gray-700">Vendor Location</label>
            <input
              type="text"
              id="vendorLocation"
              name="vendorLocation"
              value={formData.vendorLocation}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Vendor Mobile Number */}
          <div className="mb-4">
            <label htmlFor="vendorPhone" className="block font-medium text-gray-700">Vendor Mobile Number</label>
            <input
              type="tel"
              id="vendorPhone"
              name="vendorPhone"
              value={formData.vendorPhone}
              onChange={handleChange}
              required
              pattern="[0-9]{10}"
              placeholder="Enter 10-digit mobile number"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-4 mt-6">
          <button
            type="button"
            onClick={() => navigate('/raw-materials')}
            className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50"
          >
            {submitting ? 'Uploading...' : 'Finish'}
            </button>
        </div>
      </form>
    </div>
  );
};

export default RawMaterialForm;