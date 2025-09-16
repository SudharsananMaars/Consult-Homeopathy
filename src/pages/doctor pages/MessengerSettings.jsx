import FeedbackPanel from './Feedback.jsx';
import AppointmentBookingPanel from './AppointmentBookingPanel.jsx';
import PaymentIntimationPanel from './PaymentIntimationPanel.jsx'
import ShipmentOptionsCard from './ShipmentOptionsCard.jsx';

const MessengerSettings = () => {
  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Messenger</h2>
      
      <div className="space-y-6">
        {/* Wrapper to ensure consistent alignment for all components */}
        <div className="w-full">
          <div className="max-w-6xl mx-auto">
            <FeedbackPanel />
          </div>
        </div>
        
        <div className="w-full">
          <div className="max-w-6xl mx-auto">
            <AppointmentBookingPanel />
          </div>
        </div>
        
        <div className="w-full">
          <div className="max-w-6xl mx-auto">
            <PaymentIntimationPanel />
          </div>
        </div>
        
        <div className="w-full">
          <div className="max-w-6xl mx-auto">
            <ShipmentOptionsCard />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessengerSettings;