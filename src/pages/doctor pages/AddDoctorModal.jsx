import React, { useState } from 'react';

const AddDoctorModal = ({ isOpen, onClose }) => {
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    // Personal Information
    fullName: '',
    dateOfBirth: '',
    gender: '',
    maritalStatus: '',
    nationality: '',
    primaryContact: '',
    secondaryContact: '',
    personalEmail: '',
    currentAddress: '',
    permanentAddress: '',
    emergencyContactName: '',
    emergencyContactRelationship: '',
    emergencyContactNumber: '',
// Job Details
employeeID: '',
jobTitle: '',
department: '',
dateOfJoining: '',
employmentType: '',
workLocation: '',
reportingManager: '',
workShift: '',
// Compensation Details
basicSalary: '',
allowances: '',
deductions: '',
bankAccountNumber: '',
bankName: '',
ifscCode: '',
paymentFrequency: '',
pfNumber: '',
esiNumber: '',
taxDeductionPreferences: '',
usernameSystemAccess: '',
    temporaryPassword: '',
    accessLevel: '',
    digitalSignature: null,
    highestQualification: '',
    specialization: '',
    yearOfGraduation: '',
    previousEmployer: '',
    previousDuration: '',
    previousJobRole: '',
    totalExperience: '',
    certifications: '',
    medicalRegistrationNumber: '',
    documents: []
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.files[0] });
  };

  const handleDocumentUpload = (e) => {
    const files = Array.from(e.target.files);
    const newDocuments = files.map((file) => ({
      name: file.name,
      uploaded: false, // Initially set to false
    }));
    
    // Update the state with the new documents
    setUploadedDocuments((prev) => [...prev, ...newDocuments]);
  };
  
  // Handle document removal
  const handleRemoveDocument = (index) => {
    const updatedDocuments = [...uploadedDocuments];
    updatedDocuments.splice(index, 1); // Remove the document at the given index
    setUploadedDocuments(updatedDocuments);
  };
  
  // Update upload status for a document
  const markDocumentAsUploaded = (index) => {
    const updatedDocuments = [...uploadedDocuments];
    updatedDocuments[index].uploaded = true; // Set uploaded status to true
    setUploadedDocuments(updatedDocuments);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/employees/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        console.log('Doctor added successfully:', result);
        onClose();
      } else {
        console.error('Error:', result);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50 p-4">
      <div className="container max-h-[80vh] overflow-y-auto mx-auto p-6 bg-white rounded-lg shadow-lg relative">
        <h2 className="text-2xl font-bold mb-6">Add Employee</h2>
        <form onSubmit={handleSubmit}>
          
            {/* Other fields from the previous sections */}
             {/* Personal Information */}
             <h2 className="text-xl font-semibold mb-3">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium">Full Name *</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                placeholder="Enter Full Name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Date of Birth *</label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Gender *</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                required
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium">Marital Status</label>
              <select
                name="maritalStatus"
                value={formData.maritalStatus}
                onChange={handleChange}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
              >
                <option value="">Select Status</option>
                <option value="Single">Single</option>
                <option value="Married">Married</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium">Nationality</label>
              <input
                type="text"
                name="nationality"
                value={formData.nationality}
                onChange={handleChange}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                placeholder="Enter Nationality"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Primary Contact *</label>
              <input
                type="tel"
                name="primaryContact"
                value={formData.primaryContact}
                onChange={handleChange}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                placeholder="Enter Primary Contact"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Secondary Contact</label>
              <input
                type="tel"
                name="secondaryContact"
                value={formData.secondaryContact}
                onChange={handleChange}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                placeholder="Enter Secondary Contact"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Personal Email Address *</label>
              <input
                type="email"
                name="personalEmail"
                value={formData.personalEmail}
                onChange={handleChange}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                placeholder="Enter Email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Current Address *</label>
              <input
                type="text"
                name="currentAddress"
                value={formData.currentAddress}
                onChange={handleChange}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                placeholder="Enter Current Address"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Permanent Address</label>
              <input
                type="text"
                name="permanentAddress"
                value={formData.permanentAddress}
                onChange={handleChange}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                placeholder="Enter Permanent Address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Emergency Contact Name *</label>
              <input
                type="text"
                name="emergencyContactName"
                value={formData.emergencyContactName}
                onChange={handleChange}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                placeholder="Enter Emergency Contact Name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Emergency Contact Relationship *</label>
              <input
                type="text"
                name="emergencyContactRelationship"
                value={formData.emergencyContactRelationship}
                onChange={handleChange}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                placeholder="Enter Relationship"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Emergency Contact Number *</label>
              <input
                type="tel"
                name="emergencyContactNumber"
                value={formData.emergencyContactNumber}
                onChange={handleChange}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                placeholder="Enter Emergency Contact Number"
                required
              />
            </div>
            </div>

            {/* Job Details */}
            
            <h2 className="text-xl font-semibold mt-6 mb-3">Job Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium">Employee ID</label>
              <input
                type="text"
                name="employeeID"
                value={formData.employeeID}
                onChange={handleChange}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                placeholder="Enter Employee ID"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Designation Job Title</label>
              <select
                name="jobTitle"
                value={formData.jobTitle}
                onChange={handleChange}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
              >
                <option value="">Select Designation</option>
                <option value="Senior Doctor">Senior Doctor</option>
                <option value="Doctor">Doctor</option>
                <option value="Assistant Doctor">Assistant Doctor</option>
                <option value="Executive">Executive</option>
                <option value="Admin- Clinic">Admin- Clinic</option>
                <option value="Admin- Operations">Admin- Operations</option>
                <option value="External Doctor">External Doctor</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium">Department</label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
              >
                <option value="">Select Department</option>
                <option value="Medical">Medical</option>
                <option value="HR">HR</option>
                <option value="IT">IT</option>
                <option value="Operations">Operations</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium">Date of Birth *</label>
              <input
                type="date"
                name="dateOfJoining"
                value={formData.dateOfJoining}
                onChange={handleChange}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Employment Type</label>
              <select
                name="employmentType"
                value={formData.employmentType}
                onChange={handleChange}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
              >
                <option value="">Select Employment Type</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contractual">Contractual</option>
                
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Work Location</label>
              <select
                name="workLocation"
                value={formData.workLocation}
                onChange={handleChange}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
              >
                <option value="">Select Work Location</option>
                <option value="Remote">Remote</option>
                <option value="On-site">On-site</option>
                <option value="Hybrid">Hybrid</option>
                
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium">Reporting Manager *</label>
              <input
                type="text"
                name="reportingManager"
                value={formData.reportingManager}
                onChange={handleChange}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                placeholder="Enter Reporting Manager"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Work Shift/Hours</label>
              <select
                name="workShift"
                value={formData.workShift}
                onChange={handleChange}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
              >
                <option value="">Select Work Shift</option>
                <option value="Day Shift">Day Shift</option>
                <option value="Night Shift">Night Shift</option>
                <option value=" Flexible Hours"> Flexible Hours</option>
                
              </select>
            </div>
            </div>
            
            <h2 className="text-xl font-semibold mt-6 mb-3">Compensation Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

<div>
  <label className="block text-sm font-medium">Basic Salary *</label>
  <input
    type="text"
    name="basicSalary"
    value={formData.basicSalary}
    onChange={handleChange}
    className="w-full mt-1 p-2 border border-gray-300 rounded-md"
    placeholder="Enter Basic Salary"
    required
  />
</div>

<div>
  <label className="block text-sm font-medium">Allowances *</label>
  <input
    type="text"
    name="allowances"
    value={formData.allowances}
    onChange={handleChange}
    className="w-full mt-1 p-2 border border-gray-300 rounded-md"
    placeholder="Enter Allowances"
    required
  />
</div>

<div>
  <label className="block text-sm font-medium">Deductions *</label>
  <input
    type="text"
    name="deductions"
    value={formData.deductions}
    onChange={handleChange}
    className="w-full mt-1 p-2 border border-gray-300 rounded-md"
    placeholder="Enter Deductions"
    required
  />
</div>
<div>
  <label className="block text-sm font-medium">Bank Account Number *</label>
  <input
    type="text"
    name="bankAccountNumber"
    value={formData.bankAccountNumber}
    onChange={handleChange}
    className="w-full mt-1 p-2 border border-gray-300 rounded-md"
    placeholder="Enter Bank Account Number"
    required
  />
</div>

<div>
  <label className="block text-sm font-medium">Bank Name & Branch *</label>
  <input
    type="text"
    name="bankNameBranch"
    value={formData.bankNameBranch}
    onChange={handleChange}
    className="w-full mt-1 p-2 border border-gray-300 rounded-md"
    placeholder="Enter Bank Name and Branch"
    required
  />
</div>

<div>
  <label className="block text-sm font-medium">IFSC Code *</label>
  <input
    type="text"
    name="ifscCode"
    value={formData.ifscCode}
    onChange={handleChange}
    className="w-full mt-1 p-2 border border-gray-300 rounded-md"
    placeholder="Enter IFSC Code"
    required
  />
</div>


<div>
<label className="block text-sm font-medium">Payment Frequency *</label>
  <select
    name="paymentFrequency"
    value={formData.paymentFrequency}
    onChange={handleChange}
    className="w-full mt-1 p-2 border border-gray-300 rounded-md"
    required
  >
    <option value="">Select Payment Frequency</option>
    <option value="Monthly">Monthly</option>
    <option value="Bi-weekly">Bi-weekly</option>
  </select>
</div>

<div>
  <label className="block text-sm font-medium">PF Number</label>
  <input
    type="text"
    name="pfNumber"
    value={formData.pfNumber}
    onChange={handleChange}
    className="w-full mt-1 p-2 border border-gray-300 rounded-md"
    placeholder="Enter PF Number"
  />
</div>

<div>
  <label className="block text-sm font-medium">ESI Number</label>
  <input
    type="text"
    name="esiNumber"
    value={formData.esiNumber}
    onChange={handleChange}
    className="w-full mt-1 p-2 border border-gray-300 rounded-md"
    placeholder="Enter ESI Number"
  />
</div>

<div>
  <label className="block text-sm font-medium">Tax Deduction Preferences</label>
  <input
    type="text"
    name="taxDeductionPreferences"
    value={formData.taxDeductionPreferences}
    onChange={handleChange}
    className="w-full mt-1 p-2 border border-gray-300 rounded-md"
    placeholder="Enter Tax Deduction Preferences"
  />
</div>
</div>

   

  
            {/* Educational and Professional Background */}
            <h3 className="col-span-2 text-xl font-semibold mt-6 mb-6">Educational and Professional Background</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Educational fields */}
            <div>
              <label className="block text-sm font-medium">Highest Qualification *</label>
              <input
                type="text"
                name="highestQualification"
                value={formData.highestQualification}
                onChange={handleChange}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                placeholder="Enter Highest Qualification"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Specialization (if any)</label>
              <input
                type="text"
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                placeholder="Enter Specialization"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Year of Graduation *</label>
              <input
                type="text"
                name="yearOfGraduation"
                value={formData.yearOfGraduation}
                onChange={handleChange}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                placeholder="Enter Year of Graduation"
                required
              />
            </div>

            {/* Previous Employer Details */}
            <h4 className="col-span-2 text-sm font-semibold mt-6 mb-6">Previous Employer Details</h4>

            <div>
              <label className="block text-sm font-medium">Company Name</label>
              <input
                type="text"
                name="previousEmployer"
                value={formData.previousEmployer}
                onChange={handleChange}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                placeholder="Enter Company Name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Duration</label>
              <input
                type="text"
                name="previousDuration"
                value={formData.previousDuration}
                onChange={handleChange}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                placeholder="Enter Duration"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Job Role</label>
              <input
                type="text"
                name="previousJobRole"
                value={formData.previousJobRole}
                onChange={handleChange}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                placeholder="Enter Job Role"
              />
            </div>

            <div>
            <label className="block text-sm font-medium">Total Years of Experience *</label>
            <input
              type="number"
              name="totalExperience"
              value={formData.totalExperience}
              onChange={handleChange}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md"
              placeholder="Enter Total Years of Experience"
              required
            />
          </div>
  
          <div>
            <label className="block text-sm font-medium">Professional Certifications</label>
            <input
              type="text"
              name="certifications"
              value={formData.certifications}
              onChange={handleChange}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md"
              placeholder="Enter Certifications"
            />
          </div>
  
          <div>
            <label className="block text-sm font-medium">Medical Registration Number (for medical staff)</label>
            <input
              type="text"
              name="medicalRegistrationNumber"
              value={formData.medicalRegistrationNumber}
              onChange={handleChange}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md"
              placeholder="Enter Registration Number"
            />
          </div>
          </div>

            {/* Documents Upload Section */}
      

<div className="col-span-2">
  <label className="block text-lg font-medium">Documents Upload</label>
  <input
    type="file"
    name="documents"
    multiple
    onChange={handleDocumentUpload}
    className="w-full mt-1 p-2 border border-gray-300 rounded-md"
  />
</div>

{/* Display Uploaded Documents */}
<div className="col-span-2 mt-2">
  {uploadedDocuments.length > 0 && (
    <ul className="space-y-2">
      {uploadedDocuments.map((doc, index) => (
        <li key={index} className="flex items-center justify-between p-2 border border-gray-300 rounded-lg">
          <span className="flex items-center">
            {doc.uploaded && <span className="text-green-500 mr-2">✓</span>} {/* Tick mark */}
            {doc.name}
          </span>
          <div className="flex items-center">
            <button
              type="button"
              className="text-blue-500 hover:text-blue-700 mr-4"
              onClick={() => markDocumentAsUploaded(index)} // Mark as uploaded
            >
              Upload
            </button>
            <button
              type="button"
              className="text-red-500 hover:text-red-700"
              onClick={() => handleRemoveDocument(index)}
            >
              Remove
            </button>
          </div>
        </li>
      ))}
    </ul>
  )}
</div>

            {/* System Access and Credentials */}
            <h3 className="col-span-2 text-xl font-semibold mt-6 mb-6">System Access and Credentials</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium">Username(System Access) *</label>
                <input
                  type="text"
                  name="usernameSystemAccess"
                  value={formData.usernameSystemAccess}
                  onChange={handleChange}
                  className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                  placeholder="Enter Username"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Temporary Password *</label>
                <input
                  type="password"
                  name="temporaryPassword"
                  value={formData.temporaryPassword}
                  onChange={handleChange}
                  className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                  placeholder="Enter Temporary Password"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Role-based Access Level *</label>
                <select
                  name="accessLevel"
                  value={formData.accessLevel}
                  onChange={handleChange}
                  className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                  required
                >
                  <option>Select Access Level</option>
                  <option>Admin</option>
                  <option>Doctor</option>
                  <option>Assistant Doctor</option>
                  <option>Support Staff</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium">Digital Signature</label>
                <input
                  type="file"
                  name="digitalSignature"
                  onChange={handleFileChange}
                  className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
         

          <div className="flex justify-end mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 mr-4 bg-gray-500 text-white rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-600 text-white rounded-md"
            >
              Create Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDoctorModal;
