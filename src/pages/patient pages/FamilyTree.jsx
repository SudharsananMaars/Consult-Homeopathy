import React, { useState } from "react";
import { FaCrown, FaEdit, FaTrash } from "react-icons/fa";
import Layout from "../../components/patient components/Layout";

const FamilyTree = () => {
  const [members, setMembers] = useState([]);
  const [headId, setHeadId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [newMember, setNewMember] = useState({
    name: "",
    age: "",
    relation: "",
    profilePhoto: "",
    id: null,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewMember((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => setNewMember((prev) => ({ ...prev, profilePhoto: reader.result }));
    if (file) reader.readAsDataURL(file);
  };

  const addOrUpdateMember = () => {
    if (newMember.name && newMember.age && newMember.relation) {
      if (newMember.id) {
        setMembers((prev) =>
          prev.map((m) => (m.id === newMember.id ? { ...newMember } : m))
        );
      } else {
        setMembers((prev) => [...prev, { ...newMember, id: Date.now() }]);
      }
      setNewMember({ name: "", age: "", relation: "", profilePhoto: "", id: null });
      setIsFormOpen(false);
    } else {
      alert("Please fill all the fields!");
    }
  };

  const makeHead = (id) => {
    setHeadId(id);
    setMembers((prev) => {
      const headMember = prev.find((m) => m.id === id);
      const otherMembers = prev.filter((m) => m.id !== id);
      return [headMember, ...otherMembers];
    });
  };

  const editMember = (id) => {
    const member = members.find((m) => m.id === id);
    if (member) {
      setNewMember(member);
      setIsFormOpen(true);
    }
  };

  const deleteMember = (id) => {
    if (window.confirm("Are you sure you want to delete this member?")) {
      setMembers((prev) => prev.filter((m) => m.id !== id));
      if (headId === id) setHeadId(null);
    }
  };

  const relationOptions = ["Mother", "Father", "Husband", "Son", "Daughter", "Mother-in-law", "Father-in-law"];

  return (
    <Layout>
      <div className="p-8 bg-gray-100 min-h-screen">
        <div className="flex justify-end mb-6">
          <button
            onClick={() => setIsFormOpen(true)}
            className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 shadow"
          >
            Add Family Member
          </button>
        </div>

        {isFormOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-2xl shadow-2xl w-96">
              <h2 className="text-xl font-semibold mb-4 text-center">
                {newMember.id ? "Edit Family Member" : "Add Family Member"}
              </h2>
              <div className="space-y-4">
                <input
                  type="text"
                  name="name"
                  value={newMember.name}
                  onChange={handleInputChange}
                  placeholder="Name"
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400"
                />
                <input
                  type="number"
                  name="age"
                  value={newMember.age}
                  onChange={handleInputChange}
                  placeholder="Age"
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400"
                />
                <select
                  name="relation"
                  value={newMember.relation}
                  onChange={handleInputChange}
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400"
                >
                  <option value="" disabled>Select Relation</option>
                  {relationOptions.map((relation) => (
                    <option key={relation} value={relation}>{relation}</option>
                  ))}
                </select>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full border rounded-lg p-2"
                />
                <div className="flex justify-between">
                  <button
                    onClick={addOrUpdateMember}
                    className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
                  >
                    {newMember.id ? "Update" : "Add"}
                  </button>
                  <button
                    onClick={() => {
                      setIsFormOpen(false);
                      setNewMember({ name: "", age: "", relation: "", profilePhoto: "", id: null });
                    }}
                    className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white shadow-2xl rounded-2xl p-6">
          <h2 className="text-2xl font-bold mb-6 text-center">Family Tree</h2>
          {members.length === 0 ? (
            <p className="text-gray-500 text-center">No members added yet.</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {members.map((member) => (
                <div
                  key={member.id}
                  className={`p-4 rounded-2xl shadow-lg flex flex-col items-center relative border-2 ${
                    headId === member.id ? "border-yellow-500 bg-yellow-50" : "border-gray-200"
                  }`}
                >
                  {headId === member.id && (
                    <FaCrown className="absolute top-2 right-2 text-yellow-500 text-xl" title="Head" />
                  )}
                  <img
                    src={member.profilePhoto || "https://via.placeholder.com/150"}
                    alt={member.name}
                    className="w-24 h-24 rounded-full border-4 border-white shadow-md mb-3"
                  />
                  <h3 className="text-lg font-semibold text-center">{member.name}</h3>
                  <p className="text-sm text-gray-600">Age: {member.age}</p>
                  <p className="text-sm text-gray-600">Relation: {member.relation}</p>
                  <div className="flex justify-between items-center w-full mt-4 space-x-2">
                    <button
                      onClick={() => makeHead(member.id)}
                      className="w-1/3 py-1 rounded-lg bg-yellow-400 text-white hover:bg-yellow-500 flex justify-center items-center"
                      title="Make Head"
                    >
                      <FaCrown />
                    </button>
                    <button
                      onClick={() => editMember(member.id)}
                      className="w-1/3 py-1 rounded-lg bg-blue-500 text-white hover:bg-blue-600 flex justify-center items-center"
                      title="Edit"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => deleteMember(member.id)}
                      className="w-1/3 py-1 rounded-lg bg-red-500 text-white hover:bg-red-600 flex justify-center items-center"
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default FamilyTree;
