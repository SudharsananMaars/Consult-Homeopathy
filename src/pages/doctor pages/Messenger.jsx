import FeedbackPanel from './Feedback.jsx';
import AppointmentBookingPanel from './AppointmentBookingPanel.jsx';

const Messenger = () => {
  return (
  <div > 
    <h2 className='font-bold text-xl'>Messanger</h2>
        <FeedbackPanel />
        <AppointmentBookingPanel />
      </div>
    
  );
};

export default Messenger;
