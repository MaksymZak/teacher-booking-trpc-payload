import type { CollectionConfig } from "payload";

// Simple slugify function
function slugify(str: string): string {
  return str
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "")
    .replace(/\-+/g, "-");
}

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
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      index: true,
      admin: {
        readOnly: true,
      },
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            if (value) return value;
            if (data?.name) return slugify(data.name);
            return value;
          },
        ],
      },
    },
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
