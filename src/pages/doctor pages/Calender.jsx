import React, { useEffect, useState } from "react";
import { gapi } from "gapi-script";
import axios from "axios";

const CLIENT_ID = "167368098853-dsfqf6639dj4vh37u4mb1g7ocjco3181.apps.googleusercontent.com"; // Update this
const API_KEY = "AIzaSyDziOUEp7O1JGpEBxo_I7gLhB0ORRc0wR8";
const SCOPES = "https://www.googleapis.com/auth/calendar.readonly";

const CalendarEmbed = () => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [calendarEmbedLink, setCalendarEmbedLink] = useState("");

  useEffect(() => {
    const initClient = () => {
      gapi.load("client:auth2", () => {
        gapi.client
          .init({
            apiKey: API_KEY,
            clientId: CLIENT_ID,
            scope: SCOPES,
            discoveryDocs: [
              "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest",
            ],
          })
          .then(() => {
            const authInstance = gapi.auth2.getAuthInstance();
            setIsSignedIn(authInstance.isSignedIn.get());
            authInstance.isSignedIn.listen(setIsSignedIn);
          })
          .catch((error) => {
            console.error("Error initializing GAPI client:", error);
          });
      });
    };
    initClient();
  }, []);
  
  // Sign in the user
  const signIn = async () => {
    try {
      console.log("Signing in...");
      await gapi.auth2.getAuthInstance().signIn();
      console.log("Sign-in successful");
      loadUserCalendar(); // Call your calendar loading logic after sign-in
    } catch (error) {
      console.error("Error during sign-in:", error);
    }
  };   

  // Sign out the user
  const signOut = () => {
    gapi.auth2.getAuthInstance().signOut();
    setCalendarEmbedLink("");
  };

  // Fetch the primary calendar embed link
  const loadUserCalendar = () => {
    gapi.client.calendar.calendarList.list().then((response) => {
      const primaryCalendar = response.result.items.find(
        (calendar) => calendar.primary
      );
      if (primaryCalendar) {
        const calendarId = primaryCalendar.id;
        const embedLink = `https://calendar.google.com/calendar/embed?src=${encodeURIComponent(
          calendarId
        )}&ctz=Asia/Kolkata`; // Set the time zone to India (Asia/Kolkata)
        setCalendarEmbedLink(embedLink);
      }
    }).catch(error => console.error("Error loading calendar:", error));
  };

  // Load calendar when signed in
  useEffect(() => {
    if (isSignedIn) {
      loadUserCalendar();
    }
  }, [isSignedIn]);

  return (
    <div className="flex flex-col items-center p-6">
      <h1 className="text-2xl font-bold mb-4">Google Calendar</h1>
      {isSignedIn ? (
        <button
          onClick={signOut}
          className="mb-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700"
        >
          Sign Out
        </button>
      ) : (
        <button
          onClick={signIn}
          className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
        >
          Sign In with Google
        </button>
      )}
      
      {calendarEmbedLink && (
        <iframe
          src={calendarEmbedLink}
          style={{ border: 0 }}
          width="100%"
          height="600"
          frameBorder="0"
          scrolling="no"
          title="Google Calendar"
          className="shadow-lg rounded-lg"
        ></iframe>
      )}
    </div>
  );
};

export default CalendarEmbed;
