import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { z } from "zod";

export const reviewsRouter = createTRPCRouter({
  create: baseProcedure
    .input(
      z.object({
        rating: z.number().min(1).max(5),
        comment: z.string().optional(),
        teacherId: z.string().uuid("Invalid teacher ID format"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { rating, comment, teacherId } = input;

      if (!ctx.user) {
        throw new Error("User must be logged in to create a review");
      }

      const review = await ctx.payload.create({
        collection: "reviews",
        data: {
          student: ctx.user.id, // Ensure we use the correct user ID
          teacher: teacherId,
          rating,
          comment,
        },
      });

      return review;
    }),
});
