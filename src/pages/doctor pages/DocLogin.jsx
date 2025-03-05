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
        localStorage.setItem('role', role); 
        
        // Redirect based on the role
        if (role === 'admin') {
          window.location.href = '/admin-dashboard';
        } else {
          // If the user is a doctor, trigger clock-in
          if (role === 'admin-doctor' || role === 'assistant-doctor') {
            await clockInDoctor(response.data.accessToken); // Trigger clock-in
          }
          window.location.href = '/dashboard';
        }
      } else {
        setError('Login failed. Token not received.');
      }
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  // Function to trigger clock-in for doctors
const clockInDoctor = async (token) => {
  try {
    await axios.post(
      `http://${API_URL}:5000/api/work-hours/check-in`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log('Clock-in recorded successfully');
  } catch (err) {
    console.error('Failed to record clock-in:', err);
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
    className={`mx-2 py-2 text-sm ${
      role === 'admin' ? 'font-bold border-b-2 border-black' : ''
    }`}
    onClick={() => setRole('admin')}
  >
    Admin
  </button>
  <button
    className={`mx-2 py-2 text-sm ${
      role === 'admin-doctor' ? 'font-bold border-b-2 border-black' : ''
    }`}
    onClick={() => setRole('admin-doctor')}
  >
    Admin Doctor
  </button>
  <button
    className={`mx-2 py-2 text-sm ${
      role === 'assistant-doctor' ? 'font-bold border-b-2 border-black' : ''
    }`}
    onClick={() => setRole('assistant-doctor')}
  >
    Assistant Doctor
  </button>
</div>

        {error && <p className="text-red-500 mb-4">{error}</p>}
        <LoginForm onLogin={handleLogin} />
      </div>
    </div>
  );
};

export default LoginPage;
