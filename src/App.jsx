import React from 'react';
import './index.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Layout from './components/patient components/Layout.jsx';
import RecentAppointments from './components/patient components/RecentAppointments.jsx';
import UpcomingAppointments from './components/patient components/UpcomingAppointments.jsx';
import NewAppointment from './components/patient components/NewAppointment.jsx';
import CancelledAppointment from './components/patient components/CancelledAppointment.jsx';
import LoginPage from './pages/patient pages/LoginPage.jsx';
import Form from './pages/patient pages/Form.jsx';
import FirstForm from './pages/patient pages/FirstForm.jsx';
import Appointments from './pages/patient pages/Appointments.jsx';
import Home from './pages/patient pages/Home.jsx';
import Payments from './pages/patient pages/Payments.jsx';
// import Invoices from './pages/patient pages/Invoices.jsx';
import Medicine from './pages/patient pages/Medicine.jsx';
import Workshops from './pages/patient pages/Workshops.jsx';
import Settings from './pages/patient pages/Settings.jsx';
import Notification from './components/patient components/Notification.jsx';
import Profile from './pages/patient pages/Profile.jsx';
import ReferFriend from './pages/patient pages/ReferFriend.jsx';
import NeedHelp from './pages/patient pages/NeedHelp.jsx';
import Track from './pages/patient pages/Track.jsx';
import PaymentPage from './pages/patient pages/PaymentPage.jsx';
import Messenger from './components/patient components/Messenger.jsx';
import HomePage from './pages/patient pages/HomePage.jsx';
import RazorScreen from './pages/patient pages/RazorScreen.jsx';
import FamilyTree from './pages/patient pages/FamilyTree.jsx';

// import doctor website
import DoctorLayout from './components/doctor components/DoctorLayout.jsx';
import DocAppointments from './pages/doctor pages/DocAppointments.jsx';
import Dashboard from './pages/doctor pages/Dashboard.jsx';
import AssistDoc from './pages/doctor pages/AssistDoc.jsx';
import WorkshopPage from './pages/doctor pages/WorkshopPage.jsx';
import Inventry from './pages/doctor pages/Inventry.jsx';
import DocInvoices from './pages/doctor pages/DocInvoices.jsx';
import DocMedicine from './pages/doctor pages/DocMedicine.jsx';
import DoctorMessenger from './components/doctor components/DoctorMessenger.jsx';
import DoctorNotification from './components/doctor components/DoctorNotification.jsx';
import Patients from './pages/doctor pages/Patients.jsx';
import DocPayments from './pages/doctor pages/DocPayments.jsx';
import NewProfile from './pages/doctor pages/NewProfile.jsx';
import DocSettings from './pages/doctor pages/DocSettings.jsx';
import ViewDetails from './pages/doctor pages/ViewDetails.jsx';
import AddDoctorModal from './pages/doctor pages/AddDoctorModal.jsx';
import Calender from './pages/doctor pages/Calender.jsx';
import AppointmentList from './pages/doctor pages/AppointmentList.jsx';
import Accounts from './pages/doctor pages/Accounts.jsx';
import Docprofile from './pages/doctor pages/Docprofile.jsx';
import DoctorProfile from './pages/doctor pages/DoctorProfile.jsx';
import NewWorkshop from './pages/doctor pages/NewWorkshop.jsx'; 
import Content from './pages/doctor pages/Content.jsx';
import Doctors from './pages/doctor pages/Doctors.jsx';
import Patientcard from './pages/doctor pages/Patientcard.jsx'; 
import Allocation from './pages/doctor pages/Allocation.jsx';
import VideoCall from './pages/doctor pages/VideoCall.jsx';
import DocLogin from '/src/pages/doctor pages/DocLogin.jsx';
import AdminDashboard from '/src/pages/doctor pages/AdminDashboard.jsx';
import AssistantDoctorDashboard from '/src/pages/doctor pages/AssistantDoctorDashboard.jsx';
import AddDoctor from '/src/pages/doctor pages/AddDoctor.jsx';
import AssistLeave from '/src/pages/doctor pages/AssistLeave.jsx';
import VideoSettings from '/src/pages/doctor pages/VideoSettings.jsx';
import AdminLeaveManagement from './pages/doctor pages/AdminLeaveManagement.jsx';
import LeaveSettingsForm from './pages/doctor pages/LeaveSettingsForm.jsx';
import PayrollSettings from './pages/doctor pages/payrollsettings.jsx';
import Payroll from './pages/doctor pages/payroll.jsx';
import SalaryStructure from './pages/doctor pages/salarystructure.jsx';
import HRPage from './pages/doctor pages/HRPage.jsx';
import BreakTimer from './pages/doctor pages/BreakTimer.jsx';
import Payslip from './pages/doctor pages/payslip.jsx';
import NoteTaking from './pages/doctor pages/NoteTaking.jsx';
import PrescriptionWriting from './components/calllog components/PrescriptionWriting.jsx';
import InventoryPage from './components/calllog components/InventoryPage.jsx';
import '@fortawesome/fontawesome-free/css/all.min.css';

// import '@zoomus/websdk/dist/css/bootstrap.css';
// import '@zoomus/websdk/dist/css/react-select.css';

