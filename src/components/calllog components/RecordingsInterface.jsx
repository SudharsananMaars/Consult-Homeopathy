import React, { useState, useEffect } from 'react';
import axios from 'axios';

const RecordingsList = () => {
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecordings = async () => {
      try {
        const response = await axios.get('http://localhost:5000/recordings');
        setRecordings(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch recordings');
        setLoading(false);
      }
    };

    fetchRecordings();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h2>Call Recordings</h2>
      <ul>
        {recordings.map(recording => (
          <li key={recording.sid}>
            <p>Date: {new Date(recording.dateCreated).toLocaleString()}</p>
            <p>Duration: {recording.duration} seconds</p>
            <audio controls src={recording.url} />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecordingsList;