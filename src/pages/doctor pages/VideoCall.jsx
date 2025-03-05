import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

const VideoCall = () => {
  const location = useLocation();
  const [meetLink, setMeetLink] = useState("");
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [appointmentID, setAppointmentID] = useState("");

  useEffect(() => {
    if (location.state && location.state.meetLink && location.state.appointmentID) {
      setMeetLink(location.state.meetLink);
      setAppointmentID(location.state.appointmentID);
    }
  }, [location.state]);

  const handleJoinRoom = () => {
    if (meetLink) {
      const zoomWindow = window.open(meetLink, "_blank");
      if (zoomWindow) {
        setIsZoomOpen(true);
        zoomWindow.onbeforeunload = () => {
          setIsZoomOpen(false);
        };
      }
      openNoteTakingPopup();
    }
  };

  const openNoteTakingPopup = () => {
    window.open("/note-taking", "NoteTakingPopup", "width=400,height=500,top=100,left=100");
  };

  const handleSubmitNotes = async () => {
    const latestNotes = localStorage.getItem("notes") || ""; // Fetch latest notes before submitting
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("You are not authenticated. Please log in.");
        return;
      }

      const response = await axios.post(
        "http://localhost:5000/api/doctor/notes",
        { appointmentID, notes: latestNotes },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        alert("Notes submitted successfully!");
        localStorage.removeItem("notes"); // Clear notes after submission
      } else {
        alert("Failed to submit notes.");
      }
    } catch (error) {
      console.error("Error submitting notes:", error);
      alert("An error occurred while submitting notes.");
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Join the Video Call</h2>
      {meetLink ? (
        <>
          <button style={styles.button} onClick={handleJoinRoom}>
            {isZoomOpen ? "Continue Video Call" : "Join Video Call"}
          </button>
          <button style={styles.notesButton} onClick={handleSubmitNotes}>
            Submit Notes
          </button>
          <p style={styles.status}>
            {isZoomOpen ? "Video call in progress..." : "Video call not started"}
          </p>
        </>
      ) : (
        <p style={styles.error}>No meeting link found!</p>
      )}
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    backgroundColor: "#f0f0f0",
    fontFamily: "'Roboto', sans-serif",
    padding: "20px",
  },
  title: {
    fontSize: "2.5rem",
    marginBottom: "20px",
    color: "#2c3e50",
    fontWeight: "600",
  },
  button: {
    padding: "15px 30px",
    backgroundColor: "#1d73b2",
    color: "white",
    fontSize: "1.2rem",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
    marginBottom: "20px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  },
  notesButton: {
    padding: "10px 20px",
    backgroundColor: "#4CAF50",
    color: "white",
    fontSize: "1rem",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    marginTop: "10px",
  },
  error: {
    color: "red",
    fontSize: "1.2rem",
    marginTop: "20px",
  },
  status: {
    fontSize: "1.1rem",
    marginTop: "10px",
    color: "#555",
  },
};

export default VideoCall;
