import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const InventoryLayout = ({ children }) => {
  const location = useLocation();
  
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Pharmacy Management System</h1>
        <nav>
          <ul className="nav-links">
            <li className={location.pathname === '/' ? 'active' : ''}>
              <Link to="/">Dashboard</Link>
            </li>
            <li className={location.pathname.includes('/raw-materials') ? 'active' : ''}>
              <Link to="/raw-materials">Raw Materials</Link>
            </li>
            <li className={location.pathname.includes('/medicines') ? 'active' : ''}>
              <Link to="/medicines">Medicines</Link>
            </li>
          </ul>
        </nav>
      </header>
      <main className="app-content">
        {children}
      </main>
      <footer className="app-footer">
        <p>© 2025 Pharmacy Management System</p>
      </footer>
    </div>
  );
};

export default InventoryLayout;