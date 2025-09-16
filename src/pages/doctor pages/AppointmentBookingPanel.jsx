import { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { Edit2, Trash2, Clock, IndianRupee, Check } from "lucide-react";
import axios from "axios";
import config from "../../config";

const API_URL = config.API_URL;

const formatTo12Hour = (time24) => {
  if (!time24) return "--:-- --";
  let [h, m] = time24.split(":");
  const hours = parseInt(h, 10);
  const suffix = hours >= 12 ? "PM" : "AM";
  const displayHour = ((hours + 11) % 12) + 1;
  return `${String(displayHour).padStart(2, "0")}:${m} ${suffix}`;
};

const formatTo24Hour = (time12) => {
  if (!time12 || !time12.includes(" ")) return "00:00";
  const [time, period] = time12.split(" ");
  let [hours, minutes] = time.split(":");
  hours = parseInt(hours, 10);
  if (period.toUpperCase() === "PM" && hours < 12) {
    hours += 12;
  }
  if (period.toUpperCase() === "AM" && hours === 12) {
    hours = 0;
  }
  return `${String(hours).padStart(2, "0")}:${minutes}`;
};

const ToggleSwitch = ({ enabled, onChange }) => (
  <div
    onClick={() => onChange(!enabled)}
    className={`relative inline-flex items-center h-6 rounded-full w-11 cursor-pointer transition-colors duration-300 ease-in-out ${
      enabled ? "bg-blue-500" : "bg-gray-300"
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
  onChange: PropTypes.func.isRequired,
};

const CustomTimePicker = ({ value, onChange, isEditing }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedHour, setSelectedHour] = useState("10");
  const [selectedMinute, setSelectedMinute] = useState("00");
  const [selectedPeriod, setSelectedPeriod] = useState("AM");
  const [position, setPosition] = useState("bottom");
  const pickerRef = useRef(null);

  const hours = Array.from({ length: 12 }, (_, i) =>
    String(i + 1).padStart(2, "0")
  );
  const minutes = Array.from({ length: 60 }, (_, i) =>
    String(i).padStart(2, "0")
  );
  const periods = ["AM", "PM"];

  useEffect(() => {
    if (isOpen && value) {
      const [h, m] = value.split(":");
      const hour24 = parseInt(h, 10);
      setSelectedPeriod(hour24 >= 12 ? "PM" : "AM");
      const hour12 = ((hour24 + 11) % 12) + 1;
      setSelectedHour(String(hour12).padStart(2, "0"));
      setSelectedMinute(m);
    }
  }, [isOpen, value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleTogglePicker = () => {
    if (!isEditing) return;
    if (!isOpen) {
      const rect = pickerRef.current.getBoundingClientRect();
      if (window.innerHeight - rect.bottom < 250) {
        setPosition("top");
      } else {
        setPosition("bottom");
      }
    }
    setIsOpen(!isOpen);
  };

  const handleSetTime = () => {
    let hour24 = parseInt(selectedHour, 10);
    if (selectedPeriod === "PM" && hour24 < 12) {
      hour24 += 12;
    }
    if (selectedPeriod === "AM" && hour24 === 12) {
      hour24 = 0;
    }
    const finalTime = `${String(hour24).padStart(2, "0")}:${selectedMinute}`;
    onChange(finalTime);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={pickerRef}>
      <div
        className={`relative ${
          isEditing ? "cursor-pointer" : "cursor-default"
        }`}
        onClick={handleTogglePicker}
      >
        <Clock
          className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400 z-10"
          size={16}
        />
        <div
          className={`border ${
            isEditing ? "border-blue-500" : "border-gray-300"
          } text-gray-900 text-sm font-semibold rounded-lg block w-full pl-10 pr-3 py-2`}
        >
          {formatTo12Hour(value)}
        </div>
      </div>

      {isOpen && (
        <div
          className={`absolute z-20 w-64 bg-white rounded-md shadow-lg ${
            position === "bottom" ? "mt-1 top-full" : "mb-1 bottom-full"
          }`}
        >
          <div className="flex justify-center p-2">
            <ul className="h-48 overflow-y-auto pr-2 border-r">
              {hours.map((hour) => (
                <li
                  key={hour}
                  onClick={() => setSelectedHour(hour)}
                  className={`px-3 py-1 text-center rounded-md text-sm cursor-pointer ${
                    selectedHour === hour
                      ? "bg-blue-500 text-white"
                      : "hover:bg-gray-100"
                  }`}
                >
                  {hour}
                </li>
              ))}
            </ul>
            <ul className="h-48 overflow-y-auto px-2 border-r">
              {minutes.map((minute) => (
                <li
                  key={minute}
                  onClick={() => setSelectedMinute(minute)}
                  className={`px-3 py-1 text-center rounded-md text-sm cursor-pointer ${
                    selectedMinute === minute
                      ? "bg-blue-500 text-white"
                      : "hover:bg-gray-100"
                  }`}
                >
                  {minute}
                </li>
              ))}
            </ul>
            <ul className="h-48 overflow-y-auto pl-2 flex flex-col justify-center">
              {periods.map((period) => (
                <li
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-3 py-1 text-center rounded-md text-sm cursor-pointer ${
                    selectedPeriod === period
                      ? "bg-blue-500 text-white"
                      : "hover:bg-gray-100"
                  }`}
                >
                  {period}
                </li>
              ))}
            </ul>
          </div>
          <div className="border-t p-2">
            <button
              onClick={handleSetTime}
              className="w-full bg-blue-500 text-white text-sm font-bold py-2 rounded-lg hover:bg-[#6a61d3] transition-colors"
            >
              Set Time
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

