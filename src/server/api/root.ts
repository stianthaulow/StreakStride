import { activityRouter } from "./routers/activitiy";
import { paceRouter } from "./routers/pace";
import { stravaRouter } from "./routers/strava";
import { createTRPCRouter } from "./trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here
 */
export const appRouter = createTRPCRouter({
  pace: paceRouter,
  strava: stravaRouter,
  activity: activityRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
