import React, { useState, useEffect } from 'react';
import Layout from "/src/components/patient components/Layout.jsx";
import PrescriptionPopup from "/src/pages/patient pages/PrescriptionPopup.jsx";
import Nocontent from '/src/assets/images/doctor images/Nocontent.jpg';
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import {
  Clock4,
  Sun,
  Sunrise,
  Moon,
  XCircle,
  Activity,
  CalendarDays
} from 'lucide-react';

const dummyPrescriptions = [
  {
    id: "rx-001",
    date: "2025-07-16",
    doctorName: "Dr. A",
    diagnosis: "Viral Fever",
    medicines: [
      {
        label: '1',
        medicineName: 'Dolo',
        form: 'Pills',
        duration: '5 days, 2025-07-17 to 2025-07-21',
        morning: 'Day 1 - 5\nE/S, 8-9 AM',
        noon: '',
        evening: 'Day 1 - 5\nL/S, 4-5 PM',
        night: 'Day 1 - 5\nL/S, 8-9 PM',
        instructions: '3 pills',
      }
    ]
  },
  {
    id: "rx-002",
    date: "2025-07-10",
    doctorName: "Dr. B",
    diagnosis: "Common Cold",
    medicines: [
      {
        label: '2A',
        medicineName: 'Paracetamol',
        form: 'Tablets',
        duration: '5 days, 2025-07-11 to 2025-07-15',
        morning: 'Day 6 - 7\nE/S, 8-9 AM\nDay 8 - 10\nE/S, 8-9 AM',
        noon: '',
        evening: 'Day 6 - 7\nL/S, 4-5 PM\nDay 8 - 10\nL/S, 4-5 PM',
        night: 'Day 6\nL/S, 8-9 PM',
        instructions: 'Chew + Drink 1 sip hot water',
      }
    ]
  },
  {
    id: "rx-003",
    date: "2025-06-30",
    doctorName: "Dr. C",
    diagnosis: "Stomach Infection",
    medicines: [
      {
        label: '3A',
        medicineName: 'Amoxicillin',
        form: 'Tablets',
        duration: '6 days, 2025-07-01 to 2025-07-06',
        morning: 'Day 11, 12, 16\nE/S, 8-9 AM\nDay 13\nE/S, 9-10 AM',
        noon: 'Day 14\nL/S, 1-2 PM',
        evening: 'Day 11 - 16\nL/S, 4-5 PM',
        night: 'Day 11, 15\nL/S, 8-9 PM',
        instructions: 'Chew + Drink 1 sip hot water',
      }
    ]
  }
];

