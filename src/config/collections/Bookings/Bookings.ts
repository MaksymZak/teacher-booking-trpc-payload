import type { CollectionConfig } from "payload";
import payload from "payload"; // Declare the payload variable

export const Bookings: CollectionConfig = {
  slug: "bookings",
  admin: {
    useAsTitle: "id",
  },
  fields: [
    {
      name: "student",
      type: "relationship",
      relationTo: "users",
      required: true,
      filterOptions: {
        role: {
          equals: "student",
        },
      },
    },
    {
      name: "teacher",
      type: "relationship",
      relationTo: "teacher-profiles",
      required: true,
    },
    {
      name: "subject",
      type: "relationship",
      relationTo: "subjects",
      required: true,
    },
    {
      name: "date",
      type: "date",
      required: true,
    },
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
      name: "duration",
      type: "number",
      required: true,
      min: 30,
      max: 240,
    },
    {
      name: "totalPrice",
      type: "number",
      required: true,
      min: 0,
    },
    {
      name: "teachingMode",
      type: "select",
      required: true,
      options: [
        { label: "Online", value: "online" },
        { label: "Offline", value: "offline" },
      ],
    },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "pending",
      options: [
        { label: "Pending", value: "pending" },
        { label: "Confirmed", value: "confirmed" },
        { label: "Completed", value: "completed" },
        { label: "Cancelled", value: "cancelled" },
      ],
    },
    {
      name: "notes",
      type: "textarea",
    },
    {
      name: "meetingLink",
      type: "text",
      admin: {
        condition: (data) => data.teachingMode === "online",
      },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, operation }) => {
        if (operation === "create") {
          // Calculate total price based on duration and teacher's hourly rate
          if (data.teacher && data.duration) {
            const teacher = await payload.findByID({
              collection: "teacher-profiles",
              id: data.teacher,
            });
            data.totalPrice = (teacher.hourlyRate * data.duration) / 60;
          }
        }
      },
    ],
  },
};
