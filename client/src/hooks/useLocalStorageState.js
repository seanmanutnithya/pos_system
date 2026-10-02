import { useState } from "react";

// useState that remembers its value in this browser between visits. The
// setter takes a value (not an updater function). Storage can be unavailable,
// for example in a private window, so every access is guarded.
export const useLocalStorageState = (key, defaultValue) => {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored === null ? defaultValue : JSON.parse(stored);
    } catch {
      return defaultValue;
    }
  });

  const setAndStore = (nextValue) => {
    setValue(nextValue);
    try {
      localStorage.setItem(key, JSON.stringify(nextValue));
    } catch {
      // Not saved, but it still works until the page is reloaded
    }
  };

  return [value, setAndStore];
};
