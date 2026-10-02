import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Drawer from "@/components/ui/Drawer";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

// Width from which the sidebar is always visible (Tailwind's lg breakpoint)
const DESKTOP_QUERY = "(min-width: 64rem)";

const AppLayout = () => {
  // The top-bar search. Pages read it with usePageSearch() to filter their list.
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  // Close the small-screen menu if the window becomes wide enough for the sidebar
  useEffect(() => {
    if (!menuOpen) return;
    const media = window.matchMedia(DESKTOP_QUERY);
    const handleChange = (event) => {
      if (event.matches) setMenuOpen(false);
    };
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, [menuOpen]);

  return (
    <div className="flex min-h-dvh">
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 overflow-y-auto border-r border-line bg-white lg:block">
        <Sidebar enableShortcut />
      </aside>
      {menuOpen && (
        <Drawer open label="Menu" onClose={closeMenu}>
          <Sidebar onNavigate={closeMenu} />
        </Drawer>
      )}

      <div className="min-w-0 flex-1 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-360 pb-12">
          <Topbar
            search={search}
            onSearchChange={setSearch}
            onOpenMenu={() => setMenuOpen(true)}
          />
          <main>
            <Outlet context={{ search, setSearch }} />
          </main>
        </div>
      </div>
    </div>
  );
};

export default AppLayout;
