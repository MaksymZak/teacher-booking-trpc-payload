import type { CollectionConfig } from "payload";

export const TeacherProfiles: CollectionConfig = {
  slug: "teacher-profiles",
  admin: {
    useAsTitle: "user",
  },
  fields: [
    {
      name: "user",
      type: "relationship",
      relationTo: "users",
      required: true,
      unique: true,
      filterOptions: {
        role: {
          equals: "teacher",
        },
      },
    },
    {
      name: "city",
      type: "text",
    },
    {
      name: "teachingMode",
      type: "select",
      required: true,
      hasMany: true,
      options: [
        { label: "Online", value: "online" },
        { label: "Offline", value: "offline" },
      ],
    },
    {
      name: "hourlyRate",
      type: "number",
      required: true,
      min: 0,
    },
    {
      name: "subjects",
      type: "array",
      required: true,
      minRows: 1,
      fields: [
        {
          name: "subject",
          type: "relationship",
          relationTo: "subjects",
          required: true,
        },
        {
          name: "description",
          type: "textarea",
        },
        {
          name: "experienceLevel",
          type: "select",
          options: [
            { label: "Beginner", value: "beginner" },
            { label: "Intermediate", value: "intermediate" },
            { label: "Advanced", value: "advanced" },
            { label: "Expert", value: "expert" },
          ],
        },
      ],
    },
    {
      name: "yearsOfExperience",
      type: "number",
      required: true,
      min: 0,
    },
    {
      name: "biography",
      type: "richText",
    },
    {
      name: "profileImage",
      type: "upload",
      relationTo: "media",
    },
    {
      name: "isVerified",
      type: "checkbox",
      defaultValue: false,
    },
    {
      name: "isActive",
      type: "checkbox",
      defaultValue: true,
    },
    {
      name: "averageRating",
      type: "number",
      admin: {
        readOnly: true,
      },
      defaultValue: 0,
    },
    {
      name: "totalReviews",
      type: "number",
      admin: {
        readOnly: true,
      },
      defaultValue: 0,
    },
  ],
  hooks: {
    afterChange: [
      async ({ doc, req }) => {
        // Calculate average rating when profile is updated
        const reviews = await req.payload.find({
          collection: "reviews",
          where: {
            teacher: {
              equals: doc.id,
            },
          },
        });

        if (reviews.docs.length > 0) {
          const totalRating = reviews.docs.reduce(
            (sum, review) => sum + review.rating,
            0,
          );
          const averageRating = totalRating / reviews.docs.length;

          await req.payload.update({
            collection: "teacher-profiles",
            id: doc.id,
            data: {
              averageRating: Math.round(averageRating * 10) / 10,
              totalReviews: reviews.docs.length,
            },
          });
        }
      },
    ],
  },
};
