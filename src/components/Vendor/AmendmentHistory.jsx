import React, { useEffect, useState } from "react";
import axios from "axios";
import config from '../../config';

const AmendmentHistory = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const API_URL = config.API_URL;

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/vendor/get-amendment-logs`);
        if (res.data.status === "success") {
          setLogs(res.data.data.logs);
        } else {
          setError("Failed to fetch amendment logs.");
        }
      } catch {
        setError("Error fetching amendment logs.");
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <span className="animate-pulse text-gray-500 text-lg">Loading amendment history...</span>
      </div>
    );

  if (error)
    return (
      <div className="text-center text-red-600 mt-10">{error}</div>
    );

  if (!logs.length)
    return (
      <div className="text-center text-gray-500 mt-10">No amendment logs found.</div>
    );

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-blue-700 text-center">Amendment History</h1>
      <div className="space-y-8">
        {logs.map((log) => (
          <div key={log._id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="mb-3 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{log.vendorName}</h2>
                <p className="text-gray-600 text-sm">Resource: {log.resourceId?.name || "N/A"}</p>
              </div>
              <div className="text-gray-500 text-sm">{new Date(log.modifiedAt).toLocaleString()}</div>
            </div>
            <div className="divide-y divide-gray-200">
              {log.changes.map((change, idx) => (
                <div key={idx} className="py-2">
                  <p className="text-gray-800 font-medium">{change.field}</p>
                  <p className="text-gray-600">
                    <span className="mr-2 text-red-600 line-through">{String(change.oldValue)}</span>
                    <span className="mx-2 text-gray-400">&#8594;</span>
                    <span className="text-green-600 font-semibold">{String(change.newValue)}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AmendmentHistory;
