import { brandApi } from "@/api/catalog";
import { createdColumn, nameColumn, statusColumn, updatedColumn } from "@/features/records/columns";
import { statusField } from "@/features/records/formFields";
import {
  recentlyUpdatedStat,
  statusFilters,
  statusStats,
  totalStat,
} from "@/features/records/listHelpers";

const noun = { singular: "brand", plural: "brands" };

// Everything RecordPanel needs to show and edit brands
export const brandConfig = {
  api: brandApi,
  idKey: "brand_id",
  noun,
  icon: "tag",
  getName: (brand) => brand.brand_name,
  getSearchText: (brand) => [brand.brand_name, brand.description],
  emptyDescription: "Brands are the makers or suppliers of your products, like Lavazza or Oatly.",
  inUseBy: "products",

  filters: statusFilters("All Brands"),

  columns: [
    nameColumn({
      header: "Brand",
      getTitle: (brand) => brand.brand_name,
      getSubtitle: (brand) => brand.description,
      getImage: (brand) => brand.image,
    }),
    statusColumn(),
    createdColumn(),
    updatedColumn(),
  ],

  getStats: (brands) => [
    totalStat(brands, { label: "Total Brands", icon: "tag" }),
    ...statusStats(brands, noun),
    recentlyUpdatedStat(brands),
  ],

  csvColumns: [
    { header: "ID", value: (brand) => brand.brand_id },
    { header: "Name", value: (brand) => brand.brand_name },
    { header: "Description", value: (brand) => brand.description },
    { header: "Status", value: (brand) => (brand.active ? "Active" : "Inactive") },
    { header: "Created", value: (brand) => brand.created_date },
    { header: "Last Updated", value: (brand) => brand.updated_date },
  ],

  form: {
    createDescription: "Brands are the makers or suppliers of your products.",
    editDescription: "Changes apply to every product from this brand.",
    fields: [
      // Uploaded separately after the brand is saved (see RecordPanel)
      { name: "image", label: "Logo", type: "image" },
      {
        name: "brand_name",
        label: "Name",
        type: "text",
        required: true,
        maxLength: 100,
        placeholder: "e.g. Lavazza",
      },
      {
        name: "description",
        label: "Description",
        type: "textarea",
        maxLength: 500,
        placeholder: "Optional. What does this brand supply?",
      },
      statusField("Set a brand to inactive instead of deleting it to keep its history."),
    ],
    getConflict: () => ({
      field: "brand_name",
      message: "A brand with this name already exists.",
    }),
  },
};