// Inventory module
import InventoryLayout from './components/Inventory/Layout.jsx';
import InventoryDashboard from './components/Inventory/InventoryDashBoard.jsx';
import RawMaterialsList from './components/Inventory/RawMaterials/RawMaterialsList.jsx';
import RawMaterialForm from './components/Inventory/RawMaterials/RawMaterialForm.jsx';
import RawMaterialDetail from './components/Inventory/RawMaterials/RawMaterialDetail.jsx';
import MedicinesList from './components/Inventory/Medicine/MedicinesList.jsx';
import MedicineDetail from './components/Inventory/Medicine/MedicineDetail.jsx';
import MedicineForm from './components/Inventory/Medicine/MedicineForm.jsx';
import PriceCalculator from './components/Inventory/Medicine/PriceCalculator.jsx';

function App() {
  return (
    <div>
    <Router>
  
            {/* patient Routes */}
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
          {/* <Route path="/invoices" element={<Invoices/>}>
          <Route path="/invoices/paymentpage" element={<PaymentPage />} />
          </Route> */}
          <Route path="/medicine" element={<Medicine/>} />
          <Route path="/track" element={<Track/>} />
          <Route path="/workshops" element={<Workshops/>} />
          <Route path="/settings" element={<Settings/>} />
          <Route path="/notification" element={<Notification/>} />
          <Route path="/profile" element={<Profile/>} />
          <Route path="/refer" element={<ReferFriend/>} />
          <Route path="/messenger" element={<Messenger/>} />
          <Route path="/needhelp" element={<NeedHelp/>} />
          <Route path="/razor" element={<RazorScreen/>} />
          <Route path="/layout" element={<Layout />}></Route>
          <Route path="/family" element={<FamilyTree/>} />


          {/* doctor website routing */}
        <Route path="/layout" element={<DoctorLayout />}></Route>
        <Route path="/appointments/calender" element={<Calender/>}></Route>
        <Route path="/appointments/list" element={<AppointmentList />}></Route>
        <Route path="/appointments" element={<DocAppointments />}></Route>
        <Route path="/dashboard" element={<Dashboard />}></Route>
        <Route path="/assistdoc" element={<AssistDoc />}></Route>
        <Route path="/assistdoc/docprofile" element={<Docprofile />}></Route>
        <Route path="/assistdoc/doctors" element={<Doctors />}></Route>
        <Route path="/assistdoc/doctorprofile/:id" element={<DoctorProfile />}></Route>
        <Route path="adddoctormodal" element={<AddDoctorModal />}></Route>
        <Route path="/content" element={<Content />}></Route>
        <Route path="/inventry" element={<Inventry />}></Route>
        <Route path="/invoices" element={<DocInvoices/>}></Route>
        <Route path="/medicine" element={<DocMedicine/>}></Route>
        <Route path="/messenger" element={<DoctorMessenger/>}></Route>
        <Route path="/notification" element={<DoctorNotification/>}></Route>
        <Route path="/patients" element={<Patients/>}></Route>
        <Route path="/patients/card" element={<Patientcard/>}></Route>
        <Route path="/patients/viewdetails/:id" element={<ViewDetails/>}></Route>
        <Route path="/docpayments" element={<DocPayments/>}></Route>
        <Route path="/newprofile" element={<NewProfile/>}></Route>
        <Route path="/docsettings" element={<DocSettings/>}></Route>
        <Route path="/accounts" element={<Accounts/>}></Route>
        <Route path="/workshoppage" element={<WorkshopPage/>}></Route>
        <Route path="/newworkshop" element={<NewWorkshop/>}></Route>
        <Route path="/allocation" element={<Allocation/>}></Route>
        <Route path="/videocall" element={<VideoCall/>}></Route>
        <Route path="/doclogin" element={<DocLogin />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/doctor-dashboard" element={<AssistantDoctorDashboard />} />
        <Route path="/add-doctor" element={<AddDoctor />} />
        <Route path="/assistleave" element={<AssistLeave />} />
        <Route path="/leavemgt" element={<AdminLeaveManagement />} />
        <Route path="/leavesettings" element={<LeaveSettingsForm />} />
        <Route path="/videosettings" element={<VideoSettings />} />
        <Route path="/payrollsetting" element={<PayrollSettings/>}></Route>
        <Route path="/payroll" element={<Payroll/>}></Route>
        <Route path="/salarystructure" element={<SalaryStructure/>}></Route>
        <Route path="/hrm" element={<HRPage />}></Route>
        <Route path="/break" element={<BreakTimer/>}></Route>
        <Route path="/payslip" element={<Payslip/>}></Route>
        <Route path="/video-call" element={<VideoCall />} />
        <Route path="/note-taking" element={<NoteTaking />} />
        <Route path='/prescription-writing' element={<PrescriptionWriting/>} />

          {/* Inventory Module Routes */}
          <Route path='/inventory' element={<InventoryDashboard/>} />

          <Route path="/raw-materials" element={<RawMaterialsList />} />
          <Route path="/raw-materials/new" element={<RawMaterialForm />} />
          <Route path="/raw-materials/:id" element={<RawMaterialDetail />} />
          <Route path="/raw-materials/:id/edit" element={<RawMaterialForm isEdit={true} />} />

          {/* Medicines Routes */}
          <Route path="/medicines" element={<MedicinesList />} />
          <Route path="/medicines/new" element={<MedicineForm />} />
          <Route path="/medicines/:id" element={<MedicineDetail />} />
          <Route path="/medicines/:id/edit" element={<MedicineForm isEdit={true} />} />
          <Route path="/medicines/calculate-price" element={<PriceCalculator />} />
          <Route path="/inventoryLayout" element={<InventoryLayout />} />
          
        </Routes>
      
    </Router>
    </div>
  );
}


export default App;
