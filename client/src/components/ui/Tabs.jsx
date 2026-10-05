import { useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import Icon from "./Icon";
import { useSlidingIndicator } from "@/hooks/useSlidingIndicator";
import { cn } from "@/lib/cn";
import { getNextIndex } from "@/lib/keyboard";
import { prefersReducedMotion } from "@/lib/motion";

// Tab ids are used to build element ids, so keep them unique on the page
const tabId = (id) => `${id}-tab`;
const panelId = (id) => `${id}-panel`;

// tabs: [{ id, label, icon? }]. A violet underline marks the open tab and
// slides to the next one.
const Tabs = ({ tabs, value, onChange, label }) => {
  const activeIndex = tabs.findIndex((tab) => tab.id === value);
  const { listRef, itemsRef, indicatorRef } = useSlidingIndicator(activeIndex, {
    fitHeight: false,
  });

  const handleKeyDown = (event, index) => {
    const next = getNextIndex(event.key, index, tabs.length);
    if (next === null) return;
    event.preventDefault();
    onChange(tabs[next].id);
    itemsRef.current[next]?.focus();
  };

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label={label}
      className="relative flex gap-6 overflow-x-auto border-b border-line"
    >
      <span
        ref={indicatorRef}
        aria-hidden="true"
        className="pointer-events-none invisible absolute bottom-0 left-0 h-0.5 rounded-full bg-brand"
      />
      {tabs.map((tab, index) => {
        const selected = index === activeIndex;
        return (
          <button
            key={tab.id}
            ref={(element) => {
              itemsRef.current[index] = element;
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
              selected ? "text-ink" : "text-muted hover:text-ink",
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

// direction: 1 when this panel's tab is to the right of the previous one,
// -1 when it is to the left, 0 for no animation (e.g. the first page load)
export const TabPanel = ({ id, direction = 0, children }) => {
  const panelRef = useRef(null);
  // A panel is remounted for each tab (it is keyed by tab id), so the
  // direction it mounts with is the direction of the switch that opened it
  const [enterDirection] = useState(direction);

  // Slide the new panel in from the side the user moved towards, then let
  // its sections (stats, filters, table) settle in one after another
  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!enterDirection || prefersReducedMotion()) return;

    const sections = Array.from(panel.firstElementChild?.children ?? []);
    const ctx = gsap.context(() => {
      const timeline = gsap.timeline({ defaults: { ease: "power3.out", clearProps: "all" } });
      timeline.from(panel, { x: 40 * enterDirection, autoAlpha: 0, duration: 0.45 });
      if (sections.length > 0) {
        timeline.from(sections, { y: 16, autoAlpha: 0, duration: 0.4, stagger: 0.06 }, 0.05);
      }
    }, panel);
    return () => ctx.revert();
  }, [enterDirection]);

  return (
    <div ref={panelRef} role="tabpanel" id={panelId(id)} aria-labelledby={tabId(id)}>
      {children}
    </div>
  );
};

export default Tabs;
