import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import config from "../../config";

const API_URL = config.API_URL;

const ToggleSwitch = ({ enabled, onUpdate }) => (
  <div
    onClick={onUpdate}
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
  setEnabled: PropTypes.func.isRequired,
};

const CardHeader = ({ title }) => (
  <div className="bg-blue-500 text-white p-4">
    <h3 className="font-bold text-base">{title}</h3>
  </div>
);

CardHeader.propTypes = {
  title: PropTypes.string.isRequired,
};

const ShipmentConfirmationPanel = () => {
  const [panels, setPanels] = useState([]);

  const fetchShipmentPanels = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/doctorAppointmentSettings/getShipmentPanels`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setPanels(response.data || []);
    } catch (err) {
      console.error("Error fetching shipment panels:", err);
      throw err;
    }
  };

  const togglePanelStatus = async (id) => {
    try {
      await axios.patch(
        `${API_URL}/api/doctorAppointmentSettings/updateShipmentPanel/${id}`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      fetchShipmentPanels(); 
    } catch (err) {
      console.error("Error updating panel:", err);
    }
  };


  useEffect(() => {
    fetchShipmentPanels();
  }, []);


  return (
    <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl p-6 space-y-2 mt-10">
      <h1 className="text-xl font-bold text-gray-800  border-gray-200 pb-4">
        Shipment Confirmation Panel
      </h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {panels.slice(0, 3).length > 0 && (
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <CardHeader title="Shipment Confirmation Panel" />
            <div className="divide-y divide-gray-200">
              {panels.slice(0, 3).map((panel) => (
                <div
                  key={panel._id}
                  className="flex justify-between items-center p-4"
                >
                  <span className="text-gray-700 font-semibold text-sm">
                    {panel.name}
                  </span>
                  <ToggleSwitch
                    enabled={panel.status}
                    onUpdate={() =>
                      togglePanelStatus(panel._id)
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {panels.slice(3).length > 0 && (
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <CardHeader title="Shipment Confirmation Panel" />
            <div className="divide-y divide-gray-200">
              {panels.slice(3).map((panel) => (
                <div
                  key={panel._id}
                  className="flex justify-between items-center p-4"
                >
                  <span className="text-gray-700 font-semibold text-sm">
                    {panel.name}
                  </span>
                  <ToggleSwitch
                    enabled={panel.status}
                    onUpdate={() =>
                      togglePanelStatus(panel._id)
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShipmentConfirmationPanel;
