import { createTRPCRouter } from "../init";
import { subjectsRouter } from "@/modules/subjects/server/procedure";
export const appRouter = createTRPCRouter({
  subjects: subjectsRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
