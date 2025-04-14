import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from './services/api';

const InventoryDashboard = () => {
  const [stats, setStats] = useState({
    totalRawMaterials: 0,
    totalMedicines: 0,
    lowStockMedicines: 0,
    expiringRawMaterials: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [rawMaterials, medicines] = await Promise.all([
          api.getRawMaterials(),
          api.getMedicines()
        ]);
        
        // Calculate stats
        const today = new Date();
        const nextMonth = new Date();
        nextMonth.setMonth(today.getMonth() + 1);
        
        const lowStockCount = medicines.filter(med => med.stock < 10).length;
        const expiringCount = rawMaterials.filter(
          raw => new Date(raw.expiryDate) < nextMonth
        ).length;
        
        setStats({
          totalRawMaterials: rawMaterials.length,
          totalMedicines: medicines.length,
          lowStockMedicines: lowStockCount,
          expiringRawMaterials: expiringCount
        });
        
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  if (loading) return <div className="loading">Loading dashboard data...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>
      
      <div className="stats-container">
        <div className="stat-card">
          <h3>Raw Materials</h3>
          <p className="stat-number">{stats.totalRawMaterials}</p>
          <Link to="/raw-materials" className="stat-link">View All</Link>
        </div>
        
        <div className="stat-card">
          <h3>Medicines</h3>
          <p className="stat-number">{stats.totalMedicines}</p>
          <Link to="/medicines" className="stat-link">View All</Link>
        </div>
        
        <div className="stat-card warning">
          <h3>Low Stock Medicines</h3>
          <p className="stat-number">{stats.lowStockMedicines}</p>
          <Link to="/medicines?filter=low-stock" className="stat-link">View</Link>
        </div>
        
        <div className="stat-card warning">
          <h3>Expiring Raw Materials</h3>
          <p className="stat-number">{stats.expiringRawMaterials}</p>
          <Link to="/raw-materials?filter=expiring" className="stat-link">View</Link>
        </div>
      </div>
      
      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="action-buttons">
          <Link to="/raw-materials/new" className="btn">Add Raw Material</Link>
          <Link to="/medicines/new" className="btn">Add Medicine</Link>
          <Link to="/medicines/calculate-price" className="btn">Calculate Price</Link>
        </div>
      </div>
    </div>
  );
};

export default InventoryDashboard;