import { productApi } from "@/api/catalog";
import { nameColumn } from "@/features/records/columns";
import { statusField } from "@/features/records/formFields";
import { totalStat } from "@/features/records/listHelpers";
import { formatMoney, formatNumber } from "@/lib/format";
import StockBadge from "./StockBadge";
import { getStockLevel, LOW_STOCK_LIMIT, STOCK_LEVEL_ORDER, STOCK_LEVELS } from "./stock";

const noun = { singular: "product", plural: "products" };
const collator = new Intl.Collator(undefined, { sensitivity: "base", numeric: true });

const isLevel = (level) => (product) => getStockLevel(product) === level;

const attributeLabel = (attribute) =>
  attribute ? `${attribute.attribute_name}: ${attribute.attribute_value}` : "";

// Options for a select from one of the lookup lists: the active records, plus
// the product's current one if it has been deactivated since. Sorted by group,
// then label.
const toOptions = (records = [], { idKey, getLabel, getGroup, currentId }) =>
  records
    .filter((record) => record.active || record[idKey] === currentId)
    .map((record) => ({
      value: String(record[idKey]),
      label: record.active ? getLabel(record) : `${getLabel(record)} (inactive)`,
      group: getGroup?.(record),
    }))
    .sort(
      (a, b) => collator.compare(a.group ?? "", b.group ?? "") || collator.compare(a.label, b.label),
    );

