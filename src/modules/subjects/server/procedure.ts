import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { z } from "zod";

export const subjectsRouter = createTRPCRouter({
  getMany: baseProcedure
    .input(
      z
        .object({
          page: z.number().optional().default(1),
          limit: z.number().optional().default(9),
          search: z.string().optional(),
          category: z.string().optional(),
          sortBy: z.enum(["name", "popularity"]).optional().default("name"),
          sortOrder: z.enum(["asc", "desc"]).optional().default("asc"),
        })
        .optional(),
    )
    .query(async ({ ctx, input = {} }) => {
      // Building the query for Payload
      const where = {
        isActive: { equals: true },
      };

      // Add search filter if provided
      if (input.search) {
        Object.assign(where, {
          or: [
            {
              name: {
                like: input.search,
              },
            },
            {
              description: {
                like: input.search,
              },
            },
          ],
        });
      }

      // Add category filter if provided
      if (input.category) {
        Object.assign(where, {
          category: {
            equals: input.category,
          },
        });
      }

      // Determine sort field and direction
      const sort =
        (input.sortBy === "popularity" ? "teacherCount" : input.sortBy) ||
        "name";

      const sortOrder = input.sortOrder || "asc";
      const sortDirection = sortOrder === "asc" ? 1 : -1;

      // Fetch subjects with filters, sorting, and pagination
      const subjects = await ctx.payload.find({
        collection: "subjects",
        where,
        sort: `${sortDirection === 1 ? "" : "-"}${sort}`,
        page: input.page,
        limit: input.limit,
      });

      return subjects;
    }),
});
