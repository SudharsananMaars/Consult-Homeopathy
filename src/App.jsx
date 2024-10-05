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
import Invoices from './pages/Invoices.jsx';
import Medicine from './pages/Medicine.jsx';
import Workshops from './pages/Workshops.jsx';
import Settings from './pages/Settings.jsx';
import Notification from './components/Notification.jsx';
import Profile from './pages/Profile.jsx';
import ReferFriend from './pages/ReferFriend.jsx';
import NeedHelp from './pages/NeedHelp.jsx';
import Track from './pages/Track.jsx';
import PaymentPage from './pages/PaymentPage.jsx';
import Messenger from './components/Messenger.jsx';
import HomePage from './pages/HomePage.jsx';

function App() {
  return (
    <div>
    <Router>
  
            {/* Routes */}
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/form" element={<Form />} />
          <Route path="/firstform" element={<FirstForm />} />
          <Route path="/home" element={<Home/>}/>
          <Route path="/homepage" element={<HomePage/>}/>
          
          <Route path="/appointments" element={<Appointments/>} >
            <Route path="/appointments/recent" element={<RecentAppointments />} />
            <Route path="/appointments/upcoming" element={<UpcomingAppointments />} />
            <Route path="/appointments/newappointment" element={<NewAppointment />} />        
            <Route path="/appointments/cancelled" element={<CancelledAppointment />} />
          </Route>

          <Route path="/payments" element={<Payments/>} />
          <Route path="/paymentpage" element={<PaymentPage/>} />
          <Route path="/invoices" element={<Invoices/>}>
          <Route path="/invoices/paymentpage" element={<PaymentPage />} />
          </Route>
          <Route path="/medicine" element={<Medicine/>} />
          <Route path="/track" element={<Track/>} />
          <Route path="/workshops" element={<Workshops/>} />
          <Route path="/settings" element={<Settings/>} />
          <Route path="/notification" element={<Notification/>} />
          <Route path="/profile" element={<Profile/>} />
          <Route path="/refer" element={<ReferFriend/>} />
          <Route path="/messenger" element={<Messenger/>} />
          <Route path="/needhelp" element={<NeedHelp/>} />
          <Route path="/layout" element={<Layout />}></Route>
        </Routes>
      
    </Router>
    </div>
  );
}


export default App;
