import React, { useState } from "react";
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
  const [selectedFilter, setSelectedFilter] = useState("day");

  return (
    <DoctorLayout>
      <div className="p-6 space-y-6">
        {/* Filter Section */}
        <div className="flex justify-end">
          <div className="inline-flex border-2 border-blue-500 rounded-full p-0.5 bg-white shadow-md">
            <button
              onClick={() => setSelectedFilter("day")}
              className={`px-4 py-1 rounded-full text-xs font-medium transition-all ${
                selectedFilter === "day"
                  ? "bg-blue-500 text-white shadow-md"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Day
            </button>
            <button
              onClick={() => setSelectedFilter("week")}
              className={`px-4 py-1 rounded-full text-xs font-medium transition-all ${
                selectedFilter === "week"
                  ? "bg-blue-500 text-white shadow-md"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setSelectedFilter("month")}
              className={`px-4 py-1 rounded-full text-xs font-medium transition-all ${
                selectedFilter === "month"
                  ? "bg-blue-500 text-white shadow-md"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Month
            </button>
          </div>
        </div>

        {/* First Row: TotalPatientBase (left) + TotalEarnings & Appointments (right) */}
        <div className="grid grid-cols-3 gap-6">
          {/* Left: Total Patient Base - spans full height */}
          <div className="bg-white rounded-xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)] p-6 overflow-auto">
            <TotalPatientBase filter={selectedFilter} />
          </div>

          {/* Right: Two stacked cards taking 2 columns */}
          <div className="col-span-2 flex flex-col gap-6">
            {/* Top: Total Earnings */}
            <div className="bg-white rounded-xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)] p-6 h-[367px] overflow-auto">
              <TotalEarnings filter={selectedFilter} />
            </div>

            {/* Bottom: Appointments */}
            <div className="bg-white rounded-xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)] p-6 h-[367px] overflow-auto">
              <Appointments filter={selectedFilter} />
            </div>
          </div>
        </div>

        {/* Second Row: 3 cards (MedicinePreparation, Shipment, PatientCare) */}
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)] p-6 h-[270px] overflow-auto">
            <MedicinePreparation filter={selectedFilter} />
          </div>
          <div className="bg-white rounded-xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)] p-6 h-[270px] overflow-auto">
            <Shipment filter={selectedFilter} />
          </div>
          <div className="bg-white rounded-xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)] p-6 h-[270px] overflow-auto">
            <PatientCare filter={selectedFilter} />
          </div>
        </div>

        {/* Third Row: Patient Communication - full width */}
        <div className="bg-white rounded-xl shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.08),0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)] p-6 h-[270px] overflow-auto">
          <PatientCommunication filter={selectedFilter} />
        </div>

        {/* Fourth Row: WorkforceOverview (left) + InventoryOverview (right) */}
        <div className="grid grid-cols-3 gap-6">
          {/* Left: Workforce - same width as Medicine Preparation */}
          <div className="bg-white rounded-xl shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.08),0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)] p-6 h-[270px] overflow-auto">
            <WorkforceOverview filter={selectedFilter} />
          </div>

          {/* Right: Inventory - spans 2 columns */}
          <div className="col-span-2 bg-white rounded-xl shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.08),0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)] p-6 h-[270px] overflow-auto">
            <InventoryOverview filter={selectedFilter} />
          </div>
        </div>
      </div>
    </DoctorLayout>
  );
}

export default Dashboard;
