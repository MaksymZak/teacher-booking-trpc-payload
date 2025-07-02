import type { CollectionConfig, TextFieldManyValidation } from "payload";

export const Availability: CollectionConfig = {
  slug: "availability",
  admin: {
    useAsTitle: "teacher",
  },
  fields: [
    {
      name: "teacher",
      type: "relationship",
      relationTo: "teacher-profiles",
      required: true,
    },
    {
      name: "dayOfWeek",
      type: "select",
      required: true,
      options: [
        { label: "Monday", value: "monday" },
        { label: "Tuesday", value: "tuesday" },
        { label: "Wednesday", value: "wednesday" },
        { label: "Thursday", value: "thursday" },
        { label: "Friday", value: "friday" },
        { label: "Saturday", value: "saturday" },
        { label: "Sunday", value: "sunday" },
      ],
    },
    {
      name: "timeSlots",
      type: "array",
      required: true,
      fields: [
        {
          name: "startTime",
          type: "text",
          required: true,
          validate: (val: any) => {
            const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
            return timeRegex.test(val) || "Please enter time in HH:MM format";
          },
        },
        {
          name: "endTime",
          type: "text",
          required: true,
          validate: (val: any) => {
            const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
            return timeRegex.test(val) || "Please enter time in HH:MM format";
          },
        },
        {
          name: "isAvailable",
          type: "checkbox",
          defaultValue: true,
        },
      ],
    },
  ],
};
