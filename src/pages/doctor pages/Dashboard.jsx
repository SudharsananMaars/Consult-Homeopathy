import React from 'react';
import DoctorLayout from "/src/components/doctor components/DoctorLayout.jsx";
import WorkforceOverview from "/src/pages/DashboardComponents/WorkforceOverview.jsx";
import InventoryOverview from "/src/pages/DashboardComponents/InventoryOverview.jsx";
import Shipment from "/src/pages/DashboardComponents/Shipment.jsx";
import MedicinePreparation from "/src/pages/DashboardComponents/MedicinePreparation.jsx";
import PatientCare from "/src/pages/DashboardComponents/PatientCare.jsx";
import TotalPatientBase from "/src/pages/DashboardComponents/TotalPatientBase.jsx";
import TotalEarnings from "/src/pages/DashboardComponents/TotalEarnings.jsx";
import PatientCommunication from "/src/pages/DashboardComponents/PatientCommunication.jsx";
import Appointments from "/src/pages/DashboardComponents/Appointments.jsx";

function Dashboard() {
  return (
    <DoctorLayout>
      <div className="grid grid-cols-12 gap-6" style={{ minHeight: '700px' }}>
        {/* LEFT COLUMN: Total Patient Base */}
        <div className="col-span-3 bg-white rounded-xl shadow-lg p-6 overflow-auto" style={{ height: '724px' }}>
          <TotalPatientBase/>
        </div>

        {/* RIGHT COLUMN: 2 cards 50/50 height */}
        <div className="col-span-9 grid gap-6" style={{ height: '724px', gridTemplateRows: '1fr 1fr' }}>
          {/* Top: Total Earnings Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 flex items-center justify-center" style={{ height: '100%' }}>
            <TotalEarnings/>
          </div>

          {/* Bottom: Combined Appointments / Stats / Calendar Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 flex items-center justify-center" style={{ height: '100%' }}>
          
          </div>
        </div>
      </div>

      {/* Bottom row: 3 cards */}
      <div className="grid grid-cols-3 gap-6 mt-6">
        <div className="bg-white rounded-xl shadow-lg p-6 min-h-[170px] flex items-center justify-center">
          <MedicinePreparation/>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 min-h-[170px] flex items-center justify-center">
          <Shipment/>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 min-h-[170px] flex items-center justify-center">
          <PatientCare/>
        </div>
      </div>

      {/* Patient Communication & Feedback */}
      <div className="bg-white rounded-xl shadow-lg p-6 mt-6 min-h-[150px] flex items-center justify-center">
        <PatientCommunication/>
      </div>

      {/* Workforce & Inventory/OrderTracking row */}
      <div className="grid grid-cols-12 gap-6 mt-6">
        <div className="col-span-4 bg-white rounded-xl shadow-lg p-6 flex items-center justify-center min-h-[170px]">
          <WorkforceOverview/>
        </div>
        <div className="col-span-8 bg-white rounded-xl shadow-lg p-6 flex items-center justify-center min-h-[170px]">
          <InventoryOverview/>
        </div>
      </div>
    </DoctorLayout>
  );
}

export default Dashboard;