import axios from "axios";

// In development, Vite forwards /api to the backend (see vite.config.js), so
// the browser only talks to its own origin. Set VITE_API_BASE_URL when the
// API is served from a different origin.
// There is no default Content-Type: axios sets application/json for object
// bodies by itself, and a JSON default would make it turn FormData (image
// uploads) into JSON and drop the file.
export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api/v1",
  timeout: 15000,
});

// True when the request was stopped with an AbortController
export const isCanceled = (error) => axios.isCancel(error);

export const getErrorStatus = (error) => error?.response?.status;

// The backend sends { message } for every error, so prefer that text
export const getErrorMessage = (error) => {
  const message = error?.response?.data?.message;
  if (message) return message;
  if (error?.request && !error.response) {
    return "Can't reach the server. Check that the backend is running.";
  }
  if (getErrorStatus(error) >= 500) {
    return "The server ran into a problem. Try again in a moment.";
  }
  return "Something went wrong. Try again.";
};
