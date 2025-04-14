import React, { useState } from "react";
import workshop from '/src/assets/images/doctor images/workshop.jpg'; // Updated variable name
import NewWorkshop from './NewWorkshop'; // Import the modal component
import DoctorLayout from "/src/components/doctor components/DoctorLayout.jsx";
import { PlusIcon } from '@heroicons/react/20/solid';

// WorkshopCard component
const WorkshopCard = ({ title, description, time, date, amount, image }) => {
  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-sm border-2 border-blue-50">
      <img className="rounded-lg mb-4" src={workshop} alt={`${title} Workshop`} />
      <h2 className="text-xl font-bold mb-2">{title}</h2>
      <p className="text-gray-700 mb-4">{description}</p>
      <div className="text-sm text-gray-500">
        <p>{time} | {date}</p>
        <p className="font-semibold">Amount: ${amount}</p>
      </div>
    </div>
  );
};

// Function to determine the status of the workshop
const getStatus = (date) => {
  const today = new Date();
  const workshopDate = new Date(date);
  return workshopDate >= today ? 'Upcoming' : 'Expired';
};

const WorkshopPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false); // State to handle modal visibility
  const [filter, setFilter] = useState('All'); // State to handle filter selection

  const workshops = [
    {
      title: "Teeth Whitening Offer",
      description: "Delight patient with Teeth Whitening Offer, visit our clinic for free checkup.",
      time: "10:00 AM",
      date: "2024-09-25", // Change format to ISO
      amount: "50",
      image: "https://example.com/workshop-image.jpg",
    },
    {
      title: "Expired Workshop Example",
      description: "This workshop is expired.",
      time: "2:00 PM",
      date: "2023-08-15", // Change format to ISO
      amount: "30",
      image: "https://example.com/workshop-image.jpg",
    },
    // Add more workshops here as needed...
  ];

  // Filter workshops based on the selected filter
  const filteredWorkshops = workshops.filter(workshop => 
    filter === 'All' || getStatus(workshop.date) === filter
  );

  return (
    <DoctorLayout>
      <div className="min-h-screen p-7">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Workshops</h1>
          <button
            onClick={() => setIsModalOpen(true)} // Open the modal when clicked
            className="bg-blue-400 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2"
          >
            <PlusIcon className="w-5 h-5" /> {/* Add the icon here */}
            <span>New Workshop</span>
          </button>
        </div>

        {/* Dropdown Filter */}
        <div className="mb-6">
          <label htmlFor="filter" className="block text-md font-medium text-gray-700 mb-2">
            Filter Workshops
          </label>
          <select
            id="filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-40 p-2 border border-gray-300 rounded" // Adjusted width here
          >
            <option value="All">All Workshops</option>
            <option value="Upcoming">Upcoming</option>
            <option value="Expired">Expired</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorkshops.length > 0 ? (
            filteredWorkshops.map((workshop, index) => (
              <WorkshopCard key={index} {...workshop} />
            ))
          ) : (
            <p>No workshops available for the selected filter.</p>
          )}
        </div>

        {/* Modal Popup */}
        {isModalOpen && (
          <NewWorkshop 
            isOpen={isModalOpen} // Pass isOpen prop to the modal
            onClose={() => setIsModalOpen(false)} // Close modal function
          />
        )}
      </div>
    </DoctorLayout>
  );
};

export default WorkshopPage;
