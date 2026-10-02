import IconButton from "./IconButton";
import { useDialog } from "@/hooks/useDialog";

// Panel that covers the left edge of the screen, used for the menu on small
// screens. Built on the native <dialog>, like Modal.
const Drawer = ({ open, onClose, label, children }) => {
  const dialogProps = useDialog({ open, onClose });

  return (
    <dialog
      {...dialogProps}
      aria-label={label}
      className="m-0 h-dvh max-h-dvh w-72 max-w-[calc(100%-3rem)] bg-white p-0 text-ink shadow-xl backdrop:bg-ink/40"
    >
      <div className="relative h-full overflow-y-auto">
        <IconButton
          icon="x"
          label="Close menu"
          size="sm"
          data-autofocus
          onClick={onClose}
          className="absolute top-6 right-4"
        />
        {children}
      </div>
    </dialog>
  );
};

export default Drawer;
