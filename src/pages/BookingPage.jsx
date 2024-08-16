import React, { useState } from 'react';
import { AiOutlineCalendar } from 'react-icons/fa'; // Calendar icon from react-icons

const timeSlots = [
  '10 PM', '11 PM', '12 AM', '1 AM', '2 AM', '3 AM', '4 AM'
];

const BookingPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState(null);

  const handleDateChange = (event) => {
    setSelectedDate(new Date(event.target.value));
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
  };

  const handleBooking = () => {
    if (!selectedSlot) return; // No slot selected
    alert(`Appointment booked for ${selectedDate.toDateString()} at ${selectedSlot}`);
  };

  return (
    <div className="p-4 md:p-8 lg:p-12">
      <h1 className="text-2xl font-bold mb-4">Book an Appointment</h1>
      <div className="mb-4 flex items-center">
        <label htmlFor="date-picker" className="mr-2 text-lg font-semibold">Preferred Day:</label>
        <AiOutlineCalendar className="text-xl" />
        <input
          type="date"
          id="date-picker"
          value={selectedDate.toISOString().split('T')[0]}
          onChange={handleDateChange}
          className="ml-2 p-2 border rounded"
        />
      </div>

      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Available Time Slots</h2>
        <div className="flex flex-wrap gap-2">
          {timeSlots.map((slot) => (
            <button
              key={slot}
              onClick={() => handleSlotSelect(slot)}
              className={`p-2 border rounded ${selectedSlot === slot ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              {slot}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleBooking}
        className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Book an Appointment
      </button>
    </div>
  );
};

export default BookingPage;
