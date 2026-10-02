// Arrow-key movement for tabs and radio groups (WAI-ARIA pattern).
// Returns the index to move to, or null when the key isn't a navigation key.
export const getNextIndex = (key, index, length) => {
  switch (key) {
    case "ArrowRight":
    case "ArrowDown":
      return (index + 1) % length;
    case "ArrowLeft":
    case "ArrowUp":
      return (index - 1 + length) % length;
    case "Home":
      return 0;
    case "End":
      return length - 1;
    default:
      return null;
  }
};
