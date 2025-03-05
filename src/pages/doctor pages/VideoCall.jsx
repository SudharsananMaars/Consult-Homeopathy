import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

const VideoCall = () => {
  const location = useLocation();
  const [meetLink, setMeetLink] = useState("");
  const [isNoteTakingOpen, setIsNoteTakingOpen] = useState(false);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  useEffect(() => {
    if (location.state && location.state.meetLink) {
      setMeetLink(location.state.meetLink);
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
    const noteWindow = window.open(
      "/note-taking", // Open the /note-taking route
      "NoteTakingPopup",
      "width=400,height=500,top=100,left=100"
    );

    if (noteWindow) {
      setIsNoteTakingOpen(true);
      noteWindow.onbeforeunload = () => {
        setIsNoteTakingOpen(false);
      };
    } else {
      alert("Pop-up blocked! Please allow pop-ups in your browser.");
    }
  };

  const handleContinueNotes = () => {
    openNoteTakingPopup();
  };

  const handleContinueVideoCall = () => {
    if (meetLink) {
      window.open(meetLink, "_blank");
      setIsZoomOpen(true);
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
          {isNoteTakingOpen && (
            <button style={styles.notesButton} onClick={handleContinueNotes}>
              Continue Taking Notes
            </button>
          )}
          <p style={styles.status}>
            {isZoomOpen ? "Video call in progress..." : "Video call not started"}
          </p>
          <p style={styles.status}>
            {isNoteTakingOpen ? "Note-taking in progress..." : "Note-taking not started"}
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
    fontFamily: "Arial, sans-serif",
  },
  title: {
    fontSize: "2rem",
    marginBottom: "20px",
    color: "#2c3e50",
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
    marginBottom: "10px",
  },
  notesButton: {
    padding: "15px 30px",
    backgroundColor: "#4CAF50",
    color: "white",
    fontSize: "1.2rem",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
    marginBottom: "10px",
  },
  error: {
    color: "red",
    fontSize: "1rem",
    marginTop: "20px",
  },
  status: {
    fontSize: "1rem",
    marginTop: "10px",
    color: "#555",
  },
};

export default VideoCall;