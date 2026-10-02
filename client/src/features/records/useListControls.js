import { useMemo, useState } from "react";
import { matchesSearch, sortRecords } from "./listHelpers";

// Works out what the table shows from the full list: the search, the filter
// chip, the sort, the page and the selection. Only the user's choices are
// state; everything else is derived from them.
export const useListControls = (items, { config, search, pageSize }) => {
  const { idKey, filters, columns, getSearchText } = config;
  const [filter, setFilter] = useState(filters[0].value);
  const [sort, setSort] = useState(null);
  const [selectedIds, setSelectedIds] = useState(() => new Set());

  const searchResults = useMemo(
    () => items.filter((item) => matchesSearch(getSearchText(item), search)),
    [items, search, getSearchText],
  );

  // Chip counts follow the search, so they always add up to what can be shown
  const filterCounts = useMemo(
    () =>
      Object.fromEntries(
        filters.map((option) => [
          option.value,
          option.match ? searchResults.filter(option.match).length : searchResults.length,
        ]),
      ),
    [filters, searchResults],
  );

  const activeFilter = filters.find((option) => option.value === filter) ?? filters[0];
  const filteredItems = useMemo(
    () => (activeFilter.match ? searchResults.filter(activeFilter.match) : searchResults),
    [activeFilter, searchResults],
  );

  const sortValue = sort ? columns.find((column) => column.key === sort.key)?.sortValue : null;
  const sortedItems = useMemo(
    () => sortRecords(filteredItems, sortValue, sort?.direction),
    [filteredItems, sortValue, sort],
  );

  // Go back to page 1 whenever the search, filter or sort changes
  const listKey = JSON.stringify([search.trim().toLowerCase(), activeFilter.value, sort]);
  const [pageState, setPageState] = useState({ listKey, page: 1 });
  const pageCount = Math.max(1, Math.ceil(sortedItems.length / pageSize));
  // Kept in range, e.g. after deleting the last rows of the last page
  const page = Math.min(pageState.listKey === listKey ? pageState.page : 1, pageCount);
  const pageItems = sortedItems.slice((page - 1) * pageSize, page * pageSize);

  // Rows hidden by the search or filter don't count as selected
  const selectedItems = filteredItems.filter((item) => selectedIds.has(item[idKey]));

  return {
    filter: activeFilter.value,
    setFilter,
    filterCounts,
    sort,
    setSort,
    page,
    setPage: (nextPage) => setPageState({ listKey, page: nextPage }),
    pageItems,
    sortedItems,
    selectedIds,
    setSelectedIds,
    selectedItems,
  };
};
