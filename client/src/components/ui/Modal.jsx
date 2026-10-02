import { useId } from "react";
import IconButton from "./IconButton";
import { useDialog } from "@/hooks/useDialog";
import { cn } from "@/lib/cn";

const SIZES = {
  md: "max-w-lg",
  lg: "max-w-2xl",
};

// Built on the native <dialog>, which traps focus, closes on Escape and
// returns focus to the opener. The header and footer stay in place while a
// long body scrolls. Add data-autofocus to the element that should get focus
// when the modal opens.
const Modal = ({
  open,
  onClose,
  title,
  description,
  footer,
  size = "md",
  dismissible = true,
  className,
  children,
}) => {
  const dialogProps = useDialog({ open, onClose, dismissible });
  const titleId = useId();
  const descriptionId = useId();

  return (
    <dialog
      {...dialogProps}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      className={cn(
        "m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] overflow-hidden rounded-2xl bg-white p-0 text-ink shadow-2xl",
        "backdrop:bg-ink/40",
        SIZES[size],
        className,
      )}
    >
      <div className="flex max-h-[calc(100dvh-2rem)] flex-col">
        <div className="flex shrink-0 items-start justify-between gap-4 px-6 pt-6">
          <div>
            <h2 id={titleId} className="text-xl font-bold tracking-tight">
              {title}
            </h2>
            {description && (
              <p id={descriptionId} className="mt-1 text-sm text-muted">
                {description}
              </p>
            )}
          </div>
          <IconButton icon="x" label="Close" size="sm" onClick={onClose} disabled={!dismissible} />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">{children}</div>
        {footer && (
          <div className="flex shrink-0 flex-wrap justify-end gap-2 border-t border-line px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </dialog>
  );
};

export default Modal;
