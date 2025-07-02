import { baseProcedure, createTRPCRouter } from "@/trpc/init";

export const subjectsRouter = createTRPCRouter({
  getMany: baseProcedure.query(async ({ ctx }) => {
    const subjects = await ctx.payload.find({
      collection: "subjects",
      where: {
        isActive: { equals: true },
      },
      sort: "name",
    });

    return subjects;
  }),
});
