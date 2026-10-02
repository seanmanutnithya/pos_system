import { attributeApi } from "@/api/catalog";
import { createdColumn, nameColumn, statusColumn } from "@/features/records/columns";
import { statusField } from "@/features/records/formFields";
import { statusFilters, statusStats, totalStat } from "@/features/records/listHelpers";
import { formatNumber } from "@/lib/format";

const noun = { singular: "attribute", plural: "attributes" };

// Distinct attribute names, e.g. ["Size", "Milk"], ignoring case
const uniqueNames = (attributes) => [
  ...new Map(
    attributes.map((attribute) => [attribute.attribute_name.toLowerCase(), attribute.attribute_name]),
  ).values(),
];

// Everything RecordPanel needs to show and edit attributes.
// An attribute is a name and value pair, like Size: Large. Attributes have no
// "last updated" date.
export const attributeConfig = {
  api: attributeApi,
  idKey: "attribute_id",
  noun,
  icon: "layers",
  getName: (attribute) => `${attribute.attribute_name}: ${attribute.attribute_value}`,
  getSearchText: (attribute) => [attribute.attribute_name, attribute.attribute_value],
  emptyDescription:
    "Attributes describe product variants as a name and value, like Size: Large or Milk: Oat Milk.",
  inUseBy: "products",

  filters: statusFilters("All Attributes"),

  columns: [
    nameColumn({ header: "Name", getTitle: (attribute) => attribute.attribute_name }),
    {
      key: "value",
      header: "Value",
      className: "font-medium",
      sortValue: (attribute) => attribute.attribute_value,
      render: (attribute) => attribute.attribute_value,
    },
    statusColumn(),
    createdColumn(),
  ],

  getStats: (attributes) => {
    const names = uniqueNames(attributes);
    return [
      totalStat(attributes, { label: "Total Attributes", icon: "layers" }),
      {
        label: "Attribute Names",
        icon: "tag",
        tone: "ink",
        value: formatNumber(names.length),
        hint: names.length > 0 ? names.join(", ") : "None yet",
      },
      ...statusStats(attributes, noun),
    ];
  },

  csvColumns: [
    { header: "ID", value: (attribute) => attribute.attribute_id },
    { header: "Name", value: (attribute) => attribute.attribute_name },
    { header: "Value", value: (attribute) => attribute.attribute_value },
    { header: "Status", value: (attribute) => (attribute.active ? "Active" : "Inactive") },
    { header: "Created", value: (attribute) => attribute.created_date },
  ],

  form: {
    createDescription: "Pick an existing name or type a new one, then add a value for it.",
    editDescription: "Changes apply to every product with this attribute.",
    fields: [
      {
        name: "attribute_name",
        label: "Name",
        type: "text",
        required: true,
        maxLength: 50,
        placeholder: "e.g. Size",
        suggestions: ({ records }) => uniqueNames(records),
      },
      {
        name: "attribute_value",
        label: "Value",
        type: "text",
        required: true,
        maxLength: 100,
        placeholder: "e.g. Large (16 oz)",
      },
      statusField("Set an attribute to inactive instead of deleting it to keep its history."),
    ],
    getConflict: () => ({
      field: "attribute_value",
      message: "This name already has this value.",
    }),
  },
};
