import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import { Edit2, Check } from "lucide-react";
import config from "../../config";

const API_URL = config.API_URL;

const ToggleSwitch = ({ enabled, onToggle }) => (
  <div
    onClick={onToggle}
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
  onToggle: PropTypes.func.isRequired,
};

const CardHeader = ({ title }) => (
  <div className="bg-[#837BFF] text-white p-3 rounded-t-lg">
    <h3 className="font-bold text-base">{title}</h3>
  </div>
);

CardHeader.propTypes = {
  title: PropTypes.string.isRequired,
};

const PaymentIntimationCard = ({ data, onToggle }) => {
  if (!data) return null;

  return (
    <div className="bg-white rounded-lg shadow-md">
      <CardHeader title="Payment Intimation & Expiry" />
      <div className="p-4 flex justify-between items-center">
        <span className="text-gray-700 text-sm font-semibold">
          Enable Payment Intimation
        </span>
        <ToggleSwitch
          enabled={data.status}
          onToggle={() => onToggle(data._id, data.status)}
        />
      </div>
    </div>
  );
};

const FollowUpsCard = ({ data, onToggle }) => {
  if (!data) return null;

  return (
    <div className="bg-white rounded-lg shadow-md">
      <CardHeader title="Follow-Ups" />
      <div className="p-4 flex justify-between items-center">
        <span className="text-gray-700 text-sm font-semibold">
          Enable Follow-Ups
        </span>
        <ToggleSwitch
          enabled={data.status}
          onToggle={() => onToggle(data._id, data.status)}
        />
      </div>
    </div>
  );
};

