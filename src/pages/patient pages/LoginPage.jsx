import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import homeo from "/src/assets/images/patient images/homeo.png";
import config from "../../config";

const API_URL = config.API_URL;

// Create axios instance to avoid global interceptor conflicts
const apiClient = axios.create({
  baseURL: API_URL,
});

// Set up axios interceptor for handling token in requests
const setupAxiosInterceptors = () => {
  // Request interceptor to add token to headers
  apiClient.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor to handle 401 errors
  apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Token might be expired or invalid
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userType');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );
};

const LoginPage = () => {
  const [identifier, setIdentifier] = useState(''); // email or phone number
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ identifier: '', password: '', otp: '', forgotPassword: '' });
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [loginWithOTP, setLoginWithOTP] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [otpArray, setOtpArray] = useState(Array(6).fill(""));
  const initialTime = 15 * 60;
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (/^[0-9]?$/.test(value)) {
      let newOtpArray = [...otpArray];
      newOtpArray[index] = value;

      setOtpArray(newOtpArray);
      setOtp(newOtpArray.join(""));

      if (value && index < 5) {
        document.getElementById(`otp-input-${index + 1}`).focus();
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otpArray[index] && index > 0) {
      document.getElementById(`otp-input-${index - 1}`).focus();
    }
  };

  useEffect(() => {
    // Set up axios interceptors
    setupAxiosInterceptors();
    
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const isEmail = (str) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
  };

  const isPhoneNumber = (str) => {
    return /^\+91\d{10}$/.test(str);
  };

  const validateFields = () => {
    let isValid = true;
    const newErrors = { identifier: "", password: "", otp: "", forgotPassword: "" };

    if (!identifier) {
      newErrors.identifier = "This field is required";
      isValid = false;
    } else if (!isEmail(identifier) && !isPhoneNumber(identifier)) {
      newErrors.identifier = "Enter a valid email or 10-digit mobile number starting with +91";
      isValid = false;
    }

    if (!loginWithOTP && !password) {
      newErrors.password = "This field is required";
      isValid = false;
    } else if (!loginWithOTP && password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long";
      isValid = false;
    }

    if (showOtpInput && !otp) {
      newErrors.otp = "This field is required";
      isValid = false;
    } else if (showOtpInput && !/^\d{6}$/.test(otp)) {
      newErrors.otp = "OTP must be exactly 6 numeric digits";
      isValid = false;
    }

    if (showForgotPassword && !forgotPasswordEmail) {
      newErrors.forgotPassword = "Email is required";
      isValid = false;
    } else if (showForgotPassword && !isEmail(forgotPasswordEmail)) {
      newErrors.forgotPassword = "Please enter a valid email address";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleForgotPassword = async () => {
    if (showForgotPassword && !forgotPasswordEmail) {
      setErrors(prev => ({ ...prev, forgotPassword: "Email is required" }));
      return;
    }
    
    if (showForgotPassword && !isEmail(forgotPasswordEmail)) {
      setErrors(prev => ({ ...prev, forgotPassword: "Please enter a valid email address" }));
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.post(
        `${API_URL}/api/otp/forgotPassword`,
        {
          identifier: forgotPasswordEmail,
        }
      );

      if (response.data.success) {
        alert("Reset password link has been sent to your email!");
        navigate("/login");
      } else {
        alert("Failed to send reset link: " + response.data.message);
      }
    } catch (error) {
      console.error("Error sending reset link:", error);
      const errorMessage = error.response?.data?.message || "Error sending reset link";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const sendOtp = async () => {
    if (!validateFields()) return;
    
    setLoading(true);
    try {
      // For OTP sending, we typically don't need authentication
      const response = await axios.post(
        `${API_URL}/api/otp/send-otp`,
        {
          phone: identifier,
          email: isEmail(identifier) ? identifier : null,
        }
      );

      if (response.data.success) {
        setOtpSent(true);
        setShowOtpInput(true);
        setTimeLeft(initialTime); // Reset timer
        alert("OTP sent successfully!");
      } else {
        alert("Failed to send OTP: " + response.data.message);
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      const errorMessage = error.response?.data?.message || "Error sending OTP";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!validateFields()) return;
    
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/otp/verifyOtp`, {
        phone: identifier,
        userOTP: otp,
        email: isEmail(identifier) ? identifier : null,
      });
      
      if (response.data.success) {
        const { accessToken, userId, userType } = response.data;
        
        // Store user data
        localStorage.setItem("token", accessToken);
        localStorage.setItem("userId", userId);
        localStorage.setItem("userType", userType);

        // Set default authorization header
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        
        alert("OTP verified successfully!");
        
        // Navigation logic
        if (userType === "Doctor") {
          localStorage.setItem("role", response.data.role);
          navigate("/dashboard");

        } 
        else if (userType === "Patient") {
          navigate("/home");
        }
        
        window.location.reload();
      } else {
        alert("Invalid or expired OTP");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      const errorMessage = error.response?.data?.message || "Error verifying OTP";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
  if (!validateFields()) return;

  setLoading(true);
  try {
    const response = await axios.post(
      `${API_URL}/api/otp/first-login`,
      {
        identifier,
        password,
      }
    );

    if (response.data.success) {
      // Update this line to match your API response structure
      const { accessToken, userId, name, role, userType, requiresPasswordReset} = response.data;

      // Store token and user data with safety checks
      if (accessToken) localStorage.setItem("token", accessToken);
      if (userId) localStorage.setItem("userId", userId.toString());
      if (name) localStorage.setItem("userName", name); // changed from userName to name
      if (role) {
        localStorage.setItem("userRole", role); // changed from userRole to role
        localStorage.setItem("userType", userType);
      }

      // Set default authorization header for future requests
      if (accessToken) {
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      }

      console.log("Login successful:", {
        userId,
        userName: name, // update console log too
        userRole: role, // update console log too
        userType
      });

      // Navigate based on user type (removed requiresPasswordReset logic since API doesn't provide it)
      if (requiresPasswordReset) {
        navigate("/settings");
    }
      else if (userType === "Doctor") {
        localStorage.setItem("role", role);
        navigate("/dashboard");
      } else {
        navigate("/home");
      }
    }
  } catch (error) {
    console.error("Login error:", error);
    console.error("Error response:", error.response?.data);
    
    let errorMessage = "Login failed";
    
    if (error.response?.status === 401) {
      errorMessage = "Invalid credentials. Please check your email/phone and password.";
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    alert(errorMessage);
  } finally {
    setLoading(false);
  }
};

  const handleRegistration = () => {
    navigate("/firstform");
  };

  const handleIdentifierChange = (e) => {
    let value = e.target.value;
    
    // If it looks like a phone number, format it
    if (/^\d/.test(value) || value.startsWith('+')) {
      value = value.replace(/[^\d+]/g, "");
      if (!value.startsWith("+91")) {
        value = "+91" + value.replace(/^\+91/, "");
      }
      if (value.length > 13) {
        value = value.slice(0, 13);
      }
    }
    
    setIdentifier(value);
  };

  const resetOtpState = () => {
    setOtpSent(false);
    setShowOtpInput(false);
    setOtpArray(Array(6).fill(""));
    setOtp("");
    setTimeLeft(initialTime);
  };

  const resetForgotPasswordState = () => {
    setShowForgotPassword(false);
    setForgotPasswordEmail('');
    setErrors(prev => ({ ...prev, forgotPassword: '' }));
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-blue-100 p-4">
      <div className="flex flex-col md:flex-row w-full max-w-4xl bg-white rounded-lg shadow-md overflow-hidden">
        <div className="flex-1 hidden md:block flex items-center justify-center w-1/4 h-1/4">
          <img
            src={homeo}
            alt="Homeo image"
            className="max-w-full max-h-full object-contain bg-blue-700"
          />
        </div>

        <div className="flex-1 p-8">
          <h1 className="text-2xl font-semibold text-center mb-6">
            {showForgotPassword ? 'Forgot Password' : 'Login'}
          </h1>
          
          {showForgotPassword ? (
            <div className="mb-4">
              <label
                className="block text-gray-700 mb-1"
                htmlFor="forgotPasswordEmail"
              >
                Email Address
              </label>
              <input
                type="email"
                id="forgotPasswordEmail"
                value={forgotPasswordEmail}
                onChange={(e) => setForgotPasswordEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter your email address"
              />
              {errors.forgotPassword && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.forgotPassword}
                </p>
              )}
              <div className="flex justify-center space-x-4 mt-4">
                <button
                  onClick={handleForgotPassword}
                  disabled={loading}
                  className="bg-blue-400 text-white py-2 px-4 rounded-full shadow-md hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
                <button
                  onClick={resetForgotPasswordState}
                  className="bg-gray-400 text-white py-2 px-4 rounded-full shadow-md hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Back to Login
                </button>
              </div>
            </div>
          ) : (
            <>
              {!otpSent && (
                <>
                  <div className="mb-4">
                    <label
                      className="block text-gray-700 mb-1"
                      htmlFor="identifier"
                    >
                      Email or Mobile Number
                    </label>
                    <input
                      type="text"
                      id="identifier"
                      value={identifier}
                      onChange={handleIdentifierChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="Enter your email or mobile number"
                    />
                    {errors.identifier && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.identifier}
                      </p>
                    )}
                  </div>

                  {!loginWithOTP && (
                    <div className="mb-4">
                      <label
                        className="block text-gray-700 mb-1"
                        htmlFor="password"
                      >
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          id="password"
                          name="password"
                          autoComplete="current-password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm pr-16"
                          placeholder="Enter your password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 flex items-center px-3 text-sm text-gray-600 hover:text-blue-600 focus:outline-none"
                        >
                          {showPassword ? 'Hide' : 'Show'}
                        </button>
                      </div>

                      {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                      
                      {/* Forgot Password Button */}
                      <div className="mt-2 text-right">
                        <button
                          type="button"
                          onClick={() => setShowForgotPassword(true)}
                          className="text-blue-500 hover:text-blue-700 text-sm focus:outline-none"
                        >
                          Forgot Password?
                        </button>
                      </div>
                      
                      <div className="mb-4 mt-2">
                        <input
                          type="checkbox"
                          id="loginWithOtp"
                          checked={loginWithOTP}
                          onChange={() => {
                            setLoginWithOTP(!loginWithOTP);
                            setShowPassword(!loginWithOTP);
                            resetOtpState();
                          }}
                        />
                        <label
                          className="ml-2 text-gray-700"
                          htmlFor="loginWithOtp"
                        >
                          Login with OTP
                        </label>
                      </div>
                      {!loginWithOTP && (
                        <div className="mb-4 mt-4 flex justify-center">
                          <button
                            onClick={handleLogin}
                            disabled={loading}
                            className="w-1/4 bg-blue-400 text-white py-2 px-4 rounded-full shadow-md hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                          >
                            {loading ? 'Logging in...' : 'Login'}
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {loginWithOTP && (
                    <div className="mb-4 mt-10 flex justify-center">
                      <button
                        onClick={sendOtp}
                        disabled={loading}
                        className="bg-blue-400 text-white py-2 px-4 rounded-full shadow-md hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                      >
                        {loading ? 'Sending...' : 'Send OTP'}
                      </button>
                    </div>
                  )}
                </>
              )}

              {otpSent && (
                <div className="mb-4 text-center">
                  <h2 className="text-lg mb-2 font-bold">OTP Verification</h2>
                  <p className="text-sm text-gray-500 mb-4">
                    We will send you a one-time password to {identifier}
                  </p>
                  <div className="flex justify-center space-x-2">
                    {otpArray.map((digit, index) => (
                      <input
                        key={index}
                        id={`otp-input-${index}`}
                        type="text"
                        value={digit}
                        maxLength="1"
                        onChange={(e) => handleChange(e, index)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        className="w-12 h-12 text-center text-blue-500 text-lg border border-blue-400 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    ))}
                  </div>
                  {errors.otp && (
                    <p className="text-red-500 text-xs mt-1">{errors.otp}</p>
                  )}
                  <div className="text-center">
                    <button
                      onClick={verifyOtp}
                      disabled={timeLeft === 0 || loading}
                      className="bg-green-400 text-white py-2 px-4 mt-4 rounded-full shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                    >
                      {loading ? 'Verifying...' : 'Verify OTP'}
                    </button>
                    <div className="text-center font-semibold text-sm mt-2 text-blue-600">
                      {timeLeft > 0 ? (
                        <p>{formatTime(timeLeft)}</p>
                      ) : (
                        <p>OTP expired. Please resend the OTP.</p>
                      )}
                    </div>
                    <div className="mt-4">
                      <button 
                        onClick={sendOtp} 
                        disabled={loading}
                        className="text-blue-400 hover:text-blue-500 disabled:opacity-50"
                      >
                        Didn't receive any code? Resend OTP
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {!showForgotPassword && (
            <div className="mt-4 text-center">
              <button
                onClick={handleRegistration}
                className="text-blue-500 hover:underline"
              >
                Register as Patient
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;