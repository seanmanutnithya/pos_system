import { useRef } from "react";
import Icon from "./Icon";
import { cn } from "@/lib/cn";
import { getNextIndex } from "@/lib/keyboard";

// Tab ids are used to build element ids, so keep them unique on the page
const tabId = (id) => `${id}-tab`;
const panelId = (id) => `${id}-panel`;

// tabs: [{ id, label, icon? }]. The open tab gets a violet underline.
const Tabs = ({ tabs, value, onChange, label }) => {
  const tabsRef = useRef([]);

  const handleKeyDown = (event, index) => {
    const next = getNextIndex(event.key, index, tabs.length);
    if (next === null) return;
    event.preventDefault();
    onChange(tabs[next].id);
    tabsRef.current[next]?.focus();
  };

  return (
    <div
      role="tablist"
      aria-label={label}
      className="flex gap-6 overflow-x-auto border-b border-line"
    >
      {tabs.map((tab, index) => {
        const selected = tab.id === value;
        return (
          <button
            key={tab.id}
            ref={(element) => {
              tabsRef.current[index] = element;
            }}
            id={tabId(tab.id)}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-controls={panelId(tab.id)}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(tab.id)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            className={cn(
              "relative inline-flex h-11 shrink-0 items-center gap-2 text-sm font-medium transition-colors",
              "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand",
              "after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-full",
              selected ? "text-ink after:bg-brand" : "text-muted hover:text-ink",
            )}
          >
            {tab.icon && <Icon name={tab.icon} size={16} />}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

export const TabPanel = ({ id, children }) => (
  <div role="tabpanel" id={panelId(id)} aria-labelledby={tabId(id)}>
    {children}
  </div>
);

export default Tabs;
