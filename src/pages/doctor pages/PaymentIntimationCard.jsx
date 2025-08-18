import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { Edit2, Trash2, Check } from 'lucide-react';

const ToggleSwitch = ({ enabled, setEnabled }) => (
  <div
    onClick={() => setEnabled(!enabled)}
    className={`relative inline-flex items-center h-6 rounded-full w-11 cursor-pointer transition-colors duration-300 ease-in-out ${
      enabled ? "bg-[#837BFF]" : "bg-gray-300"
    }`}
  >
    <span
      className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300 ease-in-out ${
        enabled ? "translate-x-6" : "translate-x-1"
      }`}
    />
  </div>
);

ToggleSwitch.propTypes = {
  enabled: PropTypes.bool.isRequired,
  setEnabled: PropTypes.func.isRequired,
};

const CardHeader = ({ title }) => (
  <div className="bg-[#837BFF] text-white p-3 rounded-t-lg">
    <h3 className="font-bold text-base">{title}</h3>
  </div>
);

CardHeader.propTypes = {
  title: PropTypes.string.isRequired,
};

const PaymentIntimationCard = () => {
  const [enabled, setEnabled] = useState(true);
  return (
    <div className="bg-white rounded-lg shadow-md">
      <CardHeader title="Payment Intimation & Expiry" />
      <div className="p-4 flex justify-between items-center">
        <span className="text-gray-700 text-sm font-semibold">Enable Payment Intimation</span>
        <ToggleSwitch enabled={enabled} setEnabled={setEnabled} />
      </div>
    </div>
  );
};


const ChargeSummaryCard = () => {
  const [enabled, setEnabled] = useState(true);
  return (
    <div className="bg-white rounded-lg shadow-md">
      <CardHeader title="Charge Summary Preview" />
      <div className="p-4 flex justify-between items-center">
        <span className="text-gray-700 text-sm font-semibold">Enable Charge Summary Preview</span>
        <ToggleSwitch enabled={enabled} setEnabled={setEnabled} />
      </div>
      <div className="border-t border-gray-200" />
      <div className="p-4 text-gray-600 text-sm font-semibold flex justify-between">
        <div>
          <p>
            <span className="font-semibold">Patient ID :</span> P12345
          </p>
        </div>
        <div className="text-right">
          <p>Consultation Charges : ₹500</p>
          <p>Medicine Charges : ₹400</p>
          <p>Shipment Charges : ₹40</p>
          <p className="font-semibold">Total : ₹940</p>
        </div>
      </div>
    </div>
  );
};

const FollowUpsCard = () => {
  const [enabled, setEnabled] = useState(true);
  return (
    <div className="bg-white rounded-lg shadow-md">
      <CardHeader title="Follow-Ups" />
      <div className="p-4 flex justify-between items-center">
        <span className="text-gray-700 text-sm font-semibold">Enable Follow-Ups</span>
        <ToggleSwitch enabled={enabled} setEnabled={setEnabled} />
      </div>
    </div>
  );
};

const IntervalsSection = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [interval, setIntervalValue] = useState("2");
  const [message, setMessage] = useState(
    '"Gentle reminder: Your payment is pending"'
  );
  const intervalInputRef = useRef(null);
  const messageInputRef = useRef(null);

  useEffect(() => {
    if (isEditing && intervalInputRef.current) {
      intervalInputRef.current.focus();
      intervalInputRef.current.selectionStart = intervalInputRef.current.value.length;
      intervalInputRef.current.selectionEnd = intervalInputRef.current.value.length;
    }
  }, [isEditing]);

  const handleIntervalChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setIntervalValue(value);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="bg-[#837BFF] text-white p-3 rounded-t-lg grid grid-cols-12 gap-4 items-center">
        <h3 className="font-bold text-base col-span-2">Interval (hours)</h3>
        <h3 className="font-bold text-base col-span-8 ml-20">Follow-Up Message Template</h3>
        <h3 className="font-bold text-base col-span-2 text-right">Actions</h3>
      </div>
      <div className="p-4 grid grid-cols-12 gap-4 items-center">
        <div className="col-span-2">
          {isEditing ? (
            <input
              ref={intervalInputRef}
              type="text"
              value={interval}
              onChange={handleIntervalChange}
              className="w-16 text-center border border-indigo-500 rounded-md p-2 focus:ring-indigo-500"
            />
          ) : (
             <div className="w-16 text-center border border-gray-300 rounded-md p-2">
                <span className="text-gray-700 text-sm font-semibold">{interval}</span>
             </div>
          )}
        </div>
        <div className="col-span-8">
          {isEditing ? (
            <input
              ref={messageInputRef}
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full text-gray-700 text-sm font-semibold ml-20 border border-indigo-500 rounded-md p-2"
            />
          ) : (
            <p className="text-gray-700 text-sm font-semibold ml-20">
              {message}
            </p>
          )}
        </div>
        <div className="col-span-2 flex justify-end items-center space-x-4">
          {isEditing ? (
            <button onClick={() => setIsEditing(false)} className="text-gray-500 hover:text-green-600 transition-colors">
              <Check size={16} />
            </button>
          ) : (
            <button onClick={() => setIsEditing(true)} className="text-gray-500 hover:text-indigo-600 transition-colors">
              <Edit2 size={16} />
            </button>
          )}
          <button className="text-gray-500 hover:text-red-600 transition-colors">
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

const PaymentMessageTemplateSection = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [description, setDescription] = useState(
    "Hello! Your total bill is ₹{total_amount}. Please click below to pay and confirm your order."
  );
  const descriptionInputRef = useRef(null);

  useEffect(() => {
      if(isEditing && descriptionInputRef.current) {
          descriptionInputRef.current.focus();
          descriptionInputRef.current.selectionStart = descriptionInputRef.current.value.length;
          descriptionInputRef.current.selectionEnd = descriptionInputRef.current.value.length;
      }
  }, [isEditing]);

  return (
    <div className="rounded-lg shadow-md mt-6">
      <div className="bg-[#837BFF] text-white p-3 rounded-t-lg grid grid-cols-12 gap-4 items-center">
        <h3 className="font-bold text-base col-span-6">Description</h3>
        <h3 className="font-bold text-base col-span-4 ml-40">Placeholders</h3>
        <h3 className="font-bold text-base col-span-2 text-right">Actions</h3>
      </div>
      <div className="p-4 grid grid-cols-12 gap-2 items-start">
        <div className="col-span-6">
          {isEditing ? (
            <textarea
              ref={descriptionInputRef}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full h-24 text-gray-700 text-sm font-semibold border border-indigo-500 rounded-md p-2 focus:ring-indigo-500"
            />
          ) : (
            <p className="text-gray-700 text-sm font-semibold">
              {description}
            </p>
          )}
        </div>
        <div className="col-span-4">
          <p className="text-gray-500 text-sm font-semibold ml-40">
            {"{medicine_amount}"},<br />
            {"{shipment_amount}"},<br />
            {"{total_amount}"}
          </p>
        </div>
        <div className="col-span-2 flex justify-end items-center space-x-4">
          {isEditing ? (
            <button onClick={() => setIsEditing(false)} className="text-gray-500 hover:text-green-600 transition-colors">
              <Check size={16} />
            </button>
          ) : (
            <button onClick={() => setIsEditing(true)} className="text-gray-500 hover:text-indigo-600 transition-colors">
              <Edit2 size={16} />
            </button>
          )}
          <button className="text-gray-500 hover:text-red-600 transition-colors">
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};


function PaymentIntimationPanel() {
  return (
    <div className="flex items-center justify-center min-h-screen mt-10">
      <div className="bg-white shadow-lg rounded-xl w-full max-w-6xl p-6">
        <h1 className="text-xl font-bold text-gray-800 mb-6">Payment Intimation Panel</h1>
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <PaymentIntimationCard />
              <FollowUpsCard />
            </div>
            <ChargeSummaryCard />
          </div>
          <div>
            <IntervalsSection />
            {/* <div className="flex justify-end mt-4">
              <button className="bg-[#837BFF] text-white font-semibold py-2 px-5 rounded-lg hover:bg-opacity-90 transition-colors">
                Add +
              </button>
            </div> */}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Payment Message Template</h2>
            <PaymentMessageTemplateSection />
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentIntimationPanel;
