import { useContext } from "react";
import { ToastContext } from "@/components/ui/toast-context";

// Returns { notify(message, { tone }), dismiss(id) }
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used inside <ToastProvider>");
  }
  return context;
};
