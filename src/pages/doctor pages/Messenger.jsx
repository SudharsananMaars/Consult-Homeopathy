import FeedbackPanel from './Feedback.jsx';
import AppointmentBookingPanel from './AppointmentBookingPanel.jsx';
import PaymentIntimationCard from './PaymentIntimationCard.jsx'
import ShipmentOptionsCard from './ShipmentOptionsCard.jsx';

const Messenger = () => {
  return (
  <div > 
    <h2 className='font-bold text-xl'>Messanger</h2>
        <FeedbackPanel />
        <AppointmentBookingPanel />
        <PaymentIntimationCard/>
        <ShipmentOptionsCard/>
      </div>
    
  );
};

export default Messenger;
