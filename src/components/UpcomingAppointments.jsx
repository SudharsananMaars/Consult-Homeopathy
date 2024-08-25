import React from 'react'; 
import doctor from '../assets/images/doctor.jpeg';
const UpcomingAppointments = () => {
    return  <div>
      <div>
        <p className="font-bold mt-7 mb-10 text-xl px-7" >Upcoming Appointments </p>
      </div>
      
      <div className="bg-blue-100 p-4 rounded-lg shadow-lg flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4 ml-14 mr-14">

  <img className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover" src={doctor} alt="Doctor's Name" />
 
  <div className="flex-1 text-center md:text-left">
  
    <p className="text-sm sm:text-base md:text-lg text-gray-600 font-semibold">Monday, August 20, 2024</p>
    <p className="text-sm sm:text-base md:text-lg text-gray-600 font-semibold">3:00 PM</p>
    <p className="text-lg sm:text-xl font-bold text-gray-800">Dr. Jane Doe</p>
  </div>
   
  {/* <!-- Dividing Line --> */}
  
    <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start space-y-2 sm:space-y-0 sm:space-x-2 mt-2 px-12 sm:px-0">
      
      <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded flex items-center w-full sm:w-auto">

        Join
      </button>
      <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded flex items-center w-full sm:w-auto">

        Cancel
      </button>
    </div>
  
</div>
    </div>;
  };
  
  export default UpcomingAppointments;