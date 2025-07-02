import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { z } from "zod";

export const bookingsRouter = createTRPCRouter({
  create: baseProcedure
    .input(
      z.object({
        teacherId: z.string(),
        subjectId: z.string(),
        date: z.string(),
        startTime: z.string(),
        endTime: z.string(),
        duration: z.number().min(30).max(240),
        teachingMode: z.enum(["online", "offline"]),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const {
        teacherId,
        subjectId,
        date,
        startTime,
        endTime,
        duration,
        teachingMode,
        notes,
      } = input;

      // Get teacher's hourly rate
      const teacher = await ctx.payload.findByID({
        collection: "teacher-profiles",
        id: teacherId,
      });

      if (!teacher) {
        throw new Error("Teacher not found");
      }

      // Validate availability
      const bookingDate = new Date(date);
      const dayOfWeek = bookingDate
        .toLocaleDateString("en-US", { weekday: "long" })
        .toLowerCase();

      const availability = await ctx.payload.find({
        collection: "availability",
        where: {
          teacher: { equals: teacherId },
          dayOfWeek: { equals: dayOfWeek },
        },
      });

      if (availability.docs.length === 0) {
        throw new Error("Teacher is not available on this day");
      }

      // Check if the requested time slot is available
      const teacherAvailability = availability.docs[0];
      const isTimeSlotAvailable = teacherAvailability.timeSlots.some(
        (slot: any) => {
          return (
            slot.isAvailable &&
            slot.startTime <= startTime &&
            slot.endTime >= endTime
          );
        },
      );

      if (!isTimeSlotAvailable) {
        throw new Error("Requested time slot is not available");
      }

      // Check for conflicting bookings
      const conflictingBookings = await ctx.payload.find({
        collection: "bookings",
        where: {
          teacher: { equals: teacherId },
          date: { equals: date },
          status: { not_equals: "cancelled" },
          and: [
            {
              or: [
                {
                  and: [
                    { startTime: { less_than_equal: startTime } },
                    { endTime: { greater_than: startTime } },
                  ],
                },
                {
                  and: [
                    { startTime: { less_than: endTime } },
                    { endTime: { greater_than_equal: endTime } },
                  ],
                },
              ],
            },
          ],
        },
      });

      if (conflictingBookings.docs.length > 0) {
        throw new Error("Time slot is already booked");
      }

      const totalPrice = (teacher.hourlyRate * duration) / 60;

      const booking = await ctx.payload.create({
        collection: "bookings",
        data: {
          student: ctx.user.id,
          teacher: teacherId,
          subject: subjectId,
          date,
          startTime,
          endTime,
          duration,
          totalPrice,
          teachingMode,
          notes,
          status: "pending",
        },
      });

      return booking;
    }),

  getMyBookings: baseProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(20).default(10),
        status: z
          .enum(["pending", "confirmed", "completed", "cancelled"])
          .optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { page, limit, status } = input;

      const where: any = {};

      if (ctx.user.role === "student") {
        where.student = { equals: ctx.user.id };
      } else if (ctx.user.role === "teacher") {
        // Get teacher profile
        const teacherProfile = await ctx.payload.find({
          collection: "teacher-profiles",
          where: { user: { equals: ctx.user.id } },
          limit: 1,
        });

        if (teacherProfile.docs.length > 0) {
          where.teacher = { equals: teacherProfile.docs[0].id };
        }
      }

      if (status) {
        where.status = { equals: status };
      }

      const bookings = await ctx.payload.find({
        collection: "bookings",
        where,
        page,
        limit,
        sort: "-createdAt",
      });

      return bookings;
    }),

  updateStatus: baseProcedure
    .input(
      z.object({
        bookingId: z.string(),
        status: z.enum(["confirmed", "cancelled"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { bookingId, status } = input;

      const booking = await ctx.payload.update({
        collection: "bookings",
        id: bookingId,
        data: {
          status,
        },
      });

      return booking;
    }),
});
