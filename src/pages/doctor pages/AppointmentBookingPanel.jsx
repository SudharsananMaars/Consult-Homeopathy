import { useState } from 'react';
import PropTypes from 'prop-types';
import { Edit2, Trash2, Clock, IndianRupee } from 'lucide-react';

const ToggleSwitch = ({ enabled, onChange }) => (
  <label className="relative inline-flex items-center cursor-pointer">
    <input
      type="checkbox"
      checked={enabled}
      onChange={onChange}
      className="sr-only"
    />
    <div
      className={`w-11 h-6 rounded-full transition-colors ${
        enabled ? 'bg-indigo-600' : 'bg-gray-300'
      }`}
    >
      <div
        className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform mt-0.5 ${
          enabled ? 'translate-x-5' : 'translate-x-0.5'
        }`}
      />
    </div>
  </label>
);

ToggleSwitch.propTypes = {
  enabled: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
};

const TimeInput = ({ value, onChange }) => (
  <div className="relative">
    <Clock className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" size={16} />
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border border-gray-300 text-gray-900 text-sm font-bold rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-2"
    />
  </div>
);

TimeInput.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

const PriceInput = ({ value, onChange }) => (
  <div className="relative">
    <IndianRupee className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" size={16} />
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border border-gray-300 text-gray-900 text-sm font-bold rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-2"
    />
  </div>
);

PriceInput.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

const DaySelector = ({ selectedDays, onChange }) => {
  const allDays = [
    { label: 'Mon', full: 'Monday' },
    { label: 'Tue', full: 'Tuesday' },
    { label: 'Wed', full: 'Wednesday' },
    { label: 'Thu', full: 'Thursday' },
    { label: 'Fri', full: 'Friday' },
    { label: 'Sat', full: 'Saturday' },
    { label: 'Sun', full: 'Sunday' },
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
        <label key={day.label} className="flex items-center gap-1 text-xs cursor-pointer">
          <input
            type="checkbox"
            checked={selectedDays.includes(day.label)}
            onChange={() => handleDayToggle(day.label)}
            className="w-3 h-3 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
          />
          <span className="text-gray-700 font-bold">{day.label}</span>
        </label>
      ))}
    </div>
  );
};

DaySelector.propTypes = {
  selectedDays: PropTypes.arrayOf(PropTypes.string).isRequired,
  onChange: PropTypes.func.isRequired,
};

const AppointmentBookingPanel = () => {
  const [clinicHours, setClinicHours] = useState([
    { day: 'Monday', from: '10:00 AM', to: '05:00 PM', enabled: true },
    { day: 'Tuesday', from: '10:00 AM', to: '05:00 PM', enabled: true },
    { day: 'Wednesday', from: '10:00 AM', to: '05:00 PM', enabled: true },
    { day: 'Thursday', from: '10:00 AM', to: '05:00 PM', enabled: true },
    { day: 'Friday', from: '10:00 AM', to: '05:00 PM', enabled: true },
    { day: 'Saturday', from: '10:00 AM', to: '05:00 PM', enabled: true },
    { day: 'Sunday', from: '06:00 AM', to: '06:00 PM', enabled: true },
  ]);

  const [slotTypes, setSlotTypes] = useState([
    { id: 1, type: 'Normal', start: '05:00 AM', end: '10:00 PM', price: '500', allowBooking: true, days: [] },
    { id: 2, type: 'Post Working Hours', start: '05:00 PM', end: '10:00 PM', price: '700', allowBooking: true, days: [] },
    { id: 3, type: 'Weekoff', start: '05:00 AM', end: '10:00 PM', price: '600', allowBooking: true, days: ['Sat', 'Sun'] },
    { id: 4, type: 'Opinion Consultation', start: '05:00 AM', end: '10:00 PM', price: '400', allowBooking: true, days: [] },
  ]);

  const [priorityMapping, setPriorityMapping] = useState([
    { type: 'Acute', percentage: '70%' },
    { type: 'Chronic', percentage: '20%' },
    { type: 'Opinion Consultation', percentage: '10%' },
  ]);

  const [rescheduleRules, setRescheduleRules] = useState([
    { label: 'Allow Rescheduling', enabled: true },
    { label: 'Refund Adjustment on Reschedule', enabled: true },
  ]);

  const toggleClinicHour = (index) => {
    const updated = [...clinicHours];
    updated[index].enabled = !updated[index].enabled;
    setClinicHours(updated);
  };

  const updateClinicTime = (index, field, value) => {
    const updated = [...clinicHours];
    updated[index][field] = value;
    setClinicHours(updated);
  };

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

  const toggleRescheduleRule = (index) => {
    const updated = [...rescheduleRules];
    updated[index].enabled = !updated[index].enabled;
    setRescheduleRules(updated);
  };

  const updateSlotDays = (id, newDays) => {
    const updated = slotTypes.map((slot) =>
      slot.id === id ? { ...slot, days: newDays } : slot
    );
    setSlotTypes(updated);
  };

  const updatePriority = (index, value) => {
    const updated = [...priorityMapping];
    updated[index].percentage = value;
    setPriorityMapping(updated);
  };

  return (
    <div className="bg-gray-50 p-6">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl p-6 space-y-8">
        <h1 className="text-2xl font-bold text-gray-800 border-gray-200 pb-4">
          Appointment Booking Panel
        </h1>

   
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-indigo-600 text-white p-4">
            <div className="grid grid-cols-12 items-center gap-4">
              <div className="col-span-4">
                <h2 className="font-bold text-base">Clinic Operational Hours</h2>
              </div>
              <div className="col-span-6 text-center">
                <span className="font-bold text-base mr-40">Working Hours</span>
              </div>
              <div className="col-span-2 text-center">
                <span className="font-bold text-base">On / Off</span>
              </div>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {clinicHours.map((hour, index) => (
              <div key={hour.day} className="grid grid-cols-12 items-center gap-4 p-4">
                <div className="col-span-4">
                  <span className="font-bold text-gray-700">{hour.day}</span>
                </div>
                <div className="col-span-4 flex items-center gap-2">
                  <TimeInput value={hour.from} onChange={(val) => updateClinicTime(index, 'from', val)} />
                  <span className="text-gray-500 px-2 font-bold">-</span>
                  <TimeInput value={hour.to} onChange={(val) => updateClinicTime(index, 'to', val)} />
                </div>
                <div className="col-span-4 flex justify-center ml-40">
                  <ToggleSwitch enabled={hour.enabled} onChange={() => toggleClinicHour(index)} />
                </div>
              </div>
            ))}
          </div>
        </div>


        <div className="space-y-4">
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-indigo-600 text-white p-4 grid grid-cols-12 items-center gap-4">
              <div className="col-span-3">
                <h2 className="font-bold text-base">Appointment Slot Types</h2>
              </div>
              <div className="col-span-2 text-center">
                <span className="font-bold text-base">Start Time</span>
              </div>
              <div className="col-span-2 text-center">
                <span className="font-bold text-base">End Time</span>
              </div>
              <div className="col-span-2 text-center">
                <span className="font-bold text-base">Price</span>
              </div>
              <div className="col-span-2 text-center">
                <span className="font-bold text-base">Allow Booking</span>
              </div>
              <div className="col-span-1 text-center">
                <span className="font-bold text-base">Actions</span>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {slotTypes.map((slot) => (
                <div key={slot.id} className="grid grid-cols-12 items-center gap-4 p-4">
                  <div className="col-span-3 flex items-center gap-2">
                    <span className="font-bold text-gray-700">{slot.type}</span>
                    {slot.type === 'Weekoff' && (
                      <DaySelector
                        selectedDays={slot.days || []}
                        onChange={(newDays) => updateSlotDays(slot.id, newDays)}
                      />
                    )}
                  </div>
                  <div className="col-span-2">
                    <TimeInput value={slot.start} onChange={(val) => updateSlotField(slot.id, 'start', val)} />
                  </div>
                  <div className="col-span-2">
                    <TimeInput value={slot.end} onChange={(val) => updateSlotField(slot.id, 'end', val)} />
                  </div>
                  <div className="col-span-2">
                    <PriceInput value={slot.price} onChange={(val) => updateSlotField(slot.id, 'price', val)} />
                  </div>
                  <div className="col-span-2 flex justify-center">
                    <ToggleSwitch enabled={slot.allowBooking} onChange={() => toggleSlotBooking(slot.id)} />
                  </div>
                  <div className="col-span-1 flex justify-center gap-2">
                    <button className="text-gray-500 hover:text-indigo-600 transition-colors">
                      <Edit2 size={16} />
                    </button>
                    <button className="text-gray-500 hover:text-red-600 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end">
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg transition-colors flex items-center gap-2">
              Add <span className="text-lg">+</span>
            </button>
          </div>
        </div>

      
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-indigo-600 text-white p-4">
              <h3 className="font-bold text-base">Consultation Priority Mapping</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {priorityMapping.map((item, index) => (
                <div key={index} className="flex justify-between items-center p-4">
                  <span className="font-bold text-gray-700">{item.type}</span>
                  <input
                    type="text"
                    value={item.percentage}
                    onChange={(e) => updatePriority(index, e.target.value)}
                    className="w-20 text-center border border-gray-300 text-gray-900 text-sm font-bold rounded-lg focus:ring-indigo-500 focus:border-indigo-500 p-2"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-indigo-600 text-white p-4">
              <h3 className="font-bold text-base">Reschedule & Refund Rules</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {rescheduleRules.map((rule, index) => (
                <div key={index} className="flex justify-between items-center p-4">
                  <span className="font-bold text-gray-700">{rule.label}</span>
                  <ToggleSwitch enabled={rule.enabled} onChange={() => toggleRescheduleRule(index)} />
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
