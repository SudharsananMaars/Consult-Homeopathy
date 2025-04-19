import React, { useState } from "react";
import axios from "axios";
import Layout from "/src/components/patient components/Layout.jsx";
import config from '../../config';
const API_URL = config.API_URL;

const FamilyTree = () => {
  const [familyMembers, setFamilyMembers] = useState([]); // Initial state for family members
  const [formData, setFormData] = useState({
    IndividulAccess: false,
    relationship: "",
    familyMemberPhone: "",
    familyMemberName: "",
  });
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const token = localStorage.getItem("accesstoken");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const addFamilyMember = async (e) => {
    e.preventDefault(); // Prevent page refresh

    try {
      const response = await axios.post(`${API_URL}/api/patient/addFamily`, formData, {
        headers: {
          Authorization: `Bearer ${token}`, // Include your token here
        },
      });

      if (response.data.success) {
        // Update family members state after adding a new member
        setFamilyMembers((prev) => [
          ...prev,
          {
            id: response.data.newMemberId, // assuming the new member ID is returned
            relationship: `${formData.relationship}` - `${formData.familyMemberName}`,
            IndividulAccess: formData.IndividulAccess,
          },
        ]);

        // Reset form data after successful submission
        setFormData({
          IndividulAccess: false,
          relationship: "",
          familyMemberPhone: "",
          familyMemberName: "",
        });
      } else {
        console.error("Failed to add family member:", response.data.message);
      }
    } catch (error) {
      console.error("Failed to add family member:", error);
    }
  };

  const makeHeadOfFamily = () => {
    // Code to make a selected member the head of the family
  };

  return (
    <Layout>
      <div className="family-tree">
        <h1>Family Tree</h1>
        <form onSubmit={addFamilyMember}>
          <div>
            <label>
              Relationship:
              <select
                name="relationship"
                value={formData.relationship}
                onChange={handleChange}
                required
              >
                <option value="">Select relationship</option>
                <option value="Father">Father</option>
                <option value="Mother">Mother</option>
                <option value="Son">Son</option>
                <option value="Daughter">Daughter</option>
                <option value="Father in law">Father in law</option>
                <option value="Mother in law">Mother in law</option>
              </select>
            </label>
          </div>
          <div>
            <label>
              Family Member Phone:
              <input
                type="tel"
                name="familyMemberPhone"
                value={formData.familyMemberPhone}
                onChange={handleChange}
                required
              />
            </label>
          </div>
          <div>
            <label>
              Family Member Name:
              <input
                type="text"
                name="familyMemberName"
                value={formData.familyMemberName}
                onChange={handleChange}
                required
              />
            </label>
          </div>
          <div>
            <label>
              Individual Access:
              <input
                type="checkbox"
                name="IndividulAccess"
                checked={formData.IndividulAccess}
                onChange={handleChange}
              />
            </label>
          </div>
          <button type="submit" className="btn-primary">
            Add Family Member
          </button>
        </form>

        <div className="family-members">
          <h2>Family Members</h2>
          <ul>
            {familyMembers.map((member) => (
              <li key={member.id}>
                {member.relationship}
                <button onClick={() => {
                  setSelectedMember(member);
                  setShowProfileModal(true);
                }}>
                  View Profile
                </button>
              </li>
            ))}
          </ul>
        </div>

        {showProfileModal && selectedMember && (
          <div className="modal">
            <div className="modal-content">
              <h2>Profile of {selectedMember.familyMemberName}</h2> {/* Updated to match state structure */}
              <p><strong>Relation:</strong> {selectedMember.relationship}</p>
              <button
                className="bg-red-500 text-white px-4 py-2 rounded mt-4"
                onClick={makeHeadOfFamily}
              >
                Make Head of Family
              </button>
              <button
                className="text-gray-500 mt-4"
                onClick={() => setShowProfileModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default FamilyTree;