CustomTimePicker.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  isEditing: PropTypes.bool,
};

CustomTimePicker.defaultProps = {
  isEditing: false,
};

const PriceInput = ({ value, onChange, isEditing }) => (
  <div className="relative">
    <IndianRupee
      className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400"
      size={16}
    />
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`border ${
        isEditing ? "border-indigo-500" : "border-gray-300"
      } text-gray-900 text-sm font-semibold rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 pr-3 py-2`}
    />
  </div>
);

PriceInput.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onChange: PropTypes.func.isRequired,
  isEditing: PropTypes.bool,
};

PriceInput.defaultProps = {
  isEditing: false,
};

const SlotTypeRow = ({
  slot,
  isEditing,
  onUpdateSlotTypes,
  onEdit,
  onDelete,
  onUpdateField,
}) => {
  const typeInputRef = useRef(null);

  useEffect(() => {
    if (isEditing && typeInputRef.current) {
      typeInputRef.current.focus();
      typeInputRef.current.selectionStart = typeInputRef.current.value.length;
      typeInputRef.current.selectionEnd = typeInputRef.current.value.length;
    }
  }, [isEditing]);

  return (
    <div className="grid grid-cols-12 items-center gap-4 p-4">
      <div className="col-span-3 flex items-center gap-2">
        <span className="font-semibold text-gray-700 text-[14px]">
          {slot.type}
        </span>
      </div>
      <div className="col-span-2">
        <CustomTimePicker
          isEditing={isEditing}
          value={slot.start}
          onChange={(val) => onUpdateField(slot.id, "start", val)}
        />
      </div>
      <div className="col-span-2">
        <CustomTimePicker
          isEditing={isEditing}
          value={slot.end}
          onChange={(val) => onUpdateField(slot.id, "end", val)}
        />
      </div>
      <div className="col-span-2">
        {isEditing ? (
          <PriceInput
            isEditing={isEditing}
            value={String(slot.price)}
            onChange={(val) => onUpdateField(slot.id, "price", val)}
          />
        ) : (
          <div className="border border-gray-200  text-gray-700 text-sm font-semibold rounded-lg block w-full pl-10 pr-3 py-2 relative h-[42px] flex items-center">
            <IndianRupee
              className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400"
              size={16}
            />
            {slot.price}
          </div>
        )}
      </div>
      <div className="col-span-2 flex justify-center">
        <ToggleSwitch
          enabled={slot.allowBooking}
          onChange={() => onUpdateSlotTypes(slot.id, "toggle")}
        />
      </div>
      <div className="col-span-1 flex justify-center gap-2">
        {isEditing ? (
          <button
            onClick={() => onUpdateSlotTypes(slot.id, "day")}
            className="text-gray-500 hover:text-green-600 transition-colors"
          >
            <Check size={16} />
          </button>
        ) : (
          <button
            onClick={() => onEdit(slot.id)}
            className="text-gray-500 hover:text-indigo-600 transition-colors"
          >
            <Edit2 size={16} />
          </button>
        )}
        <button
          onClick={() => onDelete(slot.id)}
          className="text-gray-500 hover:text-red-600 transition-colors"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

SlotTypeRow.propTypes = {
  slot: PropTypes.object.isRequired,
  isEditing: PropTypes.bool.isRequired,
  onUpdateSlotTypes: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onUpdateField: PropTypes.func.isRequired,
  onUpdateDays: PropTypes.func.isRequired,
};

const AppointmentBookingPanel = () => {
  const [clinicHours, setClinicHours] = useState([]);
  const [originalClinicHours, setOriginalClinicHours] = useState([]);
  const [slotTypes, setSlotTypes] = useState([]);
  const [originalSlots, setOriginalSlots] = useState([]);
  const [priorityMapping, setPriorityMapping] = useState([]);
  const [originalPriorityMapping, setOriginalPriorityMapping] = useState([]);
  const [rescheduleAndRefund, setRescheduleAndRefund] = useState([]);

  const [editingSlotId, setEditingSlotId] = useState(null);
  const [editingClinicDayIndex, setEditingClinicDayIndex] = useState(null);
  const [editingPriorityIndex, setEditingPriorityIndex] = useState(null);

  useEffect(() => {
    fetchClinicHours();
    fetchSlotTypes();
    fetchConsultationPriorityMapping();
    fetchRescheduleAndRefund();
  }, []);

  const fetchClinicHours = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/doctorAppointmentSettings/getClinicOperationalHours`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      const formattedData = response.data.result.map((hour) => ({
        id: hour._id,
        day: hour.day,
        from: formatTo24Hour(hour.startingTime),
        to: formatTo24Hour(hour.endingTime),
        enabled: hour.status,
      }));
      setClinicHours(formattedData);
      setOriginalClinicHours(formattedData);
    } catch (error) {
      console.error("Error fetching clinic hours:", error);
    }
  };

  const fetchSlotTypes = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/doctorAppointmentSettings/getAppointmentSlotTypes`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      const formattedData = response.data.result.map((slot) => ({
        id: slot._id,
        type: slot.slotType,
        start: formatTo24Hour(slot.startingTime),
        end: formatTo24Hour(slot.endingTime),
        price: slot.price,
        allowBooking: slot.allowBooking,
        days: slot.days || [],
      }));
      setSlotTypes(formattedData);
      setOriginalSlots(formattedData);
    } catch (error) {
      console.error("Error fetching slot types:", error);
    }
  };

  const updateClinicHour = async (index, action) => {
    const dayToUpdate = clinicHours[index];

    const payload = {
      startingTime: formatTo12Hour(dayToUpdate.from),
      endingTime: formatTo12Hour(dayToUpdate.to),
      status: action === "day" ? dayToUpdate.enabled : !dayToUpdate.enabled,
    };
    try {
      await axios.put(
        `${API_URL}/api/doctorAppointmentSettings/editOperationalHours/${dayToUpdate.id}`,
        payload,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setEditingClinicDayIndex(null);
      fetchClinicHours();
    } catch (error) {
      console.error("Error updating clinic status:", error);
      setClinicHours(originalClinicHours);
    }
  };

  const updateClinicTime = (index, field, value) => {
    const updated = [...clinicHours];
    updated[index][field] = value;
    setClinicHours(updated);
  };

  const updateSlotField = (id, field, value) => {
    setSlotTypes(
      slotTypes.map((slot) =>
        slot.id === id ? { ...slot, [field]: value } : slot
      )
    );
  };

  const updateSlotTypes = async (id, action) => {
    const slotToUpdate = slotTypes.find((slot) => slot.id === id);
    const payload = {
      startingTime: formatTo12Hour(slotToUpdate.start),
      endingTime: formatTo12Hour(slotToUpdate.end),
      price: Number(slotToUpdate.price),
      allowBooking:
        action === "day"
          ? slotToUpdate.allowBooking
          : !slotToUpdate.allowBooking,
    };

    try {
      await axios.put(
        `${API_URL}/api/doctorAppointmentSettings/updateSlotType/${id}`,
        payload,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setEditingSlotId(null);
      fetchSlotTypes();
    } catch (error) {
      console.error("Error updating slot booking status:", error);
      setSlotTypes(originalSlots);
    }
  };

  const handleDeleteSlotType = async (id) => {
    try {
      await axios.delete(
        `${API_URL}/api/doctorAppointmentSettings/deleteSlotTypes/${id}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      fetchSlotTypes();
    } catch (error) {
      console.error("Error deleting slot type:", error);
    }
  };

  const fetchConsultationPriorityMapping = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/doctorAppointmentSettings/getConsultationPriorityMapping`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (response.data?.message === "success") {
        setPriorityMapping(response.data.result);
        setOriginalPriorityMapping(response.data.result);
      }
    } catch (error) {
      console.error("Error fetching consultation priority mapping:", error);
    }
  };

  const updateConsultationPriorityMapping = async (id) => {
    const percentage = priorityMapping.find(
      (item) => item._id === id
    ).percentage;
    try {
      const response = await axios.patch(
        `${API_URL}/api/doctorAppointmentSettings/editConsultationPriorityMapping/${id}`,
        { percentage },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      fetchConsultationPriorityMapping();
      setEditingPriorityIndex(null);
    } catch (error) {
      console.error("Error updating consultation priority mapping", error);
    }
  };

  const fetchRescheduleAndRefund = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/doctorAppointmentSettings/getRescheduleAndRefund`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data?.message === "success") {
        setRescheduleAndRefund(response.data.result);
      }
    } catch (error) {
      console.error("Error fetching Reschedule & Refund settings:", error);
    }
  };

  const updateRescheduleAndRefund = async (id) => {
    try {
      const response = await axios.patch(
        `${API_URL}/api/doctorAppointmentSettings/editRescheduleAndRefund/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data?.result) {
        fetchRescheduleAndRefund();
      }
    } catch (error) {
      console.error("Error updating Reschedule & Refund:", error);
    }
  };

  const updatePriority = (id, value) => {
    setPriorityMapping((prev) =>
      prev.map((item) =>
        item._id === id ? { ...item, percentage: value } : item
      )
    );
  };

  return (
    <div className="bg-gray-50 mt-10">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl p-6 space-y-8">
        <h1 className="text-xl font-bold text-gray-800  border-gray-200 pb-4">
          Appointment Booking Panel
        </h1>
        <div className="border border-gray-200 rounded-lg">
          <div className="bg-blue-500 text-white p-4 rounded-t-lg">
            <div className="grid grid-cols-12 items-center gap-4">
              <div className="col-span-3">
                <h2 className="font-bold text-base ">
                  Clinic Operational Hours
                </h2>
              </div>
              <div className="col-span-4 text-center ml-10">
                <span className="font-bold text-base">Working Hours</span>
              </div>
              <div className="col-span-3 text-center ml-10">
                <span className="font-bold text-base">On / Off</span>
              </div>
              <div className="col-span-2 text-center">
                <span className="font-bold text-base">Actions</span>
              </div>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {clinicHours.map((hour, index) => {
              const isEditing = editingClinicDayIndex === index;
              return (
                <div
                  key={hour.id || hour.day}
                  className="grid grid-cols-12 items-center gap-4 p-4"
                >
                  <div className="col-span-3 pl-1.5">
                    <span className="font-semibold text-gray-700 text-[14px]">
                      {hour.day}
                    </span>
                  </div>
                  <div className="col-span-4 flex items-center gap-2 ml-10">
                    <CustomTimePicker
                      isEditing={isEditing}
                      value={hour.from}
                      onChange={(val) => updateClinicTime(index, "from", val)}
                    />
                    <span className="text-gray-500 px-2 font-semibold text-[14px]">
                      -
                    </span>
                    <CustomTimePicker
                      isEditing={isEditing}
                      value={hour.to}
                      onChange={(val) => updateClinicTime(index, "to", val)}
                    />
                  </div>
                  <div className="col-span-3 flex justify-center ml-10">
                    <ToggleSwitch
                      enabled={hour.enabled}
                      onChange={() => updateClinicHour(index, "toggle")}
                    />
                  </div>
                  <div className="col-span-2 flex justify-center">
                    {isEditing ? (
                      <button
                        onClick={() => updateClinicHour(index, "day")}
                        className="text-gray-500 hover:text-green-600 transition-colors"
                      >
                        <Check size={16} />
                      </button>
                    ) : (
                      <button
                        onClick={() => setEditingClinicDayIndex(index)}
                        className="text-gray-500 hover:text-indigo-600 transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <div className="border border-gray-200 rounded-lg">
            <div className="bg-blue-500 text-white p-4 grid grid-cols-12 items-center gap-4 rounded-t-lg">
              <div className="col-span-3">
                <h2 className="font-bold text-base">Appointment Slot Types</h2>
              </div>
              <div className="col-span-2 text-center font-bold text-base">
                Start Time
              </div>
              <div className="col-span-2 text-center font-bold text-base">
                End Time
              </div>
              <div className="col-span-2 text-center font-bold text-base">
                Price
              </div>
              <div className="col-span-2 text-center font-bold text-base">
                Allow Booking
              </div>
              <div className="col-span-1 text-center font-bold text-base">
                Actions
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {slotTypes.map((slot) => (
                <SlotTypeRow
                  key={slot.id}
                  slot={slot}
                  isEditing={editingSlotId === slot.id}
                  onEdit={setEditingSlotId}
                  onDelete={handleDeleteSlotType}
                  onUpdateField={updateSlotField}
                  onUpdateSlotTypes={updateSlotTypes}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-blue-500 text-white p-4">
              <h3 className="font-bold text-base">
                Consultation Priority Mapping
              </h3>
            </div>
            <div className="divide-y divide-gray-200">
              {priorityMapping.map((item, index) => {
                const numericValue = item.percentage.replace("%", "");

                return (
                  <div
                    key={item._id}
                    className="grid grid-cols-12 items-center p-4 gap-4"
                  >
                    <div className="col-span-7 font-semibold text-gray-700 text-[14px]">
                      {item.priority}
                    </div>

                    <div className="col-span-3 relative">
                      <input
                        type="number"
                        value={numericValue}
                        disabled={editingPriorityIndex !== item._id}
                        onChange={(e) =>
                          updatePriority(item._id, e.target.value + "%")
                        }
                        className={`w-full text-center border border-gray-300 text-gray-900 text-sm font-semibold rounded-lg p-2 pr-6 ${
                          editingPriorityIndex === item._id
                            ? "focus:ring-indigo-500 focus:border-indigo-500"
                            : "bg-gray-100 cursor-not-allowed"
                        }`}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                        %
                      </span>
                    </div>

                    <div className="col-span-2 flex justify-end gap-2">
                      {editingPriorityIndex === item._id ? (
                        <button
                          type="button"
                          onClick={() =>
                            updateConsultationPriorityMapping(item._id)
                          }
                          className="text-gray-500 hover:text-green-600 transition-colors"
                        >
                          <Check size={16} />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setEditingPriorityIndex(item._id)}
                          className="text-gray-500 hover:text-indigo-600 transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-blue-500 text-white p-4">
              <h3 className="font-bold text-base">Reschedule & Refund Rules</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {rescheduleAndRefund.map((rule, index) => (
                <div
                  key={rule._id}
                  className="flex justify-between items-center p-4"
                >
                  <span className="font-semibold text-gray-700 text-[14px]">
                    {rule.name}
                  </span>
                  <ToggleSwitch
                    enabled={rule.status}
                    onChange={() => updateRescheduleAndRefund(rule._id)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AppointmentBookingPanel;
