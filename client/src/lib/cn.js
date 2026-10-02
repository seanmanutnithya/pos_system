// Joins class names and skips falsy values: cn("a", isOn && "b") -> "a b"
export const cn = (...classes) => classes.filter(Boolean).join(" ");
