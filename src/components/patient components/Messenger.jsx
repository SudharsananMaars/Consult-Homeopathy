import React, { useState } from "react";
import { FaUserMd, FaEnvelopeOpenText, FaReply } from "react-icons/fa";

const Messenger = ({ toggleMessenger, isVisible }) => {
  const [messages] = useState([
    { id: 1, sender: "Dr. Smith", message: "Follow up with patient John tomorrow.", icon: FaUserMd, time: "10 mins ago" },
    { id: 2, sender: "Dr. Jane", message: "Prescribed new medicines to patient Doe.", icon: FaUserMd, time: "1 hour ago" },
    { id: 3, sender: "Reception", message: "New appointment scheduled for Dr. Brown.", icon: FaEnvelopeOpenText, time: "3 hours ago" },
    { id: 4, sender: "Dr. Brown", message: "Meeting scheduled with the board.", icon: FaUserMd, time: "5 hours ago" },
    { id: 1, sender: "Dr. Smith", message: "Follow up with patient John tomorrow.", icon: FaUserMd, time: "10 mins ago" },
    { id: 2, sender: "Dr. Jane", message: "Prescribed new medicines to patient Doe.", icon: FaUserMd, time: "1 hour ago" },
    { id: 3, sender: "Reception", message: "New appointment scheduled for Dr. Brown.", icon: FaEnvelopeOpenText, time: "3 hours ago" },
    { id: 4, sender: "Dr. Brown", message: "Meeting scheduled with the board.", icon: FaUserMd, time: "5 hours ago" },
    
  ]);

  const [searchTerm, setSearchTerm] = useState(""); // Track the search term
  const [selectedMessage, setSelectedMessage] = useState(null);

  // Filter messages based on the search term
  const filteredMessages = messages.filter((msg) =>
    msg.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div
      className={`pt-1 fixed top-0 right-0 h-full w-1/4 bg-white shadow-lg z-50 transform transition-transform duration-300 ${
        isVisible ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="p-4 bg-blue-300 text-white flex justify-between">
        <h3 className="text-lg font-bold text-gray-800">Messenger</h3>
        <button onClick={toggleMessenger} className="text-gray-800">
          <FaReply />
        </button>
      </div>

      {/* Search Input */}
      <div className="p-4 border-b">
        <input
          type="text"
          placeholder="Search messages..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      <div className="max-h-[calc(100%-8rem)] overflow-y-auto p-4">
        {filteredMessages.length > 0 ? (
          filteredMessages.map((msg) => (
            <div
              key={msg.id}
              className="flex items-center border-b py-2 cursor-pointer"
              onClick={() => setSelectedMessage(msg)}
            >
              <span className="text-blue-300 text-xl mr-3">
                {React.createElement(msg.icon)}
              </span>
              <div>
                <p className="text-sm font-medium">{msg.sender}</p>
                <p className="text-xs text-gray-500">{msg.time}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500">No messages found.</p>
        )}
      </div>

      {selectedMessage && (
        <div className="p-4 border-t">
          <h4 className="font-semibold">{selectedMessage.sender}</h4>
          <p className="text-sm">{selectedMessage.message}</p>
          <button className="w-full mt-2 p-2 bg-blue-100 text-blue-400 hover:bg-blue-200">
            <FaReply className="inline mr-2" />
            Reply
          </button>
        </div>
      )}
    </div>
  );
};

export default Messenger;
