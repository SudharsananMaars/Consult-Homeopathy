import FeedbackPanel from './Feedback.jsx';
import AppointmentBookingPanel from './AppointmentBookingPanel.jsx';
import PaymentIntimationPanel from './PaymentIntimationPanel.jsx'
import ShipmentOptionsCard from './ShipmentOptionsCard.jsx';

const MessengerSettings = () => {
  return (
  <div > 
    <h2 className='font-bold text-xl'>Messanger</h2>
        <FeedbackPanel />
        <AppointmentBookingPanel />
        <PaymentIntimationPanel/>
        <ShipmentOptionsCard/>
      </div>
    
  );
};

export default MessengerSettings;
