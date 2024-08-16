import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import LoginPage from './pages/LoginPage.jsx';
import Form from './pages/Form.jsx';
import FirstForm from './pages/FirstForm.jsx';
import BookingPage from './pages/BookingPage.jsx';
import './index.css';

function App() {
  return (
    <Router>
  
            {/* Routes */}
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/form" element={<Form />} />
          <Route path="/firstform" element={<FirstForm />} />
          <Route path="/booking" element={<BookingPage />} />
        </Routes>
      
    </Router>
  );
}

export default App;
