import { useOutletContext } from "react-router-dom";

const noSearch = { search: "", setSearch: () => {} };

// The search box in the top bar (see AppLayout). Pages use it to filter their list.
export const usePageSearch = () => useOutletContext() ?? noSearch;
