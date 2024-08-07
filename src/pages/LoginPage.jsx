import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import homeo from 'C:/Users/Mahima Sharon J R/Desktop/website_pro/website/src/assets/images/homeo.png'; // Ensure this path is correct
import 'C:/Users/Mahima Sharon J R/Desktop/website_pro/website/src/index.css';

const LoginPage = () => {
  const [role, setRole] = useState(''); // 'doctor' or 'patient'
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loginWithOTP, setLoginWithOTP] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ mobileNumber: '', password: '', otp: '' });
  const [showPopup, setShowPopup] = useState(false);
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
    const newErrors = { mobileNumber: '', password: '', otp: '' };

    if (!mobileNumber) {
      newErrors.mobileNumber = 'This field is required';
      isValid = false;
    } else if (!/^\d{10}$/.test(mobileNumber)) {
      newErrors.mobileNumber = 'Enter a valid 10-digit mobile number';
      isValid = false;
    }

    if (!loginWithOTP && !password) {
      newErrors.password = 'This field is required';
      isValid = false;
    } else if (!loginWithOTP && !/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])(?=\S)(?!.*\s)[A-Za-z\d@$!%*?&]{8,15}$/.test(password)) {
      newErrors.password = 'Password must be 8-15 characters long and include a mix of letters, numbers, and special characters without spaces';
      isValid = false;
    }

    if (loginWithOTP && !otp) {
      newErrors.otp = 'This field is required';
      isValid = false;
    } else if (!password && !/^\d{6}$/.test(otp)) {
      newErrors.otp = 'OTP must be exactly 6 numeric digits';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleLogin = () => {
    if (validateFields()) {
      // Handle login logic here
      console.log(`Role: ${role}, Mobile Number: ${mobileNumber}, Password: ${password}, OTP: ${otp}, Remember Me: ${rememberMe}, Login with OTP: ${loginWithOTP}`);
      setShowPopup(true);
    }
  };

  const closePopup = () => {
    setShowPopup(false);
    navigate('C:/Users/Mahima Sharon J R/Desktop/website_pro/website/src/pages/Home.jsx');
  };

  const handleRoleSwitch = () => {
    // Update the role in local storage
    const newRole = role === 'doctor' ? 'patient' : 'doctor';
    localStorage.setItem('userRole', newRole);
    
    // Update the role state
    setRole(newRole);
    
    // Refresh the page
    window.location.reload();
  };

  const handleLoginWithOTPChange = (e) => {
    setLoginWithOTP(e.target.checked);
    setPassword(''); // Clear password field when switching to OTP
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
              onChange={(e) => setMobileNumber(e.target.value.replace(/\D/, '').slice(0, 10))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Enter your mobile number"
            />
            {errors.mobileNumber && <p className="text-red-500 text-xs mt-1">{errors.mobileNumber}</p>}
          </div>
          {!loginWithOTP ? (
            <>
              <div className="mb-6">
                <label className="block text-gray-700 mb-1" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    placeholder="Enter your password"
                    disabled={loginWithOTP}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                  >
                    <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} className="text-gray-500" />
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>
            </>
          ) : (
            <div className="mb-6">
              <label className="block text-gray-700 mb-1" htmlFor="otp">
                OTP
              </label>
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/, '').slice(0,6))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter your OTP"
                disabled={password}
              />
              {errors.otp && <p className="text-red-500 text-xs mt-1">{errors.otp}</p>}
            </div>
          )}
          <div className="flex items-center mb-4 justify-between">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-900">
                Remember Me
              </label>
            </div>
            <a href="#" className="text-indigo-600 hover:text-indigo-700 text-sm">
              Forgot Password?
            </a>
          </div>
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="loginWithOTP"
              checked={loginWithOTP}
              onChange={handleLoginWithOTPChange}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="loginWithOTP" className="ml-2 block text-sm text-gray-900">
              Login with OTP instead of password
            </label>
          </div>
          <div className="flex justify-center mb-4">
            <button
              onClick={handleLogin}
              className="bg-blue-600 text-white py-2 px-4 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Login
            </button>
          </div>
          <div className="text-center">
            <button
              onClick={handleRoleSwitch}
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              {role === 'doctor' ? 'Switch to Patient Login' : 'Switch to Doctor Login'}
            </button>
          </div>

          {/* Popup Modal */}
          {showPopup && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-gray-100 p-8 rounded-lg shadow-lg w-full max-w-sm">
                <h2 className="text-xl font-semibold mb-4">Login Successful</h2>
                <p>Your login was successful!</p>
                <div className="flex justify-center mt-4">
                  <button
                    onClick={closePopup}
                    className="bg-blue-600 text-white py-2 px-4 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
