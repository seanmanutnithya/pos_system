import { useState } from "react";
import Icon from "@/components/ui/Icon";
import IconButton from "@/components/ui/IconButton";
import SearchInput from "@/components/ui/SearchInput";
import { formatWeekdayDate } from "@/lib/format";

const Topbar = ({ search, onSearchChange, onOpenMenu }) => {
  // Read once when the app opens, so re-renders show the same date
  const [today] = useState(() => new Date());

  return (
    <header className="flex items-center gap-4 py-6">
      <IconButton
        icon="menu"
        label="Open menu"
        onClick={onOpenMenu}
        className="border border-line bg-white lg:hidden"
      />
      <SearchInput
        label="Search"
        placeholder="Search products, categories, brands…"
        value={search}
        onChange={onSearchChange}
        className="w-full max-w-md"
      />
      <div className="ml-auto hidden shrink-0 items-center gap-3 md:flex">
        <span className="grid size-10 place-items-center rounded-xl border border-line bg-white">
          <Icon name="calendar" size={18} />
        </span>
        <div className="leading-tight">
          <p className="text-sm font-medium">{formatWeekdayDate(today)}</p>
          <p className="text-xs text-muted">Have a productive day!</p>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
