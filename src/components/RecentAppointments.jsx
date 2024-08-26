import React from 'react'; 
const RecentAppointments = () => {
    return <div>
      <div>
        <p className="font-bold mt-7 mb-7 text-xl px-7" >Previous Appointments </p>
      </div>
      <div className="relative overflow-x-auto pt-10 shadow-lg">
    <table className="w-full text-sm text-left rtl:text-right text-white-500 dark:text-gray-100">
      <thead className="text-xs text-gray-500 uppercase bg-blue-100 dark:bg-blue-200 dark:text-gray-700">
        <tr>
          <th scope="col" className="px-3 py-3">
            S.No
          </th>
          <th scope="col" className="px-3 py-3">
            Patient Name
          </th>
          <th scope="col" className="px-3 py-3">
            Date & Time
          </th>
          <th scope="col" className="px-3 py-3">
            Duration
          </th>
          <th scope="col" className="px-3 py-3">
          Purpose 
          </th>
          <th scope="col" className="px-3 py-3">
          Doctor Name
          </th>
          <th scope="col" className="px-3 py-3">
            Follow Up / New
          </th>
        </tr>
      </thead>
      <tbody>
        <tr className="bg-white border-b dark:bg-white-200 dark:border-gray-100">
          <th
            scope="row"
            className="px-6 py-4 font-medium text-gray-600 whitespace-nowrap dark:text-gray-600"
          >
            1
          </th>
          <td className="px-4 py-4 text-gray-600 whitespace-nowrap dark:text-gray-600">Rita</td>
          <td className="px-4 py-4 text-gray-600 whitespace-nowrap dark:text-gray-600">14 Aug 10:00 AM</td>
          <td className="px-4 py-4 text-gray-600 whitespace-nowrap dark:text-gray-600">1 hr</td>
          <td className="px-4 py-4 text-gray-600 whitespace-nowrap dark:text-gray-600">Diabetes</td>
          <td className="px-4 py-4 text-gray-600 whitespace-nowrap dark:text-gray-600">Dr.Shilfa</td>
          <td className="px-4 py-4 text-gray-600 whitespace-nowrap dark:text-gray-600">Follow Up</td>
        </tr>
        <tr className="bg-white border-b dark:bg-white-200 dark:border-gray-100">
          <th
            scope="row"
            className="px-6 py-4 font-medium text-gray-600 whitespace-nowrap dark:text-gray-600"
          >
            2
          </th>
          <td className="px-4 py-4 text-gray-600 whitespace-nowrap dark:text-gray-600">Rita</td>
          <td className="px-4 py-4 text-gray-600 whitespace-nowrap dark:text-gray-600">1 Aug 11:00 AM</td>
          <td className="px-4 py-4 text-gray-600 whitespace-nowrap dark:text-gray-600">1 hr</td>
          <td className="px-4 py-4 text-gray-600 whitespace-nowrap dark:text-gray-600">Diabetes </td>
          <td className="px-4 py-4 text-gray-600 whitespace-nowrap dark:text-gray-600">Dr.Shilfa</td>
          <td className="px-4 py-4 text-gray-600 whitespace-nowrap dark:text-gray-600">New</td>
        </tr>
        <tr className="bg-white border-b dark:bg-white-200 dark:border-gray-100">
          <th
            scope="row"
            className="px-6 py-4 font-medium text-gray-600 whitespace-nowrap dark:text-gray-600"
          >
            3
          </th>
          <td className="px-4 py-4 text-gray-600 whitespace-nowrap dark:text-gray-600">Riya</td>
          <td className="px-4 py-4 text-gray-600 whitespace-nowrap dark:text-gray-600">15 July 4:00 PM</td>
          <td className="px-4 py-4 text-gray-600 whitespace-nowrap dark:text-gray-600">30 mins</td>
          <td className="px-4 py-4 text-gray-600 whitespace-nowrap dark:text-gray-600">Fever </td>
          <td className="px-4 py-4 text-gray-600 whitespace-nowrap dark:text-gray-600">Dr.Shilfa</td>
          <td className="px-4 py-4 text-gray-600 whitespace-nowrap dark:text-gray-600">New</td>
        </tr>
      </tbody>
    </table>
  </div>
  </div>;
  };
  
  export default RecentAppointments;