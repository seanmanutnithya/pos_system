import { createContext } from "react";

// Kept in its own file so ToastProvider.jsx only exports a component
// (needed for React Fast Refresh)
export const ToastContext = createContext(null);
