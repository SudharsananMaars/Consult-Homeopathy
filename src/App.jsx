import React from 'react';
import './index.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import RecentAppointments from './components/RecentAppointments.jsx';
import UpcomingAppointments from './components/UpcomingAppointments.jsx';
import NewAppointment from './components/NewAppointment.jsx';
import CancelledAppointment from './components/CancelledAppointment.jsx';
import LoginPage from './pages/LoginPage.jsx';
import Form from './pages/Form.jsx';
import FirstForm from './pages/FirstForm.jsx';
import Appointments from './pages/Appointments.jsx';
import Home from './pages/Home.jsx';
import Payments from './pages/Payments.jsx';
import Pay from './components/Pay.jsx';


function App() {
  return (
    <Router>
  
            {/* Routes */}
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/form" element={<Form />} />
          <Route path="/firstform" element={<FirstForm />} />
          <Route path="/home" element={<Home/>}/>
          <Route path="/appointments" element={<Appointments/>} >
          
            <Route path="/appointments/recent" element={<RecentAppointments />} />
            <Route path="/appointments/upcoming" element={<UpcomingAppointments />} />
            <Route path="/appointments/newappointment" element={<NewAppointment />} />
            <Route path="/appointments/newappointment/pay" element={<Pay />} />
            <Route path="/appointments/cancelled" element={<CancelledAppointment />} />

          </Route>
          
          <Route path="/payments" element={<Payments/>} />
          <Route path="/layout" element={<Layout />}></Route>
        </Routes>
      
    </Router>
  );
}


export default App;