// Everything RecordPanel needs to show and edit products. The form's selects
// need `lookups` ({ categories, brands, attributes }), which pages/ProductMaster.jsx loads.
export const productConfig = {
  api: productApi,
  idKey: "product_id",
  noun,
  icon: "box",
  getName: (product) => product.product_name,
  getSearchText: (product) => [
    product.product_name,
    product.sku,
    product.barcode,
    product.category?.category_name,
    product.brand?.brand_name,
    product.attribute?.attribute_value,
  ],
  emptyDescription:
    "Products are what you sell. Add the categories and brands you need first, then your first product.",
  inUseBy: "sales or orders",
  // More columns than the other tabs, so the table needs more room before it scrolls
  tableClassName: "min-w-240",

  filters: [
    { value: "all", label: "All Products" },
    { value: "in", label: "In Stock", match: isLevel("in") },
    { value: "low", label: "Low Stock", match: isLevel("low") },
    { value: "out", label: "Out of Stock", match: isLevel("out") },
    { value: "inactive", label: "Inactive", match: isLevel("inactive") },
  ],

  columns: [
    nameColumn({
      header: "Product",
      getTitle: (product) => product.product_name,
      getSubtitle: (product) => `SKU ${product.sku}`,
      getImage: (product) => product.image,
    }),
    {
      key: "category",
      header: "Category",
      sortValue: (product) => product.category?.category_name,
      render: (product) => product.category?.category_name ?? "—",
    },
    {
      key: "brand",
      header: "Brand",
      sortValue: (product) => product.brand?.brand_name,
      render: (product) => product.brand?.brand_name ?? "—",
    },
    {
      key: "attribute",
      header: "Attribute",
      className: "whitespace-nowrap text-muted",
      sortValue: (product) => attributeLabel(product.attribute),
      render: (product) => attributeLabel(product.attribute) || "—",
    },
    {
      key: "price",
      header: "Price",
      className: "whitespace-nowrap tabular-nums",
      sortValue: (product) => product.price,
      render: (product) => formatMoney(product.price),
    },
    {
      key: "stock",
      header: "Stock",
      className: "whitespace-nowrap tabular-nums",
      sortValue: (product) => product.quantity_stock,
      render: (product) => `${formatNumber(product.quantity_stock)} pcs`,
    },
    {
      key: "status",
      header: "Status",
      sortValue: (product) => STOCK_LEVEL_ORDER.indexOf(getStockLevel(product)),
      render: (product) => <StockBadge product={product} />,
    },
  ],

  getStats: (products) => {
    const active = products.filter((product) => product.active);
    const units = active.reduce((sum, product) => sum + product.quantity_stock, 0);
    const stockValue = active.reduce(
      (sum, product) => sum + product.cost * product.quantity_stock,
      0,
    );
    const outOfStock = active.filter(isLevel("out")).length;
    const needsRestock = outOfStock + active.filter(isLevel("low")).length;
    return [
      totalStat(products, { label: "Total Products", icon: "box" }),
      {
        label: "Units in Stock",
        icon: "layers",
        tone: "soft",
        value: formatNumber(units),
        hint: "Across active products",
      },
      {
        label: "Stock Value",
        icon: "coins",
        tone: "ink",
        value: formatMoney(stockValue),
        hint: "At cost price",
      },
      {
        label: "Needs Restock",
        icon: "alert-triangle",
        tone: "neutral",
        value: formatNumber(needsRestock),
        hint: `${formatNumber(LOW_STOCK_LIMIT)} units or fewer`,
        badge: outOfStock > 0 ? { text: `${formatNumber(outOfStock)} out of stock` } : undefined,
      },
    ];
  },

  csvColumns: [
    { header: "ID", value: (product) => product.product_id },
    { header: "Name", value: (product) => product.product_name },
    { header: "SKU", value: (product) => product.sku },
    { header: "Barcode", value: (product) => product.barcode },
    { header: "Category", value: (product) => product.category?.category_name },
    { header: "Brand", value: (product) => product.brand?.brand_name },
    { header: "Attribute", value: (product) => attributeLabel(product.attribute) },
    { header: "Price", value: (product) => product.price },
    { header: "Cost", value: (product) => product.cost },
    { header: "Stock", value: (product) => product.quantity_stock },
    { header: "Status", value: (product) => STOCK_LEVELS[getStockLevel(product)].label },
    { header: "Description", value: (product) => product.description },
    { header: "Created", value: (product) => product.created_date },
    { header: "Last Updated", value: (product) => product.updated_date },
  ],

  form: {
    size: "lg",
    createDescription: "Add something you sell. Fields marked * are required.",
    editDescription: "Changes show everywhere this product is listed.",
    fields: [
      // Uploaded separately after the product is saved (see RecordPanel)
      { name: "image", label: "Image", type: "image" },
      {
        name: "product_name",
        label: "Name",
        type: "text",
        required: true,
        maxLength: 200,
        placeholder: "e.g. Cafe Latte",
      },
      {
        name: "sku",
        label: "SKU",
        type: "text",
        required: true,
        half: true,
        maxLength: 50,
        placeholder: "e.g. HC-LAT-001",
        hint: "Your own code for this product. Must be unique.",
      },
      {
        name: "barcode",
        label: "Barcode",
        type: "text",
        half: true,
        maxLength: 50,
        placeholder: "Optional",
        hint: "Must be unique if you add one.",
      },
      {
        name: "category_id",
        label: "Category",
        type: "select",
        required: true,
        half: true,
        placeholder: "Choose a category",
        requiredMessage: "Choose a category.",
        options: ({ lookups, record }) =>
          toOptions(lookups?.categories, {
            idKey: "category_id",
            getLabel: (category) => category.category_name,
            currentId: record?.category_id,
          }),
      },
      {
        name: "brand_id",
        label: "Brand",
        type: "select",
        required: true,
        half: true,
        placeholder: "Choose a brand",
        requiredMessage: "Choose a brand.",
        options: ({ lookups, record }) =>
          toOptions(lookups?.brands, {
            idKey: "brand_id",
            getLabel: (brand) => brand.brand_name,
            currentId: record?.brand_id,
          }),
      },
      {
        name: "attribute_id",
        label: "Attribute",
        type: "select",
        placeholder: "None",
        hint: "Optional. Which variant this product is, like Size: Large.",
        options: ({ lookups, record }) =>
          toOptions(lookups?.attributes, {
            idKey: "attribute_id",
            getLabel: (attribute) => attribute.attribute_value,
            getGroup: (attribute) => attribute.attribute_name,
            currentId: record?.attribute_id,
          }),
      },
      {
        name: "price",
        label: "Price",
        type: "money",
        required: true,
        positive: true,
        half: true,
        placeholder: "0.00",
        hint: "What customers pay.",
      },
      {
        name: "cost",
        label: "Cost",
        type: "money",
        half: true,
        defaultValue: "0.00",
        placeholder: "0.00",
        hint: "What you pay for one unit.",
      },
      {
        name: "quantity_stock",
        label: "Stock",
        type: "integer",
        half: true,
        defaultValue: "0",
        placeholder: "0",
        hint: "Units you have now.",
      },
      {
        ...statusField("Set a product to inactive instead of deleting it to keep its history."),
        half: true,
      },
      {
        name: "description",
        label: "Description",
        type: "textarea",
        maxLength: 500,
        placeholder: "Optional. A short description for staff.",
      },
    ],
    getConflict: (message) =>
      message.startsWith("barcode")
        ? { field: "barcode", message: "Another product already has this barcode." }
        : { field: "sku", message: "Another product already has this SKU." },
  },
};
