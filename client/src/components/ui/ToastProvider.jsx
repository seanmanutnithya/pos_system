import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Icon from "./Icon";
import { ToastContext } from "./toast-context";
import { cn } from "@/lib/cn";

const DURATION_MS = 4000;

// Short confirmations after an action, e.g. "Category added".
// Use the useToast() hook to show one.
const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(0);
  const timers = useRef(new Map());

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
  }, []);

  const notify = useCallback(
    (message, { tone = "success" } = {}) => {
      const id = ++nextId.current;
      setToasts((current) => [...current, { id, message, tone }]);
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), DURATION_MS),
      );
    },
    [dismiss],
  );

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  const value = useMemo(() => ({ notify, dismiss }), [notify, dismiss]);

  return (
    <ToastContext value={value}>
      {children}
      {/* Always rendered so screen readers pick up new messages */}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex flex-col items-end gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-center gap-3 rounded-xl bg-ink py-2 pr-2 pl-4 text-sm text-white shadow-lg"
          >
            <span
              className={cn(
                "grid size-5 shrink-0 place-items-center rounded-full",
                toast.tone === "error" ? "bg-danger" : "bg-brand",
              )}
            >
              <Icon name={toast.tone === "error" ? "x" : "check"} size={12} strokeWidth={3} />
            </span>
            <span className="py-1">{toast.message}</span>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              aria-label="Dismiss"
              className="rounded-md p-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
            >
              <Icon name="x" size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext>
  );
};

export default ToastProvider;
