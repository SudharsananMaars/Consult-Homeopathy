import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../../components/patient components/Layout";
import { BsBell, BsSearch } from "react-icons/bs";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { FaVideo } from 'react-icons/fa';
import {
  BsClipboard,
  BsWallet,
  BsHourglassSplit,
  BsTicketPerforated,
  BsFileEarmarkText,
  BsDownload,
} from "react-icons/bs";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
} from "chart.js";
import { Pie, Bar, Line } from "react-chartjs-2";
import doctor from "/src/assets/images/patient images/doctor.jpeg";
import config from "../../config";
const API_URL = config.API_URL;

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement
);

const Home = () => {
  const [activeTab, setActiveTab] = useState("Live");
  const navigate = useNavigate();

  const data = {
    labels: ["Morning", "Afternoon", "night"], // Days of the week
    datasets: [
      {
        label: "Dosage Taken each meal",
        data: [1, 2, 2],
        backgroundColor: [
          "rgba(255, 149, 172)",
          "rgba(54, 162, 235)",
          "rgba(255, 206, 86)",
          "rgba(75, 192, 192)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };
  const lineData = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"], // Weekly labels
    datasets: [
      {
        label: "Weekly Dosage Intake",
        data: [52, 73, 75, 92], // Example data for each week
        backgroundColor: "#2196F3", // Blue color
        borderColor: "#1976D2",
        borderWidth: 1,
      },
    ],
  };
  const lineOptions = {
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function (value) {
            return value + "%"; // Convert to percentage
          },
        },
      },
    },
  };
  const [pendingAppointments, setPendingAppointments] = useState(0);


  const [couponCount, setCouponCount] = useState(0);

  useEffect(() => {
  const fetchReferrals = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_URL}/api/patient/referrals-dashboard`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // use summary.total or calculate differently if needed
      setCouponCount(response.data.summary?.total || 0);
    } catch (error) {
      console.log("Error fetching referral coupon count");
    }
  };
  fetchReferrals();
}, [activeTab]);


  const [upcomingAppointments, setUpcomingAppointments] = useState(null);
   useEffect(() => {
  const fetchUpcomingAppointment = async () => {
    try {
      const userId = localStorage.getItem("userId"); 
      const response = await axios.get(
        `${API_URL}/api/patient/${userId}/appointments-for-dashboard`
      );
      
      if (response.data.success && response.data.appointments.length > 0) {
        // keep first appointment for your existing logic
        setUpcomingAppointments(response.data.appointments[0]);

        // also set the count for the purple card
        setPendingAppointments(response.data.appointments.length);
      } else {
        setUpcomingAppointments(null);
        setPendingAppointments(0);
      }
    } catch (error) {
      console.log("Error fetching upcoming appointments");
      setUpcomingAppointments(null);
      setPendingAppointments(0);
    }
  };
  fetchUpcomingAppointment();
}, [activeTab]);


const handleVideoCall = (meetLink) => {
  window.open(meetLink, '_blank');
};

  const [transactionHistory, setTransactionHistory] = useState([]);

useEffect(() => {
  const fetchTransactionHistory = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_URL}/api/patient/show-all-payments/6875dbbaa46a57c54e005944`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Only show last 2 transactions
      setTransactionHistory(response.data.data?.slice(-2) || []);
    } catch (error) {
      console.log("Error fetching transaction history");
    }
  };
  fetchTransactionHistory();
}, [activeTab]);


const [paymentCount, setPaymentCount] = useState(0);
useEffect(() => {
  const fetchPaymentCount = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        `${API_URL}/api/patient/payments/count`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setPaymentCount(response.data.totalPaymentsDone || 0);
      } else {
        setPaymentCount(0);
      }
    } catch (error) {
      console.log("Error fetching payment count", error);
      setPaymentCount(0);
    }
  };

  fetchPaymentCount();
}, [activeTab]);


const [AppointmentsCount, setUpAppointmentsCount] = useState(0);
useEffect(() => {
  const fetchAppointmentsCount = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        `${API_URL}/api/patient/appointments/total/count`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setUpAppointmentsCount(response.data.totalAppointments || 0);
      } else {
        setUpAppointmentsCount(0);
      }
    } catch (error) {
      console.log("Error fetching upcoming appointments count", error);
      setUpAppointmentsCount(0);
    }
  };

  fetchAppointmentsCount();
}, [activeTab]);