const ChargeSummaryCard = ({ data, onToggle }) => {
  if (!data) return null;

  return (
    <div className="bg-white rounded-lg shadow-md">
      <CardHeader title="Charge Summary Preview" />
      <div className="p-4 flex justify-between items-center">
        <span className="text-gray-700 text-sm font-semibold">
          Enable Charge Summary Preview
        </span>
        <ToggleSwitch
          enabled={data.status}
          onToggle={() => onToggle(data._id, data.status)}
        />
      </div>
      <div className="border-t border-gray-200" />
      <div className="p-4 text-gray-600 text-sm font-semibold flex justify-between">
        <div>
          <p>
            <span className="font-semibold">Patient ID :</span> P12345
          </p>
          <p>
            <span className="font-light">(Sample summary)</span>
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

const IntervalsSection = ({ data, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [interval, setIntervalValue] = useState(null);
  const [message, setMessage] = useState("");
  const intervalInputRef = useRef(null);
  const messageInputRef = useRef(null);

  useEffect(() => {
    if (data) {
      setIntervalValue(data.Interval || "");
      setMessage(data.Followupmsgtemp || "");
    }
  }, [data]);

  useEffect(() => {
    if (isEditing && intervalInputRef.current) {
      intervalInputRef.current.focus();
      intervalInputRef.current.selectionStart =
        intervalInputRef.current.value.length;
      intervalInputRef.current.selectionEnd =
        intervalInputRef.current.value.length;
    }
  }, [isEditing]);

  const handleIntervalChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setIntervalValue(value);
    }
  };

  const handleSave = () => {
    if (!data?._id) return;
    onUpdate(data._id, interval, message);
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="bg-[#837BFF] text-white p-3 rounded-t-lg grid grid-cols-12 gap-4 items-center">
        <h3 className="font-bold text-base col-span-2">Interval (hours)</h3>
        <h3 className="font-bold text-base col-span-8 ml-20">
          Follow-Up Message Template
        </h3>
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
              <span className="text-gray-700 text-sm font-semibold">
                {interval}
              </span>
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
        <div className="col-span-2 flex justify-end items-center pr-4">
          {isEditing ? (
            <button
              onClick={handleSave}
              className="text-gray-500 hover:text-green-600 transition-colors"
            >
              <Check size={16} />
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="text-gray-500 hover:text-indigo-600 transition-colors"
            >
              <Edit2 size={16} />
            </button>
          )}
          {/* <button className="text-gray-500 hover:text-red-600 transition-colors">
            <Trash2 size={16} />
          </button> */}
        </div>
      </div>
    </div>
  );
};

const PaymentMessageTemplateSection = ({ message, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [description, setDescription] = useState("");
  const [placeholders, setPlaceholders] = useState([]);
  const descriptionInputRef = useRef(null);

  useEffect(() => {
    if (isEditing && descriptionInputRef.current) {
      descriptionInputRef.current.focus();
      descriptionInputRef.current.selectionStart =
        descriptionInputRef.current.value.length;
      descriptionInputRef.current.selectionEnd =
        descriptionInputRef.current.value.length;
    }
  }, [isEditing]);

  const insertPlaceholder = (placeholder) => {
    if (descriptionInputRef.current) {
      const input = descriptionInputRef.current;
      const start = input.selectionStart;
      const end = input.selectionEnd;

      const newText =
        description.substring(0, start) +
        placeholder +
        description.substring(end);

      setDescription(newText);

      setTimeout(() => {
        input.focus();
        input.selectionStart = input.selectionEnd = start + placeholder.length;
      }, 0);
    } else {
      setDescription((prev) => prev + placeholder);
    }
  };

  useEffect(() => {
    if (message) {
      setDescription(message.Description || "");

      const normalizedPlaceholders = (message.Placeholder || []).map((ph) => {
        if (!ph.startsWith("{") || !ph.endsWith("}")) {
          return `{${ph.replace(/[{}]/g, "")}}`; 
        }
        return ph;
      });

      setPlaceholders(normalizedPlaceholders);
    }
  }, [message]);

  const handleSave = () => {
    if (!message?._id) return;
    onUpdate(message._id, description, placeholders);
    setIsEditing(false);
  };

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
            <p className="text-gray-700 text-sm font-semibold">{description}</p>
          )}
        </div>

        <div className="col-span-4 flex flex-col ml-40 space-y-2">
          {placeholders.map((ph) => (
            <button
              key={ph}
              onClick={() => insertPlaceholder(ph)}
              disabled={!isEditing}
              className={`px-2 py-1 text-xs font-semibold rounded-md border ${
                isEditing
                  ? "border-indigo-500 text-indigo-600 hover:bg-indigo-100"
                  : "border-gray-300 text-gray-400 cursor-not-allowed"
              }`}
            >
              {ph}
            </button>
          ))}
        </div>

        <div className="col-span-2 flex justify-end items-center pr-4">
          {isEditing ? (
            <button
              onClick={handleSave}
              className="text-gray-500 hover:text-green-600 transition-colors"
            >
              <Check size={16} />
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="text-gray-500 hover:text-indigo-600 transition-colors"
            >
              <Edit2 size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const PaymentIntimationPanel = () => {
  const [panelSettings, setPanelSettings] = useState([]);
  const [intervalData, setIntervalData] = useState({});
  const [messageTemplate, setMessageTemplate] = useState(null);

  const updatePaymentIntimationStatus = async (id, currentStatus) => {
    try {
      await axios.patch(
        `${API_URL}/api/doctorAppointmentSettings/updatePaymentIntimationPanel1/${id}`,
        { status: !currentStatus },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      fetchPaymentIntimationPanel();
    } catch (error) {
      console.error("Error toggling payment intimation status:", error);
    }
  };

  const fetchPaymentIntimationPanel = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/doctorAppointmentSettings/getPaymentIntimationPanel1`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      if (response.data.success) {
        setPanelSettings(response.data.result);
      }
    } catch (error) {
      console.error("Error fetching payment intimation panel:", error);
    }
  };

  const fetchFollowUpMessage = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/doctorAppointmentSettings/getPaymentIntimationPanel2`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setIntervalData({ ...response.data.result[0] });
    } catch (err) {
      console.error("Error fetching Payment Intimation Panel 2:", err);
    }
  };

  const updateFollowUpMessage = async (id, interval, message) => {
    try {
      await axios.patch(
        `${API_URL}/api/doctorAppointmentSettings/editPaymentIntimationPanel2/${id}`,
        {
          Interval: interval,
          Followupmsgtemp: message,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      fetchFollowUpMessage();
    } catch (error) {
      console.error("Error updating follow-up message:", error);
    }
  };

  const fetchPaymentMessageTemplate = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/doctorAppointmentSettings/getPaymentMsgTemplate`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (response.data.success && response.data.result.length > 0) {
        const template = response.data.result[0];
        setMessageTemplate(template);
      }
    } catch (err) {
      console.error("Error fetching payment message template:", err);
    }
  };

  const updatePaymentMessageTemplate = async (
    templateId,
    description,
    placeholders
  ) => {
    try {
      const response = await axios.patch(
        `${API_URL}/api/doctorAppointmentSettings/editPaymentMsgTemplate/${templateId}`,
        {
          Description: description,
          Placeholder: placeholders,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data?.message === "modified successfully") {
        fetchPaymentMessageTemplate();
      }
    } catch (error) {
      console.error("Error updating payment message template:", error);
      throw error;
    }
  };

  useEffect(() => {
    fetchPaymentIntimationPanel();
    fetchFollowUpMessage();
    fetchPaymentMessageTemplate();
  }, []);

  return (
    <div className="flex items-center justify-center mt-10">
      <div className="bg-white shadow-lg rounded-xl w-full max-w-6xl p-6">
        <h1 className="text-xl font-bold text-gray-800 mb-6">
          Payment Intimation Panel
        </h1>
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <PaymentIntimationCard
                data={panelSettings[0]}
                onToggle={updatePaymentIntimationStatus}
              />
              <FollowUpsCard
                data={panelSettings[1]}
                onToggle={updatePaymentIntimationStatus}
              />
            </div>
            <ChargeSummaryCard
              data={panelSettings[2]}
              onToggle={updatePaymentIntimationStatus}
            />
          </div>

          <div>
            <IntervalsSection
              data={intervalData}
              onUpdate={updateFollowUpMessage}
            />
            {/* <div className="flex justify-end mt-4">
              <button className="bg-[#837BFF] text-white font-semibold py-2 px-5 rounded-lg hover:bg-opacity-90 transition-colors">
                Add +
              </button>
            </div> */}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Payment Message Template
            </h2>
            <PaymentMessageTemplateSection
              message={messageTemplate}
              onUpdate={updatePaymentMessageTemplate}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentIntimationPanel;
