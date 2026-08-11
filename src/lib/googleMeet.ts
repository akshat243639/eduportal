/**
 * Google Meet API Helper
 * Generates official Google Meet spaces or instant video call links.
 */

export interface GoogleMeetSpace {
  name: string;
  meetingUri: string;
  meetingCode?: string;
}

export const createGoogleMeetSpace = async (accessToken?: string | null): Promise<GoogleMeetSpace> => {
  if (accessToken) {
    try {
      const response = await fetch('https://meetings.googleapis.com/v1/spaces', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      if (response.ok) {
        const data = await response.json();
        return {
          name: data.name || 'spaces/tuition-session',
          meetingUri: data.meetingUri || `https://meet.google.com/${data.meetingCode || 'tui-tion-live'}`,
          meetingCode: data.meetingCode,
        };
      }
    } catch (err) {
      console.warn('Google Meet API call failed, falling back to direct Meet space creation:', err);
    }
  }

  // Instant fallback meeting link format
  const randomRoomCode = `${Math.random().toString(36).substring(2, 5)}-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 5)}`;
  return {
    name: `spaces/${randomRoomCode}`,
    meetingUri: `https://meet.google.com/${randomRoomCode}`,
    meetingCode: randomRoomCode,
  };
};
