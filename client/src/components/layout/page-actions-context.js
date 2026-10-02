import { createContext } from "react";

// The element in the page header that <PageActions> renders into.
// Kept in its own file so PageActions.jsx only exports a component.
export const PageActionsContext = createContext(null);
