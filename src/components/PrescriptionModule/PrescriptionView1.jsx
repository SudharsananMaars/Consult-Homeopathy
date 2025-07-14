
import React, { useState, useEffect } from 'react';
import { Calendar, User, Phone, MapPin, Clock, Package, FileText, IndianRupee } from 'lucide-react';

const PrescriptionViewFix = ({ prescriptionId = "686d4b0ac223d1bee6d6cf12" }) => {
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mock data for demonstration - replace with actual API call
  const mockPrescription = {
    _id: "686d4b0ac223d1bee6d6cf12",
    patient: {
      name: "John Doe",
      age: 35,
      gender: "Male",
      phone: "+91 9876543210"
    },
    doctor: {
      name: "Dr. Katyayani Shrivastava",
      qualification: "BHMS, PGDEMS (TISS - Mumbai)",
      phone: "+91 9406949646",
      specialization: "Homeopathy"
    },
    medicineCourse: 10,
    followUpDays: 10,
    medicineCharges: 21.7,
    shippingCharges: 99.99,
    notes: "",
    createdAt: "2025-07-08T16:44:58.218Z",
    action: {
      status: "In Progress",
      closeComment: ""
    },
    prescriptionItems: [
      {
        _id: "686d4b0ac223d1bee6d6cf13",
        medicineName: "ABC",
        form: "Pills",
        uom: "Dram",
        dispenseQuantity: "1/2 dram",
        duration: "10 days (ABC)",
        frequencyType: "frequent",
        prescriptionType: "Prescription + Medicine",
        consumptionType: "Sequential",
        label: "B",
        price: 21.7,
        additionalComments: "",
        rawMaterialDetails: [
          {
            _id: "68349ad578ca1521c5c0f379",
            name: "K4",
            quantity: 10,
            pricePerUnit: 0.25,
            totalPrice: 2.5
          },
          {
            _id: "68625c267a21ccfaae262925",
            name: "K5",
            quantity: 15,
            pricePerUnit: 1.28,
            totalPrice: 19.2
          }
        ],
        frequencies: [
          {
            day: 1,
            duration: "Day 1-10",
            frequency: "1hr 30mins",
            frequencyType: "frequent",
            consumptionPattern: "single",
            isOverlapping: false,
            frequentFrequency: {
              doses: 5,
              hours: 1,
              minutes: 30
            },
            timings: ["08:00", "09:30", "11:00", "12:30", "14:00"]
          }
        ]
      }
    ]
  };

  useEffect(() => {
    const fetchPrescription = async () => {
      try {
        setLoading(true);
        
        // Replace with actual API call
        // const response = await fetch(`/api/prescriptions/${prescriptionId}`);
        // const data = await response.json();
        
        // Using mock data for demonstration
        setTimeout(() => {
          setPrescription(mockPrescription);
          setLoading(false);
        }, 1000);
        
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchPrescription();
  }, [prescriptionId]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return new Date(`1970-01-01T${timeString}:00`).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const renderFrequencySchedule = (item) => {
    if (item.frequencyType === 'frequent') {
      // Group timings by day for frequent medicines
      const dayGroups = {};
      item.frequencies.forEach(freq => {
        if (!dayGroups[freq.day]) {
          dayGroups[freq.day] = [];
        }
        dayGroups[freq.day] = freq.timings || [];
      });

      return Object.entries(dayGroups).map(([day, timings]) => (
        <tr key={day} className="border-b border-gray-200">
          <td className="px-4 py-3 text-center font-medium">{day}</td>
          <td className="px-4 py-3 text-center">{item.label}</td>
          <td className="px-4 py-3 font-medium">{item.medicineName}</td>
          <td className="px-4 py-3 text-center">{item.form}</td>
          <td className="px-4 py-3 text-center">{item.duration}</td>
          <td className="px-4 py-3 text-center text-sm">
            {timings.map(time => formatTime(time)).join(', ')}
          </td>
          <td className="px-4 py-3 text-center">{item.consumptionType}</td>
        </tr>
      ));
    } else {
      // Handle standard frequency (Morning, Afternoon, Evening, Night)
      return item.frequencies.map(freq => (
        <tr key={`${item._id}-${freq.day}`} className="border-b border-gray-200">
          <td className="px-4 py-3 text-center font-medium">{freq.day}</td>
          <td className="px-4 py-3 text-center">{item.label}</td>
          <td className="px-4 py-3 font-medium">{item.medicineName}</td>
          <td className="px-4 py-3 text-center">{item.form}</td>
          <td className="px-4 py-3 text-center">{item.duration}</td>
          <td className="px-4 py-3 text-center text-sm">
            {freq.standardFrequency?.morning && (
              <span className="mr-2">M: {freq.standardFrequency.morning.from}</span>
            )}
            {freq.standardFrequency?.afternoon && (
              <span className="mr-2">A: {freq.standardFrequency.afternoon.from}</span>
            )}
            {freq.standardFrequency?.evening && (
              <span className="mr-2">E: {freq.standardFrequency.evening.from}</span>
            )}
            {freq.standardFrequency?.night && (
              <span>N: {freq.standardFrequency.night.from}</span>
            )}
          </td>
          <td className="px-4 py-3 text-center">{item.consumptionType}</td>
        </tr>
      ));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        Error loading prescription: {error}
      </div>
    );
  }

  if (!prescription) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-700">
        Prescription not found
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-t-lg">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Consult HomeopaThy</h1>
            <p className="text-purple-100 mt-1">Digital Prescription</p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-semibold">{prescription.doctor.name}</h2>
            <p className="text-purple-100">{prescription.doctor.qualification}</p>
            <p className="text-purple-100 flex items-center justify-end mt-1">
              <Phone className="w-4 h-4 mr-1" />
              {prescription.doctor.phone}
            </p>
          </div>
        </div>
      </div>

      {/* Patient & Prescription Info */}
      <div className="bg-gray-50 p-6 border-l-4 border-purple-600">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <User className="w-5 h-5 mr-2 text-purple-600" />
              Patient Information
            </h3>
            <div className="space-y-2">
              <p><span className="font-medium">Name:</span> {prescription.patient.name}</p>
              <p><span className="font-medium">Age:</span> {prescription.patient.age}</p>
              <p><span className="font-medium">Gender:</span> {prescription.patient.gender}</p>
              <p><span className="font-medium">Phone:</span> {prescription.patient.phone}</p>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-purple-600" />
              Prescription Details
            </h3>
            <div className="space-y-2">
              <p><span className="font-medium">Date:</span> {formatDate(prescription.createdAt)}</p>
              <p><span className="font-medium">Course Duration:</span> {prescription.medicineCourse} days</p>
              <p><span className="font-medium">Follow-up:</span> {prescription.followUpDays} days</p>
              <p><span className="font-medium">Status:</span> 
                <span className={`ml-2 px-2 py-1 rounded text-sm ${
                  prescription.action.status === 'In Progress' 
                    ? 'bg-yellow-100 text-yellow-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {prescription.action.status}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Medicine Schedule Table */}
      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <Package className="w-5 h-5 mr-2 text-purple-600" />
          Medicine Schedule
        </h3>
        
        <div className="overflow-x-auto shadow-lg rounded-lg">
          <table className="w-full bg-white">
            <thead className="bg-purple-600 text-white">
              <tr>
                <th className="px-4 py-3 text-center">Day</th>
                <th className="px-4 py-3 text-center">Label</th>
                <th className="px-4 py-3 text-left">Medicine Name</th>
                <th className="px-4 py-3 text-center">Form</th>
                <th className="px-4 py-3 text-center">Duration</th>
                <th className="px-4 py-3 text-center">Timing</th>
                <th className="px-4 py-3 text-center">Consumption</th>
              </tr>
            </thead>
            <tbody>
              {prescription.prescriptionItems.map(item => (
                renderFrequencySchedule(item)
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Raw Materials */}
      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-4">Raw Materials</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {prescription.prescriptionItems.map(item => (
            item.rawMaterialDetails.map(material => (
              <div key={material._id} className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-purple-600">{material.name}</h4>
                <div className="mt-2 space-y-1 text-sm">
                  <p>Quantity: {material.quantity}</p>
                  <p>Price per unit: ₹{material.pricePerUnit}</p>
                  <p>Total: ₹{material.totalPrice}</p>
                </div>
              </div>
            ))
          ))}
        </div>
      </div>

      {/* Billing Summary */}
      <div className="mt-6 bg-gray-50 p-6 rounded-lg">
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <IndianRupee className="w-5 h-5 mr-2 text-purple-600" />
          Billing Summary
        </h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Medicine Charges:</span>
            <span>₹{prescription.medicineCharges}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping Charges:</span>
            <span>₹{prescription.shippingCharges}</span>
          </div>
          <div className="flex justify-between font-semibold text-lg border-t pt-2">
            <span>Total:</span>
            <span>₹{(prescription.medicineCharges + prescription.shippingCharges).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {prescription.notes && (
        <div className="mt-6 bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">Notes:</h3>
          <p className="text-blue-700">{prescription.notes}</p>
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 text-center text-sm text-gray-500 border-t pt-4">
        <p>Online Consultation | Homeopathy Products | Counseling</p>
        <p>📧 consulthomeopathy@gmail.com | 🌐 www.consulthomeopathyonline.com</p>
        <p>#katyayanishomeopathy #consulthomeopathy</p>
      </div>
    </div>
  );
};

export default PrescriptionViewFix;