const Prescription = () => {
  const [activeTab, setActiveTab] = useState('Prescription');
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [calendarMap, setCalendarMap] = useState({});
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const map = {};
    dummyPrescriptions.forEach(pres => {
      pres.medicines.forEach(med => {
        const [durationText, range] = med.duration.split(',');
        const [start, end] = range.trim().split(' to ');
        let current = new Date(start);
        const endDate = new Date(end);

        while (current <= endDate) {
          const dateKey = current.toISOString().split('T')[0];
          if (!map[dateKey]) map[dateKey] = [];
          map[dateKey].push(med.medicineName);
          current.setDate(current.getDate() + 1);
        }
      });
    });
    setCalendarMap(map);
  }, []);

  const handleView = (prescription) => {
    setSelectedPrescription(prescription);
  };

  return (
    <Layout>
      <div className="min-h-screen flex flex-col p-7">
        <h2 className="text-2xl font-bold mb-4">Prescription</h2>

        <div className="flex mb-4 border-b border-gray-300">
          <button
            className={`py-2 px-4 ${activeTab === 'Prescription' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
            onClick={() => setActiveTab('Prescription')}
          >
            Prescriptions
          </button>
          <button
            className={`py-2 px-4 ${activeTab === 'Daily Intake Calendar' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
            onClick={() => setActiveTab('Daily Intake Calendar')}
          >
            Daily Intake Calendar
          </button>
        </div>

        {activeTab === 'Prescription' ? (
          <div className="flex flex-col gap-4">
            {dummyPrescriptions.length > 0 ? (
              dummyPrescriptions.map((prescription) => (
                <div
                  key={prescription.id}
                  className="bg-white shadow-md rounded-xl p-5 border hover:shadow-lg transition"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        {prescription.doctorName}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Date: {new Date(prescription.date).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        Diagnosis: {prescription.diagnosis}
                      </p>
                    </div>
                    <button
                      className="bg-blue-500 text-white font-semibold px-4 py-2 rounded hover:bg-blue-600"
                      onClick={() => handleView(prescription)}
                    >
                      View Prescription
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex-grow flex flex-col items-center justify-center mb-8">
                <img src={Nocontent} alt="No content" className="w-24 h-24 mb-4" />
                <p className="text-gray-500">No prescriptions available yet.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex gap-6">

            <div className="w-3/5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-blue-600" />
                  Daily Intake 
                </h3>
                <input
                  type="date"
                  className="border px-3 py-1 rounded text-sm"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
              <table className="min-w-full bg-white border rounded-lg shadow-md text-sm">
                <thead className="bg-gray-100 text-gray-700 font-semibold">
                  <tr>
                    <th className="px-4 py-2 border">Medicine</th>
                    <th className="px-4 py-2 border">Count</th>
                    <th className="px-4 py-2 border">Time</th>
                    <th className="px-4 py-2 border">Status</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  <tr>
                    <td className="px-4 py-2 border text-center">Dolo</td>
                    <td className="px-4 py-2 border text-center">3 Pills</td>
                    <td className="px-4 py-2 border text-center">8:00 AM</td>
                    <td className="px-4 py-2 border text-center">
                      <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-semibold">Taken</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 border text-center">Paracetamol</td>
                    <td className="px-4 py-2 border text-center">1 Tablet</td>
                    <td className="px-4 py-2 border text-center">4:00 PM</td>
                    <td className="px-4 py-2 border text-center">
                      <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs font-semibold">Missed</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="w-2/5 bg-gray-50 rounded-xl p-5 shadow-md border flex flex-col gap-5">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-blue-600" />
                  Daily Intake Metrics
                </h3>
                <input
                  type="date"
                  className="px-3 py-1 border rounded-md text-sm text-gray-700"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-4">
                <div className="w-28 h-28">
                  <CircularProgressbar 
                    value={78} 
                    text={`78%`} 
                    styles={buildStyles({
                      pathColor: "#10B981",
                      textColor: "#374151",
                      trailColor: "#D1D5DB",
                    })}
                  />
                </div>
                <div className="text-left">
                  <h4 className="text-md font-semibold text-gray-700">Adherence Score</h4>
                  <p className="text-sm text-gray-500 max-w-[130px]">
                    Overall medicine intake adherence for this week.
                  </p>
                </div>
              </div>

              <div className="w-full space-y-4 text-sm text-gray-700">
                <div className="bg-white rounded-lg p-4 shadow-sm border">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Clock4 className="w-4 h-4 text-gray-600" />
                    Dose Consistency
                  </h4>
                  <div className="flex gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Sunrise className="w-4 h-4 text-yellow-500" />
                      <span>Morning:</span>
                      <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold text-xs">82%</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Sun className="w-4 h-4 text-orange-400" />
                      <span>Afternoon:</span>
                      <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full font-semibold text-xs">-</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Moon className="w-4 h-4 text-indigo-500" />
                      <span>Night:</span>
                      <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-semibold text-xs">64%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 shadow-sm border">
                  <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-500" />
                    Missed Doses
                  </h4>
                  <p className="text-sm text-gray-700">
                    <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold text-xs">5</span>
                    <span className="ml-2">doses missed this week</span>
                  </p>
                </div>

                <div className="bg-white rounded-lg p-4 shadow-sm border">
                  <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-600" />
                    Time Pattern
                  </h4>
                  <p className="italic text-sm text-gray-600">
                    Often misses
                    <span className="ml-1 bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-semibold text-xs">night doses</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedPrescription && (
          <PrescriptionPopup
            isOpen={!!selectedPrescription}
            onClose={() => setSelectedPrescription(null)}
            prescriptionData={selectedPrescription.medicines}
            doctorName={selectedPrescription.doctorName}
            diagnosis={selectedPrescription.diagnosis}
            date={selectedPrescription.date}
          />
        )}
      </div>
    </Layout>
  );
};

export default Prescription;
