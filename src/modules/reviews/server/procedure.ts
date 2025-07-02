import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { z } from "zod";

export const reviewsRouter = createTRPCRouter({
  create: baseProcedure
    .input(
      z.object({
        bookingId: z.string(),
        rating: z.number().min(1).max(5),
        comment: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { bookingId, rating, comment } = input;

      // Get booking details
      const booking = await ctx.payload.findByID({
        collection: "bookings",
        id: bookingId,
      });

      if (!booking) {
        throw new Error("Booking not found");
      }

      if (booking.student !== ctx.user.id) {
        throw new Error("Unauthorized");
      }

      if (booking.status !== "completed") {
        throw new Error("Can only review completed bookings");
      }

      // Check if review already exists
      const existingReview = await ctx.payload.find({
        collection: "reviews",
        where: {
          booking: { equals: bookingId },
        },
        limit: 1,
      });

      if (existingReview.docs.length > 0) {
        throw new Error("Review already exists for this booking");
      }

      const review = await ctx.payload.create({
        collection: "reviews",
        data: {
          student: ctx.user.id,
          teacher: booking.teacher,
          booking: bookingId,
          rating,
          comment,
        },
      });

      return review;
    }),
});
