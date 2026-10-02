import { categoryApi } from "@/api/catalog";
import { createdColumn, nameColumn, statusColumn, updatedColumn } from "@/features/records/columns";
import { statusField } from "@/features/records/formFields";
import {
  recentlyUpdatedStat,
  statusFilters,
  statusStats,
  totalStat,
} from "@/features/records/listHelpers";

const noun = { singular: "category", plural: "categories" };

// Everything RecordPanel needs to show and edit categories
export const categoryConfig = {
  api: categoryApi,
  idKey: "category_id",
  noun,
  icon: "folder",
  getName: (category) => category.category_name,
  // What the top-bar search looks through
  getSearchText: (category) => [category.category_name, category.description],
  emptyDescription: "Categories group your products, like Hot Coffee or Pastries.",
  // Shown when a delete fails because something still uses the category
  inUseBy: "products",

  filters: statusFilters("All Categories"),

  columns: [
    nameColumn({
      header: "Category",
      getTitle: (category) => category.category_name,
      getSubtitle: (category) => category.description,
    }),
    statusColumn(),
    createdColumn(),
    updatedColumn(),
  ],

  getStats: (categories) => [
    totalStat(categories, { label: "Total Categories", icon: "folder" }),
    ...statusStats(categories, noun),
    recentlyUpdatedStat(categories),
  ],

  csvColumns: [
    { header: "ID", value: (category) => category.category_id },
    { header: "Name", value: (category) => category.category_name },
    { header: "Description", value: (category) => category.description },
    { header: "Status", value: (category) => (category.active ? "Active" : "Inactive") },
    { header: "Created", value: (category) => category.created_date },
    { header: "Last Updated", value: (category) => category.updated_date },
  ],

  form: {
    createDescription: "Categories group products, like Hot Coffee or Pastries.",
    editDescription: "Changes apply to every product in this category.",
    fields: [
      {
        name: "category_name",
        label: "Name",
        type: "text",
        required: true,
        // Same sizes as the database columns. The API doesn't check category
        // lengths, so the form stops longer text from being cut off on save.
        maxLength: 100,
        placeholder: "e.g. Hot Coffee",
      },
      {
        name: "description",
        label: "Description",
        type: "textarea",
        maxLength: 500,
        placeholder: "Optional. What belongs in this category?",
      },
      statusField("Set a category to inactive instead of deleting it to keep its history."),
    ],
    getConflict: () => ({
      field: "category_name",
      message: "A category with this name already exists.",
    }),
  },
};
