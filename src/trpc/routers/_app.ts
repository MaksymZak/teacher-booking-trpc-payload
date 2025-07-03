import { createTRPCRouter } from "../init";
import { reviewsRouter } from "@/modules/reviews/server/procedure";
import { subjectsRouter } from "@/modules/subjects/server/procedure";
import { teachersRouter } from "@/modules/teachers/server/procedure";

export const appRouter = createTRPCRouter({
  subjects: subjectsRouter,
  teachers: teachersRouter,
  reviews: reviewsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
