import { useContext } from "react";
import { createPortal } from "react-dom";
import { PageActionsContext } from "./page-actions-context";

// Renders its children in the page header's button area. This lets the open
// tab put its own buttons, such as "Add Category", next to the page title.
const PageActions = ({ children }) => {
  const target = useContext(PageActionsContext);
  return target ? createPortal(children, target) : null;
};

export default PageActions;
