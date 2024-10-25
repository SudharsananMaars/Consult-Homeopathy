import React, { useState } from 'react';
import axios from 'axios';
import LoginForm from '/src/components/calllog components/LoginForm.jsx';
import config from '../../config';

const LoginPage = () => {
  const [role, setRole] = useState('admin');
  const [error, setError] = useState('');
  const API_URL = config.API_URL;

  // Handle login
  const handleLogin = async (phoneNumber, password) => {
    try {
      const response = await axios.post(`http://${API_URL}:5000/api/log/login`, {
        phoneNumber,
        password,
        role
      });
  
      // Check if accessToken is returned
      if (response.data.accessToken) {
        // Store the access token using a consistent key
        localStorage.setItem('token', response.data.accessToken);
        
        // Redirect based on the role
        if (role === 'admin') {
          window.location.href = '/admin-dashboard';
        } else {
          window.location.href = '/dashboard';
        }
      } else {
        setError('Login failed. Token not received.');
      }
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-white">
      <div className="w-full max-w-sm text-center">
        <div className="mb-5">
          <i className="fas fa-user-md text-6xl text-black"></i>
        </div>
        <h1 className="text-2xl font-bold mb-5">Welcome Back</h1>
        <div className="flex justify-center mb-5">
          <button
            className={`mx-2 py-2 text-sm font-semibold ${
              role === 'admin' ? 'font-bold border-b-2 border-black' : ''
            }`}
            onClick={() => setRole('admin')}
          >
            Admin
          </button>
          <button
            className={`mx-2 py-2 text-sm ${
              role === 'doctor' ? 'font-bold border-b-2 border-black' : ''
            }`}
            onClick={() => setRole('doctor')}
          >
            Doctor
          </button>
        </div>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <LoginForm onLogin={handleLogin} />
      </div>
    </div>
  );
};

export default LoginPage;
