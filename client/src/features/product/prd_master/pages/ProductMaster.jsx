import { attributeApi, brandApi, categoryApi } from "@/api/catalog";
import { productConfig } from "@/features/product/prd_master/productConfig";
import RecordPanel from "@/features/records/RecordPanel";
import { useRecords } from "@/features/records/useRecords";

// The Product Catalog tab of the Product Menu. Besides the products, it loads
// the categories, brands and attributes that the product form's selects
// choose from.
const ProductMaster = () => {
  const categories = useRecords(categoryApi, "category_id");
  const brands = useRecords(brandApi, "brand_id");
  const attributes = useRecords(attributeApi, "attribute_id");
  const sources = [categories, brands, attributes];
  const failed = sources.filter((source) => source.status === "error");

  const lookups = {
    categories: categories.items,
    brands: brands.items,
    attributes: attributes.items,
  };
  const lookupState = {
    loading: sources.some((source) => source.status === "loading"),
    error:
      failed.length > 0
        ? "Couldn't load the categories, brands and attributes to choose from."
        : null,
    retry: () => failed.forEach((source) => source.reload()),
  };

  return <RecordPanel config={productConfig} lookups={lookups} lookupState={lookupState} />;
};

export default ProductMaster;
