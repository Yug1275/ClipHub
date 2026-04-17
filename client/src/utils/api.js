// Determine the API base URL dynamically
// We check for standalone mode OR if the user explicitly launched the app via the dev:local command parameters.
export const isLocal = import.meta.env.MODE === 'standalone';

// When running locally, allow phone to access node API by dynamically pointing to window host
// instead of hardcoded localhost
export const API_URL = isLocal 
  ? `http://${window.location.hostname}:5001` 
  : import.meta.env.DEV 
    ? (import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`)
    : (import.meta.env.VITE_API_URL || "");
      
export const SOCKET_URL = API_URL;