const [pendingData, setPendingData] = useState(null);
useEffect(() => {
  const fetchPendingTransactions = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_URL}/api/patient/payments-pending-dashboard`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setPendingData(response.data);
    } catch (error) {
      console.log("Unable to fetch pending transactions");
    }
  };
  fetchPendingTransactions();
}, [activeTab]);

  const handlePay = () => {
    navigate("/payments");
  };

  return (
    <div>
      <Layout>
        <div className="min-h-screen flex">
          {/* Sidebar */}

          {/* Main Content */}
          <main className="flex-1 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-xl font-bold text-gray-800">
                Patient Management Dashboard
              </h1>
              <div className="flex items-center space-x-4">
                <BsSearch className="text-xl text-gray-500" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Dashboard Cards */}
            <div className="bg-gray-50 p-3">
              {/* Tabs for Live and Past */}
              <div className="mb-6 flex justify-center">
                <button
                  className={`px-6 py-2 font-bold ${
                    activeTab === "Live"
                      ? "text-white bg-blue-500"
                      : "text-gray-600 bg-gray-200"
                  } rounded-l-lg`}
                  onClick={() => setActiveTab("Live")}
                >
                  Live
                </button>
                <button
                  className={`px-6 py-2 font-bold ${
                    activeTab === "Past"
                      ? "text-white bg-blue-500"
                      : "text-gray-600 bg-gray-200"
                  } rounded-r-lg`}
                  onClick={() => setActiveTab("Past")}
                >
                  Past
                </button>
              </div>

              {/* Live Tab Content */}
              {activeTab === "Live" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                  <div className="bg-purple-300 shadow-md rounded-lg p-4 flex flex-col items-center justify-center">
                    <div className="flex items-center space-x-2">
                      <div className="bg-white rounded-full p-2">
                        <BsClipboard className="text-2xl text-violet-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-600">
                        Upcoming Appointment
                      </h3>
                    </div>
                    <p className="text-4xl font-bold text-gray-800">
                      {pendingAppointments}
                    </p>
                  </div>

                  <div className="bg-pink-200 shadow-lg rounded-lg p-4 flex flex-col items-center justify-center">
                    <div className="bg-white rounded-full p-2">
                      <BsHourglassSplit className="text-2xl text-pink-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-600">
                      Pending Transaction
                    </h3>
                    <p className="text-4xl font-bold text-gray-800">1</p>
                  </div>

                  <div className="bg-green-200 shadow-lg rounded-lg p-4 flex flex-col items-center justify-center">
                    <div className="bg-white rounded-full p-2">
                      <BsTicketPerforated className="text-2xl text-green-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-600">
                      Coupons
                    </h3>
                    <p className="text-4xl font-bold text-gray-800">
                      {couponCount}
                    </p>
                  </div>
                </div>
              )}

              {/* Past Tab Content */}
              {activeTab === "Past" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                  <div className="bg-blue-300 shadow-lg rounded-lg p-4 flex flex-col items-center justify-center">
                    <div className="flex items-center space-x-2">
                      <div className="bg-white rounded-full p-2">
                        <BsWallet className="text-2xl text-blue-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-600">
                        Transactions
                      </h3>
                    </div>
                    <p className="text-4xl font-bold text-gray-800">{paymentCount}</p>
                  </div>

                  <div className="bg-purple-300 shadow-md rounded-lg p-4 flex flex-col items-center justify-center">
                    <div className="flex items-center space-x-2">
                      <div className="bg-white rounded-full p-2">
                        <BsClipboard className="text-2xl text-violet-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-600">
                        Consultations
                      </h3>
                    </div>
                    <p className="text-4xl font-bold text-gray-800">{AppointmentsCount}</p>
                  </div>

                  <div className="bg-green-200 shadow-lg rounded-lg p-4 flex flex-col items-center justify-center">
                    <div className="bg-white rounded-full p-2">
                      <BsTicketPerforated className="text-2xl text-green-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-600">
                      Used Coupons
                    </h3>
                    <p className="text-4xl font-bold text-gray-800">0</p>
                  </div>
                </div>
              )}
            </div>

            {/* Appointment Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              <div className="bg-white shadow-md rounded-lg p-4 flex flex-col">
  <div className="flex items-center mb-4">
    <div className="flex-1">
      <h3 className="text-lg font-semibold text-gray-800">
        Upcoming Appointment
      </h3>
    </div>
  </div>
  {upcomingAppointments ? (
    <div className="flex flex-col">
      <p className="text-xl font-semibold text-gray-800">
        {upcomingAppointments.doctorName}
      </p>
      <div className="flex items-center justify-between mt-2">
        <div className="flex flex-col">
          <p className="text-md text-gray-700">
            {format(
              new Date(upcomingAppointments.appointmentDate),
              "dd MMMM yyyy"
            )}
          </p>
          <p className="text-md text-gray-500">
            {upcomingAppointments.timeSlot}
          </p>
        </div>
        <button 
          className="bg-green-500 text-white p-3 rounded-full hover:bg-green-600 transition-colors"
          onClick={() => handleVideoCall(upcomingAppointments.meetLink)}
          title="Join Video Call"
        >
          <FaVideo className="text-lg" />
        </button>
      </div>
    </div>
  ) : (
    <p className="text-gray-500 text-center">
      No upcoming appointment
    </p>
  )}
</div>
              <div className="bg-white shadow-lg rounded-lg p-4 flex flex-col min-h-[150px]">
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-lg font-semibold text-gray-800">
      Transaction History
    </h3>
    <button
      className="text-blue-500 hover:underline"
      onClick={() => navigate("/paymentshistory")}
    >
      See All
    </button>

  </div>
  <div className="flex flex-col flex-grow">
    {transactionHistory.length === 0 ? (
      <p className="text-gray-500">No recent transactions</p>
    ) : (
      transactionHistory.map((txn, idx) => (
        <div key={idx}>
          <p className="text-md font-semibold text-gray-700">
            {txn.paidFor} - Dr. {txn.appointmentId.doctor.name}
          </p>
          <div className="flex items-center justify-between mb-2">
            <p className="text-md text-gray-700">
              {new Date(txn.createdAt).toLocaleDateString()}
            </p>
            <p className="text-md text-gray-500">₹{txn.amount}</p>
          </div>
        </div>
      ))
    )}
  </div>
</div>
              <div className="bg-white shadow-lg rounded-lg p-4 flex flex-col">
  <div className="flex items-center justify-between mb-4">
    <h4 className="text-lg font-semibold text-gray-800">
      Pending Transactions
    </h4>
  </div>
  
  {pendingData && pendingData.summary.totalPendingCount > 0 ? (
    <div className="flex flex-col space-y-3">
      {/* Show pending appointments */}
      {pendingData.pendingAppointments.map((appointment, idx) => (
        <div key={`apt-${idx}`} className="flex flex-col">
          <p className="text-md font-semibold text-gray-800">
            Appointment Payment
          </p>
          <p className="text-sm text-gray-600">Amount: ₹{appointment.amount}</p>
        </div>
      ))}
      
      {/* Show pending prescriptions */}
      {pendingData.pendingPrescriptions.map((prescription, idx) => (
        <div key={`presc-${idx}`} className="flex flex-col">
          <p className="text-md font-semibold text-gray-800">
            Medicine Payment
          </p>
          <p className="text-sm text-gray-600">Amount: ₹{prescription.amount}</p>
        </div>
      ))}
      
      {/* Summary */}
      <div className="border-t pt-2">
        <p className="text-sm font-medium text-gray-700">
          Total Pending: {pendingData.summary.totalPendingCount}
        </p>
      </div>
    </div>
  ) : (
    <p className="text-gray-500 text-md text-center">
      No pending transactions
    </p>
  )}
</div>
            </div>

            {/* Blood Group Information */}

            {/* Dosage Pie Chart */}
            <div className="mt-6">
              <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6 w-ful">
                <div className="p-4 bg-white rounded-lg shadow-lg ">
                  <h2 className="text-base font-semibold text-gray-800 mb-4 ">
                    Medicine Dosage{" "}
                  </h2>
                  <div className="w-48 h-48 mx-auto">
                    {" "}
                    {/* Set width and height of the chart */}
                    <Pie data={data} />
                      {" "}
                  </div>
                </div>

                <div className="bg-white shadow-lg rounded-lg p-4 ">
                  <h2 className="text-base font-bold text-gray-800 mb-4">
                    Performance Analysis
                  </h2>
                  <Line
                    data={lineData}
                    options={{ scales: { y: { beginAtZero: true } } }}
                  />
                </div>
                <div className="bg-white shadow-lg rounded-lg p-4 flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                      <BsFileEarmarkText className="mr-2" /> Reports
                    </h3>
                    <button className="text-blue-500 hover:underline">
                      See All
                    </button>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <p className="text-md text-gray-700">Ramya</p>
                      </div>
                      <p className="text-md text-gray-500">15 June 2024</p>
                      <BsDownload className="mr-2 text-blue-500" />
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <p className="text-md text-gray-700">Rahul</p>
                      </div>
                      <p className="text-md text-gray-500">12 Feb 2024</p>
                      <BsDownload className="mr-2 text-blue-500" />
                                
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <p className="text-md text-gray-700">Ramya</p>
                      </div>
                      <p className="text-md text-gray-500">12 Dec 2023</p>
                      <BsDownload className="mr-2 text-blue-500" />
                                
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <p className="text-md text-gray-700">Ramya</p>
                      </div>
                      <p className="text-md text-gray-500">12 April 2023</p>
                      <BsDownload className="mr-2 text-blue-500" />
                                
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </Layout>
    </div>
  );
};

export default Home;
