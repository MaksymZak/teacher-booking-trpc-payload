import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { z } from "zod";

export const availabilityRouter = createTRPCRouter({
  // Get teacher's availability for a specific week
  getWeeklyAvailability: baseProcedure
    .input(
      z.object({
        teacherId: z.string(),
        weekStart: z.string(), // YYYY-MM-DD format
      }),
    )
    .query(async ({ ctx, input }) => {
      const { teacherId, weekStart } = input;

      const availability = await ctx.payload.find({
        collection: "availability",
        where: {
          teacher: { equals: teacherId },
        },
      });

      // Get bookings for this week
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);

      const bookings = await ctx.payload.find({
        collection: "bookings",
        where: {
          teacher: { equals: teacherId },
          date: {
            greater_than_equal: weekStart,
            less_than_equal: weekEnd.toISOString().split("T")[0],
          },
          status: { not_equals: "cancelled" },
        },
      });

      return {
        availability: availability.docs,
        bookings: bookings.docs,
      };
    }),

  // Create or update teacher's availability (teacher only)
  upsertAvailability: baseProcedure
    .input(
      z.object({
        dayOfWeek: z.enum([
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday",
          "saturday",
          "sunday",
        ]),
        timeSlots: z.array(
          z.object({
            startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
            endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
            isAvailable: z.boolean().default(true),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { dayOfWeek, timeSlots } = input;

      // Get teacher profile
      const teacherProfile = await ctx.payload.find({
        collection: "teacher-profiles",
        where: { user: { equals: ctx.user.id } },
        limit: 1,
      });

      if (teacherProfile.docs.length === 0) {
        throw new Error("Teacher profile not found");
      }

      const teacherId = teacherProfile.docs[0].id;

      // Check if availability already exists for this day
      const existingAvailability = await ctx.payload.find({
        collection: "availability",
        where: {
          teacher: { equals: teacherId },
          dayOfWeek: { equals: dayOfWeek },
        },
        limit: 1,
      });

      if (existingAvailability.docs.length > 0) {
        // Update existing availability
        const updated = await ctx.payload.update({
          collection: "availability",
          id: existingAvailability.docs[0].id,
          data: {
            timeSlots,
          },
        });
        return updated;
      } else {
        // Create new availability
        const created = await ctx.payload.create({
          collection: "availability",
          data: {
            teacher: teacherId,
            dayOfWeek,
            timeSlots,
          },
        });
        return created;
      }
    }),

  // Get available time slots for a specific date
  getAvailableSlots: baseProcedure
    .input(
      z.object({
        teacherId: z.string(),
        date: z.string(), // YYYY-MM-DD format
      }),
    )
    .query(async ({ ctx, input }) => {
      const { teacherId, date } = input;

      const bookingDate = new Date(date);
      const dayOfWeek = bookingDate
        .toLocaleDateString("en-US", { weekday: "long" })
        .toLowerCase();

      // Get teacher's availability for this day
      const availability = await ctx.payload.find({
        collection: "availability",
        where: {
          teacher: { equals: teacherId },
          dayOfWeek: { equals: dayOfWeek },
        },
        limit: 1,
      });

      if (availability.docs.length === 0) {
        return { availableSlots: [] };
      }

      // Get existing bookings for this date
      const bookings = await ctx.payload.find({
        collection: "bookings",
        where: {
          teacher: { equals: teacherId },
          date: { equals: date },
          status: { not_equals: "cancelled" },
        },
      });

      const teacherAvailability = availability.docs[0];
      const bookedSlots = bookings.docs.map((booking) => ({
        startTime: booking.startTime,
        endTime: booking.endTime,
      }));

      // Filter available slots that don't conflict with bookings
      const availableSlots = teacherAvailability.timeSlots
        .filter((slot: any) => slot.isAvailable)
        .filter((slot: any) => {
          return !bookedSlots.some(
            (booked) =>
              slot.startTime < booked.endTime &&
              slot.endTime > booked.startTime,
          );
        });

      return { availableSlots };
    }),

  // Delete availability for a specific day (teacher only)
  deleteAvailability: baseProcedure
    .input(
      z.object({
        dayOfWeek: z.enum([
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday",
          "saturday",
          "sunday",
        ]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { dayOfWeek } = input;

      // Get teacher profile
      const teacherProfile = await ctx.payload.find({
        collection: "teacher-profiles",
        where: { user: { equals: ctx.user.id } },
        limit: 1,
      });

      if (teacherProfile.docs.length === 0) {
        throw new Error("Teacher profile not found");
      }

      const teacherId = teacherProfile.docs[0].id;

      const availability = await ctx.payload.find({
        collection: "availability",
        where: {
          teacher: { equals: teacherId },
          dayOfWeek: { equals: dayOfWeek },
        },
        limit: 1,
      });

      if (availability.docs.length > 0) {
        await ctx.payload.delete({
          collection: "availability",
          id: availability.docs[0].id,
        });
      }

      return { success: true };
    }),
});
