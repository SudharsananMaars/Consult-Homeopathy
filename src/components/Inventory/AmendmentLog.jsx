import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AmendmentLog = () => {
  const [logData, setLogData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await axios.get(
          'https://clinic-backend-jdob.onrender.com/api/inventory/fetchAllAmendmentHistories'
        );
        const sortedLogs = response.data.sort(
          (a, b) => new Date(b.amendedAt) - new Date(a.amendedAt)
        );
        setLogData(sortedLogs);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch amendment logs.');
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const excludedFields = ['createdAt', 'updatedAt', '_id', 'IsAmendment'];

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Helper function to normalize date values for comparison
  const normalizeValue = (value, fieldName) => {
    // Check if the field contains 'date' or 'Date' in its name and if the value looks like a date
    if (fieldName.toLowerCase().includes('date') || fieldName.toLowerCase().includes('expiry')) {
      try {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          // Return ISO date string (YYYY-MM-DD) for consistent comparison
          return date.toISOString().split('T')[0];
        }
      } catch (e) {
        // If parsing fails, return original value
      }
    }
    return value;
  };

  // Helper function to check if an entry has actual changes
  const hasActualChanges = (changes) => {
    return Object.entries(changes)
      .filter(([field, value]) => {
        if (excludedFields.includes(field)) return false;
        const [from, to] = value.split(' → ');
        
        // Normalize both values for comparison
        const normalizedFrom = normalizeValue(from, field);
        const normalizedTo = normalizeValue(to, field);
        
        return normalizedFrom !== normalizedTo;
      }).length > 0;
  };

  const formatChanges = (changes) => {
    return Object.entries(changes)
      .filter(([field, value]) => {
        if (excludedFields.includes(field)) return false;
        const [from, to] = value.split(' → ');
        
        // Normalize both values for comparison
        const normalizedFrom = normalizeValue(from, field);
        const normalizedTo = normalizeValue(to, field);
        
        return normalizedFrom !== normalizedTo;
      })
      .map(([field, value]) => {
        const [from, to] = value.split(' → ');
        
        // Format display values (keep original formatting for display)
        let displayFrom = from;
        let displayTo = to;
        
        // If it's a date field, format it nicely for display
        if (field.toLowerCase().includes('date') || field.toLowerCase().includes('expiry')) {
          try {
            const fromDate = new Date(from);
            const toDate = new Date(to);
            if (!isNaN(fromDate.getTime())) {
              displayFrom = fromDate.toLocaleDateString('en-IN');
            }
            if (!isNaN(toDate.getTime())) {
              displayTo = toDate.toLocaleDateString('en-IN');
            }
          } catch (e) {
            // Keep original values if parsing fails
          }
        }
        
        return (
          <div key={field} className="mb-2 flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-gray-700">{field}:</span>
            <span className="bg-red-100 text-red-700 text-xs font-semibold px-2.5 py-0.5 rounded-full max-w-[200px] truncate">
              {displayFrom}
            </span>
            <span className="text-gray-500 text-xs">→</span>
            <span className="bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-0.5 rounded-full max-w-[200px] truncate">
              {displayTo}
            </span>
          </div>
        );
      });
  };

  if (loading) return <div className="p-4 text-gray-500">Loading amendment logs...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-blue-900 mb-6">Amendment History Log</h1>
      {logData.filter(entry => hasActualChanges(entry.changes)).length === 0 ? (
        <p className="text-gray-600">No amendments found.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow border border-gray-200">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
              <tr>
                <th className="px-4 py-3">Material</th>
                <th className="px-4 py-3">Changes</th>
                <th className="px-4 py-3">Updated By</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logData
                .filter(entry => hasActualChanges(entry.changes)) // Only show entries with actual changes
                .map((entry) => (
                <tr key={entry._id} className="hover:bg-gray-50 align-top">
                  <td className="px-4 py-3 font-medium text-indigo-700">{entry.rawMaterialName}</td>
                  <td className="px-4 py-3 space-y-1">{formatChanges(entry.changes)}</td>
                  <td className="px-4 py-3">{entry.updatedBy}</td>
                  <td className="px-4 py-3">{formatDate(entry.amendedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AmendmentLog;