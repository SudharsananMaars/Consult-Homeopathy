import React from 'react';
import DoctorLayout from "/src/components/doctor components/DoctorLayout.jsx";
import WorkforceOverview from "/src/pages/DashboardComponents/WorkforceOverview.jsx";
import InventoryOverview from "/src/pages/DashboardComponents/InventoryOverview.jsx";
import Shipment from "/src/pages/DashboardComponents/Shipment.jsx";
import MedicinePreparation from "/src/pages/DashboardComponents/MedicinePreparation.jsx";
import PatientCare from "/src/pages/DashboardComponents/PatientCare.jsx";
import TotalPatientBase from "/src/pages/DashboardComponents/TotalPatientBase.jsx";
import TotalEarnings from "/src/pages/DashboardComponents/TotalEarnings.jsx";

function Dashboard() {
  return (
    <DoctorLayout>
      <div className="grid grid-cols-12 gap-6" style={{ minHeight: '700px' }}>
        {/* LEFT COLUMN: Total Patient Base */}
        <div className="col-span-3 bg-white rounded-xl shadow-lg p-6 overflow-auto" style={{ height: '724px' }}>
        </div>

        {/* RIGHT COLUMN: 2 cards 50/50 height */}
        <div className="col-span-9 grid gap-6" style={{ height: '724px', gridTemplateRows: '1fr 1fr' }}>
          {/* Top: Total Earnings Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 flex items-center justify-center" style={{ height: '100%' }}>
            <span className="text-gray-400">Total Earnings Component</span>
          </div>

          {/* Bottom: Combined Appointments / Stats / Calendar Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 flex items-center justify-center" style={{ height: '100%' }}>
            <span className="text-gray-400">Appointments Component</span>
          </div>
        </div>
      </div>

      {/* Bottom row: 3 cards */}
      <div className="grid grid-cols-3 gap-6 mt-6">
        <div className="bg-white rounded-xl shadow-lg p-6 min-h-[170px] flex items-center justify-center">
          <span className="text-gray-400">Med Prep Component</span>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 min-h-[170px] flex items-center justify-center">
          <span className="text-gray-400">Shipment Component</span>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 min-h-[170px] flex items-center justify-center">
          <span className="text-gray-400">Patient Care Component</span>
        </div>
      </div>

      {/* Patient Communication & Feedback */}
      <div className="bg-white rounded-xl shadow-lg p-6 mt-6 min-h-[150px] flex items-center justify-center">
      </div>

      {/* Workforce & Inventory/OrderTracking row */}
      <div className="grid grid-cols-12 gap-6 mt-6">
        <div className="col-span-4 bg-white rounded-xl shadow-lg p-6 flex items-center justify-center min-h-[170px]">
          <span className="text-gray-400">Workforce Overview Component</span>
        </div>
        <div className="col-span-8 bg-white rounded-xl shadow-lg p-6 flex items-center justify-center min-h-[170px]">
          <span className="text-gray-400">Inventory Component</span>
        </div>
      </div>
    </DoctorLayout>
  );
}

export default Dashboard;