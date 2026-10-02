import { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import Icon from "@/components/ui/Icon";
import SearchInput from "@/components/ui/SearchInput";
import { cn } from "@/lib/cn";
import { NAV_SECTIONS } from "./navigation";

const IS_MAC = /mac/i.test(navigator.userAgentData?.platform ?? navigator.platform);

const itemClasses =
  "flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors";

const NavItem = ({ item, onNavigate }) =>
  item.to ? (
    <NavLink
      to={item.to}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          itemClasses,
          "focus-visible:outline-2 focus-visible:outline-brand",
          isActive ? "bg-brand-soft text-brand-strong" : "text-ink hover:bg-paper",
        )
      }
    >
      <Icon name={item.icon} size={18} />
      {item.label}
    </NavLink>
  ) : (
    <span aria-disabled="true" className={cn(itemClasses, "text-muted")}>
      <Icon name={item.icon} size={18} />
      {item.label}
      <span className="ml-auto rounded-full bg-paper px-2 py-0.5 text-xs font-normal">
        Soon
      </span>
    </span>
  );

// The app's main navigation. With `enableShortcut`, Ctrl+K (⌘K on a Mac)
// jumps to the menu search.
const Sidebar = ({ onNavigate, enableShortcut = false }) => {
  const [filter, setFilter] = useState("");
  const searchRef = useRef(null);

  useEffect(() => {
    if (!enableShortcut) return;
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enableShortcut]);

  const query = filter.trim().toLowerCase();
  const sections = NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => item.label.toLowerCase().includes(query)),
  })).filter((section) => section.items.length > 0);

  return (
    <div className="flex h-full flex-col gap-6 px-4 py-6">
      <div className="flex items-center gap-3 px-2">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand text-white">
          <Icon name="bag" size={20} />
        </span>
        <div className="min-w-0">
          <p className="leading-tight font-bold tracking-tight">POS System</p>
          <p className="text-xs text-muted">Store management</p>
        </div>
      </div>

      <SearchInput
        ref={searchRef}
        label="Search menu"
        placeholder="Search menu…"
        value={filter}
        onChange={setFilter}
        shortcut={enableShortcut ? (IS_MAC ? "⌘K" : "Ctrl K") : undefined}
        aria-keyshortcuts={enableShortcut ? (IS_MAC ? "Meta+K" : "Control+K") : undefined}
      />

      <nav aria-label="Main" className="flex flex-col gap-6">
        {sections.map((section) => (
          <div key={section.id}>
            {section.title && (
              <p className="px-3 pb-2 text-xs font-medium tracking-wider text-muted uppercase">
                {section.title}
              </p>
            )}
            <ul className="flex flex-col gap-1">
              {section.items.map((item) => (
                <li key={item.label}>
                  <NavItem item={item} onNavigate={onNavigate} />
                </li>
              ))}
            </ul>
          </div>
        ))}
        {sections.length === 0 && (
          <p className="px-3 text-sm text-muted">No pages match “{filter.trim()}”.</p>
        )}
      </nav>
    </div>
  );
};

export default Sidebar;
