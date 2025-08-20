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

const ToggleSwitch = ({ enabled, onChange }) => (
  <div
    onClick={() => onChange(!enabled)}
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

  // ✅ Parse "03:00 AM"
  useEffect(() => {
    if (isOpen && value) {
      const [time, period] = value.split(" "); // ["03:00", "AM"]
      if (time) {
        const [h, m] = time.split(":");
        setSelectedHour(h.padStart(2, "0"));
        setSelectedMinute(m);
      }
      if (period) {
        setSelectedPeriod(period);
      }
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
    if (!isOpen && pickerRef.current) {
      const rect = pickerRef.current.getBoundingClientRect();
      if (window.innerHeight - rect.bottom < 250) {
        setPosition("top");
      } else {
        setPosition("bottom");
      }
    }
    setIsOpen(!isOpen);
  };

  // ✅ Save in same "hh:mm AM/PM" format
  const handleSetTime = () => {
    const finalTime = `${selectedHour}:${selectedMinute} ${selectedPeriod}`;
    onChange(finalTime);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={pickerRef}>
      <div className="relative cursor-pointer" onClick={handleTogglePicker}>
        <Clock
          className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400 z-10"
          size={16}
        />
        <div
          className={`border ${
            isEditing ? "border-indigo-500" : "border-gray-300"
          } text-gray-900 text-sm font-semibold rounded-lg block w-full pl-10 pr-3 py-2`}
        >
          {value || "--:-- --"}
        </div>
      </div>

      {isOpen && (
        <div
          className={`absolute z-20 w-64 bg-white rounded-md shadow-lg ${
            position === "bottom" ? "mt-1 top-full" : "mb-1 bottom-full"
          }`}
        >
          <div className="flex justify-center p-2">
            {/* Hours */}
            <ul className="h-48 overflow-y-auto pr-2 border-r">
              {hours.map((hour) => (
                <li
                  key={hour}
                  onClick={() => setSelectedHour(hour)}
                  className={`px-3 py-1 text-center rounded-md text-sm cursor-pointer ${
                    selectedHour === hour
                      ? "bg-[#837BFF] text-white"
                      : "hover:bg-gray-100"
                  }`}
                >
                  {hour}
                </li>
              ))}
            </ul>

            {/* Minutes */}
            <ul className="h-48 overflow-y-auto px-2 border-r">
              {minutes.map((minute) => (
                <li
                  key={minute}
                  onClick={() => setSelectedMinute(minute)}
                  className={`px-3 py-1 text-center rounded-md text-sm cursor-pointer ${
                    selectedMinute === minute
                      ? "bg-[#837BFF] text-white"
                      : "hover:bg-gray-100"
                  }`}
                >
                  {minute}
                </li>
              ))}
            </ul>

            {/* AM/PM */}
            <ul className="h-48 overflow-y-auto pl-2 flex flex-col justify-center">
              {periods.map((period) => (
                <li
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-3 py-1 text-center rounded-md text-sm cursor-pointer ${
                    selectedPeriod === period
                      ? "bg-[#837BFF] text-white"
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
              className="w-full bg-[#837BFF] text-white text-sm font-bold py-2 rounded-lg hover:bg-[#6a61d3] transition-colors"
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
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  isEditing: PropTypes.bool,
};

PriceInput.defaultProps = {
  isEditing: false,
};

const DaySelector = ({ selectedDays, onChange }) => {
  const allDays = [
    { label: "Mon", full: "Monday" },
    { label: "Tue", full: "Tuesday" },
    { label: "Wed", full: "Wednesday" },
    { label: "Thu", full: "Thursday" },
    { label: "Fri", full: "Friday" },
    { label: "Sat", full: "Saturday" },
    { label: "Sun", full: "Sunday" },
  ];

  const handleDayToggle = (dayLabel) => {
    if (selectedDays.includes(dayLabel)) {
      onChange(selectedDays.filter((d) => d !== dayLabel));
    } else {
      onChange([...selectedDays, dayLabel]);
    }
  };

  return (
    <div className="flex flex-wrap gap-1 ml-2">
      {allDays.map((day) => (
        <label
          key={day.label}
          className="flex items-center gap-1 text-xs cursor-pointer"
        >
          <input
            type="checkbox"
            checked={selectedDays.includes(day.label)}
            onChange={() => handleDayToggle(day.label)}
            className="w-3 h-3 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
          />
          <span className="text-gray-700 font-semibold text-sm">
            {day.label}
          </span>
        </label>
      ))}
    </div>
  );
};

DaySelector.propTypes = {
  selectedDays: PropTypes.arrayOf(PropTypes.string).isRequired,
  onChange: PropTypes.func.isRequired,
};

const SlotTypeRow = ({
  slot,
  isEditing,
  onSave,
  onEdit,
  onUpdateField,
  onUpdateDays,
  onToggleBooking,
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
        {isEditing ? (
          <input
            ref={typeInputRef}
            type="text"
            value={slot.type}
            onChange={(e) => onUpdateField(slot.id, "type", e.target.value)}
            className="border border-indigo-500 text-gray-900 text-sm font-semibold rounded-lg block w-full p-2"
          />
        ) : (
          <>
            <span className="font-semibold text-gray-700 text-[14px]">
              {slot.type}
            </span>
            {slot.type === "Weekoff" && (
              <DaySelector
                selectedDays={slot.days || []}
                onChange={(newDays) => onUpdateDays(slot.id, newDays)}
              />
            )}
          </>
        )}
      </div>
      {/* Start time cell */}
      <div className="col-span-2">
        {isEditing ? (
          <CustomTimePicker
            isEditing={isEditing}
            value={slot.start}
            onChange={(val) => onUpdateField(slot.id, "start", val)}
          />
        ) : (
          <div className="border border-gray-200 text-gray-700 text-sm font-semibold rounded-lg block w-full pl-10 pr-3 py-2 relative h-[42px] flex items-center">
            <Clock
              className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400"
              size={16}
            />
            {slot.start} {/* <-- directly use value from API */}
          </div>
        )}
      </div>

      {/* End time cell */}
      <div className="col-span-2">
        {isEditing ? (
          <CustomTimePicker
            isEditing={isEditing}
            value={slot.end}
            onChange={(val) => onUpdateField(slot.id, "end", val)}
          />
        ) : (
          <div className="border border-gray-200 text-gray-700 text-sm font-semibold rounded-lg block w-full pl-10 pr-3 py-2 relative h-[42px] flex items-center">
            <Clock
              className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400"
              size={16}
            />
            {slot.end} {/* <-- directly use value from API */}
          </div>
        )}
      </div>

      <div className="col-span-2">
        {isEditing ? (
          <PriceInput
            isEditing={isEditing}
            value={slot.price}
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
          onChange={() => onToggleBooking(slot.id)}
        />
      </div>

      <div className="col-span-1 flex justify-center gap-2">
        {isEditing ? (
          <button
            onClick={() => onSave(null)}
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
        <button className="text-gray-500 hover:text-red-600 transition-colors">
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

SlotTypeRow.propTypes = {
  slot: PropTypes.object.isRequired,
  isEditing: PropTypes.bool.isRequired,
  onSave: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onUpdateField: PropTypes.func.isRequired,
  onUpdateDays: PropTypes.func.isRequired,
  onToggleBooking: PropTypes.func.isRequired,
};

// ✅ API function
// const getAppointmentSlotTypes = async () => {
//   try {
// const response = await axios.get(
//   `${API_URL}/api/doctorAppointmentSettings/getAppointmentSlottypes`
// );
//     return response.data; // make sure API returns array
//   } catch (error) {
//     console.error("Error fetching appointment slot types:", error);
//     throw error; // re-throw so caller can handle
//   }
// };

const AppointmentBookingPanel = () => {
  const [clinicHours, setClinicHours] = useState([
    { day: "Monday", from: "10:00", to: "17:00", enabled: true },
    { day: "Tuesday", from: "10:00", to: "17:00", enabled: true },
    { day: "Wednesday", from: "10:00", to: "17:00", enabled: true },
    { day: "Thursday", from: "10:00", to: "17:00", enabled: true },
    { day: "Friday", from: "10:00", to: "17:00", enabled: true },
    { day: "Saturday", from: "10:00", to: "17:00", enabled: true },
    { day: "Sunday", from: "06:00", to: "18:00", enabled: true },
  ]);

  const [slotTypes, setSlotTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingSlotId, setEditingSlotId] = useState(null);

  const transformSlotTypes = (apiResult) => {
    return Object.entries(apiResult)
      .filter(
        ([key]) =>
          !["_id", "doctorId", "createdAt", "updatedAt", "__v"].includes(key)
      )
      .map(([key, value], index) => ({
        id: index + 1,
        type: key,
        start: value.startTime || "",
        end: value.endTime || "",
        price: value.price?.toString() || "",
        allowBooking: value.isAvailable ?? true,
        days: value.days || [],
      }));
  };

  useEffect(() => {
    const fetchSlotTypes = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/api/doctorAppointmentSettings/getAppointmentSlottypes`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Cache-Control": "no-cache", // optional: force fresh
            },
          }
        );

        console.log("Fetched slot types:", response.data.result);

        const transformed = transformSlotTypes(response.data.result);
        setSlotTypes(transformed);
      } catch (error) {
        console.error("Error fetching slot types:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSlotTypes();
  }, []);

  const toggleSlotBooking = (id) => {
    const updated = slotTypes.map((slot) =>
      slot.id === id ? { ...slot, allowBooking: !slot.allowBooking } : slot
    );
    setSlotTypes(updated);
  };

  const updateSlotField = (id, field, value) => {
    const updated = slotTypes.map((slot) =>
      slot.id === id ? { ...slot, [field]: value } : slot
    );
    setSlotTypes(updated);
  };

  const updateSlotDays = (id, newDays) => {
    const updated = slotTypes.map((slot) =>
      slot.id === id ? { ...slot, days: newDays } : slot
    );
    setSlotTypes(updated);
  };

  return (
    <div className="bg-gray-50 mt-10">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl p-6 space-y-8">
        <h1 className="text-xl font-bold text-gray-800 border-b border-gray-200 pb-4">
          Appointment Booking Panel
        </h1>

        <div className="border border-gray-200 rounded-lg">
          <div className="bg-[#837BFF] text-white p-4 rounded-t-lg">
            <div className="grid grid-cols-12 items-center gap-4">
              <div className="col-span-4">
                <h2 className="font-bold text-base ">
                  Clinic Operational Hours
                </h2>
              </div>
              <div className="col-span-6 text-center">
                <span className="font-bold text-base mr-60">Working Hours</span>
              </div>
              <div className="col-span-2 text-center">
                <span className="font-bold text-base mr-5">On / Off</span>
              </div>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {clinicHours.map((hour, index) => (
              <div
                key={hour.day}
                className="grid grid-cols-12 items-center gap-4 p-4"
              >
                <div className="col-span-4 pl-1.5">
                  <span className="font-semibold text-gray-700 text-[14px]">
                    {hour.day}
                  </span>
                </div>
                <div className="col-span-4 flex items-center gap-2">
                  <CustomTimePicker
                    value={hour.from}
                    onChange={(val) => updateClinicTime(index, "from", val)}
                  />
                  <span className="text-gray-500 px-2 font-semibold text-[14px]">
                    -
                  </span>
                  <CustomTimePicker
                    value={hour.to}
                    onChange={(val) => updateClinicTime(index, "to", val)}
                  />
                </div>
                <div className="col-span-4 flex justify-center ml-40">
                  <ToggleSwitch
                    enabled={hour.enabled}
                    onChange={() => toggleClinicHour(index)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Appointment Slot Types */}
        <div className="space-y-4">
          <div className="border border-gray-200 rounded-lg">
            <div className="bg-[#837BFF] text-white p-4 grid grid-cols-12 items-center gap-4 rounded-t-lg">
              <div className="col-span-3 font-bold text-base">
                Appointment Slot Types
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

            {loading ? (
              <div className="p-4 text-center text-gray-500">
                Loading slot types...
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {slotTypes.map((slot) => (
                  <SlotTypeRow
                    key={slot.id}
                    slot={slot}
                    isEditing={editingSlotId === slot.id}
                    onEdit={setEditingSlotId}
                    onSave={setEditingSlotId}
                    onUpdateField={updateSlotField}
                    onUpdateDays={updateSlotDays}
                    onToggleBooking={toggleSlotBooking}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentBookingPanel;
