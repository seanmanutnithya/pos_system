// A product with this many units or fewer counts as low stock
export const LOW_STOCK_LIMIT = 10;

// Listed in the order used when sorting by status
export const STOCK_LEVELS = {
  in: { label: "In Stock", tone: "brand" },
  low: { label: "Low Stock", tone: "warning" },
  out: { label: "Out of Stock", tone: "danger" },
  inactive: { label: "Inactive", tone: "neutral" },
};

export const STOCK_LEVEL_ORDER = Object.keys(STOCK_LEVELS);

// Inactive products are their own group, whatever their stock
export const getStockLevel = (product) => {
  if (!product.active) return "inactive";
  if (product.quantity_stock <= 0) return "out";
  if (product.quantity_stock <= LOW_STOCK_LIMIT) return "low";
  return "in";
};
