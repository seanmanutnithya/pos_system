import Badge from "@/components/ui/Badge";
import { getStockLevel, STOCK_LEVELS } from "./stock";

const StockBadge = ({ product }) => {
  const level = STOCK_LEVELS[getStockLevel(product)];
  return <Badge tone={level.tone}>{level.label}</Badge>;
};

export default StockBadge;
