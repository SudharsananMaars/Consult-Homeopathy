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
      <div className="p-6 space-y-6">
        {/* First Row: TotalPatientBase (left) + TotalEarnings & Appointments (right) */}
        <div className="flex gap-6">
          {/* Left: Total Patient Base - 370px width */}
          <div className="w-[500px] flex-shrink-0">
            <div className="bg-white rounded-xl shadow-lg p-6 h-[734px] overflow-auto">
              <TotalPatientBase/>
            </div>
          </div>

          {/* Right: Two stacked cards - 758px width */}
          <div className="flex-1 flex flex-col gap-6">
            {/* Top: Total Earnings - 352px height */}
            <div className="bg-white rounded-xl shadow-lg p-6 h-[357px] overflow-auto">
              <TotalEarnings/>
            </div>

            {/* Bottom: Appointments - 352px height */}
            <div className="bg-white rounded-xl shadow-lg p-6 h-[357px] overflow-auto">
              <Appointments/>
            </div>
          </div>
        </div>

        {/* Second Row: 3 cards (MedicinePreparation, Shipment, PatientCare) */}
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 h-[270px] overflow-auto">
            <MedicinePreparation/>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 h-[270px] overflow-auto">
            <Shipment/>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 h-[270px] overflow-auto">
            <PatientCare/>
          </div>
        </div>

        {/* Third Row: Patient Communication - full width */}
        <div className="bg-white rounded-xl shadow-lg p-6 h-[270px] overflow-auto">
          <PatientCommunication/>
        </div>

        {/* Fourth Row: WorkforceOverview (left) + InventoryOverview (right) */}
        <div className="flex gap-6">
          {/* Left: Workforce - 370px width */}
          <div className="w-[500px] flex-shrink-0">
            <div className="bg-white rounded-xl shadow-lg p-6 h-[270px] overflow-auto">
              <WorkforceOverview/>
            </div>
          </div>

          {/* Right: Inventory - remaining width (758px) */}
          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-lg p-6 h-[270px] overflow-auto">
              <InventoryOverview/>
            </div>
          </div>
        </div>
      </div>
    </DoctorLayout>
  );
}

export default Dashboard;