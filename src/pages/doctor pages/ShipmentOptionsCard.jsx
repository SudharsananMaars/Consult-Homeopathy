import { useState } from 'react';
import PropTypes from "prop-types";


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
  <div className="bg-[#837BFF] text-white p-4">
    <h3 className="font-bold text-base">{title}</h3>
  </div>
);

CardHeader.propTypes = {
  title: PropTypes.string.isRequired,
};


const ShipmentConfirmationPanel = () => {
  const [imageUpload, setImageUpload] = useState(true);
  const [textInstructions, setTextInstructions] = useState(true);
  const [markAsReceived, setMarkAsReceived] = useState(true);
  const [acknowledgement, setAcknowledgement] = useState(true);
  const [lostInTransit, setLostInTransit] = useState(true);

  
  let recived =  "Enable 'Mark as Received' Button"

  return (
    <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl p-6 space-y-2 mt-10">
        <h1 className="text-xl font-bold text-gray-800  border-gray-200 pb-4">
          Shipment Confirmation Panel
        </h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
       
            <div className="border border-gray-200 rounded-lg overflow-hidden">
                <CardHeader title="Shipment Confirmation Panel" />
                <div className="divide-y divide-gray-200">
                    <div className="flex justify-between items-center p-4">
                        <span className="text-gray-700 font-semibold text-sm">Enable Image Upload</span>
                        <ToggleSwitch enabled={imageUpload} setEnabled={setImageUpload} />
                    </div>
                    <div className="flex justify-between items-center p-4">
                        <span className="text-gray-700 font-semibold text-sm">Allow Text Instructions</span>
                        <ToggleSwitch enabled={textInstructions} setEnabled={setTextInstructions} />
                    </div>
                    <div className="flex justify-between items-center p-4">
                        <span className="text-gray-700 font-semibold text-sm">{recived}</span>
                        <ToggleSwitch enabled={markAsReceived} setEnabled={setMarkAsReceived} />
                    </div>
                </div>
            </div>

      
            <div className="border border-gray-200 rounded-lg overflow-hidden">
                <CardHeader title="Shipment Confirmation Panel" />
                <div className="divide-y divide-gray-200">
                    <div className="flex justify-between items-center p-4">
                        <span className="text-gray-700 font-semibold text-sm">Customer Acknowledgement</span>
                        <ToggleSwitch enabled={acknowledgement} setEnabled={setAcknowledgement} />
                    </div>
                   <div className="flex justify-between items-center p-4">
                            <span className="text-gray-700 font-semibold text-sm">Mark as Lost in Transit</span>
                            <div className="flex items-center space-x-3">
                                <span className="text-xs text-gray-500">Admin only</span>
                                <ToggleSwitch enabled={lostInTransit} setEnabled={setLostInTransit} />
                            </div>
                        </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default ShipmentConfirmationPanel;
