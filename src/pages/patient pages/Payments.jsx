import React, { useState, useEffect } from 'react';
import { Calendar, CreditCard, DollarSign, Package, Truck, Plus, Receipt, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import Layout from "../../components/patient components/Layout";
import config from "../../config";
import axios from "axios";

const Payments = () => {
  const [paymentsData, setPaymentsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [payingBill, setPayingBill] = useState(null);
  const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const API_URL = config.API_URL;

  // Load Razorpay Script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setIsRazorpayLoaded(true);
    script.onerror = () => console.error("Razorpay script failed to load");
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        // Get userId from localStorage
        const userId = localStorage.getItem('userId');
        
        if (!userId) {
          throw new Error('User ID not found in localStorage');
        }

        const response = await fetch(`${API_URL}/api/patient/${userId}/payments`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch payments');
        }

        const data = await response.json();
        setPaymentsData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  // Create Razorpay order for prescription
  const createPrescriptionOrder = async (prescriptionId, amount) => {
    try {
      const token = localStorage.getItem("token");
      const orderRes = await axios.post(
        `${API_URL}/api/payments/create-prescription-order`,
        { prescriptionId, amount },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return orderRes.data;
    } catch (err) {
      console.error("Error creating prescription order:", err);
      throw err;
    }
  };

  // Verify payment for prescription
  const verifyPrescriptionPayment = async (paymentResponse, prescriptionId) => {
    try {
      const token = localStorage.getItem("token");

      const payload = {
        razorpay_order_id: paymentResponse.razorpay_order_id,
        razorpay_payment_id: paymentResponse.razorpay_payment_id,
        razorpay_signature: paymentResponse.razorpay_signature,
        prescriptionId,
      };

      console.log("🔍 Sending prescription payment verification:", payload);

      const verifyRes = await axios.post(
        `${API_URL}/api/payments/verify-prescription-payment`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("✅ Prescription payment verification successful:", verifyRes.data);
      return verifyRes.data;
    } catch (err) {
      console.error("❌ Prescription payment verification failed:", err);
      throw err;
    }
  };

  // Get user info for payment prefill
  const getUserInfo = () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const decoded = JSON.parse(atob(token.split(".")[1]));
        return decoded;
      }
    } catch (error) {
      console.error("Error decoding token:", error);
    }
    return null;
  };

  const handlePayment = async (prescriptionId) => {
    if (!isRazorpayLoaded) {
      setErrorMessage("Payment system is loading. Please wait...");
      return;
    }

    setPayingBill(prescriptionId);
    setErrorMessage("");
    setPaymentStatus(null);

    try {
      // Find the bill to get the amount
      const bill = paymentsData.allBills.find(b => b.prescriptionId === prescriptionId);
      if (!bill) {
        throw new Error("Bill not found");
      }

      console.log("💰 Starting payment for prescription:", prescriptionId, "Amount:", bill.totalCharges);

      // Step 1: Create Razorpay order
      const orderResponse = await createPrescriptionOrder(prescriptionId, bill.totalCharges);
      
      if (!orderResponse.success) {
        throw new Error("Failed to create payment order");
      }

      console.log("📦 Order created:", orderResponse.order.id);

      // Get user info for prefill
      const userInfo = getUserInfo();

      // Step 2: Open Razorpay payment modal
      const options = {
        key: "rzp_test_4yi0hOj6P7akiv", // Use the same key from your appointment booking
        amount: orderResponse.order.amount,
        currency: "INR",
        name: "Prescription Payment",
        description: `Payment for Prescription ${prescriptionId.slice(-8)}`,
        order_id: orderResponse.order.id,
        handler: async (response) => {
          try {
            setPaymentStatus("verifying");
            console.log("🔄 Verifying payment:", response);
            
            await verifyPrescriptionPayment(response, prescriptionId);
            setPaymentStatus("verified");
            
            // Update the bill status locally
            setPaymentsData(prev => ({
              ...prev,
              allBills: prev.allBills.map(bill =>
                bill.prescriptionId === prescriptionId
                  ? { ...bill, isPaid: true }
                  : bill
              ),
              summary: {
                ...prev.summary,
                amountPaid: prev.summary.amountPaid + bill.totalCharges,
                amountDue: prev.summary.amountDue - bill.totalCharges
              }
            }));

            console.log("✅ Payment completed successfully!");
            
          } catch (err) {
            setPaymentStatus("failed");
            setErrorMessage("Payment verification failed. Please contact support.");
            console.error("Payment verification error:", err);
          }
        },
        prefill: {
          name: userInfo?.name || "Patient",
          email: userInfo?.email || "patient@example.com",
          contact: userInfo?.phone || "9000000000",
        },
        theme: {
          color: "#0e76a8",
        },
        modal: {
          ondismiss: () => {
            setPaymentStatus("cancelled");
            setErrorMessage("Payment was cancelled.");
            setPayingBill(null);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      console.error("Payment error:", err);
      let errorMsg = "Payment failed. Please try again.";
      
      if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMsg = err.response.data.error;
      } else if (err.message) {
        errorMsg = err.message;
      }

      setErrorMessage(errorMsg);
      setPaymentStatus("failed");
      setPayingBill(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return `₹${amount.toFixed(2)}`;
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-64">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-100 border-t-blue-600"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="pt-6 px-4">
          <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-base font-medium text-red-900">Error loading payments</h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="pt-6 px-4 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <h1 className="text-xl font-bold text-gray-900 mb-1">Medicine Payment</h1>
          <p className="text-sm text-gray-600">Manage your prescription payments and billing information</p>
        </div>

        {/* Error Message Display */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <div className="ml-3">
                <p className="text-sm text-red-800">{errorMessage}</p>
              </div>
              <button
                onClick={() => setErrorMessage("")}
                className="ml-auto text-red-400 hover:text-red-600"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Payment Status Display */}
        {paymentStatus && (
          <div className={`border rounded-lg p-3 ${
            paymentStatus === 'verified' 
              ? 'bg-green-50 border-green-200' 
              : paymentStatus === 'verifying'
              ? 'bg-blue-50 border-blue-200'
              : 'bg-yellow-50 border-yellow-200'
          }`}>
            <div className="flex items-center">
              {paymentStatus === 'verified' && <CheckCircle className="h-4 w-4 text-green-400" />}
              {paymentStatus === 'verifying' && <div className="animate-spin h-4 w-4 border-2 border-blue-400 border-t-transparent rounded-full" />}
              {paymentStatus === 'cancelled' && <Clock className="h-4 w-4 text-yellow-400" />}
              <div className="ml-3">
                <p className={`text-sm ${
                  paymentStatus === 'verified' 
                    ? 'text-green-800' 
                    : paymentStatus === 'verifying'
                    ? 'text-blue-800'
                    : 'text-yellow-800'
                }`}>
                  {paymentStatus === 'verified' && 'Payment completed successfully!'}
                  {paymentStatus === 'verifying' && 'Verifying payment...'}
                  {paymentStatus === 'cancelled' && 'Payment was cancelled'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="group bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Amount</p>
                <p className="text-xl font-bold text-gray-900 mt-1">
                  {formatCurrency(paymentsData.summary.totalAmount)}
                </p>
                <div className="mt-1 text-xs text-gray-600">All prescriptions</div>
              </div>
              <div className="h-12 w-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="group bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Amount Paid</p>
                <p className="text-xl font-bold text-green-600 mt-1">
                  {formatCurrency(paymentsData.summary.amountPaid)}
                </p>
                <div className="mt-1 text-xs text-gray-600">Successfully processed</div>
              </div>
              <div className="h-12 w-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="group bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Amount Due</p>
                <p className="text-xl font-bold text-red-600 mt-1">
                  {formatCurrency(paymentsData.summary.amountDue)}
                </p>
                <div className="mt-1 text-xs text-gray-600">Pending payment</div>
              </div>
              <div className="h-12 w-12 bg-gradient-to-br from-red-100 to-pink-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Clock className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Bills List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Package className="h-4 w-4 text-blue-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">All Bills</h2>
            </div>
          </div>
          
          <div className="divide-y divide-gray-100">
            {paymentsData.allBills.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <div className="bg-gray-100 rounded-full h-16 w-16 mx-auto mb-3 flex items-center justify-center">
                  <Receipt className="h-8 w-8 text-gray-400" />
                </div>
                <div className="text-gray-500 text-base font-medium">No bills found</div>
                <div className="text-gray-400 text-sm mt-1">Your billing history will appear here</div>
              </div>
            ) : (
              paymentsData.allBills.map((bill) => (
                <div key={bill.prescriptionId} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Bill Header */}
                      <div className="flex items-center space-x-3 mb-4">
                        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                          bill.isPaid 
                            ? 'bg-gradient-to-br from-green-100 to-emerald-100' 
                            : 'bg-gradient-to-br from-orange-100 to-red-100'
                        }`}>
                          <Package className={`h-5 w-5 ${
                            bill.isPaid ? 'text-green-600' : 'text-orange-600'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="text-base font-bold text-gray-900">
                              Prescription {bill.prescriptionId.slice(-8)}
                            </h3>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              bill.isPaid 
                                ? 'bg-green-100 text-green-800 border border-green-200' 
                                : 'bg-red-100 text-red-800 border border-red-200'
                            }`}>
                              {bill.isPaid ? (
                                <>
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Paid
                                </>
                              ) : (
                                <>
                                  <Clock className="h-3 w-3 mr-1" />
                                  Unpaid
                                </>
                              )}
                            </span>
                          </div>
                          <div className="flex items-center text-gray-500 mt-1">
                            <Calendar className="h-3 w-3 mr-1" />
                            <span className="text-xs font-medium">{formatDate(bill.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Charges Breakdown */}
                      <div className="bg-gray-50 rounded-xl p-4 mb-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center">
                            <div className="bg-blue-100 rounded-lg p-2 w-fit mx-auto mb-2">
                              <Package className="h-4 w-4 text-blue-600" />
                            </div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Medicine</p>
                            <p className="text-sm font-bold text-gray-900">{formatCurrency(bill.medicineCharges)}</p>
                          </div>
                          
                          <div className="text-center">
                            <div className="bg-purple-100 rounded-lg p-2 w-fit mx-auto mb-2">
                              <Truck className="h-4 w-4 text-purple-600" />
                            </div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Shipping</p>
                            <p className="text-sm font-bold text-gray-900">{formatCurrency(bill.shippingCharges)}</p>
                          </div>
                          
                          <div className="text-center">
                            <div className="bg-orange-100 rounded-lg p-2 w-fit mx-auto mb-2">
                              <Plus className="h-4 w-4 text-orange-600" />
                            </div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Additional</p>
                            <p className="text-sm font-bold text-gray-900">{formatCurrency(bill.additionalCharges)}</p>
                          </div>
                          
                          <div className="text-center">
                            <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg p-2 w-fit mx-auto mb-2">
                              <DollarSign className="h-4 w-4 text-green-600" />
                            </div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Total</p>
                            <p className="text-base font-bold text-gray-900">{formatCurrency(bill.totalCharges)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Payment Button */}
                  {!bill.isPaid && bill.totalCharges > 0 && (
                    <div className="flex justify-end">
                      <button
                        onClick={() => handlePayment(bill.prescriptionId)}
                        disabled={payingBill === bill.prescriptionId || !isRazorpayLoaded}
                        className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform ${
                          payingBill === bill.prescriptionId
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed scale-95'
                            : !isRazorpayLoaded
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95'
                        }`}
                      >
                        {payingBill === bill.prescriptionId ? (
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full"></div>
                            <span>Processing Payment...</span>
                          </div>
                        ) : !isRazorpayLoaded ? (
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full"></div>
                            <span>Loading Payment...</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <CreditCard className="h-4 w-4" />
                            <span>Pay {formatCurrency(bill.totalCharges)}</span>
                          </div>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Payments;