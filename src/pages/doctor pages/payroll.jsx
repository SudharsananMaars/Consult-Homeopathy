import React, { useState } from "react";
import DoctorLayout from "/src/components/doctor components/DoctorLayout.jsx";
import { FaDownload } from "react-icons/fa";

const HRPayrollModule = () => {
  const [formData, setFormData] = useState({
    employeeID: "",
    employeeName: "",
    baseSalary: 50000, // Fixed base salary
    bonus: 0,
    allowances: 10000, // Fixed allowances
    deductions: 0,
    paymentMode: "Bank Transfer",
    paymentDate: "",
  });

  const [payrollRecords, setPayrollRecords] = useState([]);
  const [editIndex, setEditIndex] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const grossPay =
      Number(formData.baseSalary) +
      Number(formData.bonus) +
      Number(formData.allowances);
    const netPay = grossPay - Number(formData.deductions);

    const newRecord = {
      ...formData,
      grossPay,
      netPay,
    };

    if (editIndex !== null) {
      const updatedRecords = [...payrollRecords];
      updatedRecords[editIndex] = newRecord;
      setPayrollRecords(updatedRecords);
      setEditIndex(null);
    } else {
      setPayrollRecords([...payrollRecords, newRecord]);
    }

    setFormData({
      employeeID: "",
      employeeName: "",
      baseSalary: 50000, // Reset fixed value
      bonus: 0,
      allowances: 10000, // Reset fixed value
      deductions: 0,
      paymentMode: "Bank Transfer",
      paymentDate: "",
    });
  };

  const handleEdit = (index) => {
    const recordToEdit = payrollRecords[index];
    setFormData(recordToEdit);
    setEditIndex(index);
  };

  const generateSalarySlip = (record) => {
    const salarySlipContent = `
      Salary Slip
      Employee ID: ${record.employeeID}
      Employee Name: ${record.employeeName}
      -------------------------
      Base Salary: ${record.baseSalary}
      Allowances: ${record.allowances}
      Bonus: ${record.bonus}
      Gross Pay: ${record.grossPay}
      Deductions: ${record.deductions}
      Net Pay: ${record.netPay}
      -------------------------
      Payment Mode: ${record.paymentMode}
      Payment Date: ${record.paymentDate}
    `;

    const blob = new Blob([salarySlipContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${record.employeeName}_SalarySlip.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DoctorLayout>
    <div className="max-w-5xl mx-auto mt-10 p-6 bg-gray-100 shadow-lg rounded-lg">
      <h2 className="text-3xl font-bold text-center mb-6">Payroll Management</h2>

      {/* Payroll Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
        {/* Employee ID */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Employee ID</label>
          <input
            type="text"
            name="employeeID"
            value={formData.employeeID}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter Employee ID"
            required
          />
        </div>

        {/* Employee Name */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Employee Name</label>
          <input
            type="text"
            name="employeeName"
            value={formData.employeeName}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter Employee Name"
            required
          />
        </div>

        {/* Base Salary (Fixed) */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Base Salary</label>
          <input
            type="number"
            name="baseSalary"
            value={formData.baseSalary}
            readOnly
            className="w-full px-4 py-2 border rounded-lg bg-gray-200"
          />
        </div>

        {/* Allowances (Fixed) */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Allowances</label>
          <input
            type="number"
            name="allowances"
            value={formData.allowances}
            readOnly
            className="w-full px-4 py-2 border rounded-lg bg-gray-200"
          />
        </div>

        {/* Bonus */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Bonus</label>
          <input
            type="number"
            name="bonus"
            value={formData.bonus}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter Bonus"
          />
        </div>

        {/* Deductions */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Deductions</label>
          <input
            type="number"
            name="deductions"
            value={formData.deductions}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter Deductions"
          />
        </div>

        {/* Payment Mode */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Payment Mode</label>
          <select
            name="paymentMode"
            value={formData.paymentMode}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option>Bank Transfer</option>
            <option>Cheque</option>
            <option>Cash</option>
          </select>
        </div>

        {/* Payment Date */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Payment Date</label>
          <input
            type="date"
            name="paymentDate"
            value={formData.paymentDate}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-blue-500 text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-600 transition"
        >
          {editIndex !== null ? "Update Record" : "Add Payroll Record"}
        </button>
      </form>

      {/* Payroll Records Table */}
      <div className="mt-10">
        <h3 className="text-2xl font-bold text-center mb-4">Payroll Records</h3>
        {payrollRecords.length > 0 ? (
          <table className="w-full bg-white shadow-lg rounded-lg">
            <thead className="bg-gray-200 text-gray-600">
              <tr>
                <th className="p-4 text-left">Employee ID</th>
                <th className="p-4 text-left">Employee Name</th>
                <th className="p-4 text-left">Base Salary</th>
                <th className="p-4 text-left">Allowances</th>
                <th className="p-4 text-left">Bonus</th>
                <th className="p-4 text-left">Gross Pay</th>
                <th className="p-4 text-left">Deductions</th>
                <th className="p-4 text-left">Net Pay</th>
                <th className="p-4 text-left">Payment Mode</th>
                <th className="p-4 text-left">Payment Date</th>
                <th className="p-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {payrollRecords.map((record, index) => (
                <tr key={index} className="border-b">
                  <td className="p-4">{record.employeeID}</td>
                  <td className="p-4">{record.employeeName}</td>
                  <td className="p-4">{record.baseSalary}</td>
                  <td className="p-4">{record.allowances}</td>
                  <td className="p-4">{record.bonus}</td>
                  <td className="p-4">{record.grossPay}</td>
                  <td className="p-4">{record.deductions}</td>
                  <td className="p-4">{record.netPay}</td>
                  <td className="p-4">{record.paymentMode}</td>
                  <td className="p-4">{record.paymentDate}</td>
                  <td className="p-4">
                    <button
                      onClick={() => handleEdit(index)}
                      className="bg-yellow-500 text-white px-4 py-2 rounded-lg mr-2 hover:bg-yellow-600"
                    >
                      Edit
                    </button>
                    <button
  onClick={() => generateSalarySlip(record)}
  className="flex items-center bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
>
  <FaDownload className="mr-2" /> {/* Simple Download Icon */}
  Download Slip
</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-center text-gray-600">No payroll records found.</p>
        )}
      </div>
    </div>
    </DoctorLayout>
  );
};


export default HRPayrollModule;
