import type { CollectionConfig } from "payload";

export const Reviews: CollectionConfig = {
  slug: "reviews",
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
      name: "booking",
      type: "relationship",
      relationTo: "bookings",
      required: true,
    },
    {
      name: "rating",
      type: "number",
      required: true,
      min: 1,
      max: 5,
    },
    {
      name: "comment",
      type: "textarea",
    },
    {
      name: "isVerified",
      type: "checkbox",
      defaultValue: false,
    },
  ],
  hooks: {
    afterChange: [
      async ({ doc, req }) => {
        // Update teacher's average rating
        const reviews = await req.payload.find({
          collection: "reviews",
          where: {
            teacher: {
              equals: doc.teacher,
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
            id: doc.teacher,
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
