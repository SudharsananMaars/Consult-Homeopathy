import React from 'react'; 
import doctor from '../assets/images/doctor.jpeg';

const UpcomingAppointments = () => {
  return (
    <div>
      <div>
        <p className="font-bold mt-7 mb-10 pl-5 text-xl text-left">Upcoming Appointments</p>
      </div>
      
      {/* Center the entire container */}
      <div className="bg-blue-100 p-4 rounded-lg shadow-lg flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-4 mx-auto max-w-4xl">
        {/* Doctor's Image */}
        <img className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover" src={doctor} alt="Doctor's Name" />

        {/* Appointment Details */}
        <div className="flex-1 text-center md:text-left">
          <p className="text-sm sm:text-base md:text-lg text-gray-600 font-semibold">Monday, August 30, 2024</p>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 font-semibold">3:00 PM</p>
          <p className="text-lg sm:text-xl font-bold text-gray-800">Dr. Jane Doe</p>
        </div>
        
        {/* Buttons */}
        <div className="flex space-x-2">
          <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded">
            Join
          </button>
          <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpcomingAppointments;
