import { baseProcedure, createTRPCRouter } from "@/trpc/init";

export const subjectsRouter = createTRPCRouter({
  getMany: baseProcedure.query(async ({ ctx }) => {
    // Implement your logic to fetch multiple subjects

    const subjects = ctx.payload.find({
      collection: "subjects",
      depth: 1,
      limit: 10,
    });

    return subjects; // Example response
  }),
});
