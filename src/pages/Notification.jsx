import React from 'react';
import Layout from '../components/Layout';
import { LuCalendarDays } from "react-icons/lu";
import { MdOutlineLocalShipping } from "react-icons/md";
import { TbPhotoVideo } from "react-icons/tb";
import { GiMedicines } from "react-icons/gi";

const Notification= () => {
  return (
    <div>
        <Layout>
      {/* Workshop Notification */}
      <div className="flex items-start bg-blue-100 p-4 mb-4 rounded shadow">
    {/* Workshop Icon */}
    <LuCalendarDays className="text-blue-600 mr-4" size={30} />
    
    {/* Workshop Content */}
    <div>
        {/* Heading */}
        <p className="font-bold text-lg text-blue-500">Workshop:</p>
        
        {/* Upcoming Workshop Description */}
        <p className="text-gray-700 font-semibold">Upcoming workshop on "Diabetes Management"</p>
        
        {/* Date and Time */}
        <p className="text-gray-700">14th Aug, 10:00 AM</p>
        
        {/* Time Elapsed */}
        <p className="text-gray-700 text-sm mt-1">1 hr ago</p>
    </div>
</div>

<div className="flex items-start bg-purple-100 p-4 mb-4 rounded shadow">
    {/* Workshop Icon */}
    <MdOutlineLocalShipping className="text-purple-600 mr-4" size={30} />
    
    {/* Workshop Content */}
    <div>
        {/* Heading */}
        <p className="font-bold text-lg text-purple-500">Shipment Tracking:</p>
        
        {/* Upcoming Workshop Description */}
        <p className="text-gray-700 font-semibold">Your medicine shipment is on its way!</p>
        
        {/* Date and Time */}
        <p className="text-gray-700">Expected delivery: 17th Aug</p>
        
        {/* Time Elapsed */}
        <p className="text-gray-700 text-sm mt-1">1 hr ago</p>
    </div>
</div>

<div className="flex items-start bg-pink-100 p-4 mb-4 rounded shadow">
    {/* Workshop Icon */}
    <TbPhotoVideo className="text-pink-500 mr-4" size={30} />
    
    {/* Workshop Content */}
    <div>
        {/* Heading */}
        <p className="font-bold text-lg text-pink-500">Video:</p>
        
        {/* Upcoming Workshop Description */}
        <p className="text-gray-700 font-semibold">New video posted: "Healthy Eating Tips".</p>
        
        {/* Time Elapsed */}
        <p className="text-gray-700 text-sm mt-1">1 hr ago</p>
    </div>
</div>

<div className="flex items-start bg-green-100 p-4 mb-4 rounded shadow">
    {/* Workshop Icon */}
    <GiMedicines className="text-green-500 mr-4" size={30} />
    
    {/* Workshop Content */}
    <div>
        {/* Heading */}
        <p className="font-bold text-lg text-green-500">Medicine:</p>
        
        {/* Upcoming Workshop Description */}
        <p className="text-gray-700 font-semibold">Have you taken your medicines?</p>
        <button className="ml-auto bg-green-500 text-white px-4 py-2 rounded mt-4">Taken</button>
    </div>
</div>
      </Layout>
    </div>
  );
};

export default Notification;
