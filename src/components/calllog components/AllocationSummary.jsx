import React, { useState, useEffect } from 'react';
import { Users, UserCheck } from "lucide-react";

const calculateSummaryStats = (doctors, allocations) => {
  // Organization counts
  const organizationCount = 1; // Assuming single organization for now
  
  // Resource counts
  const totalResources = doctors.length;
  
  // Role types count
  const uniqueRoles = new Set(doctors.map(d => d.role || 'unspecified')).size;
  
  // Allocated resources count
  const allocatedCount = new Set(Object.keys(allocations)).size;

  // Employee breakdowns
  const employeeStats = {
    totalEmployees: doctors.length,
    breakdowns: {
      'Main Doctor': {
        total: doctors.filter(d => d.role === 'admin-doctor').length,
        allocated: doctors.filter(d => 
          d.role === 'admin-doctor' && allocations[d._id]?.length > 0
        ).length
      },
      'Assistant Doctor': {
        total: doctors.filter(d => d.role === 'assistant-doctor').length,
        allocated: doctors.filter(d => 
          d.role === 'assistant-doctor' && allocations[d._id]?.length > 0
        ).length
      },
      'Other Staff': {
        total: doctors.filter(d => !['admin-doctor', 'assistant-doctor'].includes(d.role)).length,
        allocated: doctors.filter(d => 
          !['admin-doctor', 'assistant-doctor'].includes(d.role) && 
          allocations[d._id]?.length > 0
        ).length
      }
    }
  };

  return {
    summaryMetrics: [
      { label: 'Organization Count', value: organizationCount },
      { label: 'No of Resources', value: totalResources },
      { label: 'Roles', value: uniqueRoles },
      { label: 'No of Resources Allocated', value: allocatedCount }
    ],
    employeeStats
  };
};

const SummaryCard = ({ label, value }) => (
  <div className="bg-white p-4 rounded-lg shadow">
    <div className="text-sm text-gray-600 mb-1">{label}</div>
    <div className="text-2xl font-semibold">{value}</div>
  </div>
);

const AllocationSummary = ({ doctors, allocations }) => {
  const { summaryMetrics, employeeStats } = calculateSummaryStats(doctors, allocations);

  return (
    <div className="mb-6 space-y-6">
      {/* Top Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {summaryMetrics.map((metric, index) => (
          <SummaryCard key={index} label={metric.label} value={metric.value} />
        ))}
      </div>

      {/* Employee Breakdown */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Users className="w-5 h-5" />
          Employee Breakdown
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">No of Employees</span>
            <span className="font-semibold">{employeeStats.totalEmployees}</span>
          </div>
          <div className="space-y-2">
            {Object.entries(employeeStats.breakdowns).map(([role, stats], index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                <span className="text-gray-600">{role}</span>
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-green-500" />
                  <span className="font-semibold">
                    {stats.allocated}/{stats.total}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllocationSummary;