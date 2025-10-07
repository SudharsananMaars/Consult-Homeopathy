import React, { useState, useEffect } from 'react';
import DoctorLayout from '/src/components/doctor components/DoctorLayout.jsx';
import { FaSearch, FaPlus, FaTimes } from "react-icons/fa";
import axios from 'axios';
import config from '/src/config.js';

const API_URL = config.API_URL;
const token = localStorage.getItem("token");
const userId = localStorage.getItem("userId");

const DebitCreditNote = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterNoteType, setFilterNoteType] = useState('');
  const [filterLinkedType, setFilterLinkedType] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  const [formData, setFormData] = useState({
    noteId: '',
    noteType: 'Debit',
    linkedType: 'Receivable',
    linkedTransactionId: '',
    category: '',
    amount: '',
    taxDetails: { gstRate: '', gstAmount: '' },
    reason: '',
    issuedToOrBy: '',
    issuedDate: '',
    approvalStatus: 'Pending',
    paymentStatus: 'Pending',
    supportingDocumentURL: ''
  });

  const [editingNoteId, setEditingNoteId] = useState(null);

  // Fetch all notes
  const fetchNotes = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/notes/allNotes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotes(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching notes:", err);
      setNotes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'gstRate' || name === 'gstAmount') {
      setFormData(prev => ({
        ...prev,
        taxDetails: { ...prev.taxDetails, [name]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      noteId: '',
      noteType: 'Debit',
      linkedType: 'Receivable',
      linkedTransactionId: '',
      category: '',
      amount: '',
      taxDetails: { gstRate: '', gstAmount: '' },
      reason: '',
      issuedToOrBy: '',
      issuedDate: '',
      approvalStatus: 'Pending',
      paymentStatus: 'Pending',
      supportingDocumentURL: ''
    });
    setIsEditing(false);
    setEditingNoteId(null);
  };

  // Handle form submit (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const payload = {
      ...formData,
      amount: parseFloat(formData.amount),
      taxDetails: {
        gstRate: parseFloat(formData.taxDetails.gstRate) || 0,
        gstAmount: parseFloat(formData.taxDetails.gstAmount) || 0
      },
      createdBy: userId
    };

    try {
      if (isEditing && editingNoteId) {
        // Update existing note
        await axios.patch(
          `${API_URL}/api/notes/modify/${editingNoteId}`,
          { linkedType: payload.linkedType },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert('Note updated successfully!');
      } else {
        // Create new note
        await axios.post(
          `${API_URL}/api/notes/create`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert('Note created successfully!');
      }
      
      fetchNotes();
      setShowModal(false);
      resetForm();
    } catch (err) {
      console.error("Error saving note:", err);
      alert(err.response?.data?.message || 'Failed to save note');
    }
  };

  // Handle edit
  const handleEdit = (note) => {
    setFormData({
      noteId: note.noteId || '',
      noteType: note.noteType || 'Debit',
      linkedType: note.linkedType || 'Receivable',
      linkedTransactionId: note.linkedTransactionId || '',
      category: note.category || '',
      amount: note.amount || '',
      taxDetails: note.taxDetails || { gstRate: '', gstAmount: '' },
      reason: note.reason || '',
      issuedToOrBy: note.issuedToOrBy || '',
      issuedDate: note.issuedDate ? note.issuedDate.split('T')[0] : '',
      approvalStatus: note.approvalStatus || 'Pending',
      paymentStatus: note.paymentStatus || 'Pending',
      supportingDocumentURL: note.supportingDocumentURL || ''
    });
    setIsEditing(true);
    setEditingNoteId(note._id);
    setShowModal(true);
  };

  // Handle delete
  const handleDelete = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;
    
    try {
      await axios.delete(
        `${API_URL}/api/notes/delete/${noteId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Note deleted successfully!');
      fetchNotes();
    } catch (err) {
      console.error("Error deleting note:", err);
      alert('Failed to delete note');
    }
  };

  // Filter notes
  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.noteId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.linkedTransactionId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesNoteType = !filterNoteType || note.noteType === filterNoteType;
    const matchesLinkedType = !filterLinkedType || note.linkedType === filterLinkedType;
    const matchesCategory = !filterCategory || note.category === filterCategory;
    
    return matchesSearch && matchesNoteType && matchesLinkedType && matchesCategory;
  });

  return (
    <DoctorLayout>
      <div className="debit-credit-page px-6 py-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Credit & Debit Score</h1>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700"
          >
            <FaPlus /> Create New Note
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search by ID"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            
            <select
              value={filterNoteType}
              onChange={(e) => setFilterNoteType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">NoteType</option>
              <option value="Credit">Credit</option>
              <option value="Debit">Debit</option>
            </select>

            <select
              value={filterLinkedType}
              onChange={(e) => setFilterLinkedType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">LinkedType</option>
              <option value="Receivable">Receivable</option>
              <option value="Payable">Payable</option>
            </select>

            <input
              type="text"
              placeholder="Category"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="overflow-hidden">
            {loading ? (
              <p className="text-gray-500 text-sm text-center py-6">Loading...</p>
            ) : (
              <div className="overflow-hidden rounded-lg shadow pt-5">
                <table className="w-full overflow-hidden rounded-lg">
                  <thead>
                    <tr className="border-b border-blue-200">
                      <th className="bg-gray-100 text-center p-4 font-bold text-gray-700 text-sm">NoteID</th>
                      <th className="bg-white text-center p-4 font-bold text-gray-700 text-sm">NoteType</th>
                      <th className="bg-gray-100 text-center p-4 font-bold text-gray-700 text-sm">LinkedType</th>
                      <th className="bg-white text-center p-4 font-bold text-gray-700 text-sm">Linked TransactionID</th>
                      <th className="bg-gray-100 text-center p-4 font-bold text-gray-700 text-sm">Category</th>
                      <th className="bg-white text-center p-4 font-bold text-gray-700 text-sm">Amount (₹)</th>
                      <th className="bg-gray-100 text-center p-4 font-bold text-gray-700 text-sm">GST Rate (%)</th>
                      <th className="bg-white text-center p-4 font-bold text-gray-700 text-sm">GST Amount (₹)</th>
                      <th className="bg-gray-100 text-center p-4 font-bold text-gray-700 text-sm">Reason</th>
                      <th className="bg-white text-center p-4 font-bold text-gray-700 text-sm">Issued To/By</th>
                      <th className="bg-gray-100 text-center p-4 font-bold text-gray-700 text-sm">Issued Date</th>
                      <th className="bg-white text-center p-4 font-bold text-gray-700 text-sm">Approval Status</th>
                      <th className="bg-gray-100 text-center p-4 font-bold text-gray-700 text-sm">Payment Status</th>
                      <th className="bg-white text-center p-4 font-bold text-gray-700 text-sm">Document</th>
                      <th className="bg-gray-100 text-center p-4 font-bold text-gray-700 text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredNotes.length > 0 ? (
                      filteredNotes.map((note, idx) => (
                        <tr key={note._id || idx} className="border-b border-blue-200">
                          <td className="bg-gray-100 p-4 text-gray-900 text-center text-sm">{note.noteId}</td>
                          <td className="bg-white p-4 text-gray-600 text-center text-sm">{note.noteType}</td>
                          <td className="bg-gray-100 p-4 text-gray-600 text-center text-sm">{note.linkedType}</td>
                          <td className="bg-white p-4 text-gray-600 text-center text-sm">{note.linkedTransactionId}</td>
                          <td className="bg-gray-100 p-4 text-gray-600 text-center text-sm">{note.category}</td>
                          <td className="bg-white p-4 text-gray-600 text-center text-sm">{note.amount?.toFixed(2)}</td>
                          <td className="bg-gray-100 p-4 text-gray-600 text-center text-sm">{note.taxDetails?.gstRate || 0}%</td>
                          <td className="bg-white p-4 text-gray-600 text-center text-sm">₹{note.taxDetails?.gstAmount?.toFixed(2) || '0.00'}</td>
                          <td className="bg-gray-100 p-4 text-gray-600 text-center text-sm">
                            <div className="max-w-xs truncate" title={note.reason}>{note.reason}</div>
                          </td>
                          <td className="bg-white p-4 text-gray-600 text-center text-sm">{note.issuedToOrBy}</td>
                          <td className="bg-gray-100 p-4 text-gray-600 text-center text-sm">
                            {note.issuedDate ? new Date(note.issuedDate).toLocaleDateString('en-IN') : '-'}
                          </td>
                          <td className="bg-white p-4 text-center text-sm">
                            <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                              note.approvalStatus === 'Approved' ? 'bg-green-100 text-green-800' :
                              note.approvalStatus === 'Rejected' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {note.approvalStatus}
                            </span>
                          </td>
                          <td className="bg-gray-100 p-4 text-center text-sm">
                            <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                              note.paymentStatus === 'Settled' ? 'bg-green-100 text-green-800' :
                              note.paymentStatus === 'Adjusted' ? 'bg-blue-100 text-blue-800' :
                              'bg-orange-100 text-orange-800'
                            }`}>
                              {note.paymentStatus}
                            </span>
                          </td>
                          <td className="bg-white p-4 text-center text-sm">
                            {note.supportingDocumentURL ? (
                              <a 
                                href={note.supportingDocumentURL} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 underline"
                              >
                                View
                              </a>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="bg-gray-100 p-4 text-center">
                            <div className="flex gap-2 justify-center">
                              <button
                                onClick={() => handleEdit(note)}
                                className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-700"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(note._id)}
                                className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-700"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={15} className="bg-white text-center text-gray-500 py-6">
                          No notes found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50 overflow-y-auto py-6">
          <div className="bg-white p-6 rounded-xl shadow-lg w-[90%] max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">
                {isEditing ? 'Edit Note' : 'Create New Note'}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Note ID</label>
                  <input
                    type="text"
                    name="noteId"
                    value={formData.noteId}
                    onChange={handleInputChange}
                    required
                    disabled={isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="DCN-2025-001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Note Type</label>
                  <select
                    name="noteType"
                    value={formData.noteType}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="Debit">Debit</option>
                    <option value="Credit">Credit</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Linked Type</label>
                  <select
                    name="linkedType"
                    value={formData.linkedType}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="Receivable">Receivable</option>
                    <option value="Payable">Payable</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Linked Transaction ID</label>
                  <input
                    type="text"
                    name="linkedTransactionId"
                    value={formData.linkedTransactionId}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="INV-10045"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="Consultation fee"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="1200.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">GST Rate (%)</label>
                  <input
                    type="number"
                    name="gstRate"
                    value={formData.taxDetails.gstRate}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">GST Amount (₹)</label>
                  <input
                    type="number"
                    name="gstAmount"
                    value={formData.taxDetails.gstAmount}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="75.02"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Issued To/By</label>
                  <input
                    type="text"
                    name="issuedToOrBy"
                    value={formData.issuedToOrBy}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="Global Tech Suppliers"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Issued Date</label>
                  <input
                    type="date"
                    name="issuedDate"
                    value={formData.issuedDate}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Approval Status</label>
                  <select
                    name="approvalStatus"
                    value={formData.approvalStatus}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
                  <select
                    name="paymentStatus"
                    value={formData.paymentStatus}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Settled">Settled</option>
                    <option value="Adjusted">Adjusted</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                  <textarea
                    name="reason"
                    value={formData.reason}
                    onChange={handleInputChange}
                    required
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="Correction for overbilling on invoice #BILL-XYZ-987"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Supporting Document URL</label>
                  <input
                    type="url"
                    name="supportingDocumentURL"
                    value={formData.supportingDocumentURL}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="https://example.com/docs/proof-001.pdf"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700"
                >
                  {isEditing ? 'Update Note' : 'Create Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DoctorLayout>
  );
};

export default DebitCreditNote;