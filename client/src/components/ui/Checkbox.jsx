import { cn } from "@/lib/cn";

// Native checkbox in the brand color. `indeterminate` shows the "some selected"
// dash; it can only be set from JavaScript, hence the ref.
const Checkbox = ({ indeterminate = false, className, ...props }) => (
  <input
    ref={(element) => {
      if (element) element.indeterminate = indeterminate;
    }}
    type="checkbox"
    className={cn(
      "size-4 cursor-pointer align-middle accent-brand disabled:cursor-not-allowed",
      className,
    )}
    {...props}
  />
);

export default Checkbox;
