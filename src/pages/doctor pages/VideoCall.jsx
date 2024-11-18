import React, { useEffect, useState } from "react";
import { gapi } from "gapi-script";

const CLIENT_ID = "167368098853-dsfqf6639dj4vh37u4mb1g7ocjco3181.apps.googleusercontent.com";
const API_KEY = "AIzaSyDziOUEp7O1JGpEBxo_I7gLhB0ORRc0wR8";
const SCOPES = "https://www.googleapis.com/auth/calendar.events";

function GoogleMeetIntegration() {
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    function initClient() {
      gapi.client
        .init({
          apiKey: API_KEY,
          clientId: CLIENT_ID,
          scope: SCOPES,
        })
        .then(() => {
          const authInstance = gapi.auth2.getAuthInstance();
          setIsSignedIn(authInstance.isSignedIn.get());
          authInstance.isSignedIn.listen(setIsSignedIn);
        });
    }

    gapi.load("client:auth2", initClient);
  }, []);

  const signIn = () => gapi.auth2.getAuthInstance().signIn();
  const signOut = () => gapi.auth2.getAuthInstance().signOut();

  const createMeetEvent = () => {
    const event = {
      summary: "Google Meet Video Conference",
      description: "Meeting via Google Meet",
      start: {
        dateTime: new Date().toISOString(),
        timeZone: "America/Los_Angeles",
      },
      end: {
        dateTime: new Date(new Date().getTime() + 30 * 60000).toISOString(),
        timeZone: "America/Los_Angeles",
      },
      conferenceData: {
        createRequest: { requestId: "sample123", conferenceSolutionKey: { type: "hangoutsMeet" } },
      },
    };

    gapi.client.calendar.events
      .insert({
        calendarId: "primary",
        resource: event,
        conferenceDataVersion: 1,
      })
      .then((response) => {
        const meetLink = response.result.hangoutLink;
        alert(`Google Meet Link: ${meetLink}`);
      })
      .catch((error) => console.error("Error creating event", error));
  };

  return (
    <div>
      <h1>Google Meet Integration</h1>
      {isSignedIn ? (
        <>
          <button onClick={signOut}>Sign Out</button>
          <button onClick={createMeetEvent}>Create Google Meet Event</button>
        </>
      ) : (
        <button onClick={signIn}>Sign In with Google</button>
      )}
    </div>
  );
}

export default GoogleMeetIntegration;
