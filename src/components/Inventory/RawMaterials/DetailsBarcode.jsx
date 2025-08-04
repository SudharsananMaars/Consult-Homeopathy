import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const DetailsBarcode = () => {
  const { id } = useParams(); // This will be the barcode from the URL
  const navigate = useNavigate();

  const [rawMaterial, setRawMaterial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBarcodeDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Make API call to get barcode details
        const response = await fetch(`https://clinic-backend-jdob.onrender.com/api/inventory/barcode/${id}`);
        
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

  if (loading) return <div className="text-center mt-10 text-lg">Loading barcode details...</div>;
  if (error) return <div className="text-red-600 text-center mt-10">Error: {error}</div>;
  if (!rawMaterial) return <div className="text-center mt-10 text-gray-600">Barcode not found</div>;

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-8">
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

      <div className="grid gap-8">
        {/* Basic Info */}
        <Section title="📄 Basic Information">
          <Detail label="Name" value={rawMaterial.name || '—'} />
          <Detail label="Type" value={rawMaterial.type || '—'} />
          <Detail label="Category" value={rawMaterial.category || '—'} />
          <Detail label="Package Size" value={rawMaterial.packageSize || '—'} />
          <Detail label="Unit of Measure" value={rawMaterial.uom || '—'} />
          <Detail label="Stock Status" value={getStockStatus()} />
        </Section>

        {/* Quantity Information */}
        <Section title="📊 Quantity Information">
          <Detail label="Total Quantity" value={`${rawMaterial.quantity || 0} ${rawMaterial.uom || ''}`} />
          <Detail label="Current Quantity" value={`${rawMaterial.currentQuantity || 0} ${rawMaterial.uom || ''}`} />
          <Detail label="Used Quantity" value={`${(rawMaterial.quantity || 0) - (rawMaterial.currentQuantity || 0)} ${rawMaterial.uom || ''}`} />
          <Detail label="Threshold Quantity" value={`${rawMaterial.thresholdQuantity || 0}%`} />
        </Section>

        {/* Financial Information */}
        <Section title="💰 Financial Information">
          <Detail label="Cost Per Unit" value={formatCurrency(rawMaterial.costPerUnit)} />
          <Detail label="Current Stock Value" value={formatCurrency(calculateTotalValue())} />
          <Detail label="Total Investment" value={formatCurrency((rawMaterial.quantity || 0) * (rawMaterial.costPerUnit || 0))} />
        </Section>

        {/* System Info */}
        <Section title="🛠️ System Information">
          <Detail label="Created At" value={formatDate(rawMaterial.createdAt)} />
          <Detail label="Last Updated" value={formatDate(rawMaterial.updatedAt)} />
          <Detail 
            label="Expiry Date" 
            value={
              <span className={isExpiringSoon() ? 'text-red-600 font-semibold' : ''}>
                {formatDate(rawMaterial.expiryDate)}
                {isExpiringSoon() && ' (Expiring Soon!)'}
              </span>
            } 
          />
        </Section>
      </div>

      {/* Action buttons */}
      <div className="mt-8 flex gap-4 justify-center">
        <Link
          to="/inventory"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow"
        >
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

const Section = ({ title, children }) => (
  <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
    <h3 className="text-lg font-semibold mb-4 text-gray-700">{title}</h3>
    <div className="grid md:grid-cols-2 gap-4">{children}</div>
  </div>
);

const Detail = ({ label, value }) => (
  <div className="border-b border-gray-200 pb-2">
    <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
    <p className="text-base font-semibold text-gray-800">{typeof value === 'string' ? value : value}</p>
  </div>
);

export default DetailsBarcode;