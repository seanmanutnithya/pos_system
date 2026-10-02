import { useEffect, useId, useRef } from "react";
import Icon from "./Icon";
import { cn } from "@/lib/cn";
import { getNextIndex } from "@/lib/keyboard";

const GAP = 4;
// The menu's height, worked out before it opens (a hidden popover can't be
// measured). Keep in sync with the item height (h-9) and the menu's padding
// and border below.
const ITEM_HEIGHT = 36;
const MENU_CHROME = 10;

// A "⋯" button that opens a list of actions. It uses the native popover API,
// so the list renders above everything (a scrolling table can't clip it) and
// closes on Escape or a click outside.
// items: [{ label, icon?, tone?: "danger", onSelect }]
const Menu = ({ label, items }) => {
  const menuId = useId();
  const buttonRef = useRef(null);
  const menuRef = useRef(null);
  const removeListeners = useRef(null);

  useEffect(() => () => removeListeners.current?.(), []);

  const close = () => menuRef.current?.hidePopover();

  const getMenuItems = () =>
    Array.from(menuRef.current?.querySelectorAll('[role="menuitem"]') ?? []);

  // Place the menu under the button, right-aligned, or above it when there
  // isn't room below
  const handleBeforeToggle = (event) => {
    if (event.newState !== "open") return;
    const button = buttonRef.current.getBoundingClientRect();
    const height = items.length * ITEM_HEIGHT + MENU_CHROME;
    const fitsBelow = button.bottom + GAP + height <= window.innerHeight;
    const menu = menuRef.current;
    menu.style.top = `${fitsBelow ? button.bottom + GAP : Math.max(GAP, button.top - GAP - height)}px`;
    menu.style.right = `${document.documentElement.clientWidth - button.right}px`;
  };

  const handleToggle = (event) => {
    removeListeners.current?.();
    removeListeners.current = null;
    if (event.newState !== "open") return;

    getMenuItems()[0]?.focus({ preventScroll: true });
    // The menu stays where the button was, so close it as soon as the page moves
    const controller = new AbortController();
    const options = { capture: true, passive: true, signal: controller.signal };
    window.addEventListener("scroll", close, options);
    window.addEventListener("resize", close, options);
    removeListeners.current = () => controller.abort();
  };

  const handleKeyDown = (event) => {
    if (event.key === "Tab") {
      close();
      return;
    }
    // A vertical menu only moves with up/down, Home and End
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") return;
    const menuItems = getMenuItems();
    const current = Math.max(menuItems.indexOf(document.activeElement), 0);
    const next = getNextIndex(event.key, current, menuItems.length);
    if (next === null) return;
    event.preventDefault();
    menuItems[next]?.focus();
  };

  const select = (item) => {
    close();
    item.onSelect();
  };

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        popoverTarget={menuId}
        aria-haspopup="menu"
        aria-label={label}
        title={label}
        className={cn(
          "inline-flex size-8 items-center justify-center rounded-lg text-ink transition-colors hover:bg-paper",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
        )}
      >
        <Icon name="more" size={18} />
      </button>
      <div
        ref={menuRef}
        id={menuId}
        popover="auto"
        role="menu"
        aria-label={label}
        onBeforeToggle={handleBeforeToggle}
        onToggle={handleToggle}
        onKeyDown={handleKeyDown}
        className="inset-auto m-0 min-w-44 rounded-xl border border-line bg-white p-1 text-sm text-ink shadow-lg"
      >
        {items.map((item) => (
          <button
            key={item.label}
            type="button"
            role="menuitem"
            tabIndex={-1}
            onClick={() => select(item)}
            className={cn(
              "flex h-9 w-full items-center gap-2 rounded-lg px-3 text-left whitespace-nowrap transition-colors focus:outline-hidden",
              item.tone === "danger"
                ? "text-danger hover:bg-danger-soft focus:bg-danger-soft"
                : "hover:bg-paper focus:bg-paper",
            )}
          >
            {item.icon && <Icon name={item.icon} size={16} />}
            {item.label}
          </button>
        ))}
      </div>
    </>
  );
};

export default Menu;
