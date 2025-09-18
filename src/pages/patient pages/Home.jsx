import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../../components/patient components/Layout";
import { BsBell, BsSearch } from "react-icons/bs";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { FaVideo } from "react-icons/fa";
import {
  BsClipboard,
  BsWallet,
  BsHourglassSplit,
  BsTicketPerforated,
  BsFileEarmarkText,
  BsDownload,
} from "react-icons/bs";
import doctor from "/src/assets/images/patient images/doctor.jpeg";
import config from "../../config";
const API_URL = config.API_URL;

const Home = () => {
  const navigate = useNavigate();

  const [pendingAppointments, setPendingAppointments] = useState(0);
  const [pendingPayment, setPendingPayment] = useState(0);
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
  }, []);

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
  }, []);

  const handleVideoCall = (meetLink) => {
    window.open(meetLink, "_blank");
  };

  const [transactionHistory, setTransactionHistory] = useState([]);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchTransactionHistory = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${API_URL}/api/patient/show-all-payments/${userId}`,
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
  }, []);

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
        setPendingPayment(response.summary.totalPendingCount);
        setPendingData(response.data);
      } catch (error) {
        console.log("Unable to fetch pending transactions");
      }
    };
    fetchPendingTransactions();
  }, []);

  return (
    <div>
      <Layout>
        <div className="min-h-screen flex">
          {/* Main Content */}
          <main className="flex-1 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-800">
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

            {/* Dashboard Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 py-10">
              <div className="bg-white shadow-md rounded-lg p-6 border-l-4 border-purple-500 flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-black-600 text-lg font-bold mb-2">
                    Upcoming Appointment
                  </h3>
                  <p className="text-4xl font-bold text-blue-600 mb-2">
                    {pendingAppointments}
                  </p>
                </div>
                <div className="flex-shrink-0 ml-4">
                  <div className="w-16 h-16 bg-blue-50 rounded-lg flex items-center justify-center">
                    <BsClipboard className="text-3xl text-blue-500" />
                  </div>
                </div>
              </div>

              <div className="bg-white shadow-md rounded-lg p-6 border-l-4 border-pink-500 flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-black-600 text-lg font-bold mb-2">
                    Pending Transaction
                  </h3>
                  <p className="text-4xl font-bold text-blue-600 mb-2">
                    {pendingPayment}
                  </p>
                </div>
                <div className="flex-shrink-0 ml-4">
                  <div className="w-16 h-16 bg-pink-50 rounded-lg flex items-center justify-center">
                    <BsHourglassSplit className="text-3xl text-pink-500" />
                  </div>
                </div>
              </div>

              <div className="bg-white shadow-md rounded-lg p-6 border-l-4 border-green-500 flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-black-600 text-lg font-bold mb-2">
                    Coupons
                  </h3>
                  <p className="text-4xl font-bold text-blue-600 mb-2">
                    {couponCount}
                  </p>
                </div>
                <div className="flex-shrink-0 ml-4">
                  <div className="w-16 h-16 bg-green-50 rounded-lg flex items-center justify-center">
                    <BsTicketPerforated className="text-3xl text-green-500" />
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Information Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 py-4">
              <div className="bg-white shadow-md rounded-lg p-6 flex flex-col min-h-[150px] border-l-4 border-blue-500">
                {/* Heading */}
                <div className="flex items-center justify-between mb-4 border-b pb-2">
                  <h3 className="text-gray-800 text-lg font-bold">
                    Upcoming Appointment
                  </h3>
                </div>

                {upcomingAppointments ? (
                  <div className="flex justify-between items-center">
                    {/* Left side: Doctor + details */}
                    <div>
                      <p className="text-lg font-bold text-gray-800">
                        {upcomingAppointments.doctorName}
                      </p>
                      <p className="text-base text-gray-700">
                        {format(
                          new Date(upcomingAppointments.appointmentDate),
                          "dd MMMM yyyy"
                        )}
                      </p>
                      <p className="text-base text-gray-500">
                        {upcomingAppointments.timeSlot}
                      </p>
                    </div>

                    {/* Right side: Button */}
                    <div className="ml-4 flex items-center">
                      {(() => {
                        const now = new Date();
                        const appointmentDateTime = new Date(
                          `${upcomingAppointments.appointmentDate} ${upcomingAppointments.timeSlot}`
                        );
                        const timeDifference =
                          appointmentDateTime.getTime() - now.getTime();
                        const minutesDifference = Math.floor(
                          timeDifference / (1000 * 60)
                        );

                        const isActive =
                          minutesDifference <= 15 && minutesDifference >= -30;

                        return (
                          <button
                            className={`p-3 rounded-full transition-colors ${
                              isActive
                                ? "bg-green-500 text-white hover:bg-green-600 cursor-pointer"
                                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                            }`}
                            onClick={() =>
                              isActive &&
                              handleVideoCall(upcomingAppointments.meetLink)
                            }
                            disabled={!isActive}
                            title={
                              isActive
                                ? "Join Video Call"
                                : "Video call will be available 15 minutes before appointment"
                            }
                          >
                            <FaVideo className="text-lg" />
                          </button>
                        );
                      })()}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center flex-grow">
                    <p className="text-gray-500 text-center text-lg">
                      No upcoming appointment
                    </p>
                  </div>
                )}
              </div>

              <div className="bg-white shadow-md rounded-lg p-6 flex flex-col min-h-[300px] border-l-4 border-indigo-500">
                {/* Header */}
                <div className="flex items-center justify-between mb-6 border-b pb-2">
                  <h3 className="text-gray-800 text-lg font-bold">
                    Transaction History
                  </h3>
                  <button
                    className="text-blue-500 hover:underline font-medium"
                    onClick={() => navigate("/paymentshistory")}
                  >
                    See All
                  </button>
                </div>

                {/* Content */}
                <div className="flex flex-col flex-grow space-y-4">
                  {transactionHistory.length === 0 ? (
                    <div className="flex items-center justify-center flex-grow">
                      <p className="text-gray-500 text-base">
                        No recent transactions
                      </p>
                    </div>
                  ) : (
                    transactionHistory.map((txn, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between border-b pb-3 last:border-b-0"
                      >
                        {/* Left Side */}
                        <div className="flex flex-col">
                          <p className="text-base font-semibold text-gray-700">
                            {txn.paidFor} - {txn.appointmentId.doctor.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {new Date(txn.createdAt).toLocaleDateString()}
                          </p>
                        </div>

                        {/* Right Side */}
                        <p className="text-base font-bold text-gray-800">
                          ₹{txn.amount}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-white shadow-md rounded-lg p-6 flex flex-col min-h-[300px] border-l-4 border-red-500">
                {/* Header */}
                <div className="flex items-center justify-between mb-6 border-b pb-2">
                  <h3 className="text-gray-800 text-lg font-bold">
                    Pending Transactions
                  </h3>
                </div>

                {pendingData && pendingData.summary.totalPendingCount > 0 ? (
                  <div className="flex flex-col space-y-4 flex-grow">
                    {/* Show pending appointments */}
                    {pendingData.pendingAppointments.map((appointment, idx) => (
                      <div
                        key={`apt-${idx}`}
                        className="flex flex-col border-b pb-3 last:border-b-0"
                      >
                        <p className="text-base font-semibold text-gray-800">
                          Appointment Payment
                        </p>
                        <p className="text-sm text-gray-600">
                          Amount: ₹{appointment.amount}
                        </p>
                      </div>
                    ))}

                    {/* Show pending prescriptions */}
                    {pendingData.pendingPrescriptions.map(
                      (prescription, idx) => (
                        <div
                          key={`presc-${idx}`}
                          className="flex flex-col border-b pb-3 last:border-b-0"
                        >
                          <p className="text-base font-semibold text-gray-800">
                            Medicine Payment
                          </p>
                          <p className="text-sm text-gray-600">
                            Amount: ₹{prescription.amount}
                          </p>
                        </div>
                      )
                    )}

                    {/* Summary */}
                    <div className="border-t pt-4 mt-auto">
                      <p className="text-base font-medium text-gray-700">
                        Total Pending: {pendingData.summary.totalPendingCount}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center flex-grow">
                    <p className="text-gray-500 text-base text-center">
                      No pending transactions
                    </p>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </Layout>
    </div>
  );
};

export default Home;
