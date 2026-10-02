// Sidebar links. An item without `to` is a planned page: it is listed but
// can't be opened yet.
export const NAV_SECTIONS = [
  {
    id: "main",
    items: [
      { label: "Dashboard", icon: "dashboard" },
      { label: "Product Menu", icon: "box", to: "/product-menu" },
      { label: "Sales", icon: "cart" },
      { label: "Orders", icon: "clipboard" },
    ],
  },
  {
    id: "manage",
    title: "Manage",
    items: [
      { label: "Users", icon: "users" },
      { label: "Stores", icon: "map-pin" },
      { label: "Settings", icon: "settings" },
    ],
  },
];
