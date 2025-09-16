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
          
       <div className="bg-white rounded-lg shadow-sm p-6 pt-8">

              <h1 className="text-2xl font-semibold mb-6 text-gray-800">Settings</h1>
  
              {/* Tab Navigation */}
              <div className="flex border-b border-gray-200 mb-8">
                <button
                  onClick={() => setActiveTab("password")}
                  className={`px-6 py-3 text-sm font-medium transition-colors ${
                    activeTab === "password" 
                      ? "border-b-2 border-blue-500 text-blue-600 bg-blue-50" 
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  Change Password
                </button>
                <button
                  onClick={() => setActiveTab("notifications")}
                  className={`px-6 py-3 text-sm font-medium transition-colors ${
                    activeTab === "notifications" 
                      ? "border-b-2 border-blue-500 text-blue-600 bg-blue-50" 
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  Notification Settings
                </button>
                <button
                  onClick={() => setActiveTab("videosettings")}
                  className={`px-6 py-3 text-sm font-medium transition-colors ${
                    activeTab === "videosettings" 
                      ? "border-b-2 border-blue-500 text-blue-600 bg-blue-50" 
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  Video Settings
                </button>
                <button
                  onClick={() => setActiveTab("medicineprep")}
                  className={`px-6 py-3 text-sm font-medium transition-colors ${
                    activeTab === "medicineprep" 
                      ? "border-b-2 border-blue-500 text-blue-600 bg-blue-50" 
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  Medicine Preparation Settings
                </button>
                <button
                  onClick={() => setActiveTab("messengers")}
                  className={`px-6 py-3 text-sm font-medium transition-colors ${
                    activeTab === "messengers" 
                      ? "border-b-2 border-blue-500 text-blue-600 bg-blue-50" 
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  Messenger Settings
                </button>
              </div>
  
              {/* Tab Content */}
              {activeTab === "password" && (
                <div className="max-w-md">
                  <h2 className="text-xl font-semibold mb-6 text-gray-800">Change Password</h2>
                  <form onSubmit={handlePasswordChange} className="space-y-6">
                    <div>
                      <label htmlFor="oldPassword" className="block text-sm font-medium text-gray-700 mb-2">
                        Old Password
                      </label>
                      <input
                        type="password"
                        id="oldPassword"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        id="newPassword"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        required
                      />
                    </div>
                    
                    <div className="pt-4">
                      <button
                        type="submit"
                        className="bg-blue-600 text-white py-3 px-8 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                      >
                        Change Password
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {activeTab === "notifications" && (
                <div>
                  <h2 className="text-xl font-semibold mb-6 text-gray-800">Notification Settings</h2>
                  <div className="max-w-md space-y-6">
                    <div className="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <input
                        type="checkbox"
                        checked={emailNotifications}
                        onChange={(e) => setEmailNotifications(e.target.checked)}
                        className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        id="emailNotif"
                      />
                      <label htmlFor="emailNotif" className="ml-4 text-sm font-medium text-gray-700">
                        Email Notifications
                      </label>
                    </div>

                    <div className="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <input
                        type="checkbox"
                        checked={smsNotifications}
                        onChange={(e) => setSmsNotifications(e.target.checked)}
                        className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        id="smsNotif"
                      />
                      <label htmlFor="smsNotif" className="ml-4 text-sm font-medium text-gray-700">
                        SMS Notifications
                      </label>
                    </div>

                    <div className="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <input
                        type="checkbox"
                        checked={postNotifications}
                        onChange={(e) => setpostNotifications(e.target.checked)}
                        className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        id="postNotif"
                      />
                      <label htmlFor="postNotif" className="ml-4 text-sm font-medium text-gray-700">
                        Posts/Videos
                      </label>
                    </div>

                    <div className="pt-4">
                      <button
                        className="bg-blue-600 text-white py-3 px-8 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                        onClick={() => alert('Notification settings saved!')}
                      >
                        Save Notification Settings
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "videosettings" && (
                <VideoSettings/>
              )}

              {activeTab === "medicineprep" && (
                <div>
                  <h2 className="text-xl font-semibold mb-6 text-gray-800">Medicine Preparation Settings</h2>
                  
                  {/* Choose Dispense Bottle Checklist Section */}
                  <div className="mb-8 bg-blue-50 p-6 rounded-lg border border-blue-200">
                    <h3 className="text-lg font-semibold mb-4 text-blue-800">Choose Dispense Bottle Checklist</h3>
                    
                    {/* Add new item input */}
                    <div className="flex gap-3 mb-4">
                      <input
                        type="text"
                        value={newDispenseItem}
                        onChange={(e) => setNewDispenseItem(e.target.value)}
                        placeholder="Enter checklist"
                        className="flex-1 px-4 py-3 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        onKeyPress={(e) => e.key === 'Enter' && addDispenseItem()}
                      />
                      <button
                        onClick={addDispenseItem}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                      >
                        Add 
                      </button>
                    </div>

                    {/* Display checklist items */}
                    <div className="space-y-3">
                      {dispenseBottleChecklist.length === 0 ? (
                        <p className="text-gray-500 italic p-4 bg-white rounded-lg border border-gray-200">No checklist added yet.</p>
                      ) : (
                        dispenseBottleChecklist.map((item, index) => (
                          <div key={index} className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                            <span className="text-gray-800 font-medium">{item}</span>
                            <button
                              onClick={() => removeDispenseItem(index)}
                              className="text-red-600 hover:text-red-800 font-medium px-3 py-1 rounded-md hover:bg-red-50 transition-colors"
                            >
                              Remove
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Record Material Leakage Checklist Section */}
                  <div className="mb-8 bg-blue-50 p-6 rounded-lg border border-blue-200">
                    <h3 className="text-lg font-semibold mb-4 text-blue-800">Record Material Leakage Checklist</h3>
                    
                    {/* Add new item input */}
                    <div className="flex gap-3 mb-4">
                      <input
                        type="text"
                        value={newLeakageItem}
                        onChange={(e) => setNewLeakageItem(e.target.value)}
                        placeholder="Enter checklist"
                        className="flex-1 px-4 py-3 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        onKeyPress={(e) => e.key === 'Enter' && addLeakageItem()}
                      />
                      <button
                        onClick={addLeakageItem}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                      >
                        Add
                      </button>
                    </div>

                    {/* Display checklist items */}
                    <div className="space-y-3">
                      {materialLeakageChecklist.length === 0 ? (
                        <p className="text-gray-500 italic p-4 bg-white rounded-lg border border-gray-200">No checklist added yet.</p>
                      ) : (
                        materialLeakageChecklist.map((item, index) => (
                          <div key={index} className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                            <span className="text-gray-800 font-medium">{item}</span>
                            <button
                              onClick={() => removeLeakageItem(index)}
                              className="text-red-600 hover:text-red-800 font-medium px-3 py-1 rounded-md hover:bg-red-50 transition-colors"
                            >
                              Remove
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Save Settings Button */}
                  <div className="flex justify-center pt-4">
                    <button
                      onClick={saveMedicinePreparationSettings}
                      disabled={isSavingMedicineSettings}
                      className="bg-blue-600 text-white py-3 px-8 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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