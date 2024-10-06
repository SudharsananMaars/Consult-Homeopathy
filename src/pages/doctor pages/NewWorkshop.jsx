import React, { useState } from 'react';

const NewWorkshop = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [workshop, setWorkshop] = useState({
    title: '',
    sendTo: 'All Patients',
    description: '',
    time: '',
    date: '',
    amount: '',
    image: null,
  });

  const [imagePreview, setImagePreview] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setWorkshop((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setWorkshop((prev) => ({
      ...prev,
      image: file,
    }));
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(workshop);
    onClose(); // Close the modal after submitting
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Create New Workshop</h2>
          <button onClick={onClose} className="text-red-500 hover:text-red-600 text-2xl p-2">
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-1 text-gray-700">Workshop Title</label>
            <input
              type="text"
              name="title"
              value={workshop.title}
              onChange={handleInputChange}
              className="border border-gray-300 p-2 w-full rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 text-gray-700">Send To</label>
            <select
              name="sendTo"
              value={workshop.sendTo}
              onChange={handleInputChange}
              className="border border-gray-300 p-2 w-full rounded"
            >
              <option value="All Patients">All Patients</option>
              <option value="All Doctors">All Doctors</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block mb-1 text-gray-700">Description</label>
            <textarea
              name="description"
              value={workshop.description}
              onChange={handleInputChange}
              className="border border-gray-300 p-2 w-full rounded"
              rows="3"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="mb-4">
              <label className="block mb-1 text-gray-700">Time</label>
              <input
                type="time"
                name="time"
                value={workshop.time}
                onChange={handleInputChange}
                className="border border-gray-300 p-2 w-full rounded"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1 text-gray-700">Date</label>
              <input
                type="date"
                name="date"
                value={workshop.date}
                onChange={handleInputChange}
                className="border border-gray-300 p-2 w-full rounded"
                required
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block mb-1 text-gray-700">Amount</label>
            <input
              type="number"
              name="amount"
              value={workshop.amount}
              onChange={handleInputChange}
              className="border border-gray-300 p-2 w-full rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 text-gray-700">Add an Image (Optional)</label>
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleImageChange}
              className="border border-gray-300 p-2 w-full rounded"
            />
          </div>
          {imagePreview && (
            <div className="mb-4">
              <img src={imagePreview} alt="Image Preview" className="w-full h-64 object-cover rounded" />
            </div>
          )}
          <div className="flex justify-center space-x-4">
            
            <button
              type="submit"
              className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 focus:outline-none"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewWorkshop;
