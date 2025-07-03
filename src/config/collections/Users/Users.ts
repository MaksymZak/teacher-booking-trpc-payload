import type { CollectionConfig } from "payload";

export const Users: CollectionConfig = {
  slug: "users",
  auth: {
    tokenExpiration: 7200, // 2 hours
  },
  admin: {
    useAsTitle: "name",
  },
  fields: [
    {
      name: "name",
      type: "text",
    },
    {
      name: "email",
      type: "email",
      required: true,
      unique: true,
    },
    {
      name: "phone",
      type: "text",
    },
    {
      name: "role",
      type: "select",
      required: true,
      defaultValue: "student",
      options: [
        {
          label: "Student",
          value: "student",
        },
        {
          label: "Teacher",
          value: "teacher",
        },
        {
          label: "Admin",
          value: "admin",
        },
      ],
    },
    {
      name: "isActive",
      type: "checkbox",
      defaultValue: true,
    },
  ],
  access: {
    admin: ({ req: { user } }) => {
      return user?.role === "admin";
    },
  },
};
