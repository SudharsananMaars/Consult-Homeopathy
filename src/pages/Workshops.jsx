import React, { useState } from 'react';
import { BiCalendarCheck } from 'react-icons/bi';
import images from '../assets/images/images.jpg';
import workshop from '../assets/images/workshop.jpg'; 
import Layout from '../components/Layout';

const Workshops = () => {
  const [activeTab, setActiveTab] = useState('Upcoming'); // State to manage current tab selection

  const upcomingWorkshops = [
    { 
      title: "Healthy Lifestyle", 
      date: "Fri, 15 Sep", 
      location: "12pm - 2pm", 
      image: images, 
      amt: "Rs.700"
    },
    { 
      title: "A new vision on Yoga", 
      date: "Sat, 16 Sep", 
      location: "9am - 10:30am", 
      image: workshop,
      amt: "Rs.900"
    },
   
    
    // Add more upcoming workshops here
  ];

  const pastWorkshops = [
    { 
      title: "Healthy Lifestyle", 
      date: "Fri, 1 Apr", 
      location: "3pm - 4pm", 
      image: images,
     
    },
    { 
      title: "A new vision on Yoga", 
      date: "Thu, 31 Aug", 
      location: "6pm - 7pm", 
      image: <workshop></workshop>,
      
    },
    // Add more past workshops here
  ];

  return (
    <div>
      <Layout>
    <div className="container mx-auto p-4">
      {/* Tabs for Workshop Categories */}
      <div className="flex justify-center mb-8 border-b">
        <button 
          className={`py-2 px-4 ${activeTab === 'Upcoming' ? 'border-b-2 border-red-500 text-red-500' : 'text-gray-600'}`} 
          onClick={() => setActiveTab('Upcoming')}
        >
          Upcoming
        </button>
        <button 
          className={`py-2 px-4 ${activeTab === 'Recent' ? 'border-b-2 border-red-500 text-red-500' : 'text-gray-600'}`} 
          onClick={() => setActiveTab('Recent')}
        >
          Recent
        </button>
      </div>

      {/* Workshop Section */}
      <div className="w-full">
        {activeTab === 'Upcoming' ? (
          <div>
            <h3 className="text-xl font-semibold mb-2">Upcoming Workshops</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {upcomingWorkshops.map((workshop, index) => (
                <div key={index} className="min-w-[200px] bg-white shadow-md rounded-lg p-4">
                  <img 
                    src={workshop.image} 
                    alt={workshop.title} 
                    className="w-2/3 h-40 object-cover rounded-md mb-2 mx-auto" 
                  />
                  <h4 className="text-lg font-bold mb-2">{workshop.title}</h4>
                  <p className="text-sm mt-2">Join us, and gain the confidence to do the work of being well, make healthier choices, pursue a healthier lifestyle and grow your ability to cope with whatever life throws at you!</p>
                  <p className="text-sm text-gray-600 mt-3">{workshop.date}, {workshop.location}</p>
                  <p className="text-sm font-bold mt-2">{workshop.amt}</p>
                  <button className="flex items-center gap-2 mt-2 bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition duration-300">
                    <BiCalendarCheck size={20} /> {/* Register icon */}
                    Register
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <h3 className="text-xl font-semibold mb-2">Recent Workshops</h3>
            <div className="flex overflow-x-auto space-x-4 pb-4">
              {pastWorkshops.map((workshop, index) => (
                <div key={index} className="min-w-[200px] bg-white shadow-md rounded-lg p-4">
                  <img 
                    src={workshop.image} 
                    alt={workshop.title} 
                    className="w-2/3 h-40 object-cover rounded-md mb-2 mx-auto"
                  />
                  <h4 className="text-lg font-bold mb-2">{workshop.title}</h4>
                  <p className="text-sm mt-2">Join us, and gain the confidence to do the work of being well, make healthier choices, pursue a healthier lifestyle and grow your ability to cope with whatever life throws at you!</p>
                  <p className="text-sm mt-3 text-gray-600">{workshop.date}, {workshop.location}</p>
               
                  
                  <button className="mt-2 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-300">
                    View Details
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
    </Layout>
    </div>
  );
};

export default Workshops;
