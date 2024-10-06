import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import homeo from '/src/assets/images/patient images/homeo.png'; // Ensure this path is correct

const LoginPage = () => {
  const [role, setRole] = useState(''); // 'doctor' or 'patient'
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [errors, setErrors] = useState({ mobileNumber: '', otp: '' });
  const [showOtpInput, setShowOtpInput] = useState(false); // Controls when OTP field is shown
  const [otpSent, setOtpSent] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize role from local storage
    const savedRole = localStorage.getItem('userRole');
    if (savedRole) {
      setRole(savedRole);
    } else {
      // Default role
      setRole('patient');
    }
  }, []);

  const validateFields = () => {
    let isValid = true;
    const newErrors = { mobileNumber: '', otp: '' };

    if (!mobileNumber) {
      newErrors.mobileNumber = 'This field is required';
      isValid = false;
    } else if (!/^\+91\d{10}$/.test(mobileNumber)) {
      newErrors.mobileNumber = 'Enter a valid 10-digit mobile number starting with +91';
      isValid = false;
    }
    
    if (showOtpInput && !otp) {
      newErrors.otp = 'This field is required';
      isValid = false;
    } else if (showOtpInput && !/^\d{6}$/.test(otp)) {
      newErrors.otp = 'OTP must be exactly 6 numeric digits';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const sendOtp = async () => {
    if (validateFields()) {
      try {
        const response = await axios.post('http://localhost:8000/api/otp/send-otp', { 
          phone: mobileNumber,
          role: role === 'patient' ? 'Patient' : 'Doctor',
        });
        if (response.data.success) {
          setOtpSent(true);
          setShowOtpInput(true); // Show OTP input after OTP is sent
          alert('OTP sent successfully!');
        } else {
          alert('Failed to send OTP: ' + response.data.message);
        }
      } catch (error) {
        console.error('Error sending OTP:', error);
        alert('Error sending OTP.');
      }
    }
  };

  const verifyOtp = async () => {
    if (validateFields()) {
      try {
        const response = await axios.post('http://localhost:8000/api/otp/verifyOtp', {
          phone: mobileNumber,
          userOTP: otp,
        });
        if (response.data.success) {
          setShowOtpInput(false);
          localStorage.setItem('accessToken', response.data.accessToken); // Save token
          alert('OTP verified successfully!');
          if (role === 'doctor') {
            navigate('/dashboard'); // Redirect to Doctor Dashboard
          } else if (role === 'patient') {
            navigate('/form'); // Redirect to Patient Dashboard
          }
        } else {
          alert('Invalid or expired OTP');
        }
      } catch (error) {
        console.error('Error verifying OTP:', error);
        alert('Error verifying OTP.');
      }
    }
  };

  const handleRoleSwitch = () => {
    const newRole = role === 'doctor' ? 'patient' : 'doctor';
    localStorage.setItem('userRole', newRole);
    setRole(newRole);
    window.location.reload();
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-blue-100 p-4">
      <div className="flex flex-col md:flex-row w-full max-w-4xl bg-white rounded-lg shadow-md overflow-hidden">
        {/* Image Section */}
        <div className="flex-1 hidden md:block flex items-center justify-center w-1/4 h-1/4 bg-gray-100">
          <img src={homeo} alt="Homeo image" className="max-w-full max-h-full object-contain" />
        </div>

        {/* Login Form Section */}
        <div className="flex-1 p-8">
          <h1 className="text-2xl font-semibold text-center mb-6">
            {role === 'doctor' ? 'Doctor Login' : 'Patient Login'}
          </h1>
          <div className="mb-4">
            <label className="block text-gray-700 mb-1" htmlFor="mobileNumber">
              Mobile Number
            </label>
            <input
            type="text"
            id="mobileNumber"
            value={mobileNumber}
            onChange={(e) => {
              // Remove non-numeric characters except "+"
              let value = e.target.value.replace(/[^\d+]/g, '');

              // Ensure the value starts with "+91"
              if (!value.startsWith('+91')) {
                value = '+91' + value.replace(/^\+91/, ''); // Remove duplicate "+91" if typed manually
              }

              // Limit the input to 10 digits after "+91"
              if (value.length > 13) {
                value = value.slice(0, 13);
              }

              setMobileNumber(value);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Enter your mobile number"
          />

            {errors.mobileNumber && <p className="text-red-500 text-xs mt-1">{errors.mobileNumber}</p>}
          </div>

          {showOtpInput && (
            <div className="mb-4">
              <label className="block text-gray-700 mb-1" htmlFor="otp">
                OTP
              </label>
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/, '').slice(0, 6))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter your OTP"
              />
              {errors.otp && <p className="text-red-500 text-xs mt-1">{errors.otp}</p>}
            </div>
          )}

          <div className="flex justify-center mb-4">
            {!showOtpInput ? (
              <button
                onClick={sendOtp}
                className="bg-blue-600 text-white py-2 px-4 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Send OTP
              </button>
            ) : (
              <button
                onClick={verifyOtp}
                className="bg-green-600 text-white py-2 px-4 rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Verify OTP
              </button>
            )}
          </div>

          <div className="text-center">
            <button
              onClick={handleRoleSwitch}
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              {role === 'doctor' ? 'Switch to Patient Login' : 'Switch to Doctor Login'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
