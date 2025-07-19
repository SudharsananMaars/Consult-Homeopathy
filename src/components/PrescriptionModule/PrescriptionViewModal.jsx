import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Pill, FileText, User, Stethoscope, CreditCard, Truck } from 'lucide-react';
import axios from 'axios';
import config from '../../config';
import { useParams } from 'react-router-dom';
import { use } from 'react';
const PrescriptionViewModal = () => {
  const [prescriptionData, setPrescriptionData] = useState(null);
  const [loading, setLoading] = useState(false);
  // { prescriptionId, apiUrl, accessToken }
  const { prescriptionId } = useParams();
  const apiUrl = config.API_URL;
  const accessToken = localStorage.getItem('token');

  useEffect(() => {
  const fetchPrescription = async () => {
    try {
      setLoading(true);
      console.log('Prescription api:', `${apiUrl}/api/prescriptionControl/prescription/${prescriptionId}`);
      const response = await axios.get(`${apiUrl}/api/prescriptionControl/prescription/${prescriptionId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data = response.data;

      if (data.success) {
        setPrescriptionData(data.data);
      } else {
        console.error('Error:', data.message);
      }
    } catch (err) {
      console.error('Failed to load prescription data', err);
    } finally {
      setLoading(false);
    }
  };

  if (prescriptionId && apiUrl && accessToken) {
    fetchPrescription();
  }
}, [prescriptionId, apiUrl, accessToken]);

  const formatDate = (dateObj) => {
    if (!dateObj || !dateObj.$date) return 'N/A';
    return new Date(dateObj.$date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 shadow-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
          <div className="text-center mt-4 text-gray-600">Loading prescription...</div>
        </div>
      </div>
    );
  }

  if (!prescriptionData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">⚠️</div>
          <div className="text-gray-800">Failed to load prescription data</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      
      <div className="max-w-4xl mx-auto bg-white shadow-2xl relative overflow-hidden">
        
        <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
          <div className="text-9xl font-bold text-pink-300 transform rotate-12">CH</div>
        </div>
        
        <div className="relative z-10">
          <div className="h-3 bg-gradient-to-r from-pink-500 to-pink-600"></div>
          
          <div className="bg-white px-8 py-6 border-b-4 border-blue-900">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="text-pink-500 mr-4">
                  <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center">
                    <Stethoscope className="w-8 h-8 text-pink-600" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-pink-600 mb-1">Consult Homeopathy</h1>
                  <div className="text-sm text-gray-600">Online Consultation | Homeopathy Products | Counseling</div>
                </div>
              </div>
              
              <div className="text-right">
                <h2 className="text-xl font-bold text-blue-900">Dr. Katyayani Shrivastava</h2>
                <div className="text-sm text-gray-600 mb-1">BHMS, PGDEMS (TISS - Mumbai)</div>
                <div className="text-blue-900 font-medium">+91 9406949646</div>
                <div className="flex items-center justify-end mt-2">
                  <Stethoscope className="w-6 h-6 text-pink-600" />
                </div>
              </div>
            </div>
            
            <div className="mt-4 text-center text-sm text-blue-900">
              <div className="mb-2">www.consulthomeopathyonline.com</div>
              <div>#katyayanishomeopathy | #consulthomeopathy</div>
            </div>
          </div>
        </div>

        <div className="relative z-10 p-8">
          
          <div className="mb-6 text-center">
            <h3 className="text-lg font-bold text-gray-800 mb-2">PRESCRIPTION</h3>
            <div className="text-sm text-gray-600">
              Date: {formatDate(prescriptionData.createdAt)} | ID: {prescriptionData._id.slice(-8)}
            </div>
          </div>

          <div className="border border-gray-300">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 text-left">S No</th>
                  <th className="border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 text-left">Label</th>
                  <th className="border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 text-left">Medicine Name</th>
                  <th className="border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 text-left">Medicine Form</th>
                  <th className="border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 text-left">Duration</th>
                  <th className="border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 text-left">Morning</th>
                  <th className="border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 text-left">Noon</th>
                  <th className="border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 text-left">Evening</th>
                  <th className="border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 text-left">Night</th>
                  <th className="border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 text-left">Medicine Consumption</th>
                </tr>
              </thead>
              <tbody>
                {prescriptionData.prescriptionItems.map((item, index) => {
                  const timing = item.standardSchedule?.[0]?.timing || {};
                  return (
                    <React.Fragment key={index}>
                      <tr className="border-b border-gray-300">
                        <td className="border border-gray-300 px-3 py-3 text-sm">{index + 1}</td>
                        <td className="border border-gray-300 px-3 py-3 text-sm font-bold text-center">
                          {item.label}
                        </td>
                        <td className="border border-gray-300 px-3 py-3 text-sm font-medium">{item.medicineName}</td>
                        <td className="border border-gray-300 px-3 py-3 text-sm">{item.form}</td>
                        <td className="border border-gray-300 px-3 py-3 text-xs">
                          <div>{item.duration}</div>
                          {item.standardSchedule?.[0]?.day && (
                            <div className="text-blue-600 mt-1">
                              {item.standardSchedule[0].day}
                            </div>
                          )}
                        </td>
                        <td className="border border-gray-300 px-2 py-3 text-xs">
                          {timing.morning?.time && (
                            <div>
                              <div className="font-medium text-blue-700">{timing.morning.time}</div>
                              {timing.morning.food && (
                                <div className="text-gray-600 mt-1">{timing.morning.food}</div>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="border border-gray-300 px-2 py-3 text-xs">
                          {timing.afternoon?.time && (
                            <div>
                              <div className="font-medium text-blue-700">{timing.afternoon.time}</div>
                              {timing.afternoon.food && (
                                <div className="text-gray-600 mt-1">{timing.afternoon.food}</div>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="border border-gray-300 px-2 py-3 text-xs">
                          {timing.evening?.time && (
                            <div>
                              <div className="font-medium text-blue-700">{timing.evening.time}</div>
                              {timing.evening.food && (
                                <div className="text-gray-600 mt-1">{timing.evening.food}</div>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="border border-gray-300 px-2 py-3 text-xs">
                          {timing.night?.time && (
                            <div>
                              <div className="font-medium text-blue-700">{timing.night.time}</div>
                              {timing.night.food && (
                                <div className="text-gray-600 mt-1">{timing.night.food}</div>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="border border-gray-300 px-2 py-3 text-xs text-gray-700">
                          {index < 2 ? "3 pills" : index === 2 ? "No of tabs as per bottle = Chew & Drink 1 sip hot water" : index === 3 ? "10 strokes (as per bottle) in 5ml" : "No of tabs as per bottle = Chew & Drink 1 sip hot water"}
                        </td>
                      </tr>
                      {/* Add "Next Day" separator row for visual clarity */}
                      {index < prescriptionData.prescriptionItems.length - 1 && index % 1 === 0 && (
                        <tr>
                          <td colSpan="10" className="border border-gray-300 px-3 py-1 text-xs text-gray-500 bg-gray-50">
                            ——— Next Day ———
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg border">
              <h4 className="font-semibold text-blue-900 mb-3">Treatment Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Medicines:</span>
                  <span className="font-medium">{prescriptionData.prescriptionItems.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Course Duration:</span>
                  <span className="font-medium">{prescriptionData.medicineCourse} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Follow-up:</span>
                  <span className="font-medium">{prescriptionData.followUpDays} days</span>
                </div>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border">
              <h4 className="font-semibold text-green-900 mb-3">Billing Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Medicine Cost:</span>
                  <span className="font-medium">₹{prescriptionData.medicineCharges}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping:</span>
                  <span className="font-medium">₹{prescriptionData.shippingCharges}</span>
                </div>
                <div className="flex justify-between font-semibold border-t pt-2">
                  <span className="text-green-900">Total:</span>
                  <span className="text-green-900">₹{(prescriptionData.medicineCharges + prescriptionData.shippingCharges).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Status:</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    prescriptionData.isPayementDone 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {prescriptionData.isPayementDone ? 'Paid' : 'Pending'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* <div className="mt-8 p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
            <h4 className="font-semibold text-yellow-800 mb-2">Doctor's Instructions</h4>
            <div className="text-sm text-gray-700">
              <p>• Take medicines as per the prescribed schedule</p>
              <p>• Maintain proper gap between meals and medicine</p>
              <p>• Contact for any side effects or concerns</p>
              <p>• Follow-up consultation recommended after {prescriptionData.followUpDays} days</p>
            </div>
          </div> */}

          <div className="mt-8 flex justify-between items-end">
            <div className="text-sm text-gray-600">
              <div>Status: <span className={`px-2 py-1 rounded text-xs font-medium ${
                prescriptionData.action.status === 'In Progress' 
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-green-100 text-green-800'
              }`}>
                {prescriptionData.action.status}
              </span></div>
            </div>
            <div className="text-right">
              <div className="border-t border-gray-300 pt-2 mt-8 w-48">
                <div className="text-sm font-medium">Dr. Katyayani Shrivastava</div>
                <div className="text-xs text-gray-600">BHMS, PGDEMS</div>
              </div>
            </div>
          </div>
        </div>

        <div className="h-3 bg-gradient-to-r from-pink-500 to-pink-600"></div>
      </div>
    </div>
  );
};

export default PrescriptionViewModal;