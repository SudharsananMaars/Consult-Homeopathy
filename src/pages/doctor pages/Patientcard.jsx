import React, { useState } from 'react';
import patientprofile from '/src/assets/images/doctor images/patientprofile.jpg'; // Placeholder for patient image
import DoctorLayout from "/src/components/doctor components/DoctorLayout.jsx";
import { useNavigate } from 'react-router-dom';

const patients = [
  { id: 'P001', name: 'John Doe', age: 32,  lastVisit: '2023-09-01' },
  { id: 'P002', name: 'Jane Smith', age: 28, lastVisit: '2023-08-25' },
  { id: 'P003', name: 'Emily Clark', age: 45,  lastVisit: '2023-09-10' },
  { id: 'P004', name: 'Michael Brown', age: 37,  lastVisit: '2023-09-18' },
  // Add more patient objects
];

const PatientCard = () => {
  const navigate = useNavigate();
  const confirm = (id) => {
    navigate(`/patients/viewdetails/${id}`);
    };
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DoctorLayout>
      <div className="bg-blue-50">
        <div className="container mx-auto p-4">
          <div className="mb-4 flex justify-between">
            <input
              type="text"
              className="border rounded p-2 w-full max-w-xs"
              placeholder="Search by Patient's Name"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filteredPatients.map((patient, index) => (
                <button onClick={confirm}>
              <div key={index} className="bg-white shadow-md rounded-lg p-4 text-center">
                <img
                  src={patientprofile} // Replace with patient's image
                  alt={patient.name}
                  className="w-24 h-24 mx-auto rounded-full mb-4"
                />
                <h3 className="text-xl font-bold">{patient.name}</h3>
                <p>Patient ID: {patient.id}</p>
                <p>Age: {patient.age}</p>
                <p>Last Visit: {patient.lastVisit}</p>
              </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </DoctorLayout>
  );
};

export default PatientCard;
