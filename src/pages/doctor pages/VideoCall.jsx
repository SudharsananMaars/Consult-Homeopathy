import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import axios from "axios"; // Import Axios

const VideoCall = () => {
    const { patientId } = useParams(); // Get patientId from URL parameters
    const meetingRef = useRef(null);
    const [draft, setDraft] = useState(""); // State to manage the draft text

    useEffect(() => {
        const myMeeting = async (element) => {
            const appID = 909999327; // Your Zego appID
            const serverSecret = "93f3b67ec1b69b2022c023ed58556cfd"; // Your server secret - make sure to store securely

            // Generate a unique room ID using patientId or other identifier (avoiding "12345")
            const uniqueRoomId = `room-${patientId}-${Date.now()}`;

            // Generate a unique user ID using Date.now()
            const userId = `user-${Date.now()}`;

            // Generate the Kit Token using the updated unique room ID and user ID
            const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
                appID, 
                serverSecret, 
                uniqueRoomId, // Unique room ID
                userId,       // Unique user ID
                "User Name"   // Optional user name
            );

            // Create Zego instance and join the room
            const zp = ZegoUIKitPrebuilt.create(kitToken);

            try {
                await zp.joinRoom({
                    container: element,
                    sharedLinks: [
                        {
                            name: "Copy Link",
                            url: window.location.href, // Current URL as the room link
                        },
                    ],
                    scenario: {
                        mode: ZegoUIKitPrebuilt.OneONoneCall,
                    },
                    showScreenSharingButton: false,
                });

                console.log("Joined room successfully");
            } catch (error) {
                console.error("Failed to join the room:", error); // Improved error handling
            }

            // Listen for the end of the call, trigger note save on call end
            zp.on("roomEnded", async () => {
                await saveNote(); // Save the note when the room ends
            });
        };

        if (meetingRef.current) {
            myMeeting(meetingRef.current);
        }
    }, [patientId]);

    // Function to handle text area change
    const handleDraftChange = (event) => {
        setDraft(event.target.value);
    };

    // Function to save the note to the database
    const saveNote = async () => {
        window.alert("Saving note...");
        try {
            await axios.post('http://localhost:5000/api/notes', {
                patientId,
                content: draft,
            });
            console.log("Note saved successfully.");
            setDraft(""); // Clear the draft after saving
        } catch (error) {
            console.error("Failed to save note:", error);
        }
    };

    return (
        <div className="video-call-container">
            <div ref={meetingRef} className="meeting" />
            <div className="draft-container">
                <textarea
                    className="draft-textarea"
                    value={draft}
                    onChange={handleDraftChange}
                    placeholder="Write your notes here..."
                    className="w-full h-32 p-2 border rounded-md" // TailwindCSS styling
                />
                <button 
                    onClick={saveNote} 
                    className="bg-blue-500 text-white px-4 py-2 rounded-md mt-2"
                >
                    Submit
                </button>
            </div>
        </div>
    );
};

export default VideoCall;
