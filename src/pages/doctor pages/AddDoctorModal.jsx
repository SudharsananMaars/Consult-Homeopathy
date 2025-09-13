import React, { useState, useEffect } from 'react';
import config from '../../config';
const API_URL = config.API_URL;

const AddDoctorModal = ({ isOpen, onClose, employeeID, refreshDoctors, doctor }) => {
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const [formData, setFormData] = useState({
    // Personal Information
    name: "",
    dateOfBirth: "",
    gender: "",
    age: "",
    maritalStatus: "",
    nationality: "",
    phone: "",
    secondaryContact: "",
    personalEmail: "",
    currentAddress: "",
    permanentAddress: "",
    emergencyContactName: "",
    emergencyContactRelationship: "",
    emergencyContactNumber: "",
    // Job Details
    employeeID: "",
    role: "",
    department: "",
    dateOfJoining: "",
    employmentType: "",
    workLocation: "",
    reportingManager: "",
    workShift: "",
    // Compensation Details
    basicSalary: "",
    allowances: "",
    deductions: "",
    bankAccountNumber: "",
    bankName: "",
    ifscCode: "",
    paymentFrequency: "",
    pfNumber: "",
    esiNumber: "",
    taxDeductionPreferences: "",
    usernameSystemAccess: "",
    password: "",
    accessLevel: "",
    digitalSignature: null,
    highestQualification: "",
    specialization: "",
    yearOfGraduation: "",
    previousEmployer: "",
    previousDuration: "",
    previousJobRole: "",
    totalExperience: "",
    certifications: [],
    medicalRegistrationNumber: "",
    documents: [],
    follow: "",
    videoPlatform: "googleMeet",
    profilePhoto: "",
    googleAccessToken: "",
    googleRefreshToken: "",
    zoomAccessToken: "",
    zoomRefreshToken: "",
    zoomTokenExpiration: "",
  });

  // Calculate age when date of birth changes
  useEffect(() => {
    if (formData.dateOfBirth) {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      setFormData(prev => ({ ...prev, age: age.toString() }));
    }
  }, [formData.dateOfBirth]);

  // Fetch the generated Employee ID when adding a new doctor (not in edit mode)
  useEffect(() => {
    if (!doctor) {
      async function fetchemployeeID() {
        try {
          const response = await fetch(`${API_URL}/api/employees/generate-employee-id`);
          const data = await response.json();
          if (data.success) {
            setFormData((prevFormData) => ({
              ...prevFormData,
              employeeID: data.employeeID,
            }));
          }
        } catch (error) {
          console.error("Failed to fetch Employee ID:", error);
        }
      }
      fetchemployeeID();
    }
  }, [doctor]);

  // Update form data when doctor changes
  useEffect(() => {
    if (doctor) {
      const fetchEmployeeData = async () => {
        try {
          const response = await fetch(`${API_URL}/api/employees/getEmployeeById/${doctor.employeeID}`);
          const data = await response.json();
          if (data.success) {
            const employee = data.data;
            setFormData((prevFormData) => ({
              ...prevFormData,
              ...employee,
              dateOfBirth: employee.dateOfBirth
                ? new Date(employee.dateOfBirth).toISOString().split("T")[0]
                : "",
              dateOfJoining: employee.dateOfJoining
                ? new Date(employee.dateOfJoining).toISOString().split("T")[0]
                : "",
              zoomTokenExpiration: employee.zoomTokenExpiration
                ? new Date(employee.zoomTokenExpiration).toISOString().split("T")[0]
                : "",
              certifications: Array.isArray(employee.certifications) ? employee.certifications : [],
              documents: employee.documents || [],
              digitalSignature: employee.digitalSignature || null,
              age: employee.age ? employee.age.toString() : "",
              allowances: employee.allowances ? employee.allowances.toString() : "0",
              deductions: employee.deductions ? employee.deductions.toString() : "0",
            }));
          }
        } catch (error) {
          console.error("Error fetching employee details:", error);
          setError("Failed to fetch employee details");
        }
      };

      fetchEmployeeData();
    } else {
      // Reset form for adding a new employee
      setFormData({
        name: '',
        dateOfBirth: '',
        gender: '',
        age: '',
        maritalStatus: '',
        nationality: '',
        phone: '',
        secondaryContact: '',
        personalEmail: '',
        currentAddress: '',
        permanentAddress: '',
        emergencyContactName: '',
        emergencyContactRelationship: '',
        emergencyContactNumber: '',
        employeeID: '',
        role: '',
        department: '',
        dateOfJoining: '',
        employmentType: '',
        workLocation: '',
        reportingManager: '',
        workShift: '',
        basicSalary: '',
        allowances: '0',
        deductions: '0',
        bankAccountNumber: '',
        bankName: '',
        ifscCode: '',
        paymentFrequency: '',
        pfNumber: '',
        esiNumber: '',
        taxDeductionPreferences: '',
        usernameSystemAccess: '',
        password: '',
        accessLevel: '',
        digitalSignature: null,
        highestQualification: '',
        specialization: '',
        yearOfGraduation: '',
        previousEmployer: '',
        previousDuration: '',
        previousJobRole: '',
        totalExperience: '',
        certifications: [],
        medicalRegistrationNumber: '',
        documents: [],
        follow: '',
        videoPlatform: 'googleMeet',
        profilePhoto: '',
        googleAccessToken: '',
        googleRefreshToken: '',
        zoomAccessToken: '',
        zoomRefreshToken: '',
        zoomTokenExpiration: '',
      });
    }
  }, [doctor, employeeID]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle certifications as array
    if (name === 'certifications') {
      const certsArray = value.split(',').map(cert => cert.trim()).filter(cert => cert.length > 0);
      setFormData({ ...formData, [name]: certsArray });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (name === "documents") {
      setFormData({ ...formData, documents: files });
    } else if (name === "digitalSignature") {
      setFormData({ ...formData, digitalSignature: files[0] });
    } else if (name === "profilePhoto") {
      setFormData({ ...formData, profilePhoto: files[0] });
    }
  };

  const validateForm = () => {
    const errors = [];
    
    // Check required fields based on schema
    const requiredFields = [
      'name', 'dateOfBirth', 'gender', 'age', 'maritalStatus', 'nationality', 
      'phone', 'personalEmail', 'currentAddress', 'emergencyContactName',
      'emergencyContactRelationship', 'emergencyContactNumber', 'employeeID',
      'role', 'department', 'dateOfJoining', 'employmentType', 'workLocation',
      'reportingManager', 'workShift', 'basicSalary', 'bankAccountNumber',
      'bankName', 'ifscCode', 'paymentFrequency', 'usernameSystemAccess', 
      'password', 'accessLevel', 'highestQualification'
    ];

    requiredFields.forEach(field => {
      if (!formData[field] || formData[field].toString().trim() === '') {
        errors.push(`${field.replace(/([A-Z])/g, ' $1').toLowerCase()} is required`);
      }
    });

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.personalEmail && !emailRegex.test(formData.personalEmail)) {
      errors.push('Please enter a valid email address');
    }

    // Validate numeric fields
    if (formData.basicSalary && isNaN(Number(formData.basicSalary))) {
      errors.push('Basic salary must be a valid number');
    }

    if (formData.age && isNaN(Number(formData.age))) {
      errors.push('Age must be a valid number');
    }

    if (formData.yearOfGraduation && isNaN(Number(formData.yearOfGraduation))) {
      errors.push('Year of graduation must be a valid number');
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validate form
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors.join(', '));
      return;
    }

    const formDataToSend = new FormData();

    // Prepare data with proper type conversions
    const dataToSend = {
      ...formData,
      // Convert numeric fields
      age: formData.age ? Number(formData.age) : 0,
      basicSalary: formData.basicSalary ? Number(formData.basicSalary) : 0,
      allowances: formData.allowances ? Number(formData.allowances) : 0,
      deductions: formData.deductions ? Number(formData.deductions) : 0,
      yearOfGraduation: formData.yearOfGraduation ? Number(formData.yearOfGraduation) : undefined,
      // Convert dates
      dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : null,
      dateOfJoining: formData.dateOfJoining ? new Date(formData.dateOfJoining) : null,
      zoomTokenExpiration: formData.zoomTokenExpiration ? new Date(formData.zoomTokenExpiration) : undefined,
      // Ensure certifications is array
      certifications: Array.isArray(formData.certifications) ? formData.certifications : []
    };

    // Remove file fields from JSON data as they'll be appended separately
    delete dataToSend.documents;
    delete dataToSend.digitalSignature;
    delete dataToSend.profilePhoto;

    // Append employee data as JSON string
    formDataToSend.append("employeeData", JSON.stringify(dataToSend));

    // Append files separately
    if (formData.digitalSignature) {
      formDataToSend.append("digitalSignature", formData.digitalSignature);
    }

    if (formData.profilePhoto) {
      formDataToSend.append("profilePhoto", formData.profilePhoto);
    }

    if (formData.documents && formData.documents.length > 0) {
      Array.from(formData.documents).forEach((doc) => {
        formDataToSend.append("documents", doc);
      });
    }

    try {
      const isUpdate = doctor && doctor.employeeID;
      const url = isUpdate
        ? `${API_URL}/api/employees/updateEmployee/${doctor.employeeID}`
        : `${API_URL}/api/employees/add`;
      const method = isUpdate ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        body: formDataToSend,
      });

      const responseData = await response.json();

      if (response.ok) {
        alert(isUpdate ? "Profile updated successfully!" : "Profile created successfully!");
        
        if (typeof refreshDoctors === "function") {
          refreshDoctors();
        }

        if (typeof onClose === "function") {
          onClose();
        }
      } else {
        // Handle structured error responses
        if (responseData.details) {
          const errorMessages = Object.values(responseData.details).join(', ');
          setError(`Validation Error: ${errorMessages}`);
        } else {
          setError(responseData.error || "Something went wrong!");
        }
      }
    } catch (error) {
      console.error("Error in form submission:", error);
      setError("Network error occurred. Please try again.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50 p-4">
      <div className="container max-h-[80vh] overflow-y-auto mx-auto p-6 bg-white rounded-lg shadow-lg relative">
        <h2 className="text-2xl font-bold mb-6">
          {doctor ? "Edit Employee" : "Add Employee"}
        </h2>
        
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          {/* Personal Information */}
          <h2 className="text-xl font-semibold mb-3">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium">Full Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
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
              <label className="block text-sm font-medium">Age *</label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md bg-gray-50"
                placeholder="Age (auto-calculated)"
                readOnly
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
              <label className="block text-sm font-medium">Marital Status *</label>
              <select
                name="maritalStatus"
                value={formData.maritalStatus}
                onChange={handleChange}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                required
              >
                <option value="">Select Status</option>
                <option value="Single">Single</option>
                <option value="Married">Married</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium">Nationality *</label>
              <input
                type="text"
                name="nationality"
                value={formData.nationality}
                onChange={handleChange}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                placeholder="Enter Nationality"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Primary Contact *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
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
              <label className="block text-sm font-medium">Employee ID *</label>
              <input
                type="text"
                name="employeeID"
                value={formData.employeeID}
                readOnly
                className="w-full mt-1 p-2 border border-gray-300 rounded-md bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Role *</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                required
              >
                <option value="">Select Role</option>
                <option value="admin-doctor">Admin Doctor</option>
                <option value="assistant-doctor">Assistant Doctor</option>
                <option value="Executive">Executive</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium">Department *</label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                required
              >
                <option value="">Select Department</option>
                <option value="Medical">Medical</option>
                <option value="HR">HR</option>
                <option value="IT">IT</option>
                <option value="Operations">Operations</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium">Date of Joining *</label>
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
              <label className="block text-sm font-medium">Employment Type *</label>
              <select
                name="employmentType"
                value={formData.employmentType}
                onChange={handleChange}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                required
              >
                <option value="">Select Employment Type</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contractual">Contractual</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium">Work Location *</label>
              <select
                name="workLocation"
                value={formData.workLocation}
                onChange={handleChange}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                required
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
              <label className="block text-sm font-medium">Work Shift *</label>
              <select
                name="workShift"
                value={formData.workShift}
                onChange={handleChange}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                required
              >
                <option value="">Select Work Shift</option>
                <option value="Morning Shift">Morning</option>
                <option value="Evening Shift">Evening</option>
                <option value="Night Shift">Night</option>
                <option value="Flexible Hours">Flexible Hours</option>
              </select>
            </div>
          </div>
          
          {/* Compensation Details */}
          <h2 className="text-xl font-semibold mt-6 mb-3">Compensation Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium">Basic Salary *</label>
              <input
                type="number"
                name="basicSalary"
                value={formData.basicSalary}
                onChange={handleChange}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                placeholder="Enter Basic Salary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Allowances</label>
              <input
                type="number"
                name="allowances"
                value={formData.allowances}
                onChange={handleChange}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                placeholder="Enter Allowances"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Deductions</label>
              <input
                type="number"
                name="deductions"
                value={formData.deductions}
                onChange={handleChange}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                placeholder="Enter Deductions"
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
                name="bankName"
                value={formData.bankName}
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
          <h3 className="text-xl font-semibold mt-6 mb-6">Educational and Professional Background</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <label className="block text-sm font-medium">Year of Graduation</label>
              <input
                type="number"
                name="yearOfGraduation"
                value={formData.yearOfGraduation}
                onChange={handleChange}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                placeholder="Enter Year of Graduation"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Previous Company Name</label>
              <input
                type="text"
                name="previousEmployer"
                value={formData.previousEmployer}
                onChange={handleChange}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                placeholder="Enter Previous Company Name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Previous Employment Duration</label>
              <input
                type="text"
                name="previousDuration"
                value={formData.previousDuration}
                onChange={handleChange}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                placeholder="Enter Duration (e.g., 2 years 6 months)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Previous Job Role</label>
              <input
                type="text"
                name="previousJobRole"
                value={formData.previousJobRole}
                onChange={handleChange}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                placeholder="Enter Previous Job Role"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Total Years of Experience</label>
              <input
                type="text"
                name="totalExperience"
                value={formData.totalExperience}
                onChange={handleChange}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                placeholder="Enter Total Years of Experience"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Professional Certifications (comma-separated)</label>
              <input
                type="text"
                name="certifications"
                value={Array.isArray(formData.certifications) ? formData.certifications.join(', ') : formData.certifications}
                onChange={handleChange}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                placeholder="Enter Certifications separated by commas"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Medical Registration Number</label>
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

          {/* System Access and Credentials */}
          <h3 className="text-xl font-semibold mt-6 mb-6">System Access and Credentials</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium">Username (System Access) *</label>
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
              <label className="block text-sm font-medium">Password *</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                  placeholder="Enter Password"
                  required
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-2 top-3 text-sm text-gray-600 hover:text-blue-500"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
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
                <option value="">Select Access Level</option>
                <option value="Admin">Admin</option>
                <option value="Doctor">Doctor</option>
                <option value="Assistant Doctor">Assistant Doctor</option>
                <option value="Support Staff">Support Staff</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium">Digital Signature</label>
              <input
                type="file"
                name="digitalSignature"
                accept="image/*,application/pdf"
                onChange={handleFileChange}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
              />
              {formData.digitalSignature && (
                <p className="text-sm text-gray-600 mt-1">
                  Selected: {formData.digitalSignature.name || "Digital signature file"}
                </p>
              )}
            </div>
          </div>

          {/* Additional Details */}
          <h3 className="text-xl font-semibold mt-6 mb-6">Additional Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium">Follow</label>
              <input
                type="text"
                name="follow"
                value={formData.follow}
                onChange={handleChange}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                placeholder="Enter Follow Information"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Video Platform</label>
              <select
                name="videoPlatform"
                value={formData.videoPlatform}
                onChange={handleChange}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
              >
                <option value="googleMeet">Google Meet</option>
                <option value="zoom">Zoom</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium">Profile Photo</label>
              <input
                type="file"
                name="profilePhoto"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
              />
              {formData.profilePhoto && (
                <p className="text-sm text-gray-600 mt-1">
                  Selected: {formData.profilePhoto.name || "Profile photo file"}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium">Google Access Token</label>
              <input
                type="text"
                name="googleAccessToken"
                value={formData.googleAccessToken}
                onChange={handleChange}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                placeholder="Enter Google Access Token"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Google Refresh Token</label>
              <input
                type="text"
                name="googleRefreshToken"
                value={formData.googleRefreshToken}
                onChange={handleChange}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                placeholder="Enter Google Refresh Token"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Zoom Access Token</label>
              <input
                type="text"
                name="zoomAccessToken"
                value={formData.zoomAccessToken}
                onChange={handleChange}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                placeholder="Enter Zoom Access Token"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Zoom Refresh Token</label>
              <input
                type="text"
                name="zoomRefreshToken"
                value={formData.zoomRefreshToken}
                onChange={handleChange}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                placeholder="Enter Zoom Refresh Token"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Zoom Token Expiration</label>
              <input
                type="date"
                name="zoomTokenExpiration"
                value={formData.zoomTokenExpiration}
                onChange={handleChange}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          {/* Documents Upload Section */}
          <h3 className="text-xl font-semibold mt-6 mb-6">Documents Upload</h3>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium">Upload Documents (Multiple files allowed)</label>
              <input
                type="file"
                name="documents"
                accept="application/pdf,image/*"
                multiple
                onChange={handleFileChange}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
              />
              {formData.documents && formData.documents.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600">Selected files:</p>
                  <ul className="text-sm text-gray-600">
                    {Array.from(formData.documents).map((file, index) => (
                      <li key={index} className="flex items-center justify-between py-1">
                        <span>• {file.name}</span>
                        <span className="text-xs">({Math.round(file.size / 1024)} KB)</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end mt-8 space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              {doctor ? "Update Employee" : "Create Employee"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDoctorModal;