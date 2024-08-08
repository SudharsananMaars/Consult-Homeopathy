import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import LoginPage from './pages/LoginPage.jsx';
import Home from './pages/Home.jsx';
import Form from './pages/Form.jsx';
import './index.css';

function App() {
  return (
    <Router>
  
            {/* Routes */}
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/home" element={<Home />} />
          <Route path="/form" element={<Form />} />

        </Routes>
      
    </Router>
  );
}

export default App;
