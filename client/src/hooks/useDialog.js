import { useEffect, useRef } from "react";

// Connects a native <dialog> to an `open` prop: spread the returned props on
// the <dialog>. Escape and backdrop clicks go through onClose, so the parent's
// state stays the single source of truth. Put data-autofocus on the element
// that should get focus when the dialog opens.
export const useDialog = ({ open, onClose, dismissible = true }) => {
  const ref = useRef(null);
  const pressStartedOnBackdrop = useRef(false);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      // React runs autoFocus before showModal(), which would undo it
      dialog.querySelector("[data-autofocus]")?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return {
    ref,
    // Escape key
    onCancel: (event) => {
      event.preventDefault();
      if (dismissible) onClose();
    },
    // The browser can still close the dialog itself. Keep the parent in sync.
    onClose: () => {
      if (open) onClose();
    },
    // All content sits in an inner wrapper, so only a backdrop click hits the
    // <dialog> itself. A drag that starts inside and ends outside doesn't count.
    onMouseDown: (event) => {
      pressStartedOnBackdrop.current = event.target === event.currentTarget;
    },
    onClick: (event) => {
      if (
        dismissible &&
        pressStartedOnBackdrop.current &&
        event.target === event.currentTarget
      ) {
        onClose();
      }
    },
  };
};
