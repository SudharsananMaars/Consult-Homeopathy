import {useState} from "react";
import DoctorLayout from "/src/components/doctor components/DoctorLayout.jsx";
import VideoSettings from "/src/pages/doctor pages/VideoSettings.jsx"
import MessengerSettings from "./MessengerSettings.jsx"; // Import the new Messenger component
import config from "../../config";

const DocSettings = () => {
    const [activeTab, setActiveTab] = useState("password"); 
  

    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
 
    const [emailNotifications, setEmailNotifications] = useState(false);
    const [smsNotifications, setSmsNotifications] = useState(false);
    const [postNotifications, setpostNotifications] = useState(false);


    const [dispenseBottleChecklist, setDispenseBottleChecklist] = useState([]);
    const [materialLeakageChecklist, setMaterialLeakageChecklist] = useState([]);
    const [newDispenseItem, setNewDispenseItem] = useState("");
    const [newLeakageItem, setNewLeakageItem] = useState("");
    const [isSavingMedicineSettings, setIsSavingMedicineSettings] = useState(false);
    const API_URL = config.API_URL;
  
    const handlePasswordChange = (e) => {
      e.preventDefault();
      if (newPassword === confirmPassword) {
 
        alert("Password changed successfully!");
      } else {
        alert("New passwords do not match!");
      }
    };

    const addDispenseItem = () => {
      if (newDispenseItem.trim()) {
        setDispenseBottleChecklist([...dispenseBottleChecklist, newDispenseItem.trim()]);
        setNewDispenseItem("");
      }
    };

    const addLeakageItem = () => {
      if (newLeakageItem.trim()) {
        setMaterialLeakageChecklist([...materialLeakageChecklist, newLeakageItem.trim()]);
        setNewLeakageItem("");
      }
    };


    const removeDispenseItem = (index) => {
      setDispenseBottleChecklist(dispenseBottleChecklist.filter((_, i) => i !== index));
    };

    const removeLeakageItem = (index) => {
      setMaterialLeakageChecklist(materialLeakageChecklist.filter((_, i) => i !== index));
    };


    const saveMedicinePreparationSettings = async () => {
      setIsSavingMedicineSettings(true);
      
      try {
        const payload = {
          "step-1": dispenseBottleChecklist,
          "step-3": materialLeakageChecklist
        };

        const response = await fetch(`${API_URL}/api/medicine-summary/update-instructions-settings`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          alert('Medicine preparation settings saved successfully!');
        } else {
          const errorData = await response.json();
          alert(`Failed to save settings: ${errorData.message || 'Unknown error'}`);
        }
      } catch (error) {
        console.error('Error saving medicine preparation settings:', error);
        alert('Failed to save settings. Please try again.');
      } finally {
        setIsSavingMedicineSettings(false);
      }
    };
  
    return (
      <div>
        <DoctorLayout>
          <div className="p-8">
            <h1 className="text-2xl font-semibold mb-4">Settings</h1>
  
   
            <div className="flex border-b border-gray-300 mb-4">
              <button
                onClick={() => setActiveTab("password")}
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === "password" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600"
                }`}
              >
                Change Password
              </button>
              <button
                onClick={() => setActiveTab("notifications")}
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === "notifications" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600"
                }`}
              >
                Notification Settings
              </button>
              <button
                onClick={() => setActiveTab("videosettings")}
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === "videosettings" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600"
                }`}
              >
                Video Settings
              </button>
              <button
                onClick={() => setActiveTab("medicineprep")}
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === "medicineprep" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600"
                }`}
              >
                Medicine Preparation Settings
              </button>
              <button
                onClick={() => setActiveTab("messengers")}
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === "messengers" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600"
                }`}
              >
                Messenger Settings
              </button>
            </div>
  
    
            {activeTab === "password" && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-2">Change Password</h2>
                <form onSubmit={handlePasswordChange}>
                  <div className="mb-4">
                    <label htmlFor="oldPassword" className="block text-sm font-medium text-gray-700">
                      Old Password
                    </label>
                    <input
                      type="password"
                      id="oldPassword"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
  
                  <div className="mb-4">
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                      New Password
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
  
                  <div className="mb-4">
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div className="mb-4 mt-10 flex justify-center">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white py-2 px-4 rounded-full shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Change Password
                  </button>
                  </div>
                </form>
              </div>
            )}
  
            {activeTab === "notifications" && (
              <div className="mt-8">
                <h2 className="text-xl font-semibold mb-2 mt-4">Notification Settings</h2>
                <div className="mb-4 flex items-center">
                  <input
                      type="checkbox"
                      checked={emailNotifications}
                      onChange={(e) => setEmailNotifications(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 mt-2 text-sm font-medium text-gray-700">
                      Email Notifications
                  </label>
                  </div>
  
                  <div className="mb-4 flex items-center">
                  <input
                      type="checkbox"
                      checked={smsNotifications}
                      onChange={(e) => setSmsNotifications(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 mt-2 text-sm font-medium text-gray-700">
                      SMS Notifications
                  </label>
                  </div>
  
                  <div className="mb-4 flex items-center">
                  <input
                      type="checkbox"
                      checked={postNotifications}
                      onChange={(e) => setpostNotifications(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 mt-2 text-sm font-medium text-gray-700">
                       Posts/Videos
                  </label>
                  </div>
  
  
                <button
                  className="bg-green-600 text-white py-2 px-4 rounded-full shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  onClick={() => alert('Notification settings saved!')}
                >
                  Save Notification Settings
                </button>
              </div>
            )}

            {activeTab === "videosettings" && (
              <VideoSettings/>
            )}

            {activeTab === "medicineprep" && (
              <div className="mt-8">
                <h2 className="text-xl font-semibold mb-6">Medicine Preparation Settings</h2>
                
                {/* Choose Dispense Bottle Checklist Section */}
                <div className="mb-8 bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4 text-blue-800">Choose Dispense Bottle Checklist</h3>
                  
                  {/* Add new item input */}
                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      value={newDispenseItem}
                      onChange={(e) => setNewDispenseItem(e.target.value)}
                      placeholder="Enter checklist"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      onKeyPress={(e) => e.key === 'Enter' && addDispenseItem()}
                    />
                    <button
                      onClick={addDispenseItem}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Add 
                    </button>
                  </div>

                  {/* Display checklist items */}
                  <div className="space-y-2">
                    {dispenseBottleChecklist.length === 0 ? (
                      <p className="text-gray-500 italic">No checklist added yet.</p>
                    ) : (
                      dispenseBottleChecklist.map((item, index) => (
                        <div key={index} className="flex items-center justify-between bg-white p-3 rounded-md border">
                          <span className="text-gray-800">{item}</span>
                          <button
                            onClick={() => removeDispenseItem(index)}
                            className="text-red-600 hover:text-red-800 font-medium"
                          >
                            Remove
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Record Material Leakage Checklist Section */}
                <div className="mb-8 bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4 text-green-800">Record Material Leakage Checklist</h3>
                  
                  {/* Add new item input */}
                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      value={newLeakageItem}
                      onChange={(e) => setNewLeakageItem(e.target.value)}
                      placeholder="Enter checklist"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                      onKeyPress={(e) => e.key === 'Enter' && addLeakageItem()}
                    />
                    <button
                      onClick={addLeakageItem}
                      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      Add
                    </button>
                  </div>

                  {/* Display checklist items */}
                  <div className="space-y-2">
                    {materialLeakageChecklist.length === 0 ? (
                      <p className="text-gray-500 italic">No checklist added yet.</p>
                    ) : (
                      materialLeakageChecklist.map((item, index) => (
                        <div key={index} className="flex items-center justify-between bg-white p-3 rounded-md border">
                          <span className="text-gray-800">{item}</span>
                          <button
                            onClick={() => removeLeakageItem(index)}
                            className="text-red-600 hover:text-red-800 font-medium"
                          >
                            Remove
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Save Settings Button */}
                <div className="flex justify-center">
                  <button
                    onClick={saveMedicinePreparationSettings}
                    disabled={isSavingMedicineSettings}
                    className="bg-indigo-600 text-white py-3 px-8 rounded-full shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSavingMedicineSettings ? 'Saving...' : 'Save Medicine Preparation Settings'}
                  </button>
                </div>
              </div>
            )}

            {activeTab === "messengers" && (
              <MessengerSettings />
            )}
          </div>
        </DoctorLayout>
      </div>
    );
  };
export default DocSettings;