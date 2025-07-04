import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { z } from "zod";

export const teachersRouter = createTRPCRouter({
  getAll: baseProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(50).default(10),
        subject: z.string().optional(),
        city: z.string().optional(),
        minPrice: z.number().min(0).optional(),
        maxPrice: z.number().min(0).optional(),
        teachingMode: z.enum(["online", "offline"]).optional(),
        sortBy: z
          .enum(["rating", "experience", "price", "reviews"])
          .default("rating"),
        sortOrder: z.enum(["asc", "desc"]).default("desc"),
      }),
    )
    .query(async ({ ctx, input }) => {
      const {
        page,
        limit,
        subject,
        city,
        minPrice,
        maxPrice,
        teachingMode,
        sortBy,
        sortOrder,
      } = input;

      const where: any = {
        isActive: { equals: true },
      };

      if (subject) {
        where["subjects.subject"] = { equals: subject };
      }

      if (city) {
        where.city = { contains: city };
      }

      if (minPrice !== undefined) {
        where.hourlyRate = {
          ...where.hourlyRate,
          greater_than_equal: minPrice,
        };
      }

      if (maxPrice !== undefined) {
        where.hourlyRate = { ...where.hourlyRate, less_than_equal: maxPrice };
      }

      if (teachingMode) {
        where.teachingMode = { contains: teachingMode };
      }

      let sort: string;
      switch (sortBy) {
        case "rating":
          sort = `${sortOrder === "desc" ? "-" : ""}averageRating`;
          break;
        case "experience":
          sort = `${sortOrder === "desc" ? "-" : ""}yearsOfExperience`;
          break;
        case "price":
          sort = `${sortOrder === "desc" ? "-" : ""}hourlyRate`;
          break;
        case "reviews":
          sort = `${sortOrder === "desc" ? "-" : ""}totalReviews`;
          break;
        default:
          sort = "-averageRating";
      }

      const teachers = await ctx.payload.find({
        collection: "teacher-profiles",
        where,
        page,
        limit,
        sort,
      });

      return teachers;
    }),

  getById: baseProcedure.input(z.string()).query(async ({ ctx, input }) => {
    const teacher = await ctx.payload.findByID({
      collection: "teacher-profiles",
      id: input,
    });

    if (!teacher) {
      throw new Error("Teacher not found");
    }

    return teacher;
  }),

  getReviews: baseProcedure
    .input(
      z.object({
        teacherId: z.string(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(20).default(10),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { teacherId, page, limit } = input;

      const reviews = await ctx.payload.find({
        collection: "reviews",
        where: {
          teacher: { equals: teacherId },
        },
        page,
        limit,
        sort: "-createdAt",
      });

      return reviews;
    }),
});
