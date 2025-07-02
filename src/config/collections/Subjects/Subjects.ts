import type { CollectionConfig } from "payload";

export const Subjects: CollectionConfig = {
  slug: "subjects",
  admin: {
    useAsTitle: "name",
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
      unique: true,
    },
    { label: "Slug", name: "slug", type: "text", unique: true, required: true },
    {
      name: "description",
      type: "textarea",
    },
    {
      name: "category",
      type: "select",
      options: [
        { label: "Mathematics", value: "mathematics" },
        { label: "Sciences", value: "sciences" },
        { label: "Languages", value: "languages" },
        { label: "Technology", value: "technology" },
        { label: "Arts", value: "arts" },
        { label: "Other", value: "other" },
      ],
    },
    {
      name: "isActive",
      type: "checkbox",
      defaultValue: true,
    },
  ],
};
