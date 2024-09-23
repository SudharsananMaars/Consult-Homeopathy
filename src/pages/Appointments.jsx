import React from "react";
import Layout from "../components/Layout";
import AppointmentBooking from "../components/AppointmentBooking";


const Appointments = () =>{

    return( 
            <Layout>
                <div className="mt-5 rounded-2xl">
                 <AppointmentBooking /> 
                 </div> 
                
            </Layout>
    )
}

export default Appointments;
