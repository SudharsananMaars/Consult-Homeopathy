import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

const UnusedDetails = () => {
  const { id } = useParams(); // This will be the barcode from the URL
  const navigate = useNavigate();

  const [rawMaterial, setRawMaterial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Audit states
  const [auditData, setAuditData] = useState({
    isPresent: null,
    isSealed: null,
    isDamaged: null
  });
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    const fetchBarcodeDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Make API call to get barcode details
        const response = await fetch(`https://clinic-backend-jdob.onrender.com/api/inventory/unused/barcode/${id}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch barcode details: ${response.status}`);
        }
        
        const data = await response.json();
        setRawMaterial(data);
      } catch (err) {
        console.error('Error fetching barcode details:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBarcodeDetails();
    }
  }, [id]);

  // Helper functions for formatting
  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return '—';
    return `₹${amount.toFixed(2)}`;
  };

  const calculateTotalValue = () => {
    if (!rawMaterial?.currentQuantity || !rawMaterial?.costPerUnit) return 0;
    return rawMaterial.currentQuantity * rawMaterial.costPerUnit;
  };

  const getStockStatus = () => {
    if (!rawMaterial) return 'Unknown';
    
    const { quantity, currentQuantity, thresholdQuantity } = rawMaterial;
    if (!quantity || !thresholdQuantity) return 'Unknown';
    
    const usedPercentage = ((quantity - currentQuantity) / quantity) * 100;
    
    if (usedPercentage >= thresholdQuantity) {
      return <span className="text-red-600 font-semibold">Low Stock</span>;
    }
     else {
      return <span className="text-green-600 font-semibold">Available</span>;
    }
  };

  const isExpiringSoon = () => {
    if (!rawMaterial?.expiryDate) return false;
    const today = new Date();
    const expiryDate = new Date(rawMaterial.expiryDate);
    const daysDifference = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
    return daysDifference <= 30;
  };

  // Handle audit question changes
  const handleAuditChange = (field, value) => {
    setAuditData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle verify button click
  const handleVerify = async () => {
    try {
      setIsVerifying(true);
      
      // Make API call to update audit data
      const response = await fetch(`https://clinic-backend-jdob.onrender.com/api/inventory//status-flags/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(auditData)
      });

      if (!response.ok) {
        throw new Error(`Failed to update audit data: ${response.status}`);
      }

      // Navigate to verify route with raw material ID instead of barcode
      navigate(`/raw-materials/${rawMaterial._id}/verify?verify=true`);
      
    } catch (err) {
      console.error('Error updating audit data:', err);
      alert('Failed to update audit data. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  // Check if all audit questions are answered
  const isAuditComplete = () => {
    return auditData.isPresent !== null && 
           auditData.isSealed !== null && 
           auditData.isDamaged !== null;
  };

  if (loading) return <div className="text-center mt-10 text-lg">Loading barcode details...</div>;
  
  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-8">
        <div className="text-center">
          <div className="mb-4">
            <svg className="mx-auto h-16 w-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-red-600 mb-2">⚠️ Barcode Not Found</h2>
          <p className="text-gray-600 mb-6">
            Please enter the correct barcode or check if the item exists in the inventory.
          </p>
          <Link
            to="/raw-materials/quality-check"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow"
          >
             Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }
  
  if (!rawMaterial) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-8">
        <div className="text-center">
          <div className="mb-4">
            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.464-.881-6.08-2.33M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-600 mb-2">📋 Item Not Found</h2>
          <p className="text-gray-600 mb-6">
            The barcode you entered doesn't match any items in our inventory. Please verify and try again.
          </p>
          <Link
            to="/raw-materials/quality-check"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow"
          >
             Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-8">
      {/* Header with material name and barcode */}
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">{rawMaterial.name}</h1>
        <p className="text-lg text-gray-600">Barcode: {rawMaterial.barcode}</p>
        
        {/* Display barcode image if available */}
        {rawMaterial.productImage && (
          <div className="mt-4">
            <img
              src={rawMaterial.productImage}
              alt={`Barcode for ${rawMaterial.name}`}
              className="mx-auto max-w-xs rounded-lg shadow"
            />
          </div>
        )}
      </div>

      {/* Single container with important details only */}
      <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200">
    <div className="grid md:grid-cols-2 gap-x-6 gap-y-4">
    <Detail label="Name" value={rawMaterial.name || '—'} />
    <Detail label="Category" value={rawMaterial.category || '—'} />
    <Detail
      label="Current Quantity"
      value={`${rawMaterial.currentQuantity || 0} ${rawMaterial.uom || ''}`}
    />
    <Detail label="Cost Per Unit" value={formatCurrency(rawMaterial.costPerUnit)} />
    <Detail label="Stock Status" value={getStockStatus()} />
    <Detail label="Current Stock Value" value={formatCurrency(calculateTotalValue())} />
    <Detail
      label="Expiry Date"
      value={
        <span className={isExpiringSoon() ? 'text-red-600 font-semibold' : ''}>
          {formatDate(rawMaterial.expiryDate)}
          {isExpiringSoon() && ' (Expiring Soon!)'}
        </span>
      }
    />
    <Detail label="Package Size" value={rawMaterial.packageSize || '—'} />
  </div>
</div>


      {/* Audit Section */}
      <div className="bg-white p-6 rounded-2xl shadow-md mt-6 border border-gray-200">
  <h3 className="text-xl font-semibold mb-6 text-gray-800 border-b pb-2">Audit</h3>
  <div className="space-y-5">
    {/* Question 1: Is the medicine present? */}
    <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-gray-50 p-4 rounded-xl border">
      <span className="font-medium text-gray-700 mb-2 sm:mb-0">Is the medicine present?</span>
      <div className="flex gap-4">
        <label className="flex items-center gap-1 text-green-600 font-medium">
          <input
            type="radio"
            name="isPresent"
            value="true"
            checked={auditData.isPresent === true}
            onChange={() => handleAuditChange('isPresent', true)}
            className="accent-green-600"
          />
          Yes
        </label>
        <label className="flex items-center gap-1 text-red-600 font-medium">
          <input
            type="radio"
            name="isPresent"
            value="false"
            checked={auditData.isPresent === false}
            onChange={() => handleAuditChange('isPresent', false)}
            className="accent-red-600"
          />
          No
        </label>
      </div>
    </div>

    {/* Question 2: Is the medicine sealed? */}
    <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-gray-50 p-4 rounded-xl border">
      <span className="font-medium text-gray-700 mb-2 sm:mb-0">Is the medicine sealed?</span>
      <div className="flex gap-4">
        <label className="flex items-center gap-1 text-green-600 font-medium">
          <input
            type="radio"
            name="isSealed"
            value="true"
            checked={auditData.isSealed === true}
            onChange={() => handleAuditChange('isSealed', true)}
            className="accent-green-600"
          />
          Yes
        </label>
        <label className="flex items-center gap-1 text-red-600 font-medium">
          <input
            type="radio"
            name="isSealed"
            value="false"
            checked={auditData.isSealed === false}
            onChange={() => handleAuditChange('isSealed', false)}
            className="accent-red-600"
          />
          No
        </label>
      </div>
    </div>

    {/* Question 3: Is the medicine damaged? */}
    <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-gray-50 p-4 rounded-xl border">
      <span className="font-medium text-gray-700 mb-2 sm:mb-0">Is the medicine damaged?</span>
      <div className="flex gap-4">
        <label className="flex items-center gap-1 text-red-600 font-medium">
          <input
            type="radio"
            name="isDamaged"
            value="true"
            checked={auditData.isDamaged === true}
            onChange={() => handleAuditChange('isDamaged', true)}
            className="accent-green-600"
          />
          Yes
        </label>
        <label className="flex items-center gap-1 text-green-600 font-medium">
          <input
            type="radio"
            name="isDamaged"
            value="false"
            checked={auditData.isDamaged === false}
            onChange={() => handleAuditChange('isDamaged', false)}
            className="accent-red-600"
          />
          No
        </label>
      </div>
    </div>
  </div>
</div>


      {/* Action buttons */}
      <div className="mt-8 flex gap-4 justify-center">
        <Link
          to="/raw-materials/quality-check"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow"
        >
           Back to Dashboard
        </Link>
        <button
          onClick={handleVerify}
          disabled={!isAuditComplete() || isVerifying}
          className={`px-6 py-3 rounded-lg transition shadow font-medium ${
            isAuditComplete() && !isVerifying
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isVerifying ? 'Verifying...' : ' Verify'}
        </button>
      </div>
    </div>
  );
};

const Detail = ({ label, value }) => (
  <div className="border-b border-gray-200 pb-2">
    <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
    <p className="text-base font-semibold text-gray-800">{typeof value === 'string' ? value : value}</p>
  </div>
);

export default UnusedDetails;