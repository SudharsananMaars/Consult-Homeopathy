import React, {useState} from "react";
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import DoctorLayout from "/src/components/doctor components/DoctorLayout.jsx";
import patientprofile from "/src/assets/images/doctor images/patientprofile.jpg";
ChartJS.register(ArcElement, Tooltip, Legend);

const ViewDetails = () => {
    const [activeTab, setActiveTab] = useState("Medicine");
    const appointments = [
      {
        disease: "Flu",
        date: "Monday, 12 Sep 2024",
        time: "10:00 AM",
      },
      {
        disease: "Diabetes Checkup",
        date: "Wednesday, 14 Sep 2024",
        time: "02:00 PM",
      },
    ];
    const pieData = {
      labels: ['Successful Intake', 'Missed'],
      datasets: [
        {
          label: 'Medicine Intake',
          data: [80, 20], // Replace with dynamic data if available
          backgroundColor: ['#7ccf7f', '#ff7369'],
          borderColor: ['#FFFFFF', '#FFFFFF'],
          borderWidth: 1,
        },
      ],
    };
    return (
        <DoctorLayout>
        <div className="p-10 rounded-md">
            {/* First Row - Two Containers */}
            <div className="flex flex-wrap -mx-4">
                {/* First Container */}
                <div className="w-full md:w-1/2 px-4 mb-4">
                    <div className="p-5 bg-purple-100 shadow-md rounded-lg flex items-center border-1 border-blue-100">
                        <img
                            src={patientprofile} // Replace with actual patient photo
                            alt="Patient"
                            className="w-24 h-24 rounded-full mr-4 border-2 border-gray-300"
                        />
                        <div>
                            <h2 className="text-xl font-bold mt-5">John Doe</h2>
                            <p className="text-gray-600 mt-3">Patient ID: P001</p>
                            <p className="text-gray-600">Created On: 2024-09-12 10:30 AM</p>
                            <p className="mt-4 font-semibold">Disease: Flu</p>
                        </div>
                    </div>
                </div>

                {/* Second Container */}
                <div className="w-full md:w-1/2 p-1 mb-4 pr-4">
                    <div className="p-4 bg-purple-100 shadow-md rounded-lg border-1 border-blue-100">
                        
                        <p className="text-gray-700">
                            <span className="font-semibold">Age:</span> 32
                        </p>
                        <p className="text-gray-700 mt-2">
                            <span className="font-semibold">Gender:</span> Male
                        </p>

                        <p className="text-gray-700 mt-2">
                            <span className="font-semibold">Email:</span> john.doe@example.com
                        </p>
                        <p className="text-gray-700 mt-2">
                            <span className="font-semibold">Phone:</span> (123) 456-7890
                        </p>
                        <p className="text-gray-700 mt-2">
                            <span className="font-semibold">Address:</span> 123 Main St, City, Country
                        </p>
                    </div>
                </div>
            </div>

            {/* Next containers will go below this */}
           <div className="flex flex-wrap mb-4">
  {/* First Container - Disease History */}
  <div className="w-full lg:w-1/2 mb-4 pr-4">
  <div className="p-5 bg-white shadow-md rounded-md max-h-96 overflow-y-auto border-1 border-blue-100">
    <h2 className="text-xl font-semibold mb-4">Disease History</h2>

    <div className="p-2">
      {/* Row 1 - First Disease Details */}
      <div className="flex flex-wrap justify-between items-start">
        {/* Disease History */}
        <div className="flex items-start w-full md:w-1/3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-teal-400 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div>
          </div>
          <div className="ml-4">
            <h3 className="font-semibold text-gray-800">Diabetes</h3>
            <p className="text-gray-600 text-sm">Mon, 18 Mar 2021, 11:15 AM</p>
          </div>
        </div>

        {/* Prescription */}
    
        {/* Payment Details */}
        <div className="w-full md:w-1/3 ml-4">
          <p className="font-semibold text-gray-700">Rs.150</p>
          <p className="text-gray-600 text-sm">Sun, 21 May 2023</p>
          <p className="text-gray-600 text-sm">02:30 PM</p>
        </div>
        <div className="w-full md:w-1/4 mt-3">
          <p className=" text-md font-bold text-blue-400 hover:text-blue-500">
            Prescription
          </p>
        </div>
      </div>
    </div>

    {/* Row 2 */}
    <div className="p-2">
      <div className="flex flex-wrap justify-between items-start">
      <div className="flex items-start w-full md:w-1/3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-teal-400 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div>
          </div>
          <div className="ml-4">
            <h3 className="font-semibold text-gray-800">Diabetes</h3>
            <p className="text-gray-600 text-sm">Mon, 18 Mar 2021, 11:15 AM</p>
          </div>
        </div>

        {/* Payment Details */}
        <div className="w-full md:w-1/3 ml-4">
          <p className="font-semibold text-gray-700">Rs.150</p>
          <p className="text-gray-600 text-sm">Sun, 21 May 2023</p>
          <p className="text-gray-600 text-sm">02:30 PM</p>
        </div>
        <div className="w-full md:w-1/4 mt-3">
        <p className=" text-md font-bold text-blue-400 hover:text-blue-500">
            Prescription
          </p>
        </div>
      </div>
    </div>

    {/* Row 3 */}
    <div className="p-2">
      <div className="flex flex-wrap justify-between items-start">
      <div className="flex items-start w-full md:w-1/3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-teal-400 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div>
          </div>
          <div className="ml-4">
            <h3 className="font-bold text-gray-800">Diabetes</h3>
            <p className="text-gray-600 text-sm">Mon, 18 Mar 2021, 11:15 AM</p>
          </div>
        </div>
        

        {/* Payment Details */}
        <div className="w-full md:w-1/3 ml-4">
          <p className="font-semibold text-gray-700">Rs.150</p>
          <p className="text-gray-600 text-sm">Sun, 21 May 2023</p>
          <p className="text-gray-600 text-sm">02:30 PM</p>
        </div>
        <div className="w-full md:w-1/4 mt-3">
        <p className=" text-md font-bold text-blue-400 hover:text-blue-500">
            Prescription
          </p>
        </div>
      </div>
    </div>

    {/* Rows beyond 3 */}
  </div>
</div>


  {/* Second Container - Medicine and Workshop Tabs */}
  <div className="w-full lg:w-1/2 mb-4">
    <div className="p-3 ml-1 bg-white shadow-md rounded-lg max-h-96 overflow-y-auto border-1 border-blue-100">
      {/* Tab Switch */}
      <div className="flex justify-center mb-4 border-b">
        <button
          className={`px-4 py-2 ${
            activeTab === "Medicine"
              ? "text-blue-500 font-bold border-blue-500 border-b-2"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("Medicine")}
        >
          Medicine
        </button>
        <button
          className={`px-4 py-2 ml-2 ${
            activeTab === "Workshop"
              ? "text-blue-500 font-bold border-blue-500 border-b-2"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("Workshop")}
        >
          Workshop
        </button>
      </div>

      {/* Content Based on Active Tab */}
      
      <div className="space-y-6 p-2 pl-10">
        {activeTab === "Medicine" ? (
          <div className="flex flex-wrap justify-center items-center">
            {/* Medicine Payment Details */}
            <div className="w-full md:w-1/3">
          <p className="font-semibold text-gray-700">INV123456</p>
          </div>

            <div className="w-full md:w-1/3">
              <p className="font-semibold text-gray-700">Rs. 200</p>
              <p className="text-gray-600 text-sm">Monday, 12 Sep 2024</p>
              <p className="text-gray-600 text-sm">Time: 10:00 AM</p>
            </div>
          
            {/* Invoice */}
            <div className="w-full md:w-1/3">
              <span className="text-md font-bold text-blue-400 hover:text-blue-500">
                Invoice
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap justify-center items-center">
            {/* Workshop Payment Details */}
            <div className="w-full md:w-1/3">
          <p className="font-semibold text-gray-700">INV654321</p>
          </div>
  
            <div className="w-full md:w-1/3">
              <p className="font-semibold text-gray-700">Rs. 200</p>
              <p className="text-gray-600 text-sm">Friday, 15 Sep 2024</p>
              <p className="text-gray-600 text-sm">02:00 PM</p>
            </div>
            
            {/* Invoice */}
            <div className="w-full md:w-1/3">
              <span className="text-md font-bold text-blue-400 hover:text-blue-500">
                Invoice
              </span>
            </div>
          </div>
        )}
      </div>
      <div className="space-y-6 p-2 pl-10">
        {activeTab === "Medicine" ? (
          <div className="flex flex-wrap justify-center items-center">
            {/* Medicine Payment Details */}
            <div className="w-full md:w-1/3">
            <p className="font-semibold text-gray-700">INV123456</p>
            </div>
  
            <div className="w-full md:w-1/3">
              <p className="font-semibold text-gray-700">Rs. 200</p>
              <p className="text-gray-600 text-sm">Monday, 12 Sep 2024</p>
              <p className="text-gray-600 text-sm">Time: 10:00 AM</p>
            </div>
            
            {/* Invoice */}
            <div className="w-full md:w-1/3">
              <span className="text-md font-bold text-blue-400 hover:text-blue-500">
                Invoice
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap justify-center items-center">
            {/* Workshop Payment Details */}
            <div className="w-full md:w-1/3">
          <p className="font-semibold text-gray-700">INV654321</p>
          </div>
            <div className="w-full md:w-1/3">
            <p className="font-semibold text-gray-700">Rs. 200</p>
              <p className="text-gray-600 text-sm">Friday, 15 Sep 2024</p>
              <p className="text-gray-600 text-sm">02:00 PM</p>
            </div>
           
            {/* Invoice */}
            <div className="w-full md:w-1/3">
              <span className="text-md font-bold text-blue-400 hover:text-blue-500">
                Invoice
              </span>
            </div>
          </div>
        )}
      </div>
      <div className="space-y-6 p-2 pl-10">
        {activeTab === "Medicine" ? (
          <div className="flex flex-wrap justify-center items-center">
            {/* Medicine Payment Details */}
            <div className="w-full md:w-1/3">
            <p className="font-semibold text-gray-700">INV123456</p>
            </div>

            <div className="w-full md:w-1/3">
            <p className="font-semibold text-gray-700">Rs. 200</p>
              <p className="text-gray-600 text-sm">Monday, 12 Sep 2024</p>
              <p className="text-gray-600 text-sm">Time: 10:00 AM</p>
            </div>
            
            {/* Invoice */}
            <div className="w-full md:w-1/3">
              <span className="text-md font-bold text-blue-400 hover:text-blue-500">
                Invoice
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap justify-center items-center">
            {/* Workshop Payment Details */}
            <div className="w-full md:w-1/3">
          <p className="font-semibold text-gray-700">INV654321</p>
          </div>
  
            <div className="w-full md:w-1/3">
            <p className="font-semibold text-gray-700">Rs. 200</p>
              <p className="text-gray-600 text-sm">Friday, 15 Sep 2024</p>
              <p className="text-gray-600 text-sm">02:00 PM</p>
            </div>
            
            {/* Invoice */}
            <div className="w-full md:w-1/3">
              <span className="text-md font-bold text-blue-400 hover:text-blue-500">
                Invoice
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
</div>

<div className="flex flex-wrap space-x-9">
  {/* Upcoming Appointments Container */}
  <div className="w-full md:w-1/2 lg:w-1/3 p-4 bg-white shadow-md rounded-lg max-h-96 overflow-y-auto border-1 border-blue-100">
    <h2 className="text-xl font-semibold text-gray-800 mb-4">Upcoming Appointments</h2>
    <div className="space-y-4">
      {appointments.map((appointment, index) => (
        <div
          key={index}
          className="p-4 border border-blue-100 rounded-lg shadow-sm bg-white"
        >
          <p className="text-lg font-medium text-gray-700">{appointment.disease}</p>
          <p className="text-sm text-gray-600">{appointment.date}</p>
          <p className="text-sm text-gray-600">{appointment.time}</p>
        </div>
      ))}
    </div>
  </div>

  {/* Medicine Intake Statistics Container */}
  {/* Patient Review Container */}
  <div className="w-full md:w-1/2 lg:w-1/3 p-4 bg-white shadow-md rounded-lg border-1 border-blue-100">
    <h2 className="text-xl font-semibold text-gray-800 mb-4">Patient Review</h2>
    <div className="flex items-start">
      {/* Patient Profile Picture */}
      <div className="flex-shrink-0">
        <img
          className="w-12 h-12 rounded-full"
          src="https://via.placeholder.com/150"
          alt="Patient Profile"
        />
      </div>
      
      <div className="ml-4">
        {/* Patient Name */}
        <h3 className="font-semibold text-gray-800">John Doe</h3>
        
        {/* Review Date */}
        <p className="text-gray-600 text-sm">Reviewed on: 10th September 2024</p>
        
        {/* Star Rating */}
        <div className="flex items-center mt-2">
          {[...Array(5)].map((star, index) => (
            <svg
              key={index}
              className={`w-4 h-4 ${
                index < 4 ? "text-yellow-500" : "text-gray-300"
              }`}
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 .587l3.668 7.429 8.2 1.193-5.922 5.771 1.396 8.146L12 18.896l-7.342 3.863 1.396-8.146L.132 9.209l8.2-1.193L12 .587z" />
            </svg>
          ))}
        </div>
        
        {/* Patient's Review */}
        <p className="mt-3 text-gray-700">
          "Dr. Smith is amazing! He really listened to my concerns and took the time to explain everything to me. The treatment has been going well so far."
        </p>
      </div>
    </div>
  </div>

  <div className="w-full md:w-1/2 lg:w-1/4 p-4 bg-white shadow-md rounded-lg border-1 border-blue-100">
    <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">Medicine Intake Statistics</h2>
    <Pie data={pieData} />
  </div>

</div>

     
        </div> 
        </DoctorLayout>
    );
}
export default ViewDetails